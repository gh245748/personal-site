import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import { Clock, Calendar } from "lucide-react";
import ViewCounter from "@/components/blog/ViewCounter";
import ReadingProgress from "@/components/blog/ReadingProgress";

export const revalidate = 3600;

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, subtitle")
    .eq("slug", slug)
    .single();

  if (!data) return { title: "Yazı Bulunamadı" };
  return { title: data.title, description: data.subtitle ?? undefined };
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const supabase = await createClient();

  // Draft preview: allow non-published posts only for authenticated users
  let query = supabase.from("blog_posts").select("*").eq("slug", slug);

  if (preview === "1") {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return notFound();
    // no status filter — show draft
  } else {
    query = query.eq("status", "published");
  }

  const { data: post } = await query.single();
  if (!post) notFound();

  // Related posts: same tags, exclude current
  const { data: related } = post.tags?.length
    ? await supabase
        .from("blog_posts")
        .select("id, slug, title, subtitle, tags, reading_time, published_at")
        .eq("status", "published")
        .neq("slug", slug)
        .overlaps("tags", post.tags)
        .limit(3)
    : { data: [] };

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <ReadingProgress />

      {/* Draft banner */}
      {preview === "1" && post.status !== "published" && (
        <div className="fixed top-1 left-1/2 -translate-x-1/2 z-40 px-4 py-1.5 bg-amber text-obsidian text-xs font-medium rounded-sm shadow-lg"
          style={{ fontFamily: "var(--font-mono)" }}>
          TASLAK ÖNİZLEME
        </div>
      )}

      <main className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map((tag: string) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="amber">{tag}</Badge>
              </Link>
            ))}
          </div>

          <h1
            className="text-[#F0EDE4] mb-4"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
          >
            {post.title}
          </h1>

          {post.subtitle && (
            <p
              className="text-xl text-[hsl(var(--muted))] mb-8 font-light italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {post.subtitle}
            </p>
          )}

          <div
            className="flex flex-wrap items-center gap-5 text-xs text-[hsl(var(--muted))] border-t border-b border-[hsl(var(--border))] py-4"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar size={12} />
                {formatDate(post.published_at)}
              </span>
            )}
            {post.reading_time && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} />
                {post.reading_time} dakika okuma
              </span>
            )}
            <ViewCounter slug={post.slug} initialViews={post.views ?? 0} />
          </div>
        </div>

        {/* Content */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="prose-custom">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Related posts */}
        {related && related.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 mt-20 pt-12 border-t border-[hsl(var(--border))]">
            <p
              className="text-xs tracking-[0.3em] text-amber uppercase mb-6"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              İlgili Yazılar
            </p>
            <div className="flex flex-col gap-4">
              {related.map((r) => (
                <Link
                  key={r.id}
                  href={`/blog/${r.slug}`}
                  className="group flex items-start gap-4 p-4 border border-[hsl(var(--border))] rounded-sm hover:border-amber/40 bg-[hsl(var(--surface-2))] transition-colors"
                >
                  <div className="flex-1">
                    <h3
                      className="text-[#F0EDE4] group-hover:text-amber transition-colors text-base leading-snug mb-1"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {r.title}
                    </h3>
                    {r.subtitle && (
                      <p className="text-xs text-[hsl(var(--muted))] line-clamp-1">{r.subtitle}</p>
                    )}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(r.tags ?? []).slice(0, 3).map((t: string) => (
                        <Badge key={t} variant="default">{t}</Badge>
                      ))}
                    </div>
                  </div>
                  {r.reading_time && (
                    <span
                      className="text-xs text-[hsl(var(--muted))] shrink-0 mt-0.5"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {r.reading_time}dk
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
