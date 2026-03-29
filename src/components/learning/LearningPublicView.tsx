"use client";

import { motion } from "framer-motion";
import { Lock, Brain, CheckCircle, Clock, BookOpen } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { getMaturityLabel, getMaturityColor } from "@/lib/sm2";
import AnimatedNumber from "@/components/ui/AnimatedNumber";

interface Card {
  id: string;
  front: string;
  topic: string;
  category: string;
  repetitions: number;
  due_date: string | null;
  times_correct: number;
  times_wrong: number;
  created_at: string;
}

export default function LearningPublicView({ cards }: { cards: Card[] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueCards = cards.filter(
    (c) => c.due_date && new Date(c.due_date) <= today
  );
  const masteredCards = cards.filter((c) => c.repetitions >= 6);

  // Group by topic
  const byTopic = cards.reduce<Record<string, Card[]>>((acc, card) => {
    if (!acc[card.topic]) acc[card.topic] = [];
    acc[card.topic].push(card);
    return acc;
  }, {});

  const stats = [
    { label: "Toplam Kart", value: cards.length, icon: Brain },
    { label: "Bekleyen", value: dueCards.length, icon: Clock },
    { label: "Öğrenilen", value: masteredCards.length, icon: CheckCircle },
    { label: "Konu", value: Object.keys(byTopic).length, icon: BookOpen },
  ];

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map(({ label, value, icon: Icon }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))]"
          >
            <Icon size={16} className="text-amber mb-3" />
            <div
              className="text-[#F0EDE4] text-3xl font-semibold mb-1"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <AnimatedNumber value={value} />
            </div>
            <p className="text-xs text-[hsl(var(--muted))]">{label}</p>
          </motion.div>
        ))}
      </div>

      {/* Topic breakdown */}
      <div className="mb-12">
        <h2
          className="text-[#F0EDE4] text-2xl mb-6"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Konular
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(byTopic).map(([topic, topicCards], i) => {
            const due = topicCards.filter(
              (c) => c.due_date && new Date(c.due_date) <= today
            ).length;
            return (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-4 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] flex items-center justify-between"
              >
                <div>
                  <p className="text-[#F0EDE4] text-sm font-medium mb-1">{topic}</p>
                  <p className="text-xs text-[hsl(var(--muted))]">
                    {topicCards.length} kart
                    {due > 0 && (
                      <span className="text-amber ml-2">· {due} bekliyor</span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className="text-xl text-[#F0EDE4]"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {topicCards.length}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Card list (public preview — answers blurred) */}
      <div>
        <h2
          className="text-[#F0EDE4] text-2xl mb-2"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Kartlar
        </h2>
        <p className="text-sm text-[hsl(var(--muted))] mb-6">
          Cevapları görmek için admin olarak giriş yapın.
        </p>

        <div className="flex flex-col gap-3">
          {cards.slice(0, 20).map((card, i) => {
            const maturity = getMaturityLabel(card.repetitions);
            const maturityColor = getMaturityColor(card.repetitions);

            return (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-4 p-4 border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))]"
              >
                <div className="flex-1">
                  <p className="text-sm text-[#F0EDE4]">{card.front}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs text-[hsl(var(--muted))]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {card.topic}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs" style={{ color: maturityColor, fontFamily: "var(--font-mono)" }}>
                    {maturity}
                  </span>

                  {/* Blurred answer */}
                  <div className="relative">
                    <div className="w-24 h-6 bg-[hsl(var(--surface))] rounded blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Lock size={11} className="text-[hsl(var(--muted))]" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {cards.length > 20 && (
            <p className="text-center text-sm text-[hsl(var(--muted))] py-4">
              ve {cards.length - 20} kart daha…
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
