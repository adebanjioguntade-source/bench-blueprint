import Link from "next/link";

const STAGES = [
  {
    name: "Clarify",
    labelClass: "text-stage-clarify",
    body: "Score where you are, reset the story, and name what is next.",
  },
  {
    name: "Position",
    labelClass: "text-stage-position",
    body: "Audit strengths and write a positioning statement you can stand on.",
  },
  {
    name: "Execute",
    labelClass: "text-stage-execute",
    body: "Turn direction into a 30 / 60 / 90 plan you can actually keep.",
  },
  {
    name: "Review",
    labelClass: "text-stage-review",
    body: "Capture what you now have — then write the letter that closes the season.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-4">
          <p className="font-serif text-lg font-semibold tracking-tight text-foreground">
            The Bench Blueprint
          </p>
          <nav className="flex items-center gap-3 text-sm">
            <Link
              href="/login"
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-muted"
            >
              Create account
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <span className="inline-block rounded-full bg-stage-clarify/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider text-stage-clarify">
            Career reinvention workbook
          </span>
          <h1 className="mt-5 font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Know where you are. Then build what is next.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
            A guided, resumable path through the Minimum Viable Path — seven
            sections, about 95 minutes of focused work, spread over days or
            weeks. Earlier answers carry forward so you never re-type what you
            already wrote.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/diagnostic"
              className="inline-flex items-center justify-center rounded-md bg-stage-clarify px-6 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-stage-clarify focus:ring-offset-2"
            >
              Take the 5-minute diagnostic
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-base font-medium text-foreground hover:bg-muted"
            >
              Continue where I left off
            </Link>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            No account required to score yourself. Email comes after you see
            your number.
          </p>
        </div>

        <section className="mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage) => (
            <article
              key={stage.name}
              className="rounded-lg border border-border bg-card p-5 shadow-sm"
            >
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${stage.labelClass}`}
              >
                {stage.name}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {stage.body}
              </p>
            </article>
          ))}
        </section>
      </main>

      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted-foreground">
        <p>The Bench Blueprint™ · © 2026 Lami Oguntade · All rights reserved.</p>
        <p className="mx-auto mt-2 max-w-md italic text-[11px]">
          The information in this workbook is for educational purposes only and
          should not be construed as legal, financial, tax, or career advice.
        </p>
      </footer>
    </div>
  );
}
