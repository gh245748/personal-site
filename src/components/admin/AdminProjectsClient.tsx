"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Project {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  stack: string[];
  url: string | null;
  github_url: string | null;
  cover_url: string | null;
  status: string;
  featured: boolean;
}

const emptyForm = (): Omit<Project, "id"> => ({
  title: "",
  tagline: "",
  description: "",
  stack: [],
  url: "",
  github_url: "",
  cover_url: "",
  status: "active",
  featured: false,
});

export default function AdminProjectsClient({ initialProjects }: { initialProjects: Project[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [stackInput, setStackInput] = useState("");
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const openNew = () => { setEditing(null); setForm(emptyForm()); setStackInput(""); };
  const openEdit = (p: Project) => { setEditing(p); setForm({ ...p }); setStackInput(p.stack.join(", ")); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Başlık boş olamaz.");
    setSaving(true);
    const payload = {
      ...form,
      stack: stackInput.split(",").map((s) => s.trim()).filter(Boolean),
      tagline: form.tagline || null,
      description: form.description || null,
      url: form.url || null,
      github_url: form.github_url || null,
      cover_url: form.cover_url || null,
    };

    if (editing) {
      const { error } = await supabase.from("projects").update(payload).eq("id", editing.id);
      if (!error) { setProjects((p) => p.map((x) => (x.id === editing.id ? { ...x, ...payload } : x))); toast.success("Güncellendi."); setEditing(null); }
      else toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("projects").insert(payload).select().single();
      if (!error && data) { setProjects((p) => [data, ...p]); toast.success("Eklendi."); setEditing(null); setForm(emptyForm()); }
      else if (error) toast.error(error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sil?")) return;
    await supabase.from("projects").delete().eq("id", id);
    setProjects((p) => p.filter((x) => x.id !== id));
    toast.success("Silindi.");
  };

  const showForm = editing !== null || form.title !== "";

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}>
          Projeler
        </h1>
        <Button size="sm" onClick={openNew} className="flex items-center gap-2">
          <Plus size={14} /> Yeni Proje
        </Button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
          <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
            {editing ? "Projeyi Düzenle" : "Yeni Proje"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Başlık *", key: "title", placeholder: "Proje adı" },
              { label: "Tagline", key: "tagline", placeholder: "Kısa açıklama" },
              { label: "URL", key: "url", placeholder: "https://…" },
              { label: "GitHub URL", key: "github_url", placeholder: "https://github.com/…" },
              { label: "Kapak Görseli URL", key: "cover_url", placeholder: "https://…" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>{label}</label>
                <input
                  value={(form as Record<string, unknown>)[key] as string ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Durum</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
              >
                {["active", "completed", "archived"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Stack (virgülle ayır)</label>
            <input
              value={stackInput}
              onChange={(e) => setStackInput(e.target.value)}
              placeholder="Next.js, TypeScript, Supabase"
              className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
            />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="accent-amber" />
            <label htmlFor="featured" className="text-sm text-[hsl(var(--muted))]">Öne çıkan proje</label>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>Kaydet</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm()); }}>İptal</Button>
          </div>
        </div>
      )}

      <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
        {projects.map((p, i) => (
          <div key={p.id} className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm text-[#F0EDE4]">{p.title}</span>
                {p.featured && <span className="text-xs text-amber">★ Öne Çıkan</span>}
              </div>
              <div className="flex flex-wrap gap-1">
                {p.stack.slice(0, 4).map((t) => <Badge key={t} variant="default">{t}</Badge>)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={p.status === "active" ? "green" : p.status === "completed" ? "amber" : "default"}>{p.status}</Badge>
              <button onClick={() => openEdit(p)} className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(p.id)} className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {projects.length === 0 && <div className="text-center py-12 text-[hsl(var(--muted))] text-sm">Henüz proje yok.</div>}
      </div>
    </div>
  );
}
