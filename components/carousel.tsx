"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A horizontal carousel built on native scroll-snap.
 *
 * The track is an ordinary overflow-scrolling list, so it works with a
 * trackpad, a touch drag, a scrollbar and the keyboard before a line of
 * JavaScript runs. The script only adds what native scrolling has no opinion
 * about: arrows, an index, and the dots. With no JS the cards are still all
 * there and still reachable.
 *
 * It does not auto-advance. These are six paragraphs about how tenant
 * isolation is enforced, and a card that slides away mid-sentence is a page
 * arguing with its reader. Motion here is a response to intent, not a timer.
 */
export function Carousel({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const measure = useCallback(() => {
    const node = track.current;
    if (!node) return;
    const cards = [...node.children] as HTMLElement[];
    setCount(cards.length);

    // Nearest card to the left edge, rather than scrollLeft divided by a width
    // the cards do not actually share once the layout goes responsive.
    const left = node.scrollLeft;
    let nearest = 0;
    let best = Infinity;
    cards.forEach((card, i) => {
      const distance = Math.abs(card.offsetLeft - node.offsetLeft - left);
      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });
    setIndex(nearest);
    setAtStart(left <= 2);
    setAtEnd(left + node.clientWidth >= node.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const node = track.current;
    if (!node) return;

    measure();
    node.addEventListener("scroll", measure, { passive: true });

    const observer = new ResizeObserver(measure);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  }, [measure]);

  const go = (direction: -1 | 1) => {
    const node = track.current;
    if (!node) return;
    const cards = [...node.children] as HTMLElement[];
    const next = Math.min(Math.max(index + direction, 0), cards.length - 1);
    const target = cards[next];
    if (!target) return;

    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollTo({
      left: target.offsetLeft - node.offsetLeft,
      behavior: quiet ? "auto" : "smooth",
    });
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      go(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      go(-1);
    }
  };

  return (
    <div className="relative">
      <div className="mb-5 flex items-center justify-between gap-4">
        {/* The count is the whole status: "3 of 6" told on every scroll tick
            would talk over a reader who is simply dragging the track. */}
        <p className="tab font-mono text-[11px] tracking-[0.18em] text-lume-faint uppercase">
          <span className="text-lume">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden="true"> / {String(count || 1).padStart(2, "0")}</span>
          <span className="sr-only"> of {count || 1}</span>
        </p>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(-1)}
            disabled={atStart}
            aria-label="Previous"
            className="arm rounded-lg border border-etch p-2 text-lume-dim enabled:hover:border-lume-faint enabled:hover:text-lume disabled:opacity-35"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={atEnd}
            aria-label="Next"
            className="arm rounded-lg border border-etch p-2 text-lume-dim enabled:hover:border-lume-faint enabled:hover:text-lume disabled:opacity-35"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      <ul
        ref={track}
        tabIndex={0}
        aria-label={label}
        onKeyDown={onKeyDown}
        className="track flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4"
      >
        {children}
      </ul>

      {/* Fades marking that the track continues, and pointer-transparent so
          they never eat a drag that starts near the edge. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-void to-transparent transition-opacity duration-300 ${atEnd ? "opacity-0" : "opacity-100"}`}
      />
    </div>
  );
}

/** One card on the track. Sized so a second one always peeks, which is the
 *  only honest way to say "there is more here" without an instruction. */
export function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="panel reactive w-[min(21rem,82vw)] shrink-0 snap-start p-6">
      <h3 className="font-semibold text-lume">{title}</h3>
      <p className="mt-3 leading-relaxed text-pretty text-lume-dim">{children}</p>
    </li>
  );
}
