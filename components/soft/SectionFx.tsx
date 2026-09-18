type Blob = "left" | "right" | "lilac";

/**
 * Texture for one section. SoftBackdrop covers the page, but on a long landing
 * page its blobs only reach the top and bottom; this gives a section in the
 * middle its own grain, dot grid and blobs. Decorative and inert: it sits
 * behind the section's content and takes no pointer events.
 *
 * The section it goes in needs `soft-fx-host`, which makes it the stacking
 * context this layer hides behind.
 */
export function SectionFx({
  blobs = [],
  dots,
  grain = true,
}: {
  blobs?: Blob[];
  /** "faint" for white sections, where the page-weight grid shouts. */
  dots?: "full" | "faint";
  grain?: boolean;
}) {
  return (
    <span className="soft-fx" aria-hidden>
      {blobs.map((blob) => (
        <span key={blob} className={`soft-blob soft-blob-s-${blob}`} />
      ))}
      {dots ? <span className={dots === "faint" ? "soft-dots soft-dots-faint" : "soft-dots"} /> : null}
      {grain ? <span className="soft-grain" /> : null}
    </span>
  );
}
