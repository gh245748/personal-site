"use client";

import { motion } from "framer-motion";
import { Brain, CheckCircle, Calendar } from "lucide-react";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface LearningStatsProps {
  totalCards: number;
  dueToday: number;
  masteredCards: number;
}

export default function LearningStats({ totalCards, dueToday, masteredCards }: LearningStatsProps) {
  const stats = [
    { label: "Toplam Kart", value: totalCards, icon: Brain, suffix: "" },
    { label: "Bugün Bekleyen", value: dueToday, icon: Calendar, suffix: "" },
    { label: "Öğrenilen", value: masteredCards, icon: CheckCircle, suffix: "" },
  ];

  return (
    <section className="max-w-6xl mx-auto px-6 py-20 border-t border-[hsl(var(--border))]">
      <div className="mb-12">
        <p
          className="text-xs tracking-[0.3em] text-amber uppercase mb-2"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Öğrenme Durumu
        </p>
        <h2
          className="text-[#F0EDE4]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.5rem, 3vw, 3rem)",
            letterSpacing: "-0.02em",
          }}
        >
          Bilgi Birikimi
        </h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {stats.map(({ label, value, icon: Icon, suffix }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="p-6 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))]"
          >
            <Icon size={18} className="text-amber mb-4" />
            <div
              className="text-[#F0EDE4] mb-1"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              <AnimatedNumber value={value} />
              {suffix}
            </div>
            <p className="text-sm text-[hsl(var(--muted))]">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
