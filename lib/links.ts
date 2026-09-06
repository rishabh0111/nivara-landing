/**
 * Every outbound URL, in one plain module.
 *
 * Plain, and deliberately so: this used to live in `components/site.tsx`, and
 * the day that file gained `"use client"` for a pointer effect, every anchor
 * built from it in a Server Component silently lost its `href`. A Server
 * Component importing a value from a client module receives a client-reference
 * proxy, so `LINKS.widget` read as `undefined` and React simply omitted the
 * attribute — no error, no warning, twenty dead links.
 *
 * Data has no reason to sit beside a component. Keeping it here means no
 * directive on any file can turn a URL into `undefined` again.
 */
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
