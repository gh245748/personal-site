import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { FileText, Target, Briefcase, BookOpen, CalendarDays } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  const supabase = await createClient();
  const today = new Date().toISOString().split("T")[0];

  const [posts, goals, projects, notes, events] = await Promise.all([
    supabase.from("blog_posts").select("id, status", { count: "exact" }),
    supabase.from("goals").select("id, status", { count: "exact" }),
    supabase.from("projects").select("id", { count: "exact" }),
    supabase.from("notes").select("id", { count: "exact" }),
    supabase.from("events").select("id, date", { count: "exact" }),
  ]);

  const publishedPosts = (posts.data ?? []).filter(p => p.status === "published").length;
  const draftPosts     = (posts.data ?? []).filter(p => p.status === "draft").length;
  const upcomingEvents = (events.data ?? []).filter(e => e.date >= today).length;

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
      sub: `${(goals.data ?? []).filter(g => g.status === "active").length} aktif`,
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
      label: "Takvim",
      value: upcomingEvents,
      sub: "yaklaşan etkinlik",
      icon: CalendarDays,
      href: "/admin/calendar",
      color: "text-rose-400",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-10">
        <h1 className="text-[#F0EDE4] mb-1" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}>
          Dashboard
        </h1>
        <p className="text-sm text-[hsl(var(--muted))]">
          {new Date().toLocaleDateString("tr-TR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, href, color }) => (
          <Link
            key={label}
            href={href}
            className="p-5 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] hover:border-amber/40 transition-colors group"
          >
            <div className="flex items-start justify-between mb-4">
              <Icon size={18} className={color} />
              <span className="text-3xl text-[#F0EDE4] font-semibold group-hover:text-amber transition-colors" style={{ fontFamily: "var(--font-display)" }}>
                {value}
              </span>
            </div>
            <p className="text-sm text-[#F0EDE4] mb-0.5">{label}</p>
            <p className="text-xs text-[hsl(var(--muted))]">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
