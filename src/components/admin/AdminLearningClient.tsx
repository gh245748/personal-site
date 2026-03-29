"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { sm2, getMaturityLabel, getMaturityColor } from "@/lib/sm2";
import type { Quality } from "@/lib/sm2";
import { formatDateShort } from "@/lib/utils";

interface Card {
  id: string;
  front: string;
  back: string;
  topic: string;
  category: string;
  repetitions: number;
  ease_factor: number;
  interval_days: number;
  due_date: string | null;
  last_reviewed: string | null;
  times_correct: number;
  times_wrong: number;
  created_at: string;
}

const emptyForm = (): Omit<Card, "id" | "repetitions" | "ease_factor" | "interval_days" | "due_date" | "last_reviewed" | "times_correct" | "times_wrong" | "created_at"> => ({
  front: "", back: "", topic: "", category: "general",
});

export default function AdminLearningClient({ initialCards }: { initialCards: Card[] }) {
  const [cards, setCards] = useState(initialCards);
  const [editing, setEditing] = useState<Card | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [reviewCard, setReviewCard] = useState<Card | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const supabase = createClient();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueCards = cards.filter(
    (c) => c.due_date && new Date(c.due_date) <= today
  );

  const openNew = () => { setEditing(null); setForm(emptyForm()); setFormOpen(true); };
  const openEdit = (c: Card) => { setEditing(c); setForm({ front: c.front, back: c.back, topic: c.topic, category: c.category }); setFormOpen(true); };

  const handleSave = async () => {
    if (!form.front.trim() || !form.back.trim()) return toast.error("Ön yüz ve arka yüz boş olamaz.");
    setSaving(true);

    if (editing) {
      const { error } = await supabase.from("learning_items").update(form).eq("id", editing.id);
      if (!error) { setCards((c) => c.map((x) => (x.id === editing.id ? { ...x, ...form } : x))); toast.success("Güncellendi."); setEditing(null); }
      else toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("learning_items").insert(form).select().single();
      if (!error && data) { setCards((c) => [data, ...c]); toast.success("Eklendi."); setEditing(null); setForm(emptyForm()); setFormOpen(false); }
      else if (error) toast.error(error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sil?")) return;
    await supabase.from("learning_items").delete().eq("id", id);
    setCards((c) => c.filter((x) => x.id !== id));
    toast.success("Silindi.");
  };

  const handleReview = async (quality: Quality) => {
    if (!reviewCard) return;
    const updated = sm2(
      {
        repetitions: reviewCard.repetitions,
        easeFactor: reviewCard.ease_factor,
        intervalDays: reviewCard.interval_days,
        dueDate: new Date(reviewCard.due_date ?? new Date()),
      },
      quality
    );

    const payload = {
      repetitions: updated.repetitions,
      ease_factor: updated.easeFactor,
      interval_days: updated.intervalDays,
      due_date: updated.dueDate.toISOString().split("T")[0],
      last_reviewed: new Date().toISOString().split("T")[0],
      times_correct: quality >= 3 ? reviewCard.times_correct + 1 : reviewCard.times_correct,
      times_wrong: quality < 3 ? reviewCard.times_wrong + 1 : reviewCard.times_wrong,
    };

    await supabase.from("learning_items").update(payload).eq("id", reviewCard.id);
    setCards((c) => c.map((x) => (x.id === reviewCard.id ? { ...x, ...payload } : x)));

    const nextDue = dueCards.find((c) => c.id !== reviewCard.id);
    if (nextDue) { setReviewCard(nextDue); setShowAnswer(false); }
    else { setReviewCard(null); setShowAnswer(false); toast.success("Tüm kartlar çalışıldı!"); }
  };

  const showForm = formOpen;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}>Öğrenme Kartları</h1>
          {dueCards.length > 0 && (
            <p className="text-sm text-amber mt-1">{dueCards.length} kart bugün bekliyor</p>
          )}
        </div>
        <div className="flex gap-3">
          {dueCards.length > 0 && !reviewCard && (
            <Button size="sm" variant="secondary" onClick={() => { setReviewCard(dueCards[0]); setShowAnswer(false); }}>
              Çalışmaya Başla ({dueCards.length})
            </Button>
          )}
          <Button size="sm" onClick={openNew} className="flex items-center gap-2"><Plus size={14} /> Yeni Kart</Button>
        </div>
      </div>

      {/* Review mode */}
      {reviewCard && (
        <div className="mb-8 p-6 border border-amber/40 bg-amber/5 rounded-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs text-amber uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>
              Çalışma — {dueCards.length} kart bekliyor
            </span>
            <button onClick={() => setReviewCard(null)} className="text-[hsl(var(--muted))] hover:text-[#F0EDE4]"><X size={16} /></button>
          </div>

          <div className="min-h-32 flex items-center justify-center mb-6">
            <p className="text-xl text-[#F0EDE4] text-center" style={{ fontFamily: "var(--font-display)" }}>
              {reviewCard.front}
            </p>
          </div>

          {showAnswer ? (
            <>
              <div className="border-t border-[hsl(var(--border))] pt-4 mb-6">
                <p className="text-base text-[hsl(var(--muted))] text-center">{reviewCard.back}</p>
              </div>
              <div className="flex justify-center gap-3 flex-wrap">
                {([0, 2, 3, 4, 5] as Quality[]).map((q) => {
                  const labels: Record<number, string> = { 0: "Hiç Bilmedim", 2: "Zor", 3: "Orta", 4: "Kolay", 5: "Çok Kolay" };
                  const colors: Record<number, string> = { 0: "danger", 2: "secondary", 3: "secondary", 4: "primary", 5: "primary" };
                  return (
                    <Button
                      key={q}
                      size="sm"
                      variant={colors[q] as "danger" | "secondary" | "primary"}
                      onClick={() => handleReview(q)}
                    >
                      {labels[q]}
                    </Button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="flex justify-center">
              <Button onClick={() => setShowAnswer(true)}>Cevabı Göster</Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <div className="mb-8 p-6 border border-[hsl(var(--border))] bg-[hsl(var(--surface-2))] rounded-sm">
          <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
            {editing ? "Kartı Düzenle" : "Yeni Kart"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Ön Yüz (Soru) *</label>
              <textarea value={form.front} onChange={(e) => setForm((f) => ({ ...f, front: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber resize-none" />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Arka Yüz (Cevap) *</label>
              <textarea value={form.back} onChange={(e) => setForm((f) => ({ ...f, back: e.target.value }))} rows={3} className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber resize-none" />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Konu</label>
              <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="React, SQL, Matematik…" className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]" />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Kategori</label>
              <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="general" className="w-full px-3 py-2 bg-[hsl(var(--surface))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>Kaydet</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm()); setFormOpen(false); }}>İptal</Button>
          </div>
        </div>
      )}

      {/* Cards list */}
      <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
        {cards.map((card, i) => {
          const maturity = getMaturityLabel(card.repetitions);
          const maturityColor = getMaturityColor(card.repetitions);
          const isDue = card.due_date && new Date(card.due_date) <= today;

          return (
            <div key={card.id} className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#F0EDE4] truncate mb-1">{card.front}</p>
                <div className="flex items-center gap-3 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                  <span className="text-[hsl(var(--muted))]">{card.topic}</span>
                  <span style={{ color: maturityColor }}>{maturity}</span>
                  {isDue && <span className="text-amber">Bekliyor</span>}
                  {card.due_date && <span className="text-[hsl(var(--muted))]">{formatDateShort(card.due_date)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-green-400" style={{ fontFamily: "var(--font-mono)" }}>{card.times_correct}✓</span>
                <span className="text-xs text-red-400" style={{ fontFamily: "var(--font-mono)" }}>{card.times_wrong}✗</span>
                <button onClick={() => openEdit(card)} className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(card.id)} className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
        {cards.length === 0 && <div className="text-center py-12 text-[hsl(var(--muted))] text-sm">Henüz kart yok.</div>}
      </div>
    </div>
  );
}
