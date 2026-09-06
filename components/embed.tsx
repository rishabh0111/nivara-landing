"use client";

import { useEffect, useRef, useState } from "react";

const SNIPPET = `<script
  src="https://nivara-web-nextjs.vercel.app/widget/widget.js"
  data-tenant-id="YOUR_TENANT_ID"
  defer
></script>`;

/**
 * The real snippet, with a copy control that reports what it did.
 *
 * This is the actual file the demo host loads and the actual attribute it
 * reads — a visitor can view-source the demo page and find the same three
 * lines. A landing page's install snippet is the one piece of code on it a
 * reader might genuinely try, so inventing a plausible-looking one would be
 * the worst thing to fake here.
 *
 * The button falls back to selecting the text where the clipboard is refused,
 * which is every insecure origin and a good few locked-down browsers. Copying
 * silently failing is worse than not offering the button.
 */
export function Embed() {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const code = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    window.clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(SNIPPET);
      setState("copied");
    } catch {
      const node = code.current;
      if (node) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      setState("failed");
    }
    timer.current = window.setTimeout(() => setState("idle"), 2600);
  };

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-etch px-4 py-2.5">
        <p className="font-mono text-[11px] tracking-widest text-lume-faint uppercase">
          index.html
        </p>
        <button
          type="button"
          onClick={copy}
          className="arm rounded-md border border-etch px-2.5 py-1 font-mono text-[11px] text-lume-dim hover:border-lume-faint hover:text-lume"
        >
          {state === "copied" ? "copied" : state === "failed" ? "selected — press ⌘C" : "copy"}
        </button>
      </div>

      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:text-[13px]">
        <code ref={code} className="text-lume-dim">
          {SNIPPET}
        </code>
      </pre>

      {/* Announced rather than only coloured, so the outcome reaches a reader
          who cannot see the label change. */}
      <p role="status" aria-live="polite" className="sr-only">
        {state === "copied"
          ? "Snippet copied to the clipboard."
          : state === "failed"
            ? "Clipboard unavailable. The snippet has been selected for you to copy."
            : ""}
      </p>
    </div>
  );
}

/**
 * A question and its answer.
 *
 * `<details>` rather than a hand-built accordion: it is open-able before
 * hydration, findable by the browser's own in-page search even while closed in
 * engines that support that, and keyboard-operable without a line of code. The
 * only thing added is the marker rotation.
 */
export function Question({
  q,
  children,
  open = false,
}: {
  q: string;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group border-b border-etch py-1">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 font-semibold text-lume marker:hidden [&::-webkit-details-marker]:hidden">
        {q}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="size-4 shrink-0 text-lume-faint transition-transform duration-300 group-open:rotate-45"
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </summary>
      <div className="max-w-[68ch] pb-5 leading-relaxed text-pretty text-lume-dim">{children}</div>
    </details>
  );
}
