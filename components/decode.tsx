"use client";

import { useEffect, useRef, useState } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/\\<>[]{}=+*#%";

/**
 * Text that resolves out of noise, once.
 *
 * Thematically exact rather than ornamental: this is a page about retrieval
 * settling on an answer, and the headline settles the same way. Each character
 * churns for a moment and then locks, left to right, so the phrase arrives
 * rather than appears.
 *
 * The real string is what renders on the server and what a screen reader gets —
 * the churn is a client-side overwrite of already-correct text, and the
 * accessible name is pinned to the true value throughout. No JavaScript, no
 * effect, no difference to what the page says.
 */
export function Decode({
  text,
  className = "",
  delay = 260,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const [shown, setShown] = useState(text);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    started.current = true;

    let frame = 0;
    let raf = 0;
    let timer = 0;

    // Roughly three frames of churn per character before it locks.
    const run = () => {
      frame += 1;
      const locked = Math.floor(frame / 2.4);

      setShown(
        text
          .split("")
          .map((character, index) => {
            if (index < locked || character === " ") return character;
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? character;
          })
          .join(""),
      );

      if (locked <= text.length) raf = requestAnimationFrame(run);
      else setShown(text);
    };

    timer = window.setTimeout(() => {
      raf = requestAnimationFrame(run);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [text, delay]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
