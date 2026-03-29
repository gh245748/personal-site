"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface Goal {
  id: string;
  title: string;
  category: string;
  progress: number;
}

interface FeaturedGoalsProps {
  goals: Goal[];
}

function ProgressRing({ progress, size = 80 }: { progress: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="4"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#D4872A"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          whileInView={{ strokeDashoffset }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[#F0EDE4] font-semibold text-sm"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          {progress}%
        </span>
      </div>
    </div>
  );
}

const categoryLabels: Record<string, string> = {
  learning: "Öğrenme",
  fitness: "Fitness",
  finance: "Finans",
  project: "Proje",
};

export default function FeaturedGoals({ goals }: FeaturedGoalsProps) {
  if (!goals.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-[hsl(var(--border))]">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p
            className="text-xs tracking-[0.3em] text-amber uppercase mb-2"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Aktif Hedefler
          </p>
          <h2
            className="text-[#F0EDE4]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 3vw, 3rem)",
              letterSpacing: "-0.02em",
            }}
          >
            Nerede Olduğum
          </h2>
        </div>
        <Link
          href="/goals"
          className="hidden md:flex items-center gap-2 text-sm text-[hsl(var(--muted))] hover:text-amber transition-colors group"
        >
          Tümünü Gör
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {goals.slice(0, 4).map((goal, i) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="p-5 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <span
                  className="text-xs text-amber uppercase tracking-widest"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {categoryLabels[goal.category] ?? goal.category}
                </span>
                <h3 className="text-[#F0EDE4] text-base mt-1 leading-tight" style={{ fontFamily: "var(--font-display)" }}>
                  {goal.title}
                </h3>
              </div>
              <ProgressRing progress={goal.progress} size={64} />
            </div>

            {/* Progress bar */}
            <div className="h-0.5 bg-[hsl(var(--border))] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-amber rounded-full"
                initial={{ width: 0 }}
                whileInView={{ width: `${goal.progress}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
