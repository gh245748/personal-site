"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/blog",     label: "Blog" },
  { href: "/goals",    label: "Hedefler" },
  { href: "/projects", label: "Projeler" },
  { href: "/notes",    label: "Notlar" },
  { href: "/calendar", label: "Takvim" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-[hsl(var(--surface))]/90 backdrop-blur-md border-b border-[hsl(var(--border))]"
            : "bg-transparent"
        )}
      >
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="font-[family-name:var(--font-display)] text-xl font-semibold text-[#F0EDE4] hover:text-amber transition-colors"
          >
            BK
          </Link>

          {/* Desktop links */}
          <ul className="hidden md:flex items-center gap-8">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "text-sm transition-colors relative group",
                    pathname === href || pathname.startsWith(href + "/")
                      ? "text-amber"
                      : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
                  )}
                >
                  {label}
                  <span
                    className={cn(
                      "absolute -bottom-1 left-0 h-px bg-amber transition-all duration-300",
                      pathname === href || pathname.startsWith(href + "/")
                        ? "w-full"
                        : "w-0 group-hover:w-full"
                    )}
                  />
                </Link>
              </li>
            ))}
          </ul>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-x-0 top-16 z-30 md:hidden bg-[hsl(var(--surface-2))] border-b border-[hsl(var(--border))]"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "block text-base transition-colors",
                      pathname === href || pathname.startsWith(href + "/")
                        ? "text-amber"
                        : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
