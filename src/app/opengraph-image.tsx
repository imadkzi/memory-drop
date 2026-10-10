import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name}: ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f5e6df",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 28,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#8b3a42",
            fontFamily: "Georgia, serif",
          }}
        >
          Memory Drop
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.05,
              color: "#1c1514",
              fontFamily: "Georgia, serif",
              maxWidth: 920,
            }}
          >
            {siteConfig.tagline}
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.4,
              color: "rgba(28, 21, 20, 0.65)",
              fontFamily: "Georgia, serif",
              maxWidth: 720,
            }}
          >
            One private link for event guests. Photos land in your Google
            Drive.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(28, 21, 20, 0.45)",
            fontFamily: "Georgia, serif",
          }}
        >
          Private guest uploads
        </div>
      </div>
    ),
    { ...size },
  );
}
