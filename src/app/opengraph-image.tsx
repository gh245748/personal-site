import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Batuhan M.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          position: "relative",
        }}
      >
        {/* Amber glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "10%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,135,42,0.15) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Label */}
        <div
          style={{
            fontSize: 14,
            letterSpacing: "0.3em",
            color: "#D4872A",
            textTransform: "uppercase",
            marginBottom: 24,
            fontFamily: "monospace",
          }}
        >
          YAZAR · ÖĞRENIR · İNŞA EDER
        </div>
        {/* Name */}
        <div
          style={{
            fontSize: 96,
            fontWeight: 300,
            color: "#F0EDE4",
            lineHeight: 0.9,
            letterSpacing: "-0.04em",
            marginBottom: 32,
          }}
        >
          Batuhan M.
        </div>
        {/* Description */}
        <div
          style={{
            fontSize: 20,
            color: "#8A8578",
            fontWeight: 300,
          }}
        >
          Kişisel blog, hedefler, projeler ve notlar.
        </div>
        {/* Bottom border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #D4872A, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
