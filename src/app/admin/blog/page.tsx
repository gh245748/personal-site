import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil, Clock, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

export const metadata: Metadata = { title: "Blog Yönetimi" };

export default async function AdminBlogPage() {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("id, slug, title, status, tags, reading_time, published_at, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1
          className="text-[#F0EDE4]"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}
        >
          Blog Yazıları
        </h1>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 bg-amber text-obsidian text-sm font-medium rounded-sm hover:bg-amber-light transition-colors"
        >
          <Plus size={16} />
          Yeni Yazı
        </Link>
      </div>

      {posts && posts.length > 0 ? (
        <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
          {posts.map((post, i) => (
            <div
              key={post.id}
              className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${
                i > 0 ? "border-t border-[hsl(var(--border))]" : ""
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.status === "published" ? (
                    <CheckCircle size={13} className="text-green-400 shrink-0" />
                  ) : (
                    <Clock size={13} className="text-[hsl(var(--muted))] shrink-0" />
                  )}
                  <h3 className="text-sm text-[#F0EDE4] truncate">{post.title}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
                  <span>{formatDate(post.published_at ?? post.created_at)}</span>
                  {post.reading_time && <span>{post.reading_time} dk</span>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-wrap gap-1">
                  {post.tags.slice(0, 2).map((t: string) => (
                    <Badge key={t} variant="default">{t}</Badge>
                  ))}
                </div>
                <Badge variant={post.status === "published" ? "green" : "default"}>
                  {post.status === "published" ? "Yayında" : "Taslak"}
                </Badge>
                <Link
                  href={`/admin/blog/${post.id}`}
                  className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors"
                >
                  <Pencil size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border border-[hsl(var(--border))] rounded-sm">
          <p className="text-[hsl(var(--muted))] mb-4">Henüz yazı yok.</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber text-obsidian text-sm font-medium rounded-sm"
          >
            <Plus size={16} /> İlk Yazıyı Oluştur
          </Link>
        </div>
      )}
    </div>
  );
}
