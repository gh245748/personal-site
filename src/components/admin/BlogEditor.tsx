"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/admin/TipTapEditor";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";
import { calculateReadingTime } from "@/lib/reading-time";
import toast from "react-hot-toast";
import { ArrowLeft, Save, Eye, Trash2 } from "lucide-react";
import Link from "next/link";

function getReadingTime(content: string): number {
  return calculateReadingTime(content);
}

interface Post {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  content: string;
  cover_url: string | null;
  tags: string[];
  status: "draft" | "published";
  reading_time: number | null;
  published_at: string | null;
}

interface BlogEditorProps {
  initialPost?: Post;
}

export default function BlogEditor({ initialPost }: BlogEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [subtitle, setSubtitle] = useState(initialPost?.subtitle ?? "");
  const [slug, setSlug] = useState(initialPost?.slug ?? "");
  const [content, setContent] = useState(initialPost?.content ?? "");
  const [coverUrl, setCoverUrl] = useState(initialPost?.cover_url ?? "");
  const [tagsInput, setTagsInput] = useState(initialPost?.tags.join(", ") ?? "");
  const [status, setStatus] = useState<"draft" | "published">(initialPost?.status ?? "draft");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSlug, setAutoSlug] = useState(!initialPost);

  // Auto-update slug from title
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(slugify(title));
    }
  }, [title, autoSlug]);

  const save = useCallback(
    async (silent = false) => {
      if (!title.trim()) {
        if (!silent) toast.error("Başlık boş olamaz.");
        return;
      }

      setSaving(true);
      const supabase = createClient();

      const payload = {
        title,
        subtitle: subtitle || null,
        slug,
        content,
        cover_url: coverUrl || null,
        tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
        status,
        reading_time: getReadingTime(content.replace(/<[^>]*>/g, "")),
        published_at: status === "published" ? (initialPost?.published_at ?? new Date().toISOString()) : null,
      };

      const { error } = initialPost
        ? await supabase.from("blog_posts").update(payload).eq("id", initialPost.id)
        : await supabase.from("blog_posts").insert(payload);

      if (error) {
        if (!silent) toast.error("Kaydedilemedi: " + error.message);
      } else {
        setLastSaved(new Date());
        if (!silent) {
          toast.success("Kaydedildi.");
          if (!initialPost) router.push("/admin/blog");
        }
      }

      setSaving(false);
    },
    [title, subtitle, slug, content, coverUrl, tagsInput, status, initialPost, router]
  );

  // Auto-save every 30s
  useEffect(() => {
    if (!initialPost) return;
    const timer = setInterval(() => save(true), 30_000);
    return () => clearInterval(timer);
  }, [save, initialPost]);

  const handleDelete = async () => {
    if (!initialPost || !confirm("Bu yazıyı silmek istediğinden emin misin?")) return;
    const supabase = createClient();
    await supabase.from("blog_posts").delete().eq("id", initialPost.id);
    toast.success("Yazı silindi.");
    router.push("/admin/blog");
  };

  return (
    <div className="flex h-screen">
      {/* Main editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
          <Link
            href="/admin/blog"
            className="flex items-center gap-2 text-sm text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors"
          >
            <ArrowLeft size={14} /> Blog
          </Link>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
                Kaydedildi {lastSaved.toLocaleTimeString("tr-TR")}
              </span>
            )}
            {initialPost && (
              <Link
                href={`/blog/${initialPost.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted))] hover:text-amber transition-colors"
              >
                <Eye size={13} /> Önizle
              </Link>
            )}
            <Button
              onClick={() => save(false)}
              loading={saving}
              size="sm"
              className="flex items-center gap-1.5"
            >
              <Save size={13} /> Kaydet
            </Button>
          </div>
        </div>

        {/* Title input */}
        <div className="px-8 pt-8">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Yazı başlığı…"
            className="w-full bg-transparent text-[#F0EDE4] placeholder:text-[hsl(var(--border))] focus:outline-none"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
              letterSpacing: "-0.02em",
            }}
          />
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder="Alt başlık (opsiyonel)…"
            className="w-full mt-3 bg-transparent text-[hsl(var(--muted))] placeholder:text-[hsl(var(--border))] focus:outline-none text-lg font-light italic"
            style={{ fontFamily: "var(--font-display)" }}
          />
          <div className="mt-4 mb-4 h-px bg-[hsl(var(--border))]" />
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto px-8 pb-8">
          <TipTapEditor content={content} onChange={setContent} />
        </div>
      </div>

      {/* Right panel */}
      <div className="w-64 shrink-0 border-l border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] p-5 flex flex-col gap-5 overflow-auto">
        {/* Status */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Durum
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "draft" | "published")}
            className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
          >
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
          </select>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Slug
          </label>
          <input
            value={slug}
            onChange={(e) => { setSlug(e.target.value); setAutoSlug(false); }}
            className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
            placeholder="yazi-basligi"
            style={{ fontFamily: "var(--font-mono)" }}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Etiketler
          </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="react, typescript, …"
            className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
          />
          <p className="text-xs text-[hsl(var(--muted))] mt-1">Virgülle ayır</p>
        </div>

        {/* Cover URL */}
        <div>
          <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Kapak Görseli URL
          </label>
          <input
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder="https://…"
            className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
          />
        </div>

        {/* Delete */}
        {initialPost && (
          <div className="mt-auto pt-4 border-t border-[hsl(var(--border))]">
            <Button
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="w-full flex items-center gap-2"
            >
              <Trash2 size={13} /> Yazıyı Sil
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
