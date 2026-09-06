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

const DESCRIPTION =
  "A multitenant support desk with an AI layer that answers what it can, asks when a " +
  "request is ambiguous, escalates the rest to a person, and cannot misreport which it did.";

export const metadata: Metadata = {
  title: "Nivara Desk — support that knows what it doesn't know",
  description: DESCRIPTION,
  metadataBase: new URL("https://nivara-landing.vercel.app"),
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
