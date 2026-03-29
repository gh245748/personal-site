import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/blog/PostCard";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Blog" };
export const revalidate = 3600;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select("id, slug, title, subtitle, tags, reading_time, published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const { data: posts } = await query;

  // Collect all unique tags
  const { data: allPosts } = await supabase
    .from("blog_posts")
    .select("tags")
    .eq("status", "published");

  const allTags = Array.from(
    new Set((allPosts ?? []).flatMap((p) => p.tags))
  ).sort();

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 mb-16">
          <p
            className="text-xs tracking-[0.3em] text-amber uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Yazılar
          </p>
          <h1
            className="text-[#F0EDE4]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 4.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            Blog
          </h1>
        </div>

        <div className="max-w-6xl mx-auto px-6 flex gap-12">
          {/* Sidebar — tags */}
          {allTags.length > 0 && (
            <aside className="hidden lg:block w-48 shrink-0">
              <p
                className="text-xs tracking-[0.2em] text-[hsl(var(--muted))] uppercase mb-4"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                Etiketler
              </p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="/blog"
                    className={`text-sm transition-colors ${
                      !tag ? "text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
                    }`}
                  >
                    Tümü ({posts?.length ?? 0})
                  </a>
                </li>
                {allTags.map((t) => (
                  <li key={t}>
                    <a
                      href={`/blog?tag=${encodeURIComponent(t)}`}
                      className={`text-sm transition-colors ${
                        tag === t ? "text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
                      }`}
                    >
                      {t}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          )}

          {/* Posts grid */}
          <div className="flex-1">
            {tag && (
              <div className="mb-6 flex items-center gap-3">
                <span className="text-sm text-[hsl(var(--muted))]">
                  Filtre: <span className="text-amber">{tag}</span>
                </span>
                <a
                  href="/blog"
                  className="text-xs text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors underline"
                >
                  Temizle
                </a>
              </div>
            )}

            {posts && posts.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-5">
                {posts.map((post, i) => (
                  <PostCard key={post.id} post={post} index={i} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-[hsl(var(--muted))]">
                <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
                  Henüz yazı yok.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
