"use client";

import Image from "next/image";
import { usePointer } from "@/components/motion";

export const LINKS = {
  web: "https://nivara-web-nextjs.vercel.app",
  dashboard: "https://nivara-web-nextjs.vercel.app/dashboard",
  widget: "https://nivara-web-nextjs.vercel.app/widget",
  portal: "https://nivara-web-nextjs.vercel.app/portal",
  analytics: "https://nivara-web-nextjs.vercel.app/dashboard/analytics",
  docs: "https://nivara-api-nestjs.onrender.com/docs",
  repoApi: "https://github.com/rishabh0111/nivara-api-nestjs",
  repoWeb: "https://github.com/rishabh0111/nivara-web-nextjs",
  repoAi: "https://github.com/rishabh0111/nivara-ai",
  author: "https://rishabh0111.github.io",
} as const;

/**
 * A captured surface, framed as an instrument display.
 *
 * Both themes ship and the stylesheet drops the one that does not apply, so the
 * shot is right in the first paint — including for a reader whose JavaScript
 * never runs. These screenshots are the page's evidence; they do not get to
 * arrive late.
 */
export function Pane({
  name,
  alt,
  width,
  height,
  caption,
  priority = false,
  className = "",
}: {
  name: string;
  alt: string;
  width: number;
  height: number;
  caption?: string;
  priority?: boolean;
  className?: string;
}) {
  const ref = usePointer<HTMLDivElement>();

  // `data-reveal` is set here rather than passed in. The observer and the
  // failsafe both key on this attribute, and a caller that forgot it once left
  // every screenshot on the page invisible.
  return (
    <figure data-reveal className={className}>
      <div ref={ref} className="pane reactive">
        <Image
          className="shot-light"
          src={`/shots/${name}.light.png`}
          alt={alt}
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 1000px) 100vw, 1000px"
        />
        <Image
          className="shot-dark"
          src={`/shots/${name}.dark.png`}
          alt=""
          aria-hidden="true"
          width={width}
          height={height}
          priority={priority}
          sizes="(max-width: 1000px) 100vw, 1000px"
        />
      </div>
      {caption ? (
        <figcaption className="mt-3 font-mono text-[11px] tracking-wide text-lume-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** A label in the instrument's own voice: small, spaced, monospace, quiet. */
export function Legend({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono text-[11px] tracking-[0.18em] text-lume-faint uppercase">{children}</p>
  );
}
