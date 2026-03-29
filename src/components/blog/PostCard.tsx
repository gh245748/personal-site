"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";
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

export default function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className="p-6 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] hover:border-amber/40 transition-all duration-300 group-hover:-translate-y-1">
          {/* Metadata */}
          <div className="flex items-center gap-3 mb-4">
            {post.published_at && (
              <span
                className="text-xs text-[hsl(var(--muted))]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {formatDate(post.published_at)}
              </span>
            )}
            {post.reading_time && (
              <span
                className="flex items-center gap-1 text-xs text-[hsl(var(--muted))]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                <Clock size={11} />
                {post.reading_time} dk
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            className="text-[#F0EDE4] mb-3 group-hover:text-amber transition-colors"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1.75rem",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {post.title}
          </h2>

          {/* Subtitle */}
          {post.subtitle && (
            <p className="text-sm text-[hsl(var(--muted))] leading-relaxed line-clamp-3 mb-4">
              {post.subtitle}
            </p>
          )}

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="default">{tag}</Badge>
              ))}
            </div>
          )}

          {/* Hover underline */}
          <div className="mt-4 h-px bg-amber w-0 group-hover:w-full transition-all duration-500" />
        </div>
      </Link>
    </motion.article>
  );
}
