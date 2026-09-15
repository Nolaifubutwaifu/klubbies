import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle, Stat } from "@/components/ui";
import { requireAdminContext } from "@/lib/auth/admin-context";
import { createClient } from "@/lib/supabase/server";
import { AddMemberForm } from "./AddMemberForm";
import { MemberTable } from "./MemberTable";
import { RosterImport } from "./RosterImport";

export const metadata: Metadata = { title: "Member list" };

const PAGE_SIZE = 100;
const FILTERS = [
  { key: "all", label: "On the list" },
  { key: "active", label: "Signed in" },
  { key: "pending", label: "Never logged in" },
  { key: "grace", label: "Leaving" },
  { key: "revoked", label: "Removed" },
  { key: "mismatch", label: "Name check" },
] as const;

export default async function MembersPage(props: PageProps<"/admin/[handle]/members">) {
  const { handle } = await props.params;
  const search = await props.searchParams;
  const ctx = await requireAdminContext(handle);
  const supabase = await createClient();

  const filter = FILTERS.find((f) => f.key === search.filter)?.key ?? "all";
  const q = typeof search.q === "string" ? search.q.trim().slice(0, 100) : "";
  const page = Math.max(0, Number(search.page) || 0);
  const isOnboarding = search.step === "2";

  let query = supabase
    .from("memberships")
    .select("id, roster_name, roster_email, claimed_name, name_mismatch, status, role, first_seen_at, invited_at, created_at, grace_ends_at, user_id", {
      count: "exact",
    })
    .eq("club_id", ctx.club.id)
    .order("roster_name", { ascending: true })
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
  if (filter === "all") query = query.in("status", ["pending", "active", "grace"]);
  else if (filter === "mismatch") query = query.eq("name_mismatch", true);
  else query = query.eq("status", filter);
  if (q) {
    const term = q.replace(/[,()*%\\]/g, " ");
    query = query.or(`roster_name.ilike.*${term}*,roster_email.ilike.*${term}*`);
  }

  const [{ data: members, count }, onList, pending, imports] = await Promise.all([
    query,
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("club_id", ctx.club.id).in("status", ["pending", "active", "grace"]),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("club_id", ctx.club.id).eq("status", "pending"),
    supabase
      .from("roster_imports")
      .select("id, filename, added_count, matched_count, error_count, imported_at")
      .eq("club_id", ctx.club.id)
      .eq("status", "committed")
      .order("imported_at", { ascending: false })
      .limit(5),
  ]);

  const total = count ?? 0;
  const hrefFor = (params: Record<string, string | number | undefined>) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "" && v !== "all" && v !== 0) sp.set(k, String(v));
    const s = sp.toString();
    return `/admin/${handle}/members${s ? `?${s}` : ""}`;
  };

  return (
    <main className="flex max-w-[1040px] flex-col gap-6 px-6 py-8">
      {isOnboarding ? (
        <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-accent p-4">
          <div>
            <div className="kicker">Step 2 of 3</div>
            <div className="mt-1 font-heading text-[20px] font-extrabold">Add the people who should see your photos.</div>
          </div>
          <Link href={`/admin/${handle}/albums`} className="btn btn-primary">
            Continue to first album
          </Link>
        </div>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageTitle kicker={ctx.club.name} title="Member list" />
      </div>
      <div className="hr" />

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <RosterImport clubId={ctx.club.id} />
        <AddMemberForm clubId={ctx.club.id} />
        <Stat
          value={(onList.count ?? 0).toLocaleString("en-AU")}
          label={`on the list · ${(pending.count ?? 0).toLocaleString("en-AU")} never logged in`}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Link key={f.key} href={hrefFor({ filter: f.key, q })} className="btn btn-secondary text-[13px]" aria-pressed={filter === f.key}>
              {f.label}
            </Link>
          ))}
        </div>
        <form action={`/admin/${handle}/members`} className="w-full max-w-[260px]">
          {filter !== "all" ? <input type="hidden" name="filter" value={filter} /> : null}
          <input className="input text-[14px]" name="q" defaultValue={q} placeholder="Search name or email" aria-label="Search members" />
        </form>
      </div>

      <MemberTable clubId={ctx.club.id} currentUserId={ctx.userId} members={members ?? []} />

      {total > PAGE_SIZE ? (
        <nav className="flex items-center justify-between gap-3 text-[13px]">
          {page > 0 ? (
            <Link className="btn btn-secondary" href={hrefFor({ filter, q, page: page - 1 })}>
              ← Previous
            </Link>
          ) : (
            <span />
          )}
          <span>
            {page * PAGE_SIZE + 1}–{Math.min(total, (page + 1) * PAGE_SIZE)} of {total.toLocaleString("en-AU")}
          </span>
          {(page + 1) * PAGE_SIZE < total ? (
            <Link className="btn btn-secondary" href={hrefFor({ filter, q, page: page + 1 })}>
              Next →
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}

      {imports.data?.length ? (
        <section className="flex flex-col gap-2">
          <h2 className="label-caps">Import history</h2>
          <table className="table">
            <thead>
              <tr>
                <th>File</th>
                <th>Added</th>
                <th>Already there</th>
                <th>Problems</th>
                <th>When</th>
              </tr>
            </thead>
            <tbody>
              {imports.data.map((i) => (
                <tr key={i.id}>
                  <td>{i.filename}</td>
                  <td>{i.added_count}</td>
                  <td>{i.matched_count}</td>
                  <td>{i.error_count}</td>
                  <td className="text-neutral-700">{new Date(i.imported_at).toLocaleDateString("en-AU")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}
    </main>
  );
}
