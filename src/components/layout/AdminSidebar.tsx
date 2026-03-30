"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, FileText, Target, Briefcase,
  BookOpen, CalendarDays, LogOut, ExternalLink, Menu, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/admin",           label: "Dashboard",  icon: LayoutDashboard },
  { href: "/admin/blog",      label: "Blog",       icon: FileText },
  { href: "/admin/goals",     label: "Hedefler",   icon: Target },
  { href: "/admin/projects",  label: "Projeler",   icon: Briefcase },
  { href: "/admin/notes",     label: "Notlar",     icon: BookOpen },
  { href: "/admin/calendar",  label: "Takvim",     icon: CalendarDays },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[hsl(var(--border))]">
        <span className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#F0EDE4]">
          Admin
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
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
          onClick={onNavigate}
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
    </div>
  );
}

export default function AdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-56 shrink-0 h-screen sticky top-0 bg-[hsl(var(--surface-2))] border-r border-[hsl(var(--border))] flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile: top bar with hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-[hsl(var(--surface-2))] border-b border-[hsl(var(--border))] flex items-center justify-between px-4">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#F0EDE4]">
          Admin
        </span>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="lg:hidden fixed top-0 left-0 z-50 w-64 h-full bg-[hsl(var(--surface-2))] border-r border-[hsl(var(--border))] flex flex-col shadow-2xl">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </>
      )}
    </>
  );
}
