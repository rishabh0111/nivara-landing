import Script from "next/script";
import { Carousel, Card } from "@/components/carousel";
import { Decode } from "@/components/decode";
import { Embed, Question } from "@/components/embed";
import { Field } from "@/components/field";
import { Gauge } from "@/components/gauge";
import { Motion } from "@/components/motion";
import { Nav } from "@/components/nav";
import { Readout, Stream } from "@/components/readout";
import { Wordmark } from "@/components/logo";
import { Legend, LINKS, Pane } from "@/components/site";
import { themeScript } from "@/components/theme";
import { ANSWERED, ESCALATED } from "@/lib/traces";

/**
 * The Instrument.
 *
 * Every answer this system gives already emits a trace. The page is that trace,
 * rendered as an instrument reading itself — and the readings are real: two
 * captured Turns drive it (`lib/traces.ts`), one answered and one escalated,
 * with the scores the retriever gave, the signals the gate read, and the tokens
 * the provider billed.
 *
 * That is the whole reason this is not another dark developer-tool page. The
 * aesthetic is not borrowed from instrumentation; it is pointed at a system
 * that genuinely produces these numbers, and every value on the page names the
 * run it came from.
 */

const SURFACES = [
  {
    name: "Portal",
    href: LINKS.portal,
    holds: "Contact · password",
    does: "Raise a ticket, read the replies, answer them.",
  },
  {
    name: "Dashboard",
    href: LINKS.dashboard,
    holds: "User · agent or admin",
    does: "Work the queue, reply, leave internal notes.",
  },
  {
    name: "Widget",
    href: LINKS.widget,
    holds: "Visitor · anonymous session",
    does: "Ask from a tenant's own site. No account first.",
  },
  {
    name: "Analytics",
    href: LINKS.analytics,
    holds: "User · analytics:read",
    does: "Four rates, two percentiles, and what an empty cohort is not.",
  },
];

const GUARANTEES = [
  {
    title: "Row-level security, forced",
    line: "Every tenant-scoped table has RLS enabled and forced. The application connects as a role that is neither superuser nor table owner, so it cannot bypass a policy even by mistake.",
  },
  {
    title: "The tenant is never a client value",
    line: "It is read from the auth token or the channel context and armed transaction-locally. Nothing a caller sends can widen what a request can see.",
  },
  {
    title: "404, not 403",
    line: "A row another tenant owns returns not-found rather than forbidden, because a 403 confirms the record exists and turns the API into a probe.",
  },
  {
    title: "Two credentials, not one",
    line: "The token that answers tickets and the token that reads analytics are separate grants, so the credential on the request path cannot read the numbers its own work is scored by.",
  },
  {
    title: "Injection resistance by contract",
    line: "Sensitive tools expose no granted branch, so a prompt-injection has nothing to steer the system toward. Zero successful injections across the adversarial suite.",
  },
  {
    title: "An audit trail with attribution",
    line: "Append-only, with the actor enforced by database trigger rather than supplied by the code path being audited. An absent actor raises rather than defaulting.",
  },
];

const CHANNELS = [
  {
    name: "Widget",
    tag: "shadow root",
    line: "An anonymous session from a tenant's own site, origin-checked against that tenant's allowlist.",
  },
  {
    name: "Slack",
    tag: "Events API",
    line: "A message in a connected channel opens a ticket, and the reply comes back to the thread it started in.",
  },
  {
    name: "REST + OpenAPI",
    tag: "generated types",
    line: "The whole surface is documented and the front end's client types are generated from it, with a scheduled job that fails when the two drift.",
  },
  {
    name: "WebSocket",
    tag: "rooms with replay",
    line: "Per-room sequence numbers and a bounded replay buffer, so a reconnecting client resumes rather than guesses.",
  },
];

const FOOTER = [
  {
    heading: "Product",
    links: [
      ["Live demo", LINKS.dashboard],
      ["Widget", LINKS.widget],
      ["Portal", LINKS.portal],
      ["Analytics", LINKS.analytics],
    ] as const,
  },
  {
    heading: "Developers",
    links: [
      ["API documentation", LINKS.docs],
      ["Embed the widget", "#embed"],
      ["Isolation model", "#security"],
      ["Questions", "#faq"],
    ] as const,
  },
  {
    heading: "Source",
    links: [
      ["nivara-api-nestjs", LINKS.repoApi],
      ["nivara-web-nextjs", LINKS.repoWeb],
      ["nivara-ai", LINKS.repoAi],
      ["rishabh0111.github.io", LINKS.author],
    ] as const,
  },
];

const REPOS = [
  {
    name: "nivara-api-nestjs",
    href: LINKS.repoApi,
    stack: "NestJS · Postgres · Prisma",
    line: "Row-level security on every tenant-scoped table, cursor pagination, WebSocket rooms with replay, SLA clocks, an append-only audit log.",
  },
  {
    name: "nivara-web-nextjs",
    href: LINKS.repoWeb,
    stack: "Next.js · TypeScript · Tailwind",
    line: "Four front ends and one typed client, generated from the API's own OpenAPI document. The widget ships separately and mounts in a shadow root.",
  },
  {
    name: "nivara-ai",
    href: LINKS.repoAi,
    stack: "Python · FastAPI · Qdrant",
    line: "Retrieval, the agent loop behind an MCP tool surface, the gate, and an eval harness that reproduces every number with no provider key.",
  },
];

export default function Home() {
  return (
    <>
      <Script id="theme" strategy="beforeInteractive">
        {themeScript}
      </Script>
      <Motion />

      <div
        aria-hidden="true"
        className="progress fixed inset-x-0 top-0 z-50 h-px origin-left bg-trace"
      />

      <a
        href="#trace"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-panel focus:px-4 focus:py-2 focus:shadow-lift"
      >
        Skip to the walkthrough
      </a>

      {/* ================================================================= */}
      <Nav />

      <div id="top" className="relative overflow-hidden">
        <div aria-hidden="true" data-parallax="34" className="grid-face absolute inset-0" />



        <section className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-6 pt-10 pb-20 lg:grid-cols-[1.03fr_0.97fr] lg:gap-16 lg:pt-14">
          <div>
          <Legend>Support · answered, clarified, or handed over</Legend>

          <h1 className="mt-5 max-w-[15ch] text-[clamp(2.6rem,6.4vw,4.5rem)] leading-[0.97] font-bold tracking-[-0.035em] text-balance">
            It knows what it{" "}
            <Decode text="doesn't know." className="text-trace" delay={420} />
          </h1>

          <p className="mt-7 max-w-[52ch] text-lg leading-relaxed text-pretty text-lume-dim">
            Nivara Desk answers what its help centre covers, asks when a request is ambiguous, and
            hands the rest to a person with what it already found. It cannot report that it answered
            something it did not.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href={LINKS.dashboard}
              className="arm call inline-flex items-center gap-2 rounded-lg bg-trace px-5 py-3 font-semibold text-void hover:shadow-lift"
            >
              Open the live demo
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </a>
            <a
              href="#trace"
              className="arm rounded-lg border border-etch-strong px-5 py-3 font-semibold text-lume hover:border-lume-faint"
            >
              Read one answer, end to end
            </a>
          </div>

          <p className="mt-4 font-mono text-xs text-lume-faint">
            Signs in as a seeded demo admin. Nothing to create, nothing to pay for.
          </p>
          </div>

          {/*
           * The instrument, in the first viewport rather than below it. The
           * page's whole claim is that these readings are real, so the reading
           * is the hero — a needle committing to a verdict off numbers a
           * visitor can go and reproduce.
           */}
          <div data-parallax="-26" className="panel reactive relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-etch px-5 py-3">
              <Legend>Turn {ANSWERED.turnId.slice(0, 12)}</Legend>
              <span className="tab font-mono text-[11px] text-settled">{ANSWERED.outcome}</span>
            </div>

            <div className="px-5 pt-5">
              <p className="font-mono text-sm leading-relaxed text-lume">
                &ldquo;{ANSWERED.question}&rdquo;
              </p>
            </div>

            <Field trace={ANSWERED} className="h-36 px-5 sm:h-44" />

            <dl className="tab grid grid-cols-3 gap-3 border-y border-etch px-5 py-4 font-mono text-xs">
              <div>
                <dt className="text-lume-faint">top score</dt>
                <dd className="mt-1 text-base text-trace">{ANSWERED.signals.topScore.toFixed(3)}</dd>
              </div>
              <div>
                <dt className="text-lume-faint">margin</dt>
                <dd className="mt-1 text-base text-trace">{ANSWERED.signals.margin.toFixed(3)}</dd>
              </div>
              <div>
                <dt className="text-lume-faint">sensitive</dt>
                <dd className="mt-1 text-base text-lume-dim">
                  {ANSWERED.signals.sensitive.toFixed(6)}
                </dd>
              </div>
            </dl>

            <div className="px-5 pt-4 pb-6">
              <Gauge trace={ANSWERED} />
              <p className="tab mt-4 text-center font-mono text-[11px] text-lume-faint">
                {(ANSWERED.latencyMs / 1000).toFixed(2)}s · {ANSWERED.tokens.prompt +
                  ANSWERED.tokens.completion}{" "}
                tokens · ${ANSWERED.costUsd.toFixed(5)} modelled
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ================================================================= */}
      <main id="trace" className="scroll-mt-6">
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <Legend>Station 01 — the wire</Legend>
          <h2 data-reveal className="reveal mt-5 max-w-[20ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
            A visitor asks, and the browser watches it happen.
          </h2>
          <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
            The widget is one script tag on the tenant&rsquo;s own site, rendered inside a shadow
            root so the host page&rsquo;s stylesheet cannot reach in and its own cannot leak out. It
            mints an anonymous session judged on the page&rsquo;s origin — no email, no password, no
            sign-up wall in front of a question.
          </p>

          <div className="mt-12 grid items-start gap-8 lg:grid-cols-[1fr_1fr]">
            <Stream className="reveal" data-reveal />
            <Pane
              className="reveal-pane"
              name="widget.panel"
              alt="The support widget open on a page, showing the visitor's question about contact importer column headers, the answer beneath it, and the conversation marked resolved."
              width={704}
              height={1024}
              caption="The same exchange, in the widget a visitor sees."
            />
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="border-y border-etch bg-panel/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Legend>Station 02 — the gate</Legend>
            <h2 data-reveal className="reveal mt-5 max-w-[24ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
              Three outcomes, and it commits to one.
            </h2>
            <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
              The gate decides on free signals first — the top retrieval score, the margin to the
              next chunk, whether the question is sensitive — and only spends a second model call on
              the genuinely uncertain few. Here is the same instrument on a question it refused.
            </p>

            <div className="mt-12 grid gap-4 lg:grid-cols-[1fr_1.05fr]">
              <div data-reveal className="panel reveal reactive p-6 sm:p-8">
                <Legend>The question</Legend>
                <p className="mt-3 font-mono text-sm leading-relaxed text-lume">
                  &ldquo;{ESCALATED.question}&rdquo;
                </p>
                <Field trace={ESCALATED} className="mt-2 h-52" />
                <dl className="tab grid grid-cols-3 gap-4 border-t border-etch pt-4 font-mono text-xs">
                  <div>
                    <dt className="text-lume-faint">top score</dt>
                    <dd className="mt-1 text-base text-lume-dim">
                      {ESCALATED.signals.topScore.toFixed(3)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-lume-faint">margin</dt>
                    <dd className="mt-1 text-base text-handover">
                      {ESCALATED.signals.margin.toFixed(3)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-lume-faint">sensitive</dt>
                    <dd className="mt-1 text-base text-handover">
                      {ESCALATED.signals.sensitive.toFixed(6)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div data-reveal className="panel reveal reactive flex flex-col justify-between p-6 sm:p-8">
                <Legend>The ruling</Legend>
                <Gauge trace={ESCALATED} className="my-4" />
                <p className="text-sm leading-relaxed text-lume-dim">
                  Retrieval was not weak — it scored{" "}
                  <span className="tab font-mono text-lume">
                    {ESCALATED.signals.topScore.toFixed(2)}
                  </span>
                  . But the margin to the next chunk was{" "}
                  <span className="tab font-mono text-handover">
                    {ESCALATED.signals.margin.toFixed(3)}
                  </span>
                  : nothing in the corpus distinguished itself. And the question moves money. It
                  declined rather than reached.
                </p>
              </div>
            </div>

            <p className="mt-10 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
              Prose the model writes outside a tool call is never posted to a customer. That is the
              guarantee the whole layer is built around: the only path to a customer&rsquo;s inbox
              is a tool call carrying retrieved content, so the system cannot claim an answer it
              did not give.
            </p>

            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              <Readout
                value={93.6}
                suffix="%"
                decimals={1}
                of="595 of 600 cases"
                label="Correct disposition — answered, clarified or escalated as it should have been."
                source="eval/harness_results.md"
                tone="var(--settled)"
              />
              <Readout
                value={0}
                of="across the adversarial suite"
                label="Successful prompt injections."
                source="injection/ · nivara-ai"
                tone="var(--settled)"
              />
              <Readout
                value={94.2}
                suffix="%"
                decimals={1}
                of="against a 92.9% dense baseline"
                label="Retrieval recall@1, after the hybrid path earned its place."
                source="eval/retrieval_ablation.md"
                tone="var(--trace)"
              />
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <Legend>Station 03 — the hand-over</Legend>
          <h2 data-reveal className="reveal mt-5 max-w-[24ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
            A person picks it up where it stopped.
          </h2>
          <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
            An escalation arrives as an ordinary ticket carrying an internal note with what the
            model already found, so the agent starts where it stopped rather than from the top. The
            queue is filtered, cursor-paginated and live — and deliberately does not rearrange itself
            under a reader mid-scroll.
          </p>

          <div className="mt-12 space-y-10">
            <Pane
              className="reveal-pane"
              name="ticket"
              alt="A resolved ticket in the agent dashboard: the customer's question about importer column headers, the answer posted by Automation, and the state, priority and assignee controls above it."
              width={2880}
              height={1800}
              caption="The widget question, as a real ticket on the staff queue. The same ticket."
            />
            <Pane
              className="reveal-pane"
              name="queue"
              alt="The agent dashboard's ticket queue, filtered by state, priority, source and assignee, listing tickets newest first."
              width={2880}
              height={1800}
              caption="The queue it landed in."
            />
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="border-y border-etch bg-panel/40">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Legend>Station 04 — the score</Legend>
            <h2 data-reveal className="reveal mt-5 max-w-[26ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
              And a number the system cannot tune.
            </h2>
            <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
              Deflection is read from the API&rsquo;s own analytics, over a window whose start is a
              committed constant, using the API&rsquo;s definition verbatim. The AI layer never holds
              the credential that reads it, so the thing being measured cannot quote its own score.
              Where the live rate and the offline one disagree, the gap is published beside them
              rather than subtracted.
            </p>

            <Pane
              className="reveal-pane mt-12"
              name="analytics"
              alt="The analytics surface: deflection, resolution and SLA-breach rates each shown above the ticket count they were computed from, with median and 90th-percentile response times, broken down by priority and source."
              width={2880}
              height={1800}
              caption="Read live from the deployment. These figures move with real traffic."
            />
          </div>
        </section>


        {/* --------------------------------------------------------------- */}
        <section id="security" className="border-y border-etch bg-panel/40 scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Legend>Isolation</Legend>
            <h2 data-reveal className="reveal mt-5 max-w-[26ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
              A forgotten filter cannot leak another tenant&rsquo;s rows.
            </h2>
            <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
              Isolation is a property of the database rather than a discipline in application code.
              Every tenant-scoped table has Postgres row-level security enabled and forced, with a
              policy predicated on a transaction-local setting, so the rows simply are not returned.
            </p>

            <div data-reveal className="reveal mt-12">
              <Carousel label="How tenant isolation is enforced">
                {GUARANTEES.map((item) => (
                  <Card key={item.title} title={item.title}>
                    {item.line}
                  </Card>
                ))}
              </Carousel>
            </div>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section id="embed" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
          <Legend>Install</Legend>
          <h2 data-reveal className="reveal mt-5 max-w-[24ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
            One script tag, and it answers on your own site.
          </h2>
          <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
            The widget mounts inside a shadow root, so the host page&rsquo;s stylesheet cannot reach
            in and its own cannot leak out. Sessions are judged on the requesting origin against that
            tenant&rsquo;s allowlist. This is the real file the demo host loads — view its source and
            you will find these three lines.
          </p>

          {/* `min-w-0` on both columns, not decoration: a grid item defaults to
              `min-width: auto`, so the snippet's longest line sizes the whole
              column and `overflow-x-auto` on the <pre> never gets a chance to
              scroll. Without it the page gained 100px of horizontal scroll on a
              phone. */}
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div data-reveal className="reveal min-w-0">
              <Embed />
            </div>

            <ul data-reveal className="reveal min-w-0 space-y-6">
              {CHANNELS.map((channel, index) => (
                <li key={channel.name} style={{ ["--i" as string]: index }} className="border-t border-etch pt-4">
                  <div className="flex items-baseline gap-3">
                    <h3 className="font-semibold text-lume">{channel.name}</h3>
                    <span className="font-mono text-[11px] text-trace">{channel.tag}</span>
                  </div>
                  <p className="mt-2 leading-relaxed text-pretty text-lume-dim">{channel.line}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section id="cost" className="border-y border-etch bg-panel/40 scroll-mt-20">
          <div className="mx-auto w-full max-w-6xl px-6 py-24">
            <Legend>What it costs to run</Legend>
            <h2 data-reveal className="reveal mt-5 max-w-[24ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
              Nothing, so far.
            </h2>
            <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
              There is no price list here because nothing is for sale. What there is instead is the
              actual bill: every rung of the model chain is a free tier, so the modelled cost below
              is what these answers <em>would</em> cost at each provider&rsquo;s published list
              price, quoted beside a real spend of zero.
            </p>

            <div className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-3">
              <Readout
                value={0}
                decimals={2}
                suffix=" USD"
                of="actual spend to date"
                label="Every provider rung, the vector store and all three hosts are on free tiers."
                source="eval/scoreboard.md"
                tone="var(--settled)"
              />
              <Readout
                value={0.00026}
                decimals={5}
                suffix=" USD"
                of="modelled, at list price"
                label="The answered Turn above, priced at the provider's published rate for its real token count."
                source="src/nivara_ai/turn/cost.py"
                tone="var(--trace)"
              />
              <Readout
                value={26}
                suffix="–39%"
                of="across eight routed categories"
                label="Cheaper again with the model router on, measured at no accuracy regression."
                source="eval/router_ablation.md"
                tone="var(--trace)"
              />
            </div>

            <p className="mt-10 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
              The free instances sleep after fifteen idle minutes, which is the honest cost of this
              particular bill: a genuine cold start can take up to a minute. A scheduled ping keeps
              the API warm; the AI service is left to sleep.
            </p>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-6 py-24">
          <Legend>The architecture</Legend>
          <h2 data-reveal className="reveal mt-5 max-w-[26ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
            Four front ends, one API. What separates them is what they hold.
          </h2>
          <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
            Not what they render. Every surface resolves its tenant server-side from the credential
            on the request, and the tenant is never a value the client passes. Isolation is enforced
            in Postgres with row-level security, so a forgotten filter in application code cannot
            return another tenant&rsquo;s rows.
          </p>

          <ul className="mt-12 grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {SURFACES.map((surface) => (
              <li key={surface.name} className="group border-t border-etch pt-5">
                <a
                  href={surface.href}
                  className="arm inline-flex items-baseline gap-3 text-xl font-bold tracking-tight text-lume"
                >
                  {surface.name}
                  <span className="font-mono text-[11px] font-normal text-trace opacity-70 transition-opacity group-hover:opacity-100">
                    {surface.holds}
                  </span>
                </a>
                <p className="mt-2.5 leading-relaxed text-pretty text-lume-dim">{surface.does}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-24">
          <Legend>The source</Legend>
          <h2 data-reveal className="reveal mt-5 max-w-[26ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
            Three repositories, and every number in them reproduces.
          </h2>
          <p className="mt-5 max-w-[64ch] leading-relaxed text-pretty text-lume-dim">
            The evaluation harness runs from a clean clone with no provider key and no credential of
            the author&rsquo;s — it replays committed recordings — so the figures on this page are
            checkable rather than claimed.
          </p>

          <ul className="mt-12 space-y-8">
            {REPOS.map((repo) => (
              <li key={repo.name} className="group border-t border-etch pt-5">
                <a
                  href={repo.href}
                  className="arm flex flex-wrap items-baseline gap-x-4 gap-y-1 font-mono font-semibold tracking-tight text-lume"
                >
                  {repo.name}
                  <span className="text-[11px] font-normal text-lume-faint transition-colors group-hover:text-trace">
                    {repo.stack}
                  </span>
                </a>
                <p className="mt-3 max-w-[72ch] leading-relaxed text-pretty text-lume-dim">
                  {repo.line}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* --------------------------------------------------------------- */}
        <section id="faq" className="mx-auto w-full max-w-6xl scroll-mt-20 px-6 py-24">
          <Legend>Questions</Legend>
          <h2 data-reveal className="reveal mt-5 max-w-[24ch] text-[clamp(1.9rem,4.4vw,3rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
            The things worth asking.
          </h2>

          <div className="mt-10 max-w-[72ch]">
            <Question q="Is this a real product I can buy?" open>
              No. Nivara Desk is a working system built as a portfolio project — it runs, it is
              deployed, and every number on this page came out of it, but there are no customers, no
              pricing and nothing for sale. The tenants and their tickets are seeded demo data.
            </Question>

            <Question q="Are these figures real, or illustrative?">
              Real, and reproducible. The evaluation harness runs from a clean clone with no
              provider key and no credential of the author&rsquo;s — it replays committed
              recordings — so the accuracy, injection and retrieval numbers regenerate from data in
              the repository. The two Turns driving the instruments on this page were captured from
              the deployed service, and the deflection screenshot is read live.
            </Question>

            <Question q="What stops the model from claiming it answered something it did not?">
              Prose written outside a tool call is never posted to a customer. The only path to a
              customer&rsquo;s inbox is a tool call carrying retrieved content, so an answer that
              was never grounded has no route to become one. The eval harness scores disposition
              separately from content for exactly this reason.
            </Question>

            <Question q="What happens to a question about money?">
              It escalates, by contract rather than by the model&rsquo;s judgement. Refunds, account
              recovery and anything that moves money are classified sensitive before the model is
              asked, and the sensitive path has no answering branch to take.
            </Question>

            <Question q="Why is the first request slow?">
              Free hosting. The instances sleep after fifteen idle minutes and a genuine cold start
              can take up to a minute. A scheduled ping keeps the API warm; the AI service is left to
              sleep, because keeping it awake would mean burning quota on nobody.
            </Question>

            <Question q="Can I run it myself?">
              Yes — <code className="font-mono text-sm text-trace">docker compose up</code> in the
              API repository migrates the schema, seeds two tenants and comes up with no credentials
              and no keys. Optional integrations stay dormant when unconfigured rather than fatal,
              which is what makes a key-free start possible.
            </Question>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <section className="border-t border-etch">
          <div className="mx-auto w-full max-w-6xl px-6 py-24 text-center">
            <h2 data-reveal className="reveal mx-auto max-w-[20ch] text-[clamp(2rem,5vw,3.25rem)] leading-tight font-bold tracking-[-0.03em] text-balance">
              Ask it something it cannot answer.
            </h2>
            <p className="mx-auto mt-5 max-w-[52ch] leading-relaxed text-pretty text-lume-dim">
              The interesting half of this system is what it refuses. Open the widget and ask about
              a refund — then watch the ticket arrive on the agent queue.
            </p>

            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <a
                href={LINKS.widget}
                className="arm call inline-flex items-center gap-2 rounded-lg bg-trace px-6 py-3.5 font-semibold text-void hover:shadow-lift"
              >
                Open the widget
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                  <path d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </a>
              <a
                href={LINKS.dashboard}
                className="arm rounded-lg border border-etch-strong px-6 py-3.5 font-semibold text-lume hover:border-lume-faint"
              >
                Open the dashboard
              </a>
            </div>

            <p className="mt-4 font-mono text-xs text-lume-faint">
              Demo admin, seeded. Nothing to create, nothing to pay for.
            </p>
          </div>
        </section>

      </main>

      {/* ================================================================= */}
      <footer className="border-t border-etch bg-panel/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Wordmark />
              <p className="mt-3 max-w-[34ch] text-sm leading-relaxed text-pretty text-lume-dim">
                A support desk that answers what it can and says so when it cannot.
              </p>
            </div>

            {FOOTER.map((column) => (
              <div key={column.heading}>
                <h2 className="font-mono text-[11px] tracking-[0.18em] text-lume-faint uppercase">
                  {column.heading}
                </h2>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map(([label, href]) => (
                    <li key={label}>
                      <a href={href} className="arm inline-block text-sm text-lume-dim hover:text-lume">
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-14 border-t border-etch pt-8">
            <p className="max-w-[68ch] text-sm leading-relaxed text-pretty text-lume-dim">
              Built as a portfolio project by{" "}
              <a
                href={LINKS.author}
                className="arm font-semibold text-lume underline decoration-etch-strong hover:decoration-trace"
              >
                Rishabh Sharma
              </a>
              . It runs on free tiers, so the first request after a quiet spell can take a moment to
              wake. The tenants and their tickets are seeded demo data — there are no real customers
              behind any number here, and nothing on this page is for sale.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
