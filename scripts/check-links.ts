/**
 * Every link the page actually renders, followed.
 *
 * Written after a check that passed while twenty links were dead. That one
 * fetched the URLs the page was *supposed* to contain — a list kept by hand,
 * next to the code, agreeing with itself. It could not see that
 * `LINKS.widget` had quietly become `undefined` and that React was dropping
 * the attribute entirely.
 *
 * So this reads the anchors out of the served HTML and follows those. An
 * anchor with no `href` is a failure here, not an invisible one: a styled
 * `<a>` that goes nowhere looks exactly like a working button.
 *
 *   npx tsx scripts/check-links.ts [url]
 */
async function main() {
  const target = process.argv[2] ?? "http://localhost:4321";

  const html = await fetch(target).then((response) => {
    if (!response.ok) throw new Error(`${target} returned ${response.status}`);
    return response.text();
  });

  const anchors = [...html.matchAll(/<a\b([^>]*)>/g)].map((match) => match[1] ?? "");
  const missing = anchors.filter((attrs) => !/\shref=/.test(attrs));

  const hrefs = [
    ...new Set(
      anchors
        .map((attrs) => /\shref="([^"]*)"/.exec(attrs)?.[1])
        .filter((href): href is string => !!href && !href.startsWith("#")),
    ),
  ];

  console.log(`${target}\n${anchors.length} anchors · ${hrefs.length} distinct destinations\n`);

  let failed = missing.length;
  if (missing.length) {
    console.log(`✗ ${missing.length} anchor(s) with no href:`);
    for (const attrs of missing) console.log(`    <a${attrs.slice(0, 90)}>`);
    console.log("");
  }

  for (const href of hrefs) {
    const url = href.startsWith("http") ? href : new URL(href, target).toString();
    try {
      // Some hosts refuse HEAD; a GET that is thrown away is slower and honest.
      const response = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(90_000) });
      const ok = response.ok;
      if (!ok) failed += 1;
      console.log(`  ${ok ? "✓" : "✗"} ${response.status} ${href}`);
    } catch (error) {
      failed += 1;
      console.log(`  ✗ ERR ${href} — ${(error as Error).message}`);
    }
  }

  console.log(failed ? `\n${failed} problem(s)` : "\nall good");
  process.exitCode = failed ? 1 : 0;
}

main();
