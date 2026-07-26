# The Bench Blueprint — Build Specification

**For:** an agentic coding environment (Antigravity) building the v1 web app.
**Companion doc:** `01_content_map.md` — the field-level source of truth. This spec covers architecture; that one covers content. **Do not invent prompt copy; pull it from the content map.**

---

## 0. How to use this document

Read this whole file before writing code. Build in the phase order in §12. After each phase, run the acceptance checks for that phase (§13) before continuing. If a requirement here conflicts with the content map, the content map wins on *what the app says*; this document wins on *how the app works*.

**Hard rules — violating any of these is a failed build:**

1. Prompt text, examples, zone descriptions, and helper copy are **verbatim from the workbook**. Never paraphrase, shorten, or "improve" them. They are trademarked material.
2. Never send a user's Section 05 content to an AI provider without an explicit, per-invocation click.
3. Financial figures (if the runway field is added) are never logged, never sent to analytics, never included in error reports.
4. No `localStorage` as the system of record for authenticated users. It is a write-through cache only.
5. Row-Level Security on every user table, enabled from the first migration. Not "added later."

---

## 1. Product summary

A web app that turns a 76-page career-reinvention workbook into a guided, resumable, self-populating system. Seven sections (the workbook's own "Minimum Viable Path"), roughly 95 minutes of user work, spread over days or weeks. The differentiating mechanic is **carry-forward**: outputs of earlier sections auto-populate the bridges of later ones, eliminating the manual transcription that causes drop-off on paper.

**Primary success metric:** percentage of users who start Section 00 and reach the generated report. Nothing else matters as much.

---

## 2. Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 15, App Router, TypeScript** | Server components for the report render; one deploy target |
| UI | **Tailwind CSS + shadcn/ui** | Fast, accessible primitives; easy to restyle to the book's design |
| Auth + DB | **Supabase** (Postgres + Auth + RLS) | RLS is the cheapest correct answer to storing personal reflection and financial data |
| Payments | **Stripe Checkout** (deferred — see §10) | Not in v1 build; leave a clean seam |
| Email | **Resend** + React Email | Diagnostic result delivery, re-entry nudges |
| AI | **Anthropic API, server-side only** | Section 05 assist; key never reaches the client |
| Hosting | **Vercel** | |
| Analytics | **PostHog, self-host or EU region, with section-level opt-out** | Funnel measurement is essential; content capture is forbidden |

**Do not** add: a state library (React state + server actions suffice), an ORM beyond `supabase-js`, a component library other than shadcn, or any drag-and-drop dependency.

---

## 3. Data model

Design principle: **section answers live in a single JSONB column per section.** The author will revise prompt wording; schema migrations for copy changes are unacceptable. Only values that are queried, scored, or carried forward get promoted to real columns.

```sql
-- 001_init.sql

create table profiles (
  id            uuid primary key references auth.users on delete cascade,
  display_name  text,
  created_at    timestamptz not null default now(),
  last_worked_at timestamptz,
  entry_section text,                     -- "I am picking up at section" (p.3)
  tier          text not null default 'free'  -- 'free' | 'full'
);

create table section_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  section_id  text not null,              -- '00','01','02','03','05','10','15'
  data        jsonb not null default '{}'::jsonb,
  status      text not null default 'not_started', -- not_started|in_progress|complete
  completed_at timestamptz,
  updated_at  timestamptz not null default now(),
  unique (user_id, section_id)
);

-- Promoted values: queried, scored, or carried forward.
create table user_outputs (
  user_id            uuid primary key references profiles(id) on delete cascade,
  diagnostic_total   int,        -- 12..60
  diagnostic_zone    text,       -- 'reactive'|'repositioning'|'momentum'
  priority_areas     text[],     -- 3
  bench_thesis       text,
  reset_sentence     text,
  north_star         text,
  top_3_areas        text[],     -- 3
  positioning_final  text,
  first_action       text,       -- b_tomorrow
  letter_written_at  date,
  updated_at         timestamptz not null default now()
);

-- Free-tier diagnostic capture, pre-signup.
create table diagnostic_leads (
  id          uuid primary key default gen_random_uuid(),
  email       citext not null,
  total       int not null,
  zone        text not null,
  priority_areas text[],
  claimed_by  uuid references profiles(id),   -- set on later signup
  created_at  timestamptz not null default now()
);
create unique index on diagnostic_leads (email) where claimed_by is null;

alter table profiles         enable row level security;
alter table section_entries  enable row level security;
alter table user_outputs     enable row level security;

create policy own_profile  on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
create policy own_sections on section_entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy own_outputs  on user_outputs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- diagnostic_leads: no client access. Service role only.
```

**Section definitions live in code, not the database:** `lib/sections/*.ts` exports a typed schema per section (field id, label, helper, type, validation, carry-forward source). The renderer is generic and driven by these definitions. Adding Sections 04/06/07/08/09/11/12/13/14 later must require **only a new definition file** — no renderer changes. Verify this by building Section 15 last and confirming zero renderer edits were needed.

---

## 4. Routes

```
/                             Marketing landing
/diagnostic                   Section 00, PUBLIC, no auth  ← the funnel
/diagnostic/result            Score, zone, 3 priority areas, email capture
/signup  /login  /auth/callback
/dashboard                    "Where I Left Off" (workbook p.3)
/workbook/[sectionId]         Generic section renderer: 00,01,02,03,05,10,15
/workbook/checkpoint/stage-1  Interstitial after Section 02
/report                       "What You Now Have" (workbook p.74)
/report/print                 Print-optimised, server-rendered
/account                      Export all data, delete account
/api/ai/positioning           POST, authed, rate-limited — Section 05 assist
/api/export                   GET — full JSON export
```

**Critical funnel rule:** `/diagnostic` must be completable with **zero friction — no account, no email — until the score is calculated.** The email gate appears on `/diagnostic/result`, after the number is revealed. Show the total and zone first, then gate the *three priority areas* and the saved copy. Revealing value before asking is the entire reason this converts.

On signup, migrate any `diagnostic_leads` row matching the email into `section_entries` + `user_outputs` and set `claimed_by`.

---

## 5. The carry-forward engine

The core feature. Implement once, generically.

```ts
// lib/carry.ts
export type CarrySource = {
  key: keyof UserOutputs;      // e.g. 'north_star'
  sectionId: string;           // '02'
  label: string;               // 'North Star'
  sectionName: string;         // "Designing What's Next"
};
```

A section definition declares `carries: CarrySource[]`. The renderer displays them in a **Bridge panel** pinned at the top of the section (and sticky on scroll for Section 03, where the North Star must remain visible during a long exercise).

Behaviour:

- Read-only. Rendered as a labelled card: source section name, output label, the user's own words.
- Each has a **"Revisit Section 0X"** link that navigates to the source and returns to the origin afterward (`?return=/workbook/03`).
- **Empty state matters.** If a carried value is missing, show the prompt-to-complete, not an empty box: *"You haven't written your North Star yet — Section 02 takes 15 minutes and everything here depends on it."* Never render a blank bridge card.
- Editing a source value updates every downstream display immediately. No caching of carried text in downstream JSONB.

Carry map for the MVP (from the content map §3):

| Target | Carries |
|---|---|
| 01 | `diagnostic_total`, `diagnostic_zone`, `priority_areas` |
| 02 | `bench_thesis` |
| 03 | `north_star`, `priority_areas` |
| 05 | `bench_thesis`, `north_star`, `top_3_areas` |
| 10 | `north_star`, `top_3_areas`, `first_action` (from 03 `a_action_30d`) |
| 15 | `bench_thesis`, `reset_sentence`, `north_star`, plus the 30/60/90 plan summary |

---

## 6. Autosave

- Debounced 800 ms after last keystroke, plus on blur, plus on route change, plus on `visibilitychange`.
- Server action writes the whole section JSONB (`upsert` on `user_id, section_id`) and touches `profiles.last_worked_at`.
- After each write, run `syncOutputs(userId, sectionId)` to promote the section's key outputs into `user_outputs`.
- Save state indicator: `Saving… / Saved / Save failed — retry`. Persistent, subtle, never a toast.
- **Offline:** queue writes in `localStorage` keyed `bb:pending:<sectionId>`, flush on reconnect. Cache only, never the source of truth (Hard Rule 4).
- **Do not autosave Section 15's letter mid-sentence with a visible flicker.** Same debounce, but suppress the indicator animation on that page — the register is different (content map §6.5).

---

## 7. Scoring

Single pure module, `lib/scoring.ts`, fully unit-tested. No scoring logic anywhere else.

```ts
export function diagnosticTotal(items: Record<string, number>): number;
export function diagnosticZone(total: number): 'reactive'|'repositioning'|'momentum';
// 0–20 reactive | 21–40 repositioning | 41–60 momentum   ← verbatim bands, do not alter
export function lowestThree(items: Record<string, number>): string[];
// ties broken by the workbook's printed item order, ascending
```

Boundary tests are mandatory: 12, 20, 21, 40, 41, 60. See content map §2 for the note on why the minimum achievable total is 12 — do not "correct" the bands.

`lowestThree` pre-fills `d_priorities`; the user may override. Store the user's final values, not the computed ones, but keep the computed ones for comparison in analytics (counts only, never text).

---

## 8. The report — `/report`

Server-rendered from `user_outputs` + `section_entries`. Mirrors workbook p.74 exactly: a two-column inventory, section label → output name → the user's own words.

- Seven MVP rows rendered with content.
- The other nine rendered greyed with their real section names and the label "Available in the full sequence." This is the upgrade surface; it is also honest.
- Print stylesheet: serif body, no navigation, page breaks between stages, footer `The Bench Blueprint™ · © 2026 Lami Oguntade`.
- PDF via the browser print dialog in v1. **Do not add a headless-Chrome PDF service** — it doubles infrastructure for a marginal gain. Revisit only if users ask.
- Gate: report requires all seven sections `complete`. Below that, show a partial preview with the remaining sections listed. Do not hard-block — seeing the partial artifact is what motivates finishing it.

---

## 9. AI assist (Section 05 only, v1)

Server route `/api/ai/positioning`. Authenticated. Rate limit **5 generations per user per day**, enforced in Postgres.

Preconditions enforced server-side: `p_draft` non-empty and at least one evidence row complete. If unmet, return 400 with the author's instruction: *"Complete the exercise above first."* The workbook is explicit that AI refines rather than replaces thinking — the gate is a product requirement, not a nicety.

Prompt shape (from workbook p.32): given the user's draft and proof points, return exactly three positioning statements — one **specific**, one **broader**, one **bolder** — as JSON. The UI presents them as three cards, each with "Use this" (writes into `p_final`, still editable) and "Discard". Never auto-apply.

Disclosure line under the button: "Your draft and proof points are sent to an AI model to generate suggestions. Nothing else from your workbook is sent."

---

## 10. Payments — build the seam, not the wall

Pricing is undecided. Build so the decision is a config change:

- `profiles.tier` = `'free' | 'full'`.
- Single helper `canAccess(sectionId, tier)` consulted by the section renderer and `/report`.
- v1 ships with **every authenticated user on `'full'`**. No Stripe integration, no paywall UI.
- Do not scatter tier checks. One helper, one call site per surface.

When pricing is set, the only work is a Stripe Checkout route, a webhook that flips `tier`, and an upgrade screen.

---

## 11. Privacy, security, legal

Non-negotiable for a public product holding career anxiety and financial figures.

1. **RLS on from migration 001.** Test it: authenticate as user A, attempt to read user B's `section_entries`, assert failure. Write this as an automated test.
2. **Analytics captures events, never content.** Allowed: `section_started`, `section_completed`, `diagnostic_scored` (with total + zone), `report_generated`. Forbidden: any field value, any free text, any figure. Add a lint rule or a wrapper that only accepts an allowlisted event enum.
3. **No session replay. No heatmaps.** Ever.
4. **`/account` must offer full JSON export and hard account deletion** (cascade). Build both in v1 — retrofitting deletion is painful and it's a GDPR/CCPA requirement for a public product.
5. **Error reporting scrubs request bodies** on all `/workbook/*` and `/api/ai/*` routes.
6. Transactional email only until explicit marketing consent at the diagnostic gate. Separate checkbox, unticked by default.
7. Footer on every page: `The Bench Blueprint™ · © 2026 Lami Oguntade · All rights reserved.` Plus the workbook's own disclaimer, verbatim: *"The information in this workbook is for educational purposes only and should not be construed as legal, financial, tax, or career advice."* This matters more in an app than in a PDF, because Section 10 and the runway guard look like advice.
8. Pages containing workbook prompt copy must be **authenticated and `noindex`** — except `/diagnostic`, which is deliberately public. The book's content should not become a crawlable free substitute for the book.

---

## 12. Build phases

| Phase | Deliverable |
|---|---|
| **1** | Next.js + Supabase + Tailwind/shadcn scaffold. Migration 001 with RLS. Auth flows. Empty dashboard. |
| **2** | Section definition types + generic renderer + autosave + `syncOutputs`. Prove with Section 01 only. |
| **3** | Section 00 as a public route, `lib/scoring.ts` with boundary tests, result page, email capture, lead→user migration. |
| **4** | Carry-forward engine + Bridge panel. Sections 02 and 03. Stage 1 checkpoint interstitial. |
| **5** | Sections 05 and 10, including the optional `b_runway_months` guard (content map §4, item 2). |
| **6** | Section 15 in its distinct register. **Must require zero renderer changes** — this is the extensibility test. |
| **7** | `/report` + print stylesheet + `/account` export and delete. |
| **8** | AI assist. PostHog with the event allowlist. Re-entry email nudge. |

Ship-ready after Phase 7. Phase 8 is the first enhancement, not a launch blocker.

---

## 13. Acceptance criteria

**Functional**

- [ ] A user completes `/diagnostic` with no account, sees total and zone, and only then is asked for an email.
- [ ] Diagnostic totals of 12, 20, 21, 40, 41, 60 map to reactive/reactive/repositioning/repositioning/momentum/momentum.
- [ ] The three lowest-scoring items pre-fill the priority areas; user edits persist over the computed values.
- [ ] Signing up with the diagnostic email carries the score into the account; the user never re-takes it.
- [ ] Typing in any field, closing the tab within 2 seconds, and returning restores the text.
- [ ] The North Star written in Section 02 appears as a read-only bridge chip in Sections 03, 05, and 10.
- [ ] Editing the North Star in Section 02 changes what Section 03 displays, with no stale copy.
- [ ] A missing carried value renders the prompt-to-complete, never an empty card.
- [ ] Section 03's Marketable Strengths picker offers only strengths the user entered in their Strength Map.
- [ ] Section 10 accepts a plan with unfilled priority slots and still marks complete.
- [ ] Entering a runway under 2 months in Section 10 surfaces the author's warning and makes phases 2–3 optional.
- [ ] AI assist refuses to run before the user has drafted a positioning statement.
- [ ] `/report` renders the 7 completed outputs and lists the other 9 as unavailable.
- [ ] `/report/print` produces a clean document with no navigation chrome.
- [ ] `/account` exports complete JSON and permanently deletes on confirmation.
- [ ] Dashboard shows date last worked, section checklist, pick-up-at selector, and — for returning users — the Letter from Section 15.

**Security**

- [ ] Authenticated as user A, direct API and direct Supabase queries for user B's rows both fail.
- [ ] Analytics payload inspection across a full workbook run reveals zero user-authored text.
- [ ] The Anthropic key is absent from all client bundles.
- [ ] All `/workbook/*` routes return `noindex`.

**Content fidelity**

- [ ] Every prompt string in the app matches the content map character-for-character.
- [ ] The three zone descriptions are verbatim.
- [ ] Bench Notes render in the author's first-person voice, visually distinct, not dismissible.
- [ ] No streak counters, no confetti, no percentage-complete on Section 15.
- [ ] The Reactive zone is not coloured red.

**Performance / a11y**

- [ ] Lighthouse ≥ 90 performance and ≥ 95 accessibility on `/diagnostic` and `/workbook/01`.
- [ ] The diagnostic is fully keyboard-operable, scale buttons included, with visible focus.
- [ ] Every input has a programmatic label. Score changes announce via a live region.

---

## 14. Design direction

Take cues from the workbook itself: generous whitespace, restrained palette, one accent colour, serif for the author's Bench Notes and the Letter, sans for UI. Stage colour-coding — Clarify / Position / Execute / Review — carried consistently across dashboard, section headers, and report.

The workbook's own visual grammar to reproduce: the four-stage journey bar, the section priority tiers (Essential / Recommended / Deep Dive), estimated minutes on every section header, and the "x of y" progress marker within a stage. These exist on paper; they are not new UI.

**Mobile matters more than expected.** People do this work in the evening, on a phone, between other obligations. Section 03 in particular is long — make it a vertically stacked set of collapsible category cards rather than a table.
