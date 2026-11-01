const stops = [
  {
    title: "Advertiser",
    text: "Uploads a creative and builds a campaign draft",
  },
  {
    title: "Review",
    text: "An AdVibe admin approves the creative and the campaign",
  },
  {
    title: "Vehicle screen",
    text: "The ad plays on screens assigned to the campaign",
    live: true,
  },
  {
    title: "Driver partner",
    text: "Earnings are recorded for the driver carrying the screen",
  },
];

/**
 * The "route line": how a campaign travels through AdVibe. It draws itself once
 * when the page loads (the homepage's single orchestrated motion) and is static
 * for anyone who prefers reduced motion. Styles live in globals.css (.route-*).
 */
export function RouteLine() {
  return (
    <figure className="w-full">
      <ol className="route grid gap-0 md:grid-cols-4">
        {stops.map((stop, i) => (
          <li
            key={stop.title}
            className="route-stop relative pb-8 pl-10 md:pr-6 md:pb-0 md:pl-0"
            style={{ "--i": i } as React.CSSProperties}
          >
            {i < stops.length - 1 ? <span className="route-seg" aria-hidden /> : null}
            <span className="route-dot" aria-hidden />
            <h3 className="font-heading text-lg font-semibold text-white md:mt-10">
              {stop.title}
              {stop.live ? (
                <span className="route-live ml-2 inline-flex items-center gap-1.5 rounded-full bg-beacon px-2 py-0.5 align-middle font-sans text-xs font-semibold text-ink">
                  <span className="size-1.5 rounded-full bg-ink" aria-hidden />
                  Live
                </span>
              ) : null}
            </h3>
            <p className="mt-1 text-sm text-[#c3d0e4]">{stop.text}</p>
          </li>
        ))}
      </ol>
      <figcaption className="mt-6 text-xs text-[#9fb0cc]">
        How a campaign moves through AdVibe. Illustration.
      </figcaption>
    </figure>
  );
}
