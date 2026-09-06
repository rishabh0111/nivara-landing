"use client";

import { useEffect, useRef, useState } from "react";
import { useSeen } from "@/components/motion";
import { STREAM } from "@/lib/traces";

/**
 * A figure that rolls to its reading.
 *
 * The value is rendered as real text on the server and only *animated* on the
 * client, so it is present, selectable and readable with no JavaScript. The
 * roll is a flourish on top of a finished number, never the thing that produces
 * it — which is also why `suppressHydrationWarning` is not needed: the first
 * client render matches the server exactly, and the count-up starts after.
 *
 * The denominator is a required prop, not an option. There is no honest way to
 * quote a rate without the cohort it was measured over, and making it part of
 * the component's shape means nobody can forget.
 */
export function Readout({
  value,
  suffix = "",
  decimals = 0,
  of,
  label,
  source,
  tone = "var(--lume)",
}: {
  value: number;
  suffix?: string;
  decimals?: number;
  of: string;
  label: string;
  source: string;
  tone?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const seen = useSeen(host);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const started = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - started) / 1100, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(value * eased);
      if (t < 1) raf = requestAnimationFrame(run);
    };

    setShown(0);
    raf = requestAnimationFrame(run);
    return () => cancelAnimationFrame(raf);
  }, [seen, value]);

  return (
    <div ref={host} className="group relative border-t border-etch pt-5">
      <p className="tab font-mono text-4xl leading-none font-semibold" style={{ color: tone }}>
        {shown.toFixed(decimals)}
        <span className="text-2xl">{suffix}</span>
      </p>
      <p className="tab mt-2 font-mono text-[11px] tracking-wide text-lume-faint">{of}</p>
      <p className="mt-3 text-sm leading-snug text-lume-dim">{label}</p>
      {/* Always present, not revealed on hover: a pointer is not something a
          touch reader has, and provenance is the point of the component. It
          brightens on hover rather than appearing. */}
      <p className="mt-2 font-mono text-[11px] break-all text-lume-faint/70 transition-colors duration-300 group-hover:text-trace">
        {source}
      </p>
    </div>
  );
}

/**
 * The stream a visitor's browser actually receives, printing itself.
 *
 * Server-rendered complete — every line is in the HTML — and then, once seen,
 * re-typed at roughly the cadence a real Turn arrives at. So it is a
 * demonstration for a reader who has JavaScript and a transcript for one who
 * does not, and the two say the same thing.
 */
export function Stream({ className = "" }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const seen = useSeen(host);
  const [shown, setShown] = useState(STREAM.length);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setShown(0);
    let line = 0;
    const tick = window.setInterval(() => {
      line += 1;
      setShown(line);
      if (line >= STREAM.length) window.clearInterval(tick);
    }, 420);

    return () => window.clearInterval(tick);
  }, [seen]);

  return (
    <div ref={host} className={`panel overflow-hidden ${className}`}>
      <div className="flex items-center gap-2 border-b border-etch px-4 py-2.5">
        <span className="pulse relative inline-block size-1.5 rounded-full text-settled">
          <span className="absolute inset-0 rounded-full bg-settled" />
        </span>
        <p className="font-mono text-[11px] tracking-widest text-lume-dim uppercase">
          POST /widget/turns/stream
        </p>
      </div>

      <ol className="tab space-y-1 p-4 font-mono text-xs leading-relaxed">
        {STREAM.map((line, index) => (
          <li
            key={`${line.event}-${index}`}
            className="transition-opacity duration-300"
            style={{ opacity: index < shown ? 1 : 0.14 }}
          >
            <span
              className={
                line.event === "done"
                  ? "text-settled"
                  : line.event === "gate" || line.event === "retrieval"
                    ? "text-trace"
                    : "text-lume-faint"
              }
            >
              event: {line.event}
            </span>
            <span className="ml-2 text-lume-dim">{line.data}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
