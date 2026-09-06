"use client";

import { useEffect, useRef } from "react";
import { useSeen } from "@/components/motion";
import type { Trace } from "@/lib/traces";

/**
 * Retrieval, drawn.
 *
 * The corpus is a field of points; a question enters and the nearest few light
 * up in rank order. What the drawing is really about is the **margin** — the
 * distance between the best chunk and the next one — because that gap, not the
 * top score, is the signal the gate leans on hardest. A question whose top hit
 * scores 1.62 with a margin of 0.005 found nothing that distinguished itself,
 * and that is the escalated Turn in `lib/traces.ts`.
 *
 * Canvas rather than 240 DOM nodes, and it stops drawing the moment it leaves
 * the viewport or the tab goes to the background — a decorative field that
 * keeps a phone warm in a background tab is a bug, not an effect.
 *
 * It is `aria-hidden` and paired with a real table in the markup beside it. The
 * numbers are readable without it; this makes them felt.
 */
export function Field({ trace, className = "" }: { trace: Trace; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const seen = useSeen(box);

  useEffect(() => {
    const el = canvas.current;
    const parent = box.current;
    if (!el || !parent || !seen) return;

    const context = el.getContext("2d");
    if (!context) return;

    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    const resize = () => {
      const rect = parent.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      el.width = Math.round(width * dpr);
      el.height = Math.round(height * dpr);
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    // A deterministic scatter: the same field every load, so two readers
    // looking at the page are looking at the same picture.
    let seed = 20260906;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };

    const AMBIENT = 190;
    const ambient = Array.from({ length: AMBIENT }, () => ({
      x: random(),
      y: random(),
      r: 0.7 + random() * 1.2,
      drift: 0.15 + random() * 0.5,
      phase: random() * Math.PI * 2,
    }));

    // The retrieved chunks, placed by rank: the best sits at the query, the
    // rest fall away by how far their score is below it.
    const top = trace.hits[0]?.score ?? 1;
    const bottom = trace.hits[trace.hits.length - 1]?.score ?? 0;
    const span = Math.max(top - bottom, 0.0001);
    const hits = trace.hits.map((hit, index) => {
      const closeness = (hit.score - bottom) / span;
      const radius = 0.1 + (1 - closeness) * 0.32;
      const angle = -0.9 + index * 1.31;
      return { ...hit, radius, angle, closeness };
    });

    let raf = 0;
    let start = 0;
    let running = true;

    const draw = (now: number) => {
      if (!start) start = now;
      const t = (now - start) / 1000;
      const intro = quiet ? 1 : Math.min(t / 1.1, 1);
      const eased = 1 - Math.pow(1 - intro, 3);

      context.clearRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.5;
      const scale = Math.min(width, height);

      const ink = getComputedStyle(el).getPropertyValue("--field-ink").trim() || "#8c9bb0";
      const signal = getComputedStyle(el).getPropertyValue("--field-signal").trim() || "#4cc2ff";

      // ambient corpus
      for (const point of ambient) {
        const bob = quiet ? 0 : Math.sin(t * point.drift + point.phase) * 3;
        context.beginPath();
        context.arc(point.x * width, point.y * height + bob, point.r, 0, Math.PI * 2);
        context.fillStyle = ink;
        context.globalAlpha = 0.16 * eased;
        context.fill();
      }

      context.globalAlpha = 1;

      // the query
      const pulse = quiet ? 0 : (Math.sin(t * 1.8) + 1) * 0.5;
      context.beginPath();
      context.arc(cx, cy, 4.5, 0, Math.PI * 2);
      context.fillStyle = signal;
      context.fill();
      context.beginPath();
      context.arc(cx, cy, 8 + pulse * 12 * eased, 0, Math.PI * 2);
      context.strokeStyle = signal;
      context.globalAlpha = (0.45 - pulse * 0.4) * eased;
      context.lineWidth = 1.2;
      context.stroke();
      context.globalAlpha = 1;

      // the retrieved, and the line back to the query
      hits.forEach((hit, index) => {
        const appear = quiet ? 1 : Math.max(0, Math.min((t - 0.25 - index * 0.13) / 0.5, 1));
        if (appear <= 0) return;
        const ease = 1 - Math.pow(1 - appear, 3);
        const r = hit.radius * scale * 0.42;
        const x = cx + Math.cos(hit.angle) * r * ease;
        const y = cy + Math.sin(hit.angle) * r * ease;

        context.beginPath();
        context.moveTo(cx, cy);
        context.lineTo(x, y);
        context.strokeStyle = signal;
        context.globalAlpha = 0.1 + (1 - hit.radius) * 0.3 * ease;
        context.lineWidth = index === 0 ? 1.6 : 1;
        context.stroke();

        context.beginPath();
        context.arc(x, y, index === 0 ? 5.5 : 3.4, 0, Math.PI * 2);
        context.fillStyle = signal;
        context.globalAlpha = (index === 0 ? 1 : 0.5) * ease;
        context.fill();
        context.globalAlpha = 1;
      });

      if (running && !quiet) raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    // Stop when nobody is looking. A background tab throws frames anyway, but
    // an element scrolled out of view does not, and this one would keep running.
    const visible = new IntersectionObserver(([entry]) => {
      const onscreen = !!entry?.isIntersecting;
      if (onscreen && !running) {
        running = true;
        raf = requestAnimationFrame(draw);
      } else if (!onscreen && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    visible.observe(parent);

    const observer = new ResizeObserver(resize);
    observer.observe(parent);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      visible.disconnect();
    };
  }, [seen, trace]);

  return (
    <div ref={box} className={`relative ${className}`} aria-hidden="true">
      <canvas
        ref={canvas}
        className="block size-full [--field-ink:var(--lume-faint)] [--field-signal:var(--trace)]"
      />
    </div>
  );
}
