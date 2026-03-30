"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Target, Tag } from "lucide-react";
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

interface Category {
  key: string;
  label: string;
}

const emptyGoalForm = (): Omit<Goal, "id"> => ({
  title: "",
  description: "",
  category: "learning",
  progress: 0,
  target_date: "",
  status: "active",
  milestones: [],
});

export default function AdminGoalsClient({
  initialGoals,
  categories: initialCategories,
}: {
  initialGoals: Goal[];
  categories: Category[];
}) {
  const [goals, setGoals] = useState(initialGoals);
  const [categories, setCategories] = useState(initialCategories);
  const [tab, setTab] = useState<"goals" | "categories">("goals");

  // Goal form state
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyGoalForm());
  const [milestoneInput, setMilestoneInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Category form state
  const [catForm, setCatForm] = useState({ key: "", label: "" });
  const [catSaving, setCatSaving] = useState(false);
  const [catFormOpen, setCatFormOpen] = useState(false);

  const supabase = createClient();

  // ── Goals ──────────────────────────────────────────────
  const openNew = () => { setEditing(null); setForm(emptyGoalForm()); setFormOpen(true); };
  const openEdit = (g: Goal) => { setEditing(g); setForm({ ...g }); setFormOpen(true); };

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
        setForm(emptyGoalForm());
        setFormOpen(false);
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

  // ── Categories ─────────────────────────────────────────
  const handleAddCategory = async () => {
    if (!catForm.key.trim() || !catForm.label.trim()) return toast.error("Key ve etiket gerekli.");
    const key = catForm.key.trim().toLowerCase().replace(/\s+/g, "_");
    if (categories.find((c) => c.key === key)) return toast.error("Bu key zaten var.");

    setCatSaving(true);
    const payload = {
      key,
      label: catForm.label.trim(),
      sort_order: categories.length,
    };
    const { data, error } = await supabase.from("goal_categories").insert(payload).select().single();
    if (!error && data) {
      setCategories((c) => [...c, { key: data.key, label: data.label }]);
      setCatForm({ key: "", label: "" });
      setCatFormOpen(false);
      toast.success("Kategori eklendi.");
    } else toast.error(error?.message ?? "Hata");
    setCatSaving(false);
  };

  const handleDeleteCategory = async (key: string) => {
    const count = goals.filter((g) => g.category === key).length;
    if (count > 0 && !confirm(`Bu kategoride ${count} hedef var. Yine de sil?`)) return;
    const { error } = await supabase.from("goal_categories").delete().eq("key", key);
    if (!error) {
      setCategories((c) => c.filter((x) => x.key !== key));
      toast.success("Kategori silindi.");
    } else toast.error(error.message);
  };

  const categoryLabel = (key: string) =>
    categories.find((c) => c.key === key)?.label ?? key;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-[#F0EDE4]"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}
        >
          Hedefler
        </h1>
        <div>
          {tab === "goals" && (
            <Button size="sm" onClick={openNew} className="flex items-center gap-2">
              <Plus size={14} /> Yeni Hedef
            </Button>
          )}
          {tab === "categories" && (
            <Button size="sm" onClick={() => setCatFormOpen(true)} className="flex items-center gap-2">
              <Plus size={14} /> Kategori Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 border border-[hsl(var(--border))] rounded-sm p-0.5 w-fit mb-8">
        <button
          onClick={() => setTab("goals")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm transition-colors ${
            tab === "goals" ? "bg-amber/10 text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
          }`}
        >
          <Target size={14} /> Hedefler
        </button>
        <button
          onClick={() => setTab("categories")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm transition-colors ${
            tab === "categories" ? "bg-amber/10 text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
          }`}
        >
          <Tag size={14} /> Kategoriler
          <span className="ml-1 text-xs bg-[hsl(var(--surface-2))] px-1.5 py-0.5 rounded-sm">
            {categories.length}
          </span>
        </button>
      </div>

      {/* ── GOALS TAB ── */}
      {tab === "goals" && (
        <>
          {formOpen && (
            <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
              <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
                {editing ? "Hedefi Düzenle" : "Yeni Hedef"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Başlık *
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Hedef başlığı"
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Kategori
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    İlerleme (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={form.progress}
                    onChange={(e) => setForm((f) => ({ ...f, progress: Number(e.target.value) }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Durum
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  >
                    {["active", "completed", "paused"].map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Hedef Tarihi
                  </label>
                  <input
                    type="date"
                    value={form.target_date ?? ""}
                    onChange={(e) => setForm((f) => ({ ...f, target_date: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  />
                </div>
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

              <div className="mb-5">
                <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                  Milestone&apos;lar
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
                <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyGoalForm()); setFormOpen(false); }}>İptal</Button>
              </div>
            </div>
          )}

          <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
            {goals.map((goal, i) => (
              <div
                key={goal.id}
                className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#F0EDE4]">{goal.title}</span>
                    <Badge variant="amber">{categoryLabel(goal.category)}</Badge>
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
        </>
      )}

      {/* ── CATEGORIES TAB ── */}
      {tab === "categories" && (
        <>
          {catFormOpen && (
            <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
              <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
                Yeni Kategori
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Key (benzersiz)
                  </label>
                  <input
                    type="text"
                    value={catForm.key}
                    onChange={(e) => setCatForm((f) => ({ ...f, key: e.target.value }))}
                    placeholder="ornek: okuma"
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
                    Görünen Ad
                  </label>
                  <input
                    type="text"
                    value={catForm.label}
                    onChange={(e) => setCatForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="Okuma"
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddCategory} loading={catSaving}>Ekle</Button>
                <Button variant="ghost" onClick={() => { setCatForm({ key: "", label: "" }); setCatFormOpen(false); }}>İptal</Button>
              </div>
            </div>
          )}

          {categories.length > 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
              {categories.map((cat, i) => {
                const count = goals.filter((g) => g.category === cat.key).length;
                return (
                  <div
                    key={cat.key}
                    className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}
                  >
                    <div className="flex-1">
                      <span className="text-sm text-[#F0EDE4]">{cat.label}</span>
                      <span className="text-xs text-[hsl(var(--muted))] ml-2" style={{ fontFamily: "var(--font-mono)" }}>
                        key: {cat.key}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
                        {count} hedef
                      </span>
                      <button
                        onClick={() => handleDeleteCategory(cat.key)}
                        className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-[hsl(var(--border))] rounded-sm">
              <Tag size={32} className="text-[hsl(var(--border))] mx-auto mb-3" />
              <p className="text-[hsl(var(--muted))] text-sm">Henüz kategori yok.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
