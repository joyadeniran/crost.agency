import { ImageResponse } from "next/og";

export const alt = "Crost Agency — What's the number?";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * The share card. Satori supports flexbox and a subset of CSS only — no grid,
 * no CSS variables — so the brand values are written literally here. They are
 * the same values as the tokens in globals.css.
 */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0A0A0A",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: "0.22em",
            color: "#FF40D8",
            fontWeight: 700,
          }}
        >
          CROST AGENCY
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              lineHeight: 1,
              color: "#FFFFFF",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            WHAT&#39;S THE
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 116,
              lineHeight: 1.1,
              color: "#FF40D8",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            NUMBER?
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#C9C9D1",
              maxWidth: "660px",
              lineHeight: 1.4,
            }}
          >
            Agree the outcome. We put our performance fee at risk against it.
          </div>
          <div style={{ display: "flex", fontSize: 22, color: "#8A8A93" }}>
            crost.agency
          </div>
        </div>
      </div>
    ),
    size
  );
}
