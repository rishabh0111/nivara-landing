"use client";

import { useEffect } from "react";

/**
 * The two free-tier backends the demo stands on, woken while the reader reads.
 *
 * Both sleep after fifteen idle minutes, and the first request after that pays
 * a cold start of up to a minute. Without this, that request is the reader's
 * first click on "Open the live demo". With it, the wake-up starts when the page
 * opens, and someone who reads even the hero before clicking finds both awake.
 *
 * `no-cors` because nothing reads the answer: the request arriving is the whole
 * point, and an opaque response is enough for that.
 */
const BACKENDS = [
  "https://nivara-api-nestjs.onrender.com/health",
  "https://nivara-ai-7qw8.onrender.com/health",
];

export function Wake() {
  useEffect(() => {
    for (const url of BACKENDS) {
      fetch(url, { mode: "no-cors", cache: "no-store" }).catch(() => {});
    }
  }, []);

  return null;
}
