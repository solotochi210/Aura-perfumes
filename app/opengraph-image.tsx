import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f6f1ea",
          color: "#1c1612",
          padding: "72px",
        }}
      >
        <div style={{ fontSize: 22, letterSpacing: 8, color: "#8a6a3d" }}>LAGOS PERFUME HOUSE</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 92, lineHeight: 0.95 }}>Ojoma</div>
          <div style={{ marginTop: 16, fontSize: 28 }}>Scent, composed in quiet.</div>
        </div>
      </div>
    ),
    { ...size },
  );
}
