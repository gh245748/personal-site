"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden px-6">
      {/* Ambient glow */}
      <div
        className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, #D4872A18 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
      />

      {/* Scan line */}
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none opacity-20"
        style={{ background: "linear-gradient(90deg, transparent, #D4872A, transparent)" }}
      />

      <div className="max-w-6xl mx-auto w-full relative z-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-4"
        >
          <span
            className="text-xs tracking-[0.3em] text-amber uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Personal Knowledge Base
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-[#F0EDE4] leading-none mb-6"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 8vw, 7rem)",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
          }}
        >
          Batuhan M.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg text-[hsl(var(--muted))] mb-12 font-light tracking-wide"
        >
          Builder. Learner. Observer.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            href="/blog"
            className="px-6 py-3 bg-amber text-obsidian text-sm font-medium rounded-sm hover:bg-amber-light transition-colors"
          >
            Yazıları Oku
          </Link>
          <Link
            href="/goals"
            className="px-6 py-3 border border-[hsl(var(--border))] text-[#F0EDE4] text-sm font-light rounded-sm hover:border-amber hover:text-amber transition-colors"
          >
            Hedefleri Gör
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-xs text-[hsl(var(--muted))] tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Keşfet
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
          className="w-px h-8 bg-gradient-to-b from-amber/50 to-transparent"
        />
      </motion.div>
    </section>
  );
}
