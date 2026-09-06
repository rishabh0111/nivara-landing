/**
 * Two Turns, captured from the deployed system.
 *
 * Every figure the page reports comes from here, and every one of them was
 * produced by the running service rather than chosen to look good: the
 * `POST /widget/turns/stream` response for two real questions asked against
 * the showcase tenant, one that the gate answered and one it handed to a
 * person. The scores are the retrieval scores, the signals are the signals the
 * gate actually read, and the token counts are what the provider billed.
 *
 * They are frozen here rather than fetched live for two reasons. The service
 * sleeps on its free instance, and a hero that waits a minute for a cold start
 * is a hero nobody sees; and a page whose headline number changes between two
 * readers cannot be checked by either of them. Refresh them by re-running the
 * capture and pasting the `done` event.
 */

export type Ruling = "answer" | "clarify" | "escalate";

export type Trace = {
  question: string;
  turnId: string;
  outcome: string;
  ruling: Ruling;
  placement: string;
  /** Retrieved chunks, best first, with the score the retriever gave each. */
  hits: { id: string; score: number }[];
  signals: { topScore: number; margin: number; sensitive: number };
  combined: number;
  provider: string;
  model: string;
  tokens: { prompt: number; completion: number };
  costUsd: number;
  latencyMs: number;
  /** What the model called, and what it said when it called it. */
  call: { name: string; note: string };
};

/** The gate answered this one: strong retrieval, a clear margin, nothing sensitive. */
export const ANSWERED: Trace = {
  question: "What column headers does the contact importer expect?",
  turnId: "cb765689bea14c44a789b315f4710b43",
  outcome: "answered",
  ruling: "answer",
  placement: "answer",
  hits: [
    { id: "DOC-015#1", score: 2.2769449 },
    { id: "DOC-015#0", score: 2.1496897 },
    { id: "DOC-015#2", score: 2.135285 },
    { id: "DOC-020#1", score: 1.3602505 },
    { id: "DOC-019#0", score: 1.1652513 },
  ],
  signals: { topScore: 2.276945, margin: 0.127255, sensitive: 0.000015 },
  combined: 0.019179,
  provider: "groq",
  model: "openai/gpt-oss-120b",
  tokens: { prompt: 1024, completion: 182 },
  costUsd: 0.0002628,
  latencyMs: 3490,
  call: { name: "post_reply", note: "answered from DOC-015, the importer's own help-centre page" },
};

/**
 * The gate escalated this one. Worth reading closely: retrieval was not weak —
 * it scored 1.62 — but the margin to the next chunk was 0.005, meaning nothing
 * in the corpus distinguished itself, and the question was about money. The
 * model declined rather than reaching.
 */
export const ESCALATED: Trace = {
  question: "How long is the refund window on an annual plan?",
  turnId: "4b153061d9ee446babb2542fac85644e",
  outcome: "escalated",
  ruling: "escalate",
  placement: "uncertain",
  hits: [
    { id: "DOC-002#2", score: 1.6225369 },
    { id: "DOC-002#0", score: 1.6178962 },
    { id: "DOC-002#1", score: 1.5665812 },
    { id: "DOC-045#0", score: 1.5205449 },
    { id: "DOC-052#0", score: 1.4671838 },
  ],
  signals: { topScore: 1.622537, margin: 0.004641, sensitive: 0.000753 },
  combined: 0.023051,
  provider: "groq",
  model: "openai/gpt-oss-120b",
  tokens: { prompt: 1035, completion: 170 },
  costUsd: 0.00025725,
  latencyMs: 9483,
  call: {
    name: "escalate",
    note: "the policy excerpts do not cover refund windows, and this moves money",
  },
};

/** The stream a visitor's browser actually receives, in the order it arrives. */
export const STREAM: { event: string; data: string }[] = [
  { event: "status", data: '{ "state": "connecting" }' },
  { event: "status", data: '{ "state": "working" }' },
  { event: "retrieval", data: '{ "top": "DOC-015#1", "score": 2.277, "margin": 0.127 }' },
  { event: "gate", data: '{ "placement": "answer", "ruling": "answer" }' },
  { event: "token", data: '"The importer looks for the required headers"' },
  { event: "token", data: '" email, name, and company."' },
  { event: "done", data: '{ "outcome": "answered", "latency_ms": 3490 }' },
];
