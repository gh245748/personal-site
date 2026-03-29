"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  tags: string[];
  reading_time: number | null;
  published_at: string | null;
}

interface LatestPostsProps {
  posts: Post[];
}

export default function LatestPosts({ posts }: LatestPostsProps) {
  if (!posts.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-20">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p
            className="text-xs tracking-[0.3em] text-amber uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Son Yazılar
          </p>
          <h2
            className="text-[#F0EDE4]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 3rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Düşünceler & Notlar
          </h2>
        </div>
        <Link
          href="/blog"
          className="hidden md:flex items-center gap-2 text-sm text-[hsl(var(--muted))] hover:text-amber transition-colors group"
        >
          Tümünü Gör
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {posts.map((post, i) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link href={`/blog/${post.slug}`} className="block group h-full">
              <div className="h-full p-6 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] hover:border-amber/40 transition-all duration-300 group-hover:-translate-y-1">
                {/* Date */}
                {post.published_at && (
                  <p
                    className="text-xs text-[hsl(var(--muted))] mb-3"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    {formatDate(post.published_at)}
                  </p>
                )}

                {/* Title */}
                <h3
                  className="text-[#F0EDE4] mb-2 group-hover:text-amber transition-colors line-clamp-2"
                  style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", lineHeight: 1.2 }}
                >
                  {post.title}
                </h3>

                {/* Subtitle */}
                {post.subtitle && (
                  <p className="text-sm text-[hsl(var(--muted))] mb-4 line-clamp-2 leading-relaxed">
                    {post.subtitle}
                  </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 2).map((tag) => (
                      <Badge key={tag} variant="default">{tag}</Badge>
                    ))}
                  </div>
                  {post.reading_time && (
                    <span className="flex items-center gap-1 text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
                      <Clock size={11} />
                      {post.reading_time}dk
                    </span>
                  )}
                </div>

                {/* Hover underline */}
                <div className="mt-4 h-px bg-amber w-0 group-hover:w-full transition-all duration-500" />
              </div>
            </Link>
          </motion.article>
        ))}
      </div>

      <Link
        href="/blog"
        className="md:hidden mt-8 flex items-center gap-2 text-sm text-[hsl(var(--muted))] hover:text-amber transition-colors group"
      >
        Tümünü Gör
        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </Link>
    </section>
  );
}
