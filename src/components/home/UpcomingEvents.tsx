"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CalendarDays, Flag, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  date: string;
  type: string;
  color: string;
}

const typeIcon = {
  event:    CalendarDays,
  deadline: Flag,
  reminder: Bell,
  goal:     Flag,
};

const typeLabel: Record<string, string> = {
  event:    "Etkinlik",
  deadline: "Deadline",
  reminder: "Hatırlatıcı",
  goal:     "Hedef",
};

export default function UpcomingEvents({ events }: { events: Event[] }) {
  if (!events.length) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-[hsl(var(--border))]">
      <div className="flex items-end justify-between mb-12">
        <div>
          <p className="text-xs tracking-[0.3em] text-amber uppercase mb-2" style={{ fontFamily: "var(--font-mono)" }}>
            Yaklaşan
          </p>
          <h2 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 3vw, 3rem)", letterSpacing: "-0.02em" }}>
            Takvim
          </h2>
        </div>
        <Link href="/calendar" className="hidden md:flex items-center gap-2 text-sm text-[hsl(var(--muted))] hover:text-amber transition-colors group">
          Takvimi Aç <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {events.map((event, i) => {
          const Icon = typeIcon[event.type as keyof typeof typeIcon] ?? CalendarDays;
          const daysLeft = Math.ceil((new Date(event.date).getTime() - new Date().setHours(0,0,0,0)) / 86400000);

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className="flex items-center gap-4 p-4 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] hover:border-amber/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-sm flex items-center justify-center shrink-0" style={{ background: "#D4872A15" }}>
                <Icon size={16} className="text-amber" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-[#F0EDE4] font-medium">{event.title}</p>
                <p className="text-xs text-[hsl(var(--muted))] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>
                  {formatDate(event.date)} · {typeLabel[event.type] ?? event.type}
                </p>
              </div>
              <span className="text-xs shrink-0" style={{ fontFamily: "var(--font-mono)", color: daysLeft <= 3 ? "#E8A84C" : "hsl(var(--muted))" }}>
                {daysLeft === 0 ? "Bugün" : daysLeft === 1 ? "Yarın" : `${daysLeft} gün`}
              </span>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
