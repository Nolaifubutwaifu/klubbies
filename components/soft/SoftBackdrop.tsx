/**
 * Decoration layer for the soft theme: organic accent blobs, a dot grid and a
 * fine grain overlay, so the page reads as designed rather than as a plain
 * gradient. Purely visual — no pointer events, hidden from assistive tech, and
 * the drift stops under prefers-reduced-motion (see globals.css).
 */
export function SoftBackdrop() {
  return (
    <div className="soft-backdrop" aria-hidden>
      <span className="soft-blob soft-blob-a" />
      <span className="soft-blob soft-blob-b" />
      <span className="soft-blob soft-blob-c" />
      <span className="soft-dots" />
      <span className="soft-grain" />
    </div>
  );
}
