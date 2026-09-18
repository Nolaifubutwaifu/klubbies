/**
 * Decoration layer for the soft theme: organic accent blobs, a dot grid, a
 * fine grain overlay and — with `photos` — club shots running off the edges.
 * Purely visual: no pointer events, hidden from assistive tech, and the drift
 * stops under prefers-reduced-motion (see globals.css).
 */

/** Each entry is half off the page on purpose, at low opacity. */
const BLEED = [
  { src: "/marketing/bleed-1.jpg", style: { top: "14%", left: "-150px", width: 300, height: 300, transform: "rotate(-9deg)" } },
  { src: "/marketing/bleed-2.jpg", style: { top: "38%", right: "-170px", width: 340, height: 340, transform: "rotate(7deg)" } },
  { src: "/marketing/bleed-3.jpg", style: { top: "62%", left: "-160px", width: 320, height: 320, transform: "rotate(6deg)" } },
  { src: "/marketing/bleed-4.jpg", style: { top: "82%", right: "-150px", width: 300, height: 300, transform: "rotate(-8deg)" } },
];

export function SoftBackdrop({ photos = false }: { photos?: boolean }) {
  return (
    <div className="soft-backdrop" aria-hidden>
      <span className="soft-blob soft-blob-a" />
      <span className="soft-blob soft-blob-b" />
      <span className="soft-blob soft-blob-c" />
      {photos
        ? BLEED.map((item) => (
            // eslint-disable-next-line @next/next/no-img-element -- decorative, fixed size, no optimisation needed
            <img key={item.src} src={item.src} alt="" className="soft-bleed" style={item.style} loading="lazy" />
          ))
        : null}
      <span className="soft-dots" />
      <span className="soft-grain" />
    </div>
  );
}
