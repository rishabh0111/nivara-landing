/**
 * The product's mark, lit for this ground.
 *
 * Same geometry as the icon the application serves, so it is recognisably the
 * same product in two tabs. The fill is the page's own accent rather than the
 * application's `#1d63c4`, for the reason the application itself keeps two
 * accents: the light-mode blue is chosen to be legible on white and goes muddy
 * on near-black. A logo that is the wrong blue for its background is not more
 * faithful, it is just harder to see.
 *
 * The live dot stays, moved onto the mark's corner where it reads as a status
 * on the product rather than as a bullet before its name.
 */
export function Logo({ withStatus = false }: { withStatus?: boolean }) {
  return (
    <span className="relative inline-flex">
      <svg
        aria-hidden="true"
        viewBox="0 0 32 32"
        className="size-7 shrink-0"
      >
        <rect width="32" height="32" rx="7" className="fill-trace" />
        <path
          d="M25 18.5a2.5 2.5 0 0 1-2.5 2.5H11l-4.5 4.5V9.5A2.5 2.5 0 0 1 9 7h13.5A2.5 2.5 0 0 1 25 9.5Z"
          fill="none"
          className="stroke-void"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {withStatus ? (
        <span
          aria-hidden="true"
          className="pulse absolute -top-0.5 -right-0.5 flex size-2 rounded-full text-settled ring-2 ring-void"
        >
          <span className="absolute inset-0 rounded-full bg-settled" />
        </span>
      ) : null}
    </span>
  );
}

/** The mark and the name, which is what a header and a footer both want. */
export function Wordmark({ withStatus = false }: { withStatus?: boolean }) {
  return (
    <span className="flex items-center gap-2.5 font-semibold tracking-tight">
      <Logo withStatus={withStatus} />
      Nivara Desk
    </span>
  );
}
