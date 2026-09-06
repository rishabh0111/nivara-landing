import type { Metadata } from "next";
import { JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/**
 * The product's two faces, loaded the way the product loads them. A landing
 * page that argued it was the same system in a different typeface would be
 * making its own case badly.
 */
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono-face",
});

/**
 * Where this is served from. `VERCEL_PROJECT_PRODUCTION_URL` is the project's
 * stable production domain, so this keeps working through a rename or a custom
 * domain; the literal is only the local fallback.
 */
const SITE = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

const DESCRIPTION =
  "A multitenant support desk with an AI layer that answers what it can, asks when a " +
  "request is ambiguous, escalates the rest to a person, and cannot misreport which it did.";

export const metadata: Metadata = {
  title: "Nivara Desk — support that knows what it doesn't know",
  description: DESCRIPTION,
  // Read from the deployment rather than hardcoded. The URL guessed at build
  // time was wrong the moment Vercel named the project something else, and a
  // wrong base silently points every absolute metadata URL at a host that does
  // not exist.
  metadataBase: new URL(SITE),
  openGraph: {
    title: "Nivara Desk",
    description: DESCRIPTION,
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body className="bg-void font-sans text-lume antialiased">{children}</body>
    </html>
  );
}
