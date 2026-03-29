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
import { Clock, Calendar } from "lucide-react";

export const revalidate = 3600;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("blog_posts")
    .select("title, subtitle")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!data) return { title: "Yazı Bulunamadı" };
  return {
    title: data.title,
    description: data.subtitle ?? undefined,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />

      {/* Progress bar placeholder — would use scroll listener in client */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-[hsl(var(--border))]">
        <div className="h-full bg-amber w-0" id="reading-progress" />
      </div>

      <main className="pt-24 pb-20">
        {/* Hero */}
        <div className="max-w-3xl mx-auto px-6 mb-16">
          <div className="flex flex-wrap gap-1.5 mb-6">
            {post.tags.map((tag: string) => (
              <Badge key={tag} variant="amber">{tag}</Badge>
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
      </main>

      <Footer />
    </div>
  );
}
