/**
 * Captures the product's real surfaces into `public/shots/`.
 *
 * The page argues that four front ends are told apart by the credential they
 * hold. Illustrating that with drawings would be arguing it twice; these are
 * the running surfaces, signed into with the seeded demo credential, at the
 * moment each one is making its point.
 *
 * Points at whatever `--base` / `--api` say, so the same script serves the
 * deployed system today and a local `docker compose up` stack later without
 * being edited. Defaults to the deployment.
 *
 *   npx tsx scripts/capture.ts
 *   npx tsx scripts/capture.ts --base http://localhost:3001 --api http://localhost:3000
 *
 * Two notes on running it against the deployment. The AI service is on a free
 * instance that sleeps after fifteen idle minutes, so the widget capture warms
 * it first and allows a cold start; and the shots contain seeded demo data
 * only, which is public by construction — there is no private record here to
 * leak into a public repository.
 */
import { chromium, type Browser, type Page } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

function flag(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  const v = i === -1 ? null : process.argv[i + 1];
  return v && !v.startsWith('--') ? v : fallback;
}

const BASE = flag('base', 'https://nivara-web-nextjs.vercel.app');
const API = flag('api', 'https://nivara-api-nestjs.onrender.com');
const AI = flag('ai', 'https://nivara-ai-7qw8.onrender.com');
const OUT = path.join(process.cwd(), 'public', 'shots');

/** The seeded showcase tenant. Public demo data — see the seed's own README. */
const TENANT = '5eed0000-0000-4000-8000-000000000001';
const EMAIL = 'admin@meridian.test';
const PASSWORD = 'nivara-demo-password';

type Theme = 'light' | 'dark';
const THEMES: Theme[] = ['light', 'dark'];

/** Retina, so a downscaled shot stays crisp under a `2x` CSS width. */
const SCALE = 2;
const DESKTOP = { width: 1440, height: 900 };
const NARROW = { width: 430, height: 932 };

async function shoot(page: Page, name: string, theme: Theme) {
  const file = path.join(OUT, `${name}.${theme}.png`);
  await page.screenshot({ path: file, animations: 'disabled' });
  console.log(`  ${path.relative(process.cwd(), file)}`);
}

/**
 * Settles the page before a shot: fonts loaded, network idle, and one
 * animation frame past both. Without the font wait the first capture of a run
 * catches fallback metrics and the type is subtly wrong in only that one shot.
 */
async function settle(page: Page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
  );
}

async function signIn(page: Page) {
  await page.goto(`${BASE}/dashboard`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Workspace ID').fill(TENANT);
  await page.getByLabel('Email').fill(EMAIL);
  await page.getByLabel('Password').fill(PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/, { timeout: 60_000 });
  await page.getByRole('heading').first().waitFor({ timeout: 60_000 });
}

/** Wakes the free-tier AI instance so the widget capture is not a spinner. */
async function warmAi() {
  process.stdout.write('warming the AI instance… ');
  const started = Date.now();
  try {
    await fetch(`${AI}/health`, { signal: AbortSignal.timeout(120_000) });
    console.log(`awake in ${Math.round((Date.now() - started) / 1000)}s`);
  } catch {
    console.log('no answer — the widget shot may show a connecting state');
  }
}

async function context(browser: Browser, theme: Theme, viewport = DESKTOP) {
  return browser.newContext({
    viewport,
    deviceScaleFactor: SCALE,
    colorScheme: theme,
    reducedMotion: 'reduce',
  });
}

/**
 * Opens the Widget, asks a question the Corpus actually covers, and waits for
 * the Answer to land before shooting.
 *
 * The launcher-on-a-page shot says the Widget exists; this one says it works,
 * which is the only claim worth a picture. The question is one of the seeded
 * help-centre topics (`corpus/documents.jsonl`, DOC-015), so the Gate rules
 * `answer` rather than escalating — a shot of an escalation would be honest
 * about a different thing than the one this frame is making.
 */
async function captureWidgetAnswering(page: Page, theme: Theme) {
  await page.goto(`${BASE}/widget`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await shoot(page, 'widget.host', theme);

  // The Widget boots closed behind its launcher, or already open when it
  // resumes a session it was left open in (`widget.tsx`, the `resumed.place`
  // branch). Both are ordinary, so the capture opens it only when it is shut
  // rather than assuming the launcher is there to click.
  const launcher = page.locator('.nvw-launcher');
  const box = page.locator('.nvw-box');

  // Wait on the shadow root's first painted control rather than on one named
  // state, then act on whichever arrived. Polling both beats racing two
  // `waitFor`s, which reports only the branch that happened not to win.
  // Reloaded rather than waited on longer. The Widget mints its session on
  // boot, against an API on a free instance that may be asleep; when that call
  // times out the boot does not retry itself and no amount of further waiting
  // produces a control. A reload is a fresh attempt against an instance the
  // first one has by then woken.
  const painted = async () =>
    page
      .waitForFunction(
        () => {
          const host = document.querySelector('nivara-widget');
          const root = host && (host as HTMLElement & { shadowRoot: ShadowRoot | null }).shadowRoot;
          return !!root?.querySelector('.nvw-launcher, .nvw-box');
        },
        undefined,
        { timeout: 45_000 },
      )
      .then(
        () => true,
        () => false,
      );

  let ready = await painted();
  for (let attempt = 1; !ready && attempt <= 3; attempt++) {
    console.log(`    (the Widget did not boot — reloading, attempt ${attempt} of 3)`);
    await page.reload({ waitUntil: 'domcontentloaded' });
    ready = await painted();
  }
  if (!ready) {
    throw new Error('the Widget never rendered a control after three reloads');
  }

  if (await launcher.count()) {
    await launcher.click();
  }

  await box.waitFor({ timeout: 90_000 });
  await box.fill('What column headers does the contact importer expect?');
  await page.locator('.nvw-send').click();

  // A cold rung plus retrieval plus the Gate; generous, and the shot is taken
  // either way so a slow run degrades to a "working" frame rather than failing.
  await page
    .locator('.nvw-said li')
    .nth(1)
    .waitFor({ timeout: 120_000 })
    .catch(() => console.log('    (no answer in time — shooting the pending state)'));
  await page.waitForTimeout(1500);

  // The thread auto-scrolls to the newest line, which puts the frame at the end
  // of the Answer with the question off the top — a picture of some prose. Back
  // to the question, so the frame carries the exchange rather than half of it.
  await page.locator('.nvw-said').evaluate((list) => {
    // The thread is not the scroller — a panel ancestor is — so walk up to
    // whichever element actually overflows and put that one back to the top.
    let node: HTMLElement | null = list as HTMLElement;
    while (node) {
      if (node.scrollHeight > node.clientHeight + 4) {
        node.scrollTop = 0;
        return;
      }
      node = node.parentElement;
    }
  });
  await page.waitForTimeout(600);
  await settle(page);
  await shoot(page, 'widget.answering', theme);

  // The panel on its own, so the page can place it as an object rather than
  // crop it out of a screenshot of somebody else's page.
  const panel = page.locator('.nvw-panel').first();
  const bounds = await panel.boundingBox();
  if (bounds) {
    await page.screenshot({
      path: path.join(OUT, `widget.panel.${theme}.png`),
      clip: bounds,
      animations: 'disabled',
    });
    console.log(`  ${path.relative(process.cwd(), path.join(OUT, `widget.panel.${theme}.png`))}`);
  }
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log(`base ${BASE}\napi  ${API}\n`);
  await warmAi();

  const browser = await chromium.launch();

  for (const theme of THEMES) {
    console.log(`\n${theme}:`);

    const ctx = await context(browser, theme);
    const page = await ctx.newPage();

    await signIn(page);

    // The queue, not the filter form above it. The Dashboard opens with its
    // filters expanded, which is right for someone working a queue and wrong
    // for a picture of one — scrolled to the list, the shot is of the thing
    // the surface is for.
    await page.getByRole('heading', { name: /tickets/i }).first().waitFor();
    await page.locator('input[placeholder*="subject" i]').scrollIntoViewIfNeeded();
    await settle(page);
    await shoot(page, 'queue', theme);

    // One Ticket open: the thread, the internal Notes, the audit timeline and
    // the three write actions in one frame. The densest true picture of the
    // staff surface, and the one that shows it is a working desk.
    const firstTicket = page.locator('a,button').filter({ hasText: /SSO redirect loop|refund|billing/i }).first();
    if (await firstTicket.count()) {
      await firstTicket.click();
      await page.waitForTimeout(2500);
      // Back to the top, or the sticky header eats the Ticket's own subject and
      // the frame opens on a form instead of on the thing the form is about.
      await page.evaluate(() => window.scrollTo(0, 0));
      await settle(page);
      await shoot(page, 'ticket', theme);
    }

    await page.goto(`${BASE}/dashboard/analytics`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    await shoot(page, 'analytics', theme);

    await captureWidgetAnswering(page, theme);

    await ctx.close();

    // The Portal is a different credential, so it gets a clean context rather
    // than inheriting the staff session — capturing it signed in as an admin
    // would be a picture of the wrong claim.
    const portalCtx = await context(browser, theme);
    const portal = await portalCtx.newPage();
    await portal.goto(`${BASE}/portal`, { waitUntil: 'domcontentloaded' });
    await settle(portal);
    await shoot(portal, 'portal', theme);
    await portalCtx.close();

    const narrowCtx = await context(browser, theme, NARROW);
    const narrow = await narrowCtx.newPage();
    await narrow.goto(`${BASE}/widget`, { waitUntil: 'domcontentloaded' });
    await settle(narrow);
    await shoot(narrow, 'widget.narrow', theme);
    await narrowCtx.close();
  }

  await browser.close();
  console.log('\ndone');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
