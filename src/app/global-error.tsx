"use client";

/**
 * Replaces the root layout when the layout itself fails, so it must render its
 * own <html> and <body>. It also does not receive the app's global stylesheet,
 * which is why the brand values here are written inline rather than as tokens.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0A0A0A",
          color: "#FFFFFF",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <title>Something went wrong — Crost Agency</title>
        <div style={{ maxWidth: "420px" }}>
          <div
            style={{
              fontSize: "12px",
              letterSpacing: "0.22em",
              color: "#FF40D8",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            CROST AGENCY
          </div>
          <h1 style={{ fontSize: "30px", lineHeight: 1.1, margin: "0 0 14px" }}>
            That didn&rsquo;t work.
          </h1>
          <p style={{ color: "#C9C9D1", lineHeight: 1.6, margin: "0 0 24px" }}>
            Something went wrong loading the site. Try again, or email us and
            we&rsquo;ll pick it up directly.
          </p>
          <button
            onClick={() => retry()}
            style={{
              height: "48px",
              padding: "0 26px",
              border: "none",
              borderRadius: "12px",
              background: "#FF40D8",
              color: "#0A0A0A",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
          <p style={{ marginTop: "20px" }}>
            <a href="mailto:hello@crost.agency" style={{ color: "#FF40D8" }}>
              hello@crost.agency
            </a>
          </p>
          {error.digest && (
            <p style={{ color: "#8A8A93", fontSize: "12px", marginTop: "16px" }}>
              Reference: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
