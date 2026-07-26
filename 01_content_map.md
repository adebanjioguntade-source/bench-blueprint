# The Bench Blueprint — Content Map (MVP: Minimum Viable Path)

Source: `bench_blueprint_workbook_Locked.pdf`, First Edition, © 2026 Lami Oguntade.
Scope: the seven sections the workbook designates as the Minimum Viable Path — **00, 01, 02, 03, 05, 10, 15**.

Every field below traces to a specific page in the workbook. Nothing here is invented. Where the app needs something the workbook doesn't provide, it is called out explicitly in **§4 Broken Dependencies** and **§5 New Constructs**.

---

## 1. Field type legend

| Type | Meaning | UI |
|---|---|---|
| `scale_1_5` | Integer 1–5 | Segmented button row |
| `text_short` | Single line, ~120 chars | Input |
| `text_long` | Paragraph, 1–3 sentences | Textarea, 3 rows |
| `text_xl` | Extended free writing | Textarea, 8+ rows |
| `list_n` | Fixed-count repeating list | N stacked inputs |
| `list_dyn` | User-added rows, min/max noted | Repeater with add/remove |
| `group` | Repeating record with named subfields | Card |
| `date` | Date | Date picker |
| `computed` | Derived, never user-entered | Read-only display |
| `carry` | Read-only value pulled from an earlier section | Reference chip |

---

## 2. Section-by-section inventory

### Section 00 — The Bench Diagnostic
**Stage 1 · Clarify · Essential · 5 min · workbook pp. 9–10**

Instruction text: "Score each item honestly. Within five minutes, you'll know where to focus first." Scale defined as 1 = not yet in place, 5 = consistently strong.

| # | Field ID | Label (verbatim short form) | Type |
|---|---|---|---|
| 1 | `d_resume` | Resume current | `scale_1_5` |
| 2 | `d_linkedin` | LinkedIn updated | `scale_1_5` |
| 3 | `d_certs` | Certifications current | `scale_1_5` |
| 4 | `d_network` | Network active | `scale_1_5` |
| 5 | `d_fund` | Emergency fund in place | `scale_1_5` |
| 6 | `d_positioning` | Positioning clear | `scale_1_5` |
| 7 | `d_proof` | Proof visible | `scale_1_5` |
| 8 | `d_direction` | Career direction defined | `scale_1_5` |
| 9 | `d_gaps` | Gap list current | `scale_1_5` |
| 10 | `d_visibility` | Content or visibility habit | `scale_1_5` |
| 11 | `d_plan` | Transition plan in place | `scale_1_5` |
| 12 | `d_exit` | Exit criteria defined | `scale_1_5` |

Each item carries a one-line clarifier in the workbook (e.g. "Updated within the last 6 months and reflects recent outcomes"). Render these as helper text beneath the label — they are load-bearing, not decoration.

**Computed**

- `d_total` = sum of the 12 items. Range 12–60. Display as `_ / 60`.
- `d_zone` — banding is **verbatim from the workbook** and must not be adjusted:

| Range | Zone | Guidance shown |
|---|---|---|
| 0–20 | **Reactive** | Begin with Bench Reset and Bench Audit before spending energy on visibility, networking, or credentials. Sections 01–05 particularly important. |
| 21–40 | **Repositioning** | Fundamentals exist but gaps are slowing momentum. Pay particular attention to Sections 03–05. |
| 41–60 | **Momentum** | Foundation is strong. Focus on visibility, proof, and opportunity conversion. Sections 06–14 create the greatest leverage. |

> ⚠️ **Math note.** Twelve items scored 1–5 have a *minimum possible total of 12*, so the "0–20" band is only reachable from 12. Do not "fix" this by rescaling — the bands are the author's published instrument and changing them changes her product. But it does mean the Reactive band is narrower in practice (12–20) than it looks. Worth flagging to the author for a second edition, not worth patching in code.

**Outputs**

- `d_priorities` — `list_3`, `text_short`. Workbook: "record your three lowest areas above." App should **pre-fill with the three lowest-scoring items** and let the user override. This is the single highest-value micro-feature in Section 00 — it turns a form into a diagnosis.

**Feeds:** `d_total`, `d_zone` → dashboard + Section 01 bridge. `d_priorities` → Section 03 (lens) and the post-Stage-1 routing table in Section 02.

---

### Section 01 — Bench Reset
**Stage 1 · Clarify · Essential · 10 min · workbook pp. 11–14**

Opens with a Bench Note (author's personal story) and a **Bridge**: "Use this section to make sense of what your Section 00 diagnostic surfaced."

| Field ID | Prompt | Type |
|---|---|---|
| `r_where_now` | Where am I now? What circumstances led to this transition period? | `text_xl` |
| `r_true_financial` | What is true today — the financial reality | `text_long` |
| `r_true_professional` | What is true today — the professional reality | `text_long` |
| `r_true_feeling` | What is true today — how I actually feel about it | `text_long` |
| `r_uncertain` | What feels uncertain | `list_dyn` (3–6) |
| `r_control` | What is in my control | `list_dyn` (3–6) |
| `r_thesis` | **KEY OUTPUT — Bench Thesis.** "This bench period is an opportunity to:" | `text_long` |
| `r_future_self` | Describe the professional I want to be when this bench period ends | `text_long` |
| `r_guardrail` | **Non-Negotiable Guardrail.** What must not happen during this period? | `text_long` |
| `r_leaving` | What am I leaving behind? | `text_short` |
| `r_reset_sentence` | **KEY OUTPUT — Reset Sentence.** One sentence that would make this bench period feel like a success. Not a recovery. | `text_long` |

`r_thesis` is prefixed in the UI with the fixed stem "This bench period is an opportunity to…" — the workbook prints it as a sentence starter.

Example strings to show as placeholder/example (verbatim): Thesis — *"This bench period is an opportunity to stop saying yes to whatever's available and figure out what I actually want next."* Reset — *"Success this season means I stop measuring my worth by how busy I look."*

**Feeds:** `r_thesis` → Section 05 "Before you begin". `r_reset_sentence` → dashboard, Section 15.

---

### Section 02 — Designing What's Next
**Stage 1 · Clarify · Recommended · 15 min · workbook pp. 15–18**

Three movements: **IMAGINE → FILTER → DECLARE**. Render as three visual groups; the progression is the point.

| Field ID | Movement | Prompt | Type |
|---|---|---|---|
| `n_life` | Imagine | What kind of life am I building, and what role should work play within it? | `text_xl` |
| `n_environment` | Imagine | Describe the work environment, engagement type, and daily rhythm I am building toward. What does a good day look like twelve months from now? | `text_xl` |
| `n_one_area` | Imagine | If I could make meaningful progress in only one area over the next 90 days, what would it be? | `text_long` |
| `n_success_12mo` | Filter | What would success look like 12 months from now? | `text_xl` |
| `n_regret` | Filter | What would I regret not pursuing? | `text_long` |
| `n_more_of` | Filter | More of | `list_dyn` (3–6) |
| `n_less_of` | Filter | Less of | `list_dyn` (3–6) |
| `n_introduction` | Declare | In twelve months, when someone introduces me professionally, what do I want them to say about what I do and how I do it? | `text_long` |
| `n_north_star` | Declare | **KEY OUTPUT — One-Sentence North Star.** What am I moving toward? | `text_long` |
| `n_reflection` | Checkpoint | Which of these outputs feels most important right now? | `text_short` |

Completion criterion, verbatim, shown next to the North Star field: *"Your North Star is complete when you can read it aloud and it still sounds like you."*

**Stage 1 checkpoint screen** (p. 17–18) lists five assets produced: Bench Readiness Score, Three Priority Areas, Bench Thesis, Reset Statement, North Star. Build this as a real interstitial — it is the first moment the user sees accumulated output, and it is where the app most obviously beats paper.

**Routing table** (p. 18, "Where to go next"): six focus areas → six sections. In the full app this is navigation. In the MVP, four of the six targets don't exist yet — see §4.

**Feeds:** `n_north_star` → Sections 03, 05, 10 (and 06, 08, 13, 14 post-MVP). It is the most-referenced value in the entire workbook.

---

### Section 03 — Bench Audit
**Stage 2 · Position · Essential · 25 min · workbook pp. 19–23**

Bridge: "Before working through your Strength Map, revisit your Section 02 North Star. Use it as your lens." Show `n_north_star` as a pinned `carry` chip for the whole section.

Four movements: **DISCOVER → VALIDATE → UNCOVER → DECIDE**.

**3a. Strength Map** (`group` × 7, fixed categories). Each category has three subfields: `built`, `surface`, `strengthen` — all `text_long`.

| Category ID | Category | Definition (helper text) |
|---|---|---|
| `sm_core` | Core Skills | The technical and functional work you are trained to do |
| `sm_industry` | Industry Knowledge | Sector context, domain fluency, and market awareness |
| `sm_proof` | Proof of Outcomes | Documented results, case studies, and measurable impact |
| `sm_comms` | Communication | How clearly you convey complex ideas to different audiences |
| `sm_network` | Network Strength | The quality and activation of your professional relationships |
| `sm_credibility` | Technical Credibility | Certifications, tools, platforms, and demonstrated depth |
| `sm_brand` | Personal Brand Clarity | How consistently your professional identity comes across |

Worked example to display (verbatim, Core Skills): Built — *"Project coordination, stakeholder communication."* Surface — *"Mentored new team members, never documented anywhere."* Strengthen — *"Presenting recommendations to larger groups."*

**3b. Marketable Strengths** (`group` × 4). Subfields: `strength` (`text_short`), `evidence` (`text_long`), `where_visible` (`text_short`).

Constraint, verbatim and important: *"Do not generate new strengths here. Transfer the strengths you already identified on the previous page."* → The app should offer a **picker sourced from the user's own `built` entries** rather than a blank field. This is a case where the app can enforce an instruction the paper version can only request.

**3c. Hidden Assets** — six `text_long` prompts in three labelled pairs:

| Field ID | Pair | Prompt |
|---|---|---|
| `h_trust` | Trusted & Proven | What do people already trust me to solve? |
| `h_invisible` | Trusted & Proven | Which achievements are strongest but least visible? |
| `h_energy` | Energy & Fit | What kinds of work give me the most energy? |
| `h_drain` | Energy & Fit | What kinds of work drain me, even if I am good at them? |
| `h_underused` | Undervalued Strengths | Which of my strengths are underused? |
| `h_normal` | Undervalued Strengths | What have I done that feels normal to me but would be impressive to someone else? |

**3d. Decide**

| Field ID | Prompt | Type |
|---|---|---|
| `a_strengthen_priority` | Which area in STRENGTHEN matters most to where I am going? | `text_long` |
| `a_surface_visible` | Which area in SURFACE could become visible with one specific action? | `text_long` |
| `a_action_30d` | What is the one action that would make your SURFACE area visible in the next 30 days? | `text_long` |
| `a_top3` | **KEY OUTPUT — Top 3 Priority Areas** | `list_3`, `text_short` |

**Feeds:** `a_top3` → Section 05, and (post-MVP) Section 04. In the MVP it also substitutes for Section 04's Top 3 Gaps in Section 10 — see §4.

---

### Section 05 — Professional Positioning
**Stage 2 · Position · Recommended · 20 min · workbook pp. 28–33**

"Before you begin" bridge requires four prior outputs. In the MVP, three of four exist — see §4.

| Field ID | Prompt | Type |
|---|---|---|
| `p_who` | I help **[who]** | `text_short` |
| `p_outcome` | achieve **[outcome]** | `text_short` |
| `p_approach` | through **[your approach or expertise]** | `text_short` |
| `p_draft` | Positioning statement (draft) | `computed` from the three above, editable |
| `p_audience` | My primary target audience. Be specific. Not 'companies'. What type, size, industry? | `text_long` |

**Evidence** (`group` × 3): `delivered` (`text_long`), `impact` (`text_long`), `where_to_find` (`text_short`).

**Alternative Positioning Angles** (`group` × 2): `audience` (`text_short`), `value` (`text_short`), `why_works` (`text_long`).

The workbook prints a three-step progress ribbon — DRAFT → ALTERNATIVE ANGLES → FINAL — with "YOU ARE HERE" on the middle step. Reproduce it; it tells the user why they're writing three versions.

| Field ID | Prompt | Type |
|---|---|---|
| `p_final` | **KEY OUTPUT — Final Positioning Statement.** Compare your draft with your two alternate angles. Which is most specific, most credible, most aligned? | `text_long` |
| `p_brand_sentence` | The one sentence that defines my professional brand right now | `text_long` |
| `p_goto` | What do I want to be the go-to person for? | `text_long` |

**Story Cleanup** — four `text_long` prompts: `p_hiding` (What title or label am I hiding behind?), `p_hired_for` (What do I really want to be hired for?), `p_stop_describing` (What kind of work should I stop describing as my focus?), `p_evidence_new` (What evidence supports the new direction?).

**AI-assisted exercise (author-sanctioned, p. 32):** "Paste your strongest proof points and ask it to write three versions: specific, broader, and bolder. Pick the one that feels uncomfortably accurate." → Native feature. Input = `p_draft` + the three evidence rows. Output = 3 candidate statements the user can accept into `p_final`. **Must run after the user drafts, never before** — the workbook is explicit that AI refines rather than replaces thinking.

**Feeds:** `p_final` → dashboard, report, and (post-MVP) Sections 06, 08, 14.

---

### Section 10 — 30 / 60 / 90 Bench Plan
**Stage 3 · Execute · Essential · 20 min · workbook pp. 51–53**

Three phase blocks, identical shape:

| Phase | Label | Theme (verbatim) |
|---|---|---|
| `phase_1` | Days 1–30 | Foundation — Audit, clarity, and positioning |
| `phase_2` | Days 31–60 | Build — Visibility, proof, and outreach |
| `phase_3` | Days 61–90 | Convert — Opportunities, decisions, and momentum |

Each phase: `priority_1`, `priority_2`, `priority_3` (`text_short`), `milestone` (`text_long`), `success_metric` (`text_long`).

Example success metrics, verbatim by phase: *"Positioning finalized."* / *"First visibility asset published."* / *"At least one qualified opportunity or engagement in motion."*

| Field ID | Prompt | Type |
|---|---|---|
| `b_next_7_days` | In the next 7 days I will | `text_long` |
| `b_tomorrow` | The first thing I will do tomorrow morning | `text_short` |
| `b_day_30` | What success looks like at Day 30 | `text_long` |

Explicit instruction to surface in UI: *"Do not fill every line. Focus on the few priorities most likely to create momentum."* Do **not** mark this section incomplete for unfilled priority slots — that would contradict the author.

**Feeds:** dashboard countdown + report. `b_tomorrow` is the single best candidate for a next-day email nudge.

---

### Section 15 — Reinvention Review
**Stage 4 · Review & Reinvent · Recommended · 20 min · workbook pp. 69–72**

Framing, verbatim: *"This section is different. There is no score to calculate and no framework to complete."* Design accordingly — quieter page, wider measure, no progress meter, no autosave toast.

Nine `text_xl` prompts:

| Field ID | Prompt |
|---|---|
| `v_differently` | How do I see my work differently now than when I started this workbook? |
| `v_becoming` | What kind of professional am I becoming? |
| `v_surprised` | What surprised me? |
| `v_clearer` | What am I clearer on now? |
| `v_unsure` | What did I do during this period that I was not sure I could do? |
| `v_outlast` | What did I build that will outlast this chapter? |
| `v_proved` | What did I prove to myself during this season? |
| `v_carrying` | What am I carrying forward into my next season? |
| `v_remember` | What do I want the next version of me to remember about this period? |

**A Letter to the Next Version of Me**: `v_letter` (`text_xl`, generous height), `v_letter_date` (`date`), sign-off printed as "With clarity,".

The workbook says (p. 3) that returning users should re-read this letter before continuing. So the letter must be **resurfaced on the dashboard on re-entry**, not buried in Section 15.

---

### Closing artifact — "What You Now Have"
**workbook p. 74**

A 16-row inventory of durable outputs. This is a finished spec for the app's **generated report**, and it is the product's emotional payoff. MVP renders the 7 rows it can fill and shows the other 9 as locked/greyed with their section names — which doubles as the upgrade prompt for the full sequence.

MVP rows: Bench Readiness Score (00), Bench Thesis (01), North Star (02), The Strength Map (03), Positioning Statement (05), 30/60/90 Bench Plan (10), Reinvention Review (15).

---

## 3. Dependency graph (MVP only)

```
00 ─ d_total, d_zone ─────────────► Dashboard, 01 bridge
   └ d_priorities ────────────────► 03 (lens), 02 routing table

01 ─ r_thesis ────────────────────► 05 (before you begin), Report
   └ r_reset_sentence ────────────► Stage 1 checkpoint, 15, Report

02 ─ n_north_star ────────────────► 03 (bridge lens), 05, 10, Report   ★ most-referenced value
   └ n_one_area ──────────────────► 10 (phase 1 priorities)

03 ─ a_top3 ──────────────────────► 05, 10 (MVP substitute for S04 gaps)
   └ sm_*.built ──────────────────► 03b Marketable Strengths picker
   └ a_action_30d ────────────────► 10 (phase 1)

05 ─ p_final ─────────────────────► Dashboard, Report
   └ p_audience, evidence[] ──────► AI positioning assist

10 ─ b_tomorrow ──────────────────► Email nudge, Dashboard
   └ all phases ──────────────────► Report

15 ─ v_letter ────────────────────► Dashboard on re-entry, Report
```

**Rule for the build:** a carry-forward value renders as a read-only chip with the source section label and a "revisit" link. It is never re-typed and never silently editable from the downstream section. Editing the source updates every downstream display.

---

## 4. Broken dependencies created by the MVP cut

Cutting Sections 04, 07, 09, and 11 severs four bridges the workbook explicitly relies on. Each needs a deliberate decision — silently dropping them will make the app feel incoherent to anyone who has read the book.

| # | Where | What the workbook asks for | Status in MVP | Recommended handling |
|---|---|---|---|---|
| 1 | **S10 Bridge** | "Use your Top 3 Gaps (S04), Visibility Plan (S07), Relationship Capital Inventory (S09) to choose priorities for each phase." | All three missing | Substitute `a_top3` from S03 and `a_action_30d`. Reword the bridge to reference what exists. |
| 2 | **S10 Bridge** | "Treat this plan as provisional until Section 11. Check your Financial Runway; if under 60 days, only commit to Days 1–30." | S11 missing | **Add a single optional field to S10:** `b_runway_months` (number, optional). If < 2, show the author's own warning and collapse phases 2–3 to optional. Cheapest possible way to preserve a genuinely important safety rail. |
| 3 | **S05 Before You Begin** | Requires Bench Thesis, North Star, Strength Map, **Top 3 Gaps (S04)** | 3 of 4 present | Show the three; omit the fourth rather than showing an empty slot. |
| 4 | **S15** | Draws on "Today in Transition" entries (S08) and weekly patterns (S12) as raw material | Both missing | Feed S15 with the Stage 1 checkpoint outputs and the S10 plan instead. Note in the report that the full sequence deepens this section. |
| 5 | **S02 routing table** | Six focus areas route to S06, S05, S09, S02, S04, S07 | Only S05 and S02 exist | Render all six; unavailable targets shown as "in the full sequence" with a waitlist/upgrade tag. Turns a gap into a conversion surface. |

Also note: the workbook's Minimum Viable Path is **00, 01, 02, 03, 05, 10, 15** — it deliberately skips 04. So dependency #1 is a tension the author already accepted on paper. The app just has to make it graceful.

---

## 5. New constructs the app needs (not in the workbook)

These have no page reference because they're native-only. Keep the list short and defensible — every addition is surface area the author has to stand behind.

| Construct | Justification | Source |
|---|---|---|
| **Dashboard / "Where I Left Off"** | Already designed on p. 3: date last worked, 16-section checklist, "I am picking up at section", and a tip to re-read S00 score, S02 North Star, and the Letter. | p. 3 — this is a screen spec, not an invention |
| **Autosave + resume** | The workbook is explicitly designed to be revisited over weeks. | pp. 3, 7 |
| **Carry-forward chips** | Replaces manual transcription across 5 bridges. The core reason to build this. | Bridges throughout |
| **Auto-suggested priority areas** | S00 asks for "your three lowest areas" — computable. | p. 10 |
| **Marketable-strengths picker** | Enforces "do not generate new strengths here." | p. 21 |
| **Generated report** | p. 74 is the spec. | p. 74 |
| **AI positioning assist** | Author-sanctioned exercise. | p. 32 |
| **Runway guard in S10** | Preserves the S11 safety rail without building S11. | p. 51, §4 above |

Everything else — streaks, gamification, social sharing, community — is out of scope and off-brand. The book's whole argument is that activity and progress are not the same thing; a streak counter would contradict the text on page 11.

---

## 6. Tone and copy rules for whoever builds this

1. **Use the workbook's words.** Every prompt, helper line, example, and zone description above is verbatim. Do not paraphrase for brevity — the phrasing is the product, and it's trademarked.
2. **Bench Notes are the author's voice.** Sections 01, 03, and 15 open with first-person stories. Render them visually distinct (left rule, warmer background), never as a dismissible tooltip.
3. **Don't gamify reflection.** No confetti, no "streak", no percentage-complete on Section 15.
4. **Low scores are signals, not judgments** — the workbook says this outright on p. 9. Never colour the Reactive zone red.
5. **Section 15 is a different register.** Quieter, slower, no chrome.
