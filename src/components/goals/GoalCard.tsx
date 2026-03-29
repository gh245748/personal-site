"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Calendar } from "lucide-react";
import { daysUntil } from "@/lib/utils";
import Badge from "@/components/ui/Badge";

interface Milestone {
  text: string;
  done: boolean;
}

interface Goal {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  progress: number;
  target_date?: string | null;
  status: string;
  milestones: Milestone[];
}

const categoryLabels: Record<string, string> = {
  learning: "Öğrenme",
  fitness: "Fitness",
  finance: "Finans",
  project: "Proje",
};

export default function GoalCard({ goal, index = 0 }: { goal: Goal; index?: number }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (goal.progress / 100) * circumference;
  const days = goal.target_date ? daysUntil(goal.target_date) : null;

  const milestones: Milestone[] = Array.isArray(goal.milestones) ? goal.milestones : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="p-6 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))]"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="amber">{categoryLabels[goal.category] ?? goal.category}</Badge>
            {goal.status === "completed" && <Badge variant="green">Tamamlandı</Badge>}
            {goal.status === "paused" && <Badge variant="default">Durakladı</Badge>}
          </div>
          <h3
            className="text-[#F0EDE4] text-xl leading-tight"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-[hsl(var(--muted))] mt-2 leading-relaxed">
              {goal.description}
            </p>
          )}
        </div>

        {/* Progress ring */}
        <div className="relative shrink-0" style={{ width: 88, height: 88 }}>
          <svg width={88} height={88} className="-rotate-90">
            <circle cx={44} cy={44} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
            <motion.circle
              cx={44}
              cy={44}
              r={radius}
              fill="none"
              stroke="#D4872A"
              strokeWidth="5"
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
              className="text-[#F0EDE4] font-semibold"
              style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem" }}
            >
              {goal.progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-[hsl(var(--border))] rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-amber rounded-full"
          initial={{ width: 0 }}
          whileInView={{ width: `${goal.progress}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>

      {/* Target date */}
      {days !== null && (
        <div
          className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted))] mb-5"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          <Calendar size={11} />
          {days > 0 ? `${days} gün kaldı` : days === 0 ? "Bugün!" : `${Math.abs(days)} gün geçti`}
        </div>
      )}

      {/* Milestones */}
      {milestones.length > 0 && (
        <ul className="flex flex-col gap-2">
          {milestones.map((m, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm">
              {m.done ? (
                <CheckCircle2 size={15} className="text-amber mt-0.5 shrink-0" />
              ) : (
                <Circle size={15} className="text-[hsl(var(--muted))] mt-0.5 shrink-0" />
              )}
              <span className={m.done ? "line-through text-[hsl(var(--muted))]" : "text-[#F0EDE4]"}>
                {m.text}
              </span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
