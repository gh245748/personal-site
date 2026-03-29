"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CalendarDays, Flag, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: string;
  description?: string | null;
  time?: string | null;
}

interface GoalDeadline {
  id: string;
  title: string;
  target_date: string;
  progress: number;
}

const MONTHS = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DAYS   = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

const typeColor: Record<string, string> = {
  event:    "#D4872A",
  deadline: "#E85555",
  reminder: "#5599E8",
  goal:     "#55C888",
};

const typeIcon = {
  event:    CalendarDays,
  deadline: Flag,
  reminder: Bell,
  goal:     Flag,
};

export default function CalendarView({
  events,
  goals,
}: {
  events: CalendarEvent[];
  goals: GoalDeadline[];
}) {
  const now = new Date();
  const [year, setYear]   = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0);  setYear(y => y + 1); } else setMonth(m => m + 1); };

  // Build days array
  const firstDay = new Date(year, month, 1);
  const lastDay  = new Date(year, month + 1, 0);
  // Monday-first: 0=Mon ... 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const totalCells = Math.ceil((startOffset + lastDay.getDate()) / 7) * 7;

  const days: (number | null)[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = i - startOffset + 1;
    days.push(d >= 1 && d <= lastDay.getDate() ? d : null);
  }

  // Merge events + goal deadlines into a map keyed by date string
  const eventMap: Record<string, { title: string; type: string; id: string; description?: string | null; time?: string | null }[]> = {};

  events.forEach(e => {
    if (!eventMap[e.date]) eventMap[e.date] = [];
    eventMap[e.date].push({ title: e.title, type: e.type, id: e.id, description: e.description, time: e.time });
  });

  goals.forEach(g => {
    if (!g.target_date) return;
    if (!eventMap[g.target_date]) eventMap[g.target_date] = [];
    eventMap[g.target_date].push({ title: g.title, type: "goal", id: g.id });
  });

  const todayStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;

  const selectedItems = selected ? (eventMap[selected] ?? []) : [];

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Calendar */}
      <div className="flex-1">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-[#F0EDE4] text-xl" style={{ fontFamily: "var(--font-display)" }}>
            {MONTHS[month]} {year}
          </h2>
          <button onClick={nextMonth} className="p-2 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {DAYS.map(d => (
            <div key={d} className="text-center text-xs text-[hsl(var(--muted))] py-2" style={{ fontFamily: "var(--font-mono)" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={i} />;
            const dateStr = `${year}-${String(month+1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const isToday    = dateStr === todayStr;
            const isSelected = dateStr === selected;
            const dayEvents  = eventMap[dateStr] ?? [];

            return (
              <motion.button
                key={i}
                onClick={() => setSelected(isSelected ? null : dateStr)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className={`relative p-2 rounded-sm text-sm transition-colors min-h-[56px] flex flex-col items-center gap-1 ${
                  isSelected
                    ? "bg-amber/20 border border-amber/50"
                    : isToday
                    ? "bg-amber/10 border border-amber/30"
                    : "border border-transparent hover:border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-2))]"
                }`}
              >
                <span className={`text-xs ${isToday ? "text-amber font-semibold" : "text-[#F0EDE4]"}`} style={{ fontFamily: "var(--font-mono)" }}>
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <div className="flex flex-wrap gap-0.5 justify-center">
                    {dayEvents.slice(0, 3).map((e, ei) => (
                      <span key={ei} className="w-1.5 h-1.5 rounded-full" style={{ background: typeColor[e.type] ?? "#D4872A" }} />
                    ))}
                    {dayEvents.length > 3 && <span className="text-[9px] text-[hsl(var(--muted))]">+{dayEvents.length - 3}</span>}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-[hsl(var(--border))]">
          {Object.entries(typeColor).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-[hsl(var(--muted))]">
              <span className="w-2 h-2 rounded-full" style={{ background: color }} />
              {type === "event" ? "Etkinlik" : type === "deadline" ? "Deadline" : type === "reminder" ? "Hatırlatıcı" : "Hedef"}
            </div>
          ))}
        </div>
      </div>

      {/* Selected day panel */}
      <div className="lg:w-72 shrink-0">
        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.25 }}
            >
              <h3 className="text-[#F0EDE4] mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "1.25rem" }}>
                {formatDate(selected)}
              </h3>
              {selectedItems.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {selectedItems.map((item, i) => {
                    const Icon = typeIcon[item.type as keyof typeof typeIcon] ?? CalendarDays;
                    return (
                      <div key={i} className="p-4 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))]" style={{ borderLeftColor: typeColor[item.type], borderLeftWidth: 3 }}>
                        <div className="flex items-start gap-2">
                          <Icon size={14} style={{ color: typeColor[item.type] }} className="mt-0.5 shrink-0" />
                          <div>
                            <p className="text-sm text-[#F0EDE4] font-medium">{item.title}</p>
                            {item.time && <p className="text-xs text-[hsl(var(--muted))] mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>{item.time}</p>}
                            {item.description && <p className="text-xs text-[hsl(var(--muted))] mt-1 leading-relaxed">{item.description}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted))]">Bu gün için etkinlik yok.</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-16 text-center"
            >
              <CalendarDays size={32} className="text-[hsl(var(--border))] mb-3" />
              <p className="text-sm text-[hsl(var(--muted))]">Bir gün seç, etkinliklerini gör.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
