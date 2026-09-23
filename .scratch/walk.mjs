// Walks the main screens and reports any non-2xx responses, using the
// browser's own cookie jar is not possible from node — so this just checks
// which routes render for an anonymous visitor (should redirect, not 500).
const base = "http://localhost:3100";
const routes = ["/", "/how-it-works", "/privacy", "/terms", "/refunds", "/signin", "/start", "/clubs",
  "/c/demo_umfc", "/c/demo_umfc/me", "/c/demo_umfc/saved", "/c/demo_umfc/feed", "/account",
  "/admin/demo_umfc", "/admin/demo_umfc/settings", "/admin/demo_umfc/members", "/admin/demo_umfc/albums",
  "/admin/demo_umfc/activity", "/admin/demo_umfc/removals", "/admin/demo_umfc/guests", "/admin/demo_umfc/roles"];
for (const r of routes) {
  const res = await fetch(base + r, { redirect: "manual" });
  const flag = res.status >= 500 ? "  <-- SERVER ERROR" : "";
  console.log(String(res.status).padEnd(4), r, flag);
}
