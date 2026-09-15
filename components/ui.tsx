import Link from "next/link";
import type { ReactNode } from "react";

export function Brand({ href = "/", size = 20 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="brand" style={{ fontSize: size }}>
      klubbies
    </Link>
  );
}

export function Kicker({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <span className={`kicker ${className}`}>{children}</span>;
}

export function PageTitle({ kicker, title, children }: { kicker?: ReactNode; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <h1 className="display" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
        {title}
      </h1>
      {children ? <p className="text-[15px] text-neutral-700">{children}</p> : null}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="dropzone px-4 py-12" style={{ cursor: "default" }}>
      <span className="font-heading text-[18px] font-extrabold">{title}</span>
      {children ? <span className="max-w-[46ch] text-[14px] text-neutral-700">{children}</span> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}

export function StatusTag({ status, role, graceEndsAt }: { status: string; role?: string; graceEndsAt?: string | null }) {
  if (status === "grace") {
    const ends = graceEndsAt ? new Date(graceEndsAt).toLocaleDateString("en-AU", { day: "numeric", month: "short" }) : "";
    return <span className="tag tag-accent-2">Leaving{ends ? ` · ${ends}` : ""}</span>;
  }
  if (status === "revoked") return <span className="tag tag-neutral">Removed</span>;
  if (role === "club_admin") return <span className="tag tag-accent">Admin</span>;
  if (status === "active") return <span className="tag tag-outline">Active</span>;
  return <span className="tag tag-neutral">Never logged in</span>;
}

export function Stat({ value, label }: { value: ReactNode; label: ReactNode }) {
  return (
    <div className="flex flex-col justify-center gap-1 border-2 border-divider p-4">
      <span className="display text-[40px]">{value}</span>
      <span className="text-[13px] text-neutral-700">{label}</span>
    </div>
  );
}

export function Placeholder({ seed, className = "" }: { seed: string; className?: string }) {
  const tones = ["#9b9797", "#7d7979", "#bab6b6", "#605d5d", "#d7d3d3", "#444141"];
  let hash = 0;
  for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return <div className={className} style={{ background: tones[hash % tones.length] }} aria-hidden />;
}
