import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

type Props = { params: Promise<{ slug: string }> };

export default async function OGImage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("title, subtitle, tags, published_at")
    .eq("slug", slug)
    .single();

  const title = post?.title ?? "Batuhan M. — Blog";
  const subtitle = post?.subtitle ?? "";
  const tags: string[] = post?.tags ?? [];

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px 80px",
          position: "relative",
        }}
      >
        {/* Glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: "15%",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,135,42,0.12) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />

        {/* Top: site name */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              fontSize: 18,
              color: "#D4872A",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "monospace",
            }}
          >
            BATUHAN M.
          </div>
          <div style={{ fontSize: 18, color: "#3A3A3A" }}>·</div>
          <div style={{ fontSize: 18, color: "#555", fontFamily: "monospace" }}>BLOG</div>
        </div>

        {/* Middle: title */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div
            style={{
              fontSize: title.length > 60 ? 48 : title.length > 40 ? 56 : 68,
              fontWeight: 300,
              color: "#F0EDE4",
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 22, color: "#8A8578", fontWeight: 300, maxWidth: 800 }}>
              {subtitle}
            </div>
          )}
        </div>

        {/* Bottom: tags */}
        <div style={{ display: "flex", gap: 10 }}>
          {tags.slice(0, 4).map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 14px",
                background: "rgba(212,135,42,0.1)",
                border: "1px solid rgba(212,135,42,0.3)",
                borderRadius: 2,
                fontSize: 14,
                color: "#D4872A",
                fontFamily: "monospace",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Bottom border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(90deg, transparent, #D4872A60, transparent)",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
