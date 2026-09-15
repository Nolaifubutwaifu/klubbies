import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlbumCard } from "@/components/AlbumCard";
import { EmptyState } from "@/components/ui";
import { getClubContext } from "@/lib/auth/session";
import { listAlbums } from "@/lib/media/queries";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(props: PageProps<"/c/[handle]">): Promise<Metadata> {
  const { handle } = await props.params;
  const ctx = await getClubContext(handle);
  return { title: ctx?.club.name ?? "Club" };
}

export default async function ClubFeedPage(props: PageProps<"/c/[handle]">) {
  const { handle } = await props.params;
  const search = await props.searchParams;
  const ctx = await getClubContext(handle);
  if (!ctx) notFound();

  const q = typeof search.q === "string" ? search.q.slice(0, 100) : "";
  const kind = search.kind === "photo" || search.kind === "video" ? search.kind : undefined;
  const page = Math.max(0, Number(search.page) || 0);

  const supabase = await createClient();
  const { albums, hasMore } = await listAlbums(supabase, ctx.club.id, { q, kind, page });

  const filterHref = (next: "photo" | "video") => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (kind !== next) params.set("kind", next);
    const qs = params.toString();
    return `/c/${handle}${qs ? `?${qs}` : ""}`;
  };

  return (
    <main className="flex flex-1 flex-col">
      <div className="grid border-b-2 border-divider" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
        <div className="p-6">
          <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
            Events
          </h1>
          <p className="mt-2 text-[15px] text-neutral-700">Everything the committee has shared with you.</p>
        </div>
        <div className="flex flex-wrap items-end gap-2 p-6">
          <form className="w-full max-w-[240px]" action={`/c/${handle}`}>
            {kind ? <input type="hidden" name="kind" value={kind} /> : null}
            <input className="input text-[14px]" name="q" defaultValue={q} placeholder="Search events" aria-label="Search events" />
          </form>
          <Link href={filterHref("photo")} className="btn btn-secondary" aria-pressed={kind === "photo"}>
            Photos
          </Link>
          <Link href={filterHref("video")} className="btn btn-secondary" aria-pressed={kind === "video"}>
            Videos
          </Link>
        </div>
      </div>

      {albums.length === 0 ? (
        <div className="p-6">
          <EmptyState title={q || kind ? "No events match" : "Nothing shared yet"}>
            {q || kind
              ? "Try a different search, or clear the filter."
              : "When the committee publishes an event album, it will show up here."}
          </EmptyState>
        </div>
      ) : (
        <div
          className="tile-grid border-b-2 border-divider"
          style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}
        >
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} href={`/c/${handle}/a/${album.id}`} />
          ))}
        </div>
      )}

      {page > 0 || hasMore ? (
        <nav className="flex justify-between gap-3 px-6 py-4">
          {page > 0 ? (
            <Link className="btn btn-secondary" href={`/c/${handle}?page=${page - 1}`}>
              ← Newer
            </Link>
          ) : (
            <span />
          )}
          {hasMore ? (
            <Link className="btn btn-secondary" href={`/c/${handle}?page=${page + 1}`}>
              Older →
            </Link>
          ) : null}
        </nav>
      ) : null}
    </main>
  );
}
