"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The page's motion engine.
 *
 * It is deliberately not CSS scroll-driven animation. `animation-timeline:
 * view()` is Chromium-only — Firefox and Safari report `false` for it — and an
 * earlier build fell back to `animation: none`, which meant a third of readers
 * got a page with every scroll effect silently switched off. An
 * IntersectionObserver and one rAF-throttled scroll listener behave the same
 * in every engine, so the effects either run for everybody or for nobody.
 *
 * Three jobs:
 *
 * 1. **Arm.** Sets `data-motion="on"` so the stylesheet's displaced "before"
 *    states apply at all. Nothing in the markup depends on it — with no
 *    JavaScript the page is already at rest and fully legible.
 * 2. **Reveal.** Marks `[data-reveal]` elements `data-seen` as they arrive.
 * 3. **Parallax.** Offsets `[data-parallax]` by a fraction of its distance
 *    from the viewport's centre, transform only, so it never triggers layout.
 *
 * The failsafe matters as much as the effects. If the observer never fires —
 * a stalled tab, an engine quirk, a bug of mine — everything is revealed after
 * two seconds anyway. The page's content is never contingent on an animation
 * completing.
 */
export function Motion() {
  useEffect(() => {
    const root = document.documentElement;
    const quiet = window.matchMedia("(prefers-reduced-motion: reduce)");

    let observer: IntersectionObserver | null = null;
    let raf = 0;
    let failsafe = 0;
    let parallaxNodes: HTMLElement[] = [];

    const revealAll = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((node) => {
        node.dataset.seen = "true";
      });
    };

    const teardown = () => {
      observer?.disconnect();
      observer = null;
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      raf = requestAnimationFrame(() => {
        ticking = false;
        const middle = window.innerHeight / 2;
        for (const node of parallaxNodes) {
          const rect = node.getBoundingClientRect();
          // Skip anything well outside the viewport: the whole point of a
          // parallax layer is that it costs nothing when nobody can see it.
          if (rect.bottom < -200 || rect.top > window.innerHeight + 200) continue;
          const depth = Number(node.dataset.parallax) || 0;
          const offset = ((rect.top + rect.height / 2 - middle) / middle) * depth;
          node.style.setProperty("--shift", `${offset.toFixed(2)}px`);
        }
      });
    }

    const start = () => {
      // Reduced motion is not "faster animation", it is no animation. The
      // attribute is never set, so the displaced states never apply.
      if (quiet.matches || typeof IntersectionObserver === "undefined") {
        delete root.dataset.motion;
        revealAll();
        return;
      }

      root.dataset.motion = "on";

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            (entry.target as HTMLElement).dataset.seen = "true";
            observer?.unobserve(entry.target);
          }
        },
        { rootMargin: "0px 0px -12% 0px", threshold: 0.06 },
      );

      document
        .querySelectorAll<HTMLElement>("[data-reveal]")
        .forEach((node) => observer?.observe(node));

      parallaxNodes = [...document.querySelectorAll<HTMLElement>("[data-parallax]")];
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      onScroll();

      failsafe = window.setTimeout(revealAll, 2000);
    };

    start();

    const rearm = () => {
      teardown();
      start();
    };
    quiet.addEventListener("change", rearm);

    return () => {
      teardown();
      quiet.removeEventListener("change", rearm);
    };
  }, []);

  return null;
}

/**
 * True once the element has been seen, and stays true. Instruments settle when
 * a reader is actually looking, once — replaying on every scroll-past would
 * make the page a fidget. Returns `true` immediately for a reduced-motion
 * reader, which is the finished state.
 */
export function useSeen(ref: React.RefObject<Element | null>, margin = "-10% 0px") {
  const [seen, setSeen] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || done.current) return;

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      typeof IntersectionObserver === "undefined"
    ) {
      done.current = true;
      setSeen(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          done.current = true;
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: margin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [ref, margin]);

  return seen;
}

/**
 * A pointer-reactive surface. Publishes the pointer's position over the
 * element as `--px`/`--py` (0–1) and its distance-from-centre as `--tx`/`--ty`,
 * so a panel can catch a light or lean toward the cursor in CSS alone.
 *
 * Pointer events rather than mouse events, and it does nothing for a coarse
 * pointer: a phone has no cursor to react to, and running this on touch would
 * spend battery producing a tilt nobody asked for.
 */
export function usePointer<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const move = (event: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = node.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width;
        const py = (event.clientY - rect.top) / rect.height;
        node.style.setProperty("--px", `${(px * 100).toFixed(1)}%`);
        node.style.setProperty("--py", `${(py * 100).toFixed(1)}%`);
        node.style.setProperty("--tx", (px - 0.5).toFixed(3));
        node.style.setProperty("--ty", (py - 0.5).toFixed(3));
      });
    };

    const leave = () => {
      cancelAnimationFrame(raf);
      node.style.setProperty("--tx", "0");
      node.style.setProperty("--ty", "0");
    };

    node.addEventListener("pointermove", move);
    node.addEventListener("pointerleave", leave);
    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener("pointermove", move);
      node.removeEventListener("pointerleave", leave);
    };
  }, []);

  return ref;
}
