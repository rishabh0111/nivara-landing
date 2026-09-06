"use client";

import { useEffect, useState } from "react";
import { Wordmark } from "@/components/logo";
import { LINKS } from "@/components/site";
import { ThemeToggle } from "@/components/theme";

const SECTIONS = [
  ["How it works", "#trace"],
  ["Security", "#security"],
  ["Embed", "#embed"],
  ["Cost", "#cost"],
  ["FAQ", "#faq"],
] as const;

/**
 * The page header.
 *
 * It condenses on scroll rather than appearing on it: a bar that materialises
 * out of nothing when a reader scrolls up is a small jump-scare, and one that
 * is simply always there costs a strip of the first viewport. So it starts
 * transparent and flush with the hero, and gains its ground and its border once
 * the page has moved.
 *
 * The mobile menu is a `<dialog>`-less disclosure on purpose — nothing here
 * needs protected focus or an interruption, and a modal for five anchors is a
 * heavier promise than the content deserves.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // A menu that survives a rotation into desktop width would leave the page
  // scroll-locked behind a panel nobody can see.
  useEffect(() => {
    if (!open) return;
    const wide = window.matchMedia("(min-width: 768px)");
    const close = () => setOpen(false);
    wide.addEventListener("change", close);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      wide.removeEventListener("change", close);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-etch bg-void/80 backdrop-blur-xl supports-[backdrop-filter]:bg-void/65"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
        {/* The visible wordmark is the link's name. An sr-only label beside it
            just makes a screen reader say the product twice. */}
        <a href="#top" className="arm">
          <Wordmark withStatus />
        </a>

        <nav aria-label="Sections" className="ml-auto hidden items-center gap-1 md:flex">
          {SECTIONS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="arm rounded-lg px-3 py-1.5 text-sm text-lume-dim hover:text-lume"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <a
            href={LINKS.docs}
            className="arm hidden rounded-lg px-3 py-1.5 font-mono text-xs text-lume-dim hover:text-lume sm:block"
          >
            /docs
          </a>
          <a
            href={LINKS.dashboard}
            className="arm hidden rounded-lg bg-trace px-3.5 py-1.5 text-sm font-semibold text-void sm:block"
          >
            Live demo
          </a>
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="arm rounded-lg border border-etch px-2 py-1.5 text-lume-dim md:hidden"
          >
            <span className="sr-only">{open ? "Close the menu" : "Open the menu"}</span>
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4">
              {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-etch bg-void px-6 pb-6 md:hidden"
      >
        <nav aria-label="Sections" className="flex flex-col py-2">
          {SECTIONS.map(([label, href]) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="border-b border-etch py-3.5 text-lume-dim last:border-0 hover:text-lume"
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          href={LINKS.dashboard}
          className="mt-2 block rounded-lg bg-trace px-4 py-3 text-center font-semibold text-void"
        >
          Open the live demo
        </a>
      </div>
    </header>
  );
}
