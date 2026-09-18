/* eslint-disable @next/next/no-img-element -- decorative background tiles: fixed grid cells, no layout shift to avoid */
import { bandTiles, type Photo } from "@/components/soft/photos";

/**
 * A dense grid of event photos under a colour wash, used as a section
 * background. "deep" and "diagonal" carry white text; "paper" leaves a cream
 * section looking like paper with photographs showing through it.
 */
export function PhotoBand({
  columns,
  rows,
  tint = "deep",
  desaturate = false,
  pool,
}: {
  columns: number;
  rows: number;
  tint?: "deep" | "diagonal" | "paper";
  desaturate?: boolean;
  pool?: Photo[];
}) {
  const tiles = bandTiles(columns * rows, pool);

  return (
    <span className={`soft-photoband${desaturate ? " soft-photoband-desaturate" : ""}`} aria-hidden>
      <span
        className="soft-photoband-grid"
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((tile, i) => (
          <img key={i} src={tile.src} alt="" loading="lazy" style={{ objectPosition: tile.pos }} />
        ))}
      </span>
      <span className={`soft-photoband-tint soft-tint-${tint}`} />
    </span>
  );
}
