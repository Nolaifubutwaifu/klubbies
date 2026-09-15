"use client";

export default function GlobalError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f3f2f2", color: "#201e1d", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ padding: 24, maxWidth: 520 }}>
          <p style={{ fontWeight: 900, fontSize: 20 }}>klubbies</p>
          <h1 style={{ fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", margin: "48px 0 12px" }}>Klubbies hit a problem.</h1>
          <p style={{ fontSize: 15, color: "#605d5d" }}>We&apos;ve been notified. Try again in a moment.</p>
          {error.digest ? <p style={{ fontSize: 12, color: "#7d7979" }}>Reference: {error.digest}</p> : null}
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 16, background: "#ec3013", color: "#f3f2f2", border: 0, padding: "10px 16px", fontWeight: 800, cursor: "pointer" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
