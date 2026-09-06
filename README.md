# nivara-landing

The landing page for [Nivara Desk](https://nivara-web-nextjs.vercel.app) — a multitenant
support desk whose AI layer answers what it can, asks when a request is ambiguous, and
escalates the rest to a person.

Next.js 15 · React 19 · TypeScript · Tailwind v4. Statically rendered; no server, no
database, no environment variables.

## Running it

```bash
npm install
npm run dev
```

Then `http://localhost:3000`.

```bash
npm run build && npm run start   # production build
npm run lint
npx tsc --noEmit
```

## The screenshots

Every product image under `public/shots/` is captured from the running system rather than
mocked up, by a script that signs in with the seeded demo credential and drives each
surface:

```bash
npx tsx scripts/capture.ts
```

It points at the deployment by default. Pass `--base`, `--api` and `--ai` to capture from a
local `docker compose up` stack instead:

```bash
npx tsx scripts/capture.ts --base http://localhost:3001 \
                           --api  http://localhost:3000 \
                           --ai   http://localhost:8000
```

Two files land per surface, one per theme, and the stylesheet drops whichever does not
apply. Re-run it after any change to the product's UI, or the page starts describing a
version of it that no longer exists.

## Checks

```bash
npm run lint
npx tsc --noEmit
npx tsx scripts/check-links.ts            # local
npx tsx scripts/check-links.ts <live-url>  # a deployment
```

`check-links.ts` reads the anchors out of the served HTML and follows them.
It fails on an `<a>` with no `href`, because a styled anchor that goes nowhere
looks exactly like a working button.

## Deploying

Vercel, from the repository root, with no configuration and no environment variables. The
build output is fully static.

## The rest of the system

| | |
|---|---|
| [nivara-api-nestjs](https://github.com/rishabh0111/nivara-api-nestjs) | The API — tenancy, tickets, real-time, analytics |
| [nivara-web-nextjs](https://github.com/rishabh0111/nivara-web-nextjs) | The four front ends and the typed client |
| [nivara-ai](https://github.com/rishabh0111/nivara-ai) | Retrieval, the agent loop, the gate, the eval harness |
