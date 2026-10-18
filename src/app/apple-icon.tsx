import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the OSSGrid four-square mark on graphite. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#050506" }}>
        <div style={{ width: 96, height: 96, display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 42, height: 42, borderRadius: 8, background: i === 1 ? "#1ac66e" : "#f5f3ef" }} />)}
        </div>
      </div>
    ),
    size
  );
}
