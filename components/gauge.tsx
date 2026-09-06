"use client";

import { useEffect, useRef, useState } from "react";
import { useSeen } from "@/components/motion";
import type { Ruling, Trace } from "@/lib/traces";

const MARKS: { ruling: Ruling; label: string; angle: number; tone: string }[] = [
  { ruling: "answer", label: "Answer", angle: -54, tone: "var(--settled)" },
  { ruling: "clarify", label: "Clarify", angle: 0, tone: "var(--trace)" },
  { ruling: "escalate", label: "Escalate", angle: 54, tone: "var(--handover)" },
];

/**
 * The gate, as the instrument it behaves like.
 *
 * A Turn ends in exactly one of three rulings, and the needle commits to one —
 * which is the honest shape of the thing. A row of three cards would say the
 * system has three features; a needle says it picks.
 *
 * It settles rather than sliding. The overshoot is not decoration: the gate
 * reads its free signals, lands, and does not drift afterwards, and a
 * spring-damped arrival is what that feels like. Reduced motion gets the
 * needle already on its mark.
 *
 * The reading exists as text underneath regardless, so the instrument is an
 * illustration of a sentence rather than a replacement for one.
 */
export function Gauge({ trace, className = "" }: { trace: Trace; className?: string }) {
  const host = useRef<SVGSVGElement>(null);
  const seen = useSeen(host);
  const target = MARKS.find((mark) => mark.ruling === trace.ruling) ?? MARKS[1]!;
  const [angle, setAngle] = useState(target.angle);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Swing wide, overshoot, then settle — three hand-timed angles rather than
    // a spring library for one needle. The overshoot lives here, in where the
    // needle goes, and not in the easing curve: a bouncy cubic-bezier applies
    // its wobble to every property it touches and reads as a toy. A real
    // galvanometer hunts past its reading and comes back, which is what this
    // is; each leg of it decelerates cleanly.
    setAngle(-70);
    const hunt = window.setTimeout(() => setAngle(target.angle + 9), 260);
    const land = window.setTimeout(() => setAngle(target.angle), 700);
    return () => {
      window.clearTimeout(hunt);
      window.clearTimeout(land);
    };
  }, [seen, target.angle]);

  return (
    <figure className={className}>
      <svg
        ref={host}
        viewBox="0 0 320 200"
        role="img"
        aria-label={`The gate ruled ${target.label.toLowerCase()} on this question.`}
        className="w-full"
      >
        {/* the dial face */}
        <path
          d="M28 162a132 132 0 0 1 264 0"
          fill="none"
          stroke="var(--etch)"
          strokeWidth="1.5"
        />

        {/* the three arcs, each owning its outcome's colour */}
        {MARKS.map((mark) => {
          const from = ((mark.angle - 27 - 90) * Math.PI) / 180;
          const to = ((mark.angle + 27 - 90) * Math.PI) / 180;
          const r = 118;
          const x1 = 160 + r * Math.cos(from);
          const y1 = 162 + r * Math.sin(from);
          const x2 = 160 + r * Math.cos(to);
          const y2 = 162 + r * Math.sin(to);
          const live = mark.ruling === trace.ruling;
          return (
            <path
              key={mark.ruling}
              d={`M${x1} ${y1}A${r} ${r} 0 0 1 ${x2} ${y2}`}
              fill="none"
              stroke={mark.tone}
              strokeWidth={live ? 7 : 3}
              strokeLinecap="round"
              opacity={live ? 1 : 0.26}
            />
          );
        })}

        {/* tick marks, every nine degrees */}
        {Array.from({ length: 15 }, (_, i) => {
          const a = ((-63 + i * 9 - 90) * Math.PI) / 180;
          const inner = i % 3 === 0 ? 92 : 100;
          return (
            <line
              key={i}
              x1={160 + inner * Math.cos(a)}
              y1={162 + inner * Math.sin(a)}
              x2={160 + 106 * Math.cos(a)}
              y2={162 + 106 * Math.sin(a)}
              stroke="var(--etch-strong)"
              strokeWidth={i % 3 === 0 ? 1.5 : 1}
            />
          );
        })}

        {/* Labels ride outside the arc, not inside it: at an inner radius the
            needle sweeps straight through them, and the one word a reader
            needs is the one the needle is covering. */}
        {MARKS.map((mark) => {
          const a = ((mark.angle - 90) * Math.PI) / 180;
          return (
            <text
              key={mark.ruling}
              x={160 + 138 * Math.cos(a)}
              y={162 + 138 * Math.sin(a) + 4}
              textAnchor="middle"
              className="font-mono text-[10px] tracking-widest uppercase"
              fill={mark.ruling === trace.ruling ? mark.tone : "var(--lume-faint)"}
            >
              {mark.label}
            </text>
          );
        })}

        {/* the needle */}
        <g
          style={{
            transform: `rotate(${angle}deg)`,
            transformOrigin: "160px 162px",
            transition: "transform 620ms cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <line
            x1="160"
            y1="162"
            x2="160"
            y2="58"
            stroke={target.tone}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="160" cy="58" r="4" fill={target.tone} />
        </g>

        <circle cx="160" cy="162" r="8" fill="var(--panel-high)" stroke="var(--etch-strong)" />
        <circle cx="160" cy="162" r="2.5" fill={target.tone} />
      </svg>

      <figcaption className="tab mt-3 text-center font-mono text-xs text-lume-dim">
        placement <span className="text-lume">{trace.placement}</span> · ruling{" "}
        <span style={{ color: target.tone }}>{trace.ruling}</span>
      </figcaption>
    </figure>
  );
}
