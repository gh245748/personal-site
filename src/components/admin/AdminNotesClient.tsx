"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Note {
  id: string;
  title: string;
  author: string | null;
  type: string;
  cover_url: string | null;
  rating: number | null;
  content: string | null;
  tags: string[];
  finished_at: string | null;
}

const emptyForm = (): Omit<Note, "id"> => ({
  title: "", author: "", type: "book", cover_url: "", rating: null, content: "", tags: [], finished_at: "",
});

export default function AdminNotesClient({ initialNotes }: { initialNotes: Note[] }) {
  const [notes, setNotes] = useState(initialNotes);
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const supabase = createClient();

  const openNew = () => { setEditing(null); setForm(emptyForm()); setTagsInput(""); setFormOpen(true); };
  const openEdit = (n: Note) => { setEditing(n); setForm({ ...n }); setTagsInput(n.tags.join(", ")); setFormOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Başlık boş olamaz.");
    setSaving(true);
    const payload = {
      ...form,
      tags: tagsInput.split(",").map((t) => t.trim()).filter(Boolean),
      author: form.author || null,
      cover_url: form.cover_url || null,
      content: form.content || null,
      finished_at: form.finished_at || null,
    };

    if (editing) {
      const { error } = await supabase.from("notes").update(payload).eq("id", editing.id);
      if (!error) { setNotes((n) => n.map((x) => (x.id === editing.id ? { ...x, ...payload } : x))); toast.success("Güncellendi."); setEditing(null); }
      else toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("notes").insert(payload).select().single();
      if (!error && data) { setNotes((n) => [data, ...n]); toast.success("Eklendi."); setEditing(null); setForm(emptyForm()); setFormOpen(false); }
      else if (error) toast.error(error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sil?")) return;
    await supabase.from("notes").delete().eq("id", id);
    setNotes((n) => n.filter((x) => x.id !== id));
    toast.success("Silindi.");
  };

  const showForm = formOpen;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}>Notlar</h1>
        <Button size="sm" onClick={openNew} className="flex items-center gap-2"><Plus size={14} /> Yeni Not</Button>
      </div>

      {showForm && (
        <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
          <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
            {editing ? "Notu Düzenle" : "Yeni Not"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            {[
              { label: "Başlık *", key: "title", placeholder: "Kitap/Film adı" },
              { label: "Yazar / Yönetmen", key: "author", placeholder: "Opsiyonel" },
              { label: "Kapak URL", key: "cover_url", placeholder: "https://…" },
              { label: "Bitiş Tarihi", key: "finished_at", type: "date" },
            ].map(({ label, key, placeholder, type }) => (
              <div key={key}>
                <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>{label}</label>
                <input
                  type={type ?? "text"}
                  value={(form as Record<string, unknown>)[key] as string ?? ""}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Tür</label>
              <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber">
                {["book", "film", "article", "album"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Puan (1-5)</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button key={s} type="button" onClick={() => setForm((f) => ({ ...f, rating: f.rating === s ? null : s }))}>
                    <Star size={20} className={s <= (form.rating ?? 0) ? "text-amber fill-amber" : "text-[hsl(var(--border))]"} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Etiketler</label>
            <input value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} placeholder="roman, distopya, …" className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]" />
          </div>
          <div className="mb-5">
            <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Notlar (Markdown)</label>
            <textarea
              value={form.content ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber resize-none placeholder:text-[hsl(var(--muted))]"
              placeholder="Kitap/film hakkında notlar, alıntılar…"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>Kaydet</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm()); setFormOpen(false); }}>İptal</Button>
          </div>
        </div>
      )}

      <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
        {notes.map((n, i) => (
          <div key={n.id} className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}>
            <div className="flex-1">
              <span className="text-sm text-[#F0EDE4]">{n.title}</span>
              {n.author && <span className="text-xs text-[hsl(var(--muted))] ml-2">— {n.author}</span>}
              {n.rating && (
                <div className="flex items-center gap-0.5 mt-1">
                  {[1,2,3,4,5].map((s) => <Star key={s} size={11} className={s <= n.rating! ? "text-amber fill-amber" : "text-[hsl(var(--border))]"} />)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="amber">{n.type}</Badge>
              <button onClick={() => openEdit(n)} className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors"><Pencil size={14} /></button>
              <button onClick={() => handleDelete(n.id)} className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {notes.length === 0 && <div className="text-center py-12 text-[hsl(var(--muted))] text-sm">Henüz not yok.</div>}
      </div>
    </div>
  );
}
