import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PostCard from "@/components/blog/PostCard";
import { createClient } from "@/lib/supabase/server";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Blog" };
export const revalidate = 3600;

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string }>;
}) {
  const { tag, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("blog_posts")
    .select("id, slug, title, subtitle, tags, reading_time, published_at, views")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (tag) query = query.contains("tags", [tag]);
  if (q) query = query.ilike("title", `%${q}%`);

  const { data: posts } = await query;

  const { data: allPosts } = await supabase
    .from("blog_posts")
    .select("tags")
    .eq("status", "published");

  const allTags = Array.from(
    new Set((allPosts ?? []).flatMap((p) => p.tags))
  ).sort();

  const hasFilter = !!(tag || q);

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20">
        {/* Header */}
        <div className="max-w-6xl mx-auto px-6 mb-12">
          <p
            className="text-xs tracking-[0.3em] text-amber uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Yazılar
          </p>
          <h1
            className="text-[#F0EDE4] mb-8"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 4.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 0.95,
            }}
          >
            Blog
          </h1>

          {/* Search bar */}
          <form method="get" action="/blog" className="relative max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] pointer-events-none"
            />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Yazı ara…"
              className="w-full pl-9 pr-4 py-2.5 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-amber transition-colors"
            />
            {tag && <input type="hidden" name="tag" value={tag} />}
          </form>
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
                      !tag && !q ? "text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
                    }`}
                  >
                    Tümü ({allPosts?.length ?? 0})
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

              {/* RSS link */}
              <div className="mt-8 pt-6 border-t border-[hsl(var(--border))]">
                <a
                  href="/feed.xml"
                  className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted))] hover:text-amber transition-colors"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z" />
                  </svg>
                  RSS Feed
                </a>
              </div>
            </aside>
          )}

          {/* Posts */}
          <div className="flex-1">
            {hasFilter && (
              <div className="mb-6 flex items-center gap-3 flex-wrap">
                {q && (
                  <span className="text-sm text-[hsl(var(--muted))]">
                    Arama: <span className="text-amber">&quot;{q}&quot;</span>
                  </span>
                )}
                {tag && (
                  <span className="text-sm text-[hsl(var(--muted))]">
                    Etiket: <span className="text-amber">{tag}</span>
                  </span>
                )}
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
                  {q ? `"${q}" için sonuç bulunamadı.` : "Henüz yazı yok."}
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
