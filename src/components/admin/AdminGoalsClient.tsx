"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Milestone { text: string; done: boolean; }

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  progress: number;
  target_date: string | null;
  status: string;
  milestones: Milestone[];
}

const emptyForm = (): Omit<Goal, "id"> => ({
  title: "",
  description: "",
  category: "learning",
  progress: 0,
  target_date: "",
  status: "active",
  milestones: [],
});

export default function AdminGoalsClient({ initialGoals }: { initialGoals: Goal[] }) {
  const [goals, setGoals] = useState(initialGoals);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [milestoneInput, setMilestoneInput] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const openNew = () => { setEditing(null); setForm(emptyForm()); };

  const openEdit = (g: Goal) => {
    setEditing(g);
    setForm({ ...g });
  };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Başlık boş olamaz.");
    setSaving(true);
    const payload = { ...form, target_date: form.target_date || null, description: form.description || null };

    if (editing) {
      const { error } = await supabase.from("goals").update(payload).eq("id", editing.id);
      if (!error) {
        setGoals((g) => g.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));
        toast.success("Güncellendi.");
        setEditing(null);
      } else toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("goals").insert(payload).select().single();
      if (!error && data) {
        setGoals((g) => [data, ...g]);
        toast.success("Eklendi.");
        setEditing(null);
        setForm(emptyForm());
      } else if (error) toast.error(error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sil?")) return;
    await supabase.from("goals").delete().eq("id", id);
    setGoals((g) => g.filter((x) => x.id !== id));
    toast.success("Silindi.");
  };

  const addMilestone = () => {
    if (!milestoneInput.trim()) return;
    setForm((f) => ({ ...f, milestones: [...f.milestones, { text: milestoneInput.trim(), done: false }] }));
    setMilestoneInput("");
  };

  const toggleMilestone = (i: number) => {
    setForm((f) => ({
      ...f,
      milestones: f.milestones.map((m, idx) => (idx === i ? { ...m, done: !m.done } : m)),
    }));
  };

  const removeMilestone = (i: number) => {
    setForm((f) => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));
  };

  const showForm = editing !== null || form.title !== "";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}>
          Hedefler
        </h1>
        <Button size="sm" onClick={openNew} className="flex items-center gap-2">
          <Plus size={14} /> Yeni Hedef
        </Button>
      </div>

      {/* Form */}
      {(showForm || editing !== null) && (
        <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
          <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
            {editing ? "Hedefi Düzenle" : "Yeni Hedef"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Başlık *", key: "title", type: "text", placeholder: "Hedef başlığı" },
              { label: "Kategori", key: "category", type: "select", options: ["learning", "fitness", "finance", "project"] },
              { label: "İlerleme (%)", key: "progress", type: "number" },
              { label: "Durum", key: "status", type: "select", options: ["active", "completed", "paused"] },
              { label: "Hedef Tarihi", key: "target_date", type: "date" },
            ].map(({ label, key, type, placeholder, options }) => (
              <div key={key}>
                <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                  {label}
                </label>
                {type === "select" ? (
                  <select
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  >
                    {options!.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={(form as Record<string, unknown>)[key] as string}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value) : e.target.value }))}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Açıklama
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber resize-none placeholder:text-[hsl(var(--muted))]"
              placeholder="Opsiyonel açıklama"
            />
          </div>

          {/* Milestones */}
          <div className="mb-5">
            <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
              Milestone'lar
            </label>
            <div className="flex gap-2 mb-2">
              <input
                value={milestoneInput}
                onChange={(e) => setMilestoneInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMilestone())}
                placeholder="Milestone ekle…"
                className="flex-1 px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
              />
              <Button size="sm" onClick={addMilestone}><Plus size={13} /></Button>
            </div>
            {form.milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2 mb-1.5">
                <button type="button" onClick={() => toggleMilestone(i)}>
                  {m.done ? <Check size={14} className="text-amber" /> : <div className="w-3.5 h-3.5 border border-[hsl(var(--border))] rounded-sm" />}
                </button>
                <span className={`flex-1 text-sm ${m.done ? "line-through text-[hsl(var(--muted))]" : "text-[#F0EDE4]"}`}>{m.text}</span>
                <button type="button" onClick={() => removeMilestone(i)}>
                  <X size={12} className="text-[hsl(var(--muted))] hover:text-red-400" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>Kaydet</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm()); }}>İptal</Button>
          </div>
        </div>
      )}

      {/* Goals list */}
      <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
        {goals.map((goal, i) => (
          <div
            key={goal.id}
            className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-[#F0EDE4]">{goal.title}</span>
                <Badge variant="amber">{goal.category}</Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1 w-24 bg-[hsl(var(--border))] rounded-full overflow-hidden">
                  <div className="h-full bg-amber rounded-full" style={{ width: `${goal.progress}%` }} />
                </div>
                <span className="text-xs text-amber" style={{ fontFamily: "var(--font-mono)" }}>{goal.progress}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={goal.status === "active" ? "green" : goal.status === "completed" ? "amber" : "default"}>
                {goal.status}
              </Badge>
              <button onClick={() => openEdit(goal)} className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(goal.id)} className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {goals.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--muted))] text-sm">Henüz hedef yok.</div>
        )}
      </div>
    </div>
  );
}
