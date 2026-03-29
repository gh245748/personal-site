"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Target, Briefcase,
  BookOpen, Brain, LogOut, ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/blog",      label: "Blog",       icon: FileText },
  { href: "/admin/goals",     label: "Hedefler",   icon: Target },
  { href: "/admin/projects",  label: "Projeler",   icon: Briefcase },
  { href: "/admin/notes",     label: "Notlar",     icon: BookOpen },
  { href: "/admin/learning",  label: "Öğrenme",    icon: Brain },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <aside className="w-56 shrink-0 h-screen sticky top-0 bg-[hsl(var(--surface-2))] border-r border-[hsl(var(--border))] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[hsl(var(--border))]">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#F0EDE4]">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm transition-colors",
                active
                  ? "bg-amber/10 text-amber"
                  : "text-[hsl(var(--muted))] hover:text-[#F0EDE4] hover:bg-[hsl(var(--surface))]"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-[hsl(var(--border))] flex flex-col gap-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[hsl(var(--muted))] hover:text-[#F0EDE4] hover:bg-[hsl(var(--surface))] transition-colors"
        >
          <ExternalLink size={16} />
          Siteyi Gör
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-sm text-sm text-[hsl(var(--muted))] hover:text-red-400 hover:bg-red-900/10 transition-colors w-full text-left"
        >
          <LogOut size={16} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
