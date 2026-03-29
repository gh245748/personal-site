import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FileText, Target, Briefcase, BookOpen, Brain, Clock } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [posts, goals, projects, notes, cards] = await Promise.all([
    supabase.from("blog_posts").select("id, status", { count: "exact" }),
    supabase.from("goals").select("id, status", { count: "exact" }),
    supabase.from("projects").select("id", { count: "exact" }),
    supabase.from("notes").select("id", { count: "exact" }),
    supabase.from("learning_items").select("id, due_date, repetitions"),
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueCards = (cards.data ?? []).filter(
    (c) => c.due_date && new Date(c.due_date) <= today
  ).length;

  const publishedPosts = (posts.data ?? []).filter((p) => p.status === "published").length;
  const draftPosts = (posts.data ?? []).filter((p) => p.status === "draft").length;

  const statCards = [
    {
      label: "Blog Yazıları",
      value: posts.count ?? 0,
      sub: `${publishedPosts} yayında, ${draftPosts} taslak`,
      icon: FileText,
      href: "/admin/blog",
      color: "text-blue-400",
    },
    {
      label: "Hedefler",
      value: goals.count ?? 0,
      sub: `${(goals.data ?? []).filter((g) => g.status === "active").length} aktif`,
      icon: Target,
      href: "/admin/goals",
      color: "text-amber",
    },
    {
      label: "Projeler",
      value: projects.count ?? 0,
      sub: "toplam",
      icon: Briefcase,
      href: "/admin/projects",
      color: "text-purple-400",
    },
    {
      label: "Notlar",
      value: notes.count ?? 0,
      sub: "kitap, film, makale",
      icon: BookOpen,
      href: "/admin/notes",
      color: "text-green-400",
    },
    {
      label: "Öğrenme Kartları",
      value: (cards.data ?? []).length,
      sub: `${dueCards} bugün bekliyor`,
      icon: Brain,
      href: "/admin/learning",
      color: "text-rose-400",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1
          className="text-[#F0EDE4] mb-1"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}
        >
          Dashboard
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {statCards.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="p-5 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] hover:border-amber/40 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <Icon size={18} className={color} />
              <span
                className="text-3xl text-[#F0EDE4] font-semibold group-hover:text-amber transition-colors"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {value}
              </span>
            </div>
            <p className="text-sm text-[#F0EDE4] mb-0.5">{label}</p>
            <p className="text-xs text-[hsl(var(--muted))]">{sub}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      {dueCards > 0 && (
        <div className="p-5 border border-amber/30 bg-amber/5 rounded-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-amber" />
            <div>
              <p className="text-sm text-[#F0EDE4] font-medium">
                {dueCards} öğrenme kartı bekliyor
              </p>
              <p className="text-xs text-[hsl(var(--muted))]">
                Bugün çalışman gereken kartlar mevcut.
              </p>
            </div>
          </div>
          <Link
            href="/admin/learning"
            className="px-4 py-2 bg-amber text-obsidian text-xs font-medium rounded-sm hover:bg-amber-light transition-colors"
          >
            Çalış
          </Link>
        </div>
      )}
    </div>
  );
}
