import { ImageResponse } from "next/og";

export const alt = "Nivara Desk — support that knows what it doesn't know";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The card people see when the link is pasted somewhere.
 *
 * For a page whose whole job is to be shared into a cold email, a chat or a
 * profile, this image is often the first thing anyone sees of it — and without
 * one the link renders as a bare line of text. It is generated at build time
 * rather than committed as a PNG so the words can never drift from the page's.
 *
 * Deliberately not a screenshot of the page: at 1200x630, shrunk into a chat
 * client's preview, a screenshot of a landing page is an unreadable smear. It
 * carries the mark, the claim, and the one reading that makes the claim
 * checkable.
 */
export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#07090c",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 13,
              background: "#4cc2ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="34" height="34" viewBox="0 0 32 32" fill="none">
              <path
                d="M25 18.5a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4.5V9.5A2.5 2.5 0 0 1 9 7h13.5A2.5 2.5 0 0 1 25 9.5Z"
                stroke="#07090c"
                strokeWidth="2.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div style={{ color: "#e9eef6", fontSize: 34, fontWeight: 700, letterSpacing: -0.8 }}>
            Nivara Desk
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#e9eef6",
              fontSize: 86,
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: -3.4,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            It knows what it&nbsp;<span style={{ color: "#4cc2ff" }}>doesn&apos;t know.</span>
          </div>
          <div style={{ color: "#8c9bb0", fontSize: 30, marginTop: 26, lineHeight: 1.35 }}>
            Answers what its help centre covers, asks when a request is ambiguous,
            hands the rest to a person.
          </div>
        </div>

        <div style={{ display: "flex", gap: 56, alignItems: "center" }}>
          {[
            ["93.6%", "correct disposition", "#57d9a3"],
            ["0", "successful injections", "#57d9a3"],
            ["94.2%", "retrieval recall@1", "#4cc2ff"],
          ].map(([value, label, tone]) => (
            <div key={label} style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ color: tone, fontSize: 40, fontWeight: 700 }}>{value}</div>
              <div style={{ color: "#6b7a8f", fontSize: 21, marginTop: 6 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
