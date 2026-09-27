"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f6f1ea", color: "#1c1612", fontFamily: "Georgia, serif" }}>
        <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: 32 }}>
          <p style={{ letterSpacing: "0.28em", textTransform: "uppercase", fontSize: 12 }}>Aurane</p>
          <h1 style={{ fontWeight: 500, fontSize: 48 }}>Something slipped.</h1>
          <button
            type="button"
            onClick={reset}
            style={{ marginTop: 24, height: 48, background: "#1c1612", color: "#f6f1ea", border: 0, padding: "0 24px" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
