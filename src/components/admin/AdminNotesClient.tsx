"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star, Share2, LayoutGrid, Link2, X } from "lucide-react";
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

interface Connection {
  id: string;
  note_a: string;
  note_b: string;
  label: string | null;
}

const emptyForm = (): Omit<Note, "id"> => ({
  title: "", author: "", type: "book", cover_url: "", rating: null, content: "", tags: [], finished_at: "",
});

export default function AdminNotesClient({
  initialNotes,
  initialConnections,
}: {
  initialNotes: Note[];
  initialConnections: Connection[];
}) {
  const [notes, setNotes] = useState(initialNotes);
  const [connections, setConnections] = useState(initialConnections);
  const [tab, setTab] = useState<"notes" | "connections">("notes");

  // Note form state
  const [editing, setEditing] = useState<Note | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [tagsInput, setTagsInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  // Connection form state
  const [connForm, setConnForm] = useState({ note_a: "", note_b: "", label: "" });
  const [connSaving, setConnSaving] = useState(false);
  const [connFormOpen, setConnFormOpen] = useState(false);

  const supabase = createClient();

  // ── Notes ──────────────────────────────────────────────
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
      if (!error) {
        setNotes((n) => n.map((x) => (x.id === editing.id ? { ...x, ...payload } : x)));
        toast.success("Güncellendi.");
        setEditing(null);
      } else toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("notes").insert(payload).select().single();
      if (!error && data) {
        setNotes((n) => [data, ...n]);
        toast.success("Eklendi.");
        setEditing(null);
        setForm(emptyForm());
        setFormOpen(false);
      } else if (error) toast.error(error.message);
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Sil?")) return;
    await supabase.from("notes").delete().eq("id", id);
    setNotes((n) => n.filter((x) => x.id !== id));
    toast.success("Silindi.");
  };

  // ── Connections ────────────────────────────────────────
  const handleAddConnection = async () => {
    if (!connForm.note_a || !connForm.note_b) return toast.error("İki not seçmelisiniz.");
    if (connForm.note_a === connForm.note_b) return toast.error("Aynı notu seçemezsiniz.");

    setConnSaving(true);
    const payload = {
      note_a: connForm.note_a,
      note_b: connForm.note_b,
      label: connForm.label || null,
    };
    const { data, error } = await supabase.from("note_connections").insert(payload).select().single();
    if (!error && data) {
      setConnections((c) => [...c, data]);
      setConnForm({ note_a: "", note_b: "", label: "" });
      setConnFormOpen(false);
      toast.success("Bağlantı eklendi.");
    } else toast.error(error?.message ?? "Hata");
    setConnSaving(false);
  };

  const handleDeleteConnection = async (id: string) => {
    if (!confirm("Bağlantıyı sil?")) return;
    await supabase.from("note_connections").delete().eq("id", id);
    setConnections((c) => c.filter((x) => x.id !== id));
    toast.success("Bağlantı silindi.");
  };

  const noteTitle = (id: string) => notes.find((n) => n.id === id)?.title ?? id.slice(0, 8);
  const noteType = (id: string) => notes.find((n) => n.id === id)?.type ?? "";

  const TYPE_COLOR: Record<string, string> = {
    book: "#D4872A", film: "#5599E8", article: "#55C888", music: "#C855E8",
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-[#F0EDE4]"
          style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}
        >
          Notlar
        </h1>
        <div className="flex items-center gap-2">
          {tab === "notes" && (
            <Button size="sm" onClick={openNew} className="flex items-center gap-2">
              <Plus size={14} /> Yeni Not
            </Button>
          )}
          {tab === "connections" && (
            <Button size="sm" onClick={() => setConnFormOpen(true)} className="flex items-center gap-2">
              <Link2 size={14} /> Bağlantı Ekle
            </Button>
          )}
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 border border-[hsl(var(--border))] rounded-sm p-0.5 w-fit mb-8">
        <button
          onClick={() => setTab("notes")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm transition-colors ${
            tab === "notes" ? "bg-amber/10 text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
          }`}
        >
          <LayoutGrid size={14} /> Notlar
        </button>
        <button
          onClick={() => setTab("connections")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-sm text-sm transition-colors ${
            tab === "connections" ? "bg-amber/10 text-amber" : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
          }`}
        >
          <Share2 size={14} /> Bağlantılar
          <span className="ml-1 text-xs bg-[hsl(var(--surface-2))] px-1.5 py-0.5 rounded-sm">
            {connections.length}
          </span>
        </button>
      </div>

      {/* ── NOTES TAB ── */}
      {tab === "notes" && (
        <>
          {formOpen && (
            <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
              <h2
                className="text-[#F0EDE4] text-lg mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
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
                    <label
                      className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {label}
                    </label>
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
                  <label
                    className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Tür
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  >
                    {["book", "film", "article", "music"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Puan (1-5)
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, rating: f.rating === s ? null : s }))}
                      >
                        <Star
                          size={20}
                          className={s <= (form.rating ?? 0) ? "text-amber fill-amber" : "text-[hsl(var(--border))]"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label
                  className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Etiketler
                </label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="roman, distopya, …"
                  className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                />
              </div>
              <div className="mb-5">
                <label
                  className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  Notlar (Markdown)
                </label>
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
                <Button
                  variant="ghost"
                  onClick={() => { setEditing(null); setForm(emptyForm()); setFormOpen(false); }}
                >
                  İptal
                </Button>
              </div>
            </div>
          )}

          <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
            {notes.map((n, i) => (
              <div
                key={n.id}
                className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}
              >
                <div className="flex-1">
                  <span className="text-sm text-[#F0EDE4]">{n.title}</span>
                  {n.author && (
                    <span className="text-xs text-[hsl(var(--muted))] ml-2">— {n.author}</span>
                  )}
                  {n.rating && (
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={11}
                          className={s <= n.rating! ? "text-amber fill-amber" : "text-[hsl(var(--border))]"}
                        />
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="amber">{n.type}</Badge>
                  <button
                    onClick={() => openEdit(n)}
                    className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(n.id)}
                    className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {notes.length === 0 && (
              <div className="text-center py-12 text-[hsl(var(--muted))] text-sm">
                Henüz not yok.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── CONNECTIONS TAB ── */}
      {tab === "connections" && (
        <>
          {/* Add connection form */}
          {connFormOpen && (
            <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
              <h2
                className="text-[#F0EDE4] text-lg mb-5"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Bağlantı Ekle
              </h2>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label
                    className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Not A *
                  </label>
                  <select
                    value={connForm.note_a}
                    onChange={(e) => setConnForm((f) => ({ ...f, note_a: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  >
                    <option value="">Seç…</option>
                    {notes.map((n) => (
                      <option key={n.id} value={n.id}>
                        [{n.type}] {n.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Not B *
                  </label>
                  <select
                    value={connForm.note_b}
                    onChange={(e) => setConnForm((f) => ({ ...f, note_b: e.target.value }))}
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
                  >
                    <option value="">Seç…</option>
                    {notes.map((n) => (
                      <option key={n.id} value={n.id}>
                        [{n.type}] {n.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label
                    className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase"
                    style={{ fontFamily: "var(--font-mono)" }}
                  >
                    Bağlantı Etiketi (opsiyonel)
                  </label>
                  <input
                    type="text"
                    value={connForm.label}
                    onChange={(e) => setConnForm((f) => ({ ...f, label: e.target.value }))}
                    placeholder="örn: aynı yazar, benzer tema, uyarlandı…"
                    className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleAddConnection} loading={connSaving}>Ekle</Button>
                <Button
                  variant="ghost"
                  onClick={() => { setConnForm({ note_a: "", note_b: "", label: "" }); setConnFormOpen(false); }}
                >
                  İptal
                </Button>
              </div>
            </div>
          )}

          {/* Connections list */}
          {connections.length > 0 ? (
            <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
              {connections.map((c, i) => {
                const colorA = TYPE_COLOR[noteType(c.note_a)] ?? "#888";
                const colorB = TYPE_COLOR[noteType(c.note_b)] ?? "#888";
                return (
                  <div
                    key={c.id}
                    className={`flex items-center justify-between gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span
                        className="text-sm text-[#F0EDE4] truncate font-medium"
                        style={{ color: colorA }}
                      >
                        {noteTitle(c.note_a)}
                      </span>
                      <div className="flex flex-col items-center shrink-0">
                        <div className="h-px w-8 bg-[hsl(var(--border))]" />
                        {c.label && (
                          <span
                            className="text-[9px] text-[hsl(var(--muted))] mt-0.5 whitespace-nowrap"
                            style={{ fontFamily: "var(--font-mono)" }}
                          >
                            {c.label}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-[#F0EDE4] truncate font-medium" style={{ color: colorB }}>
                        {noteTitle(c.note_b)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteConnection(c.id)}
                      className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16 border border-[hsl(var(--border))] rounded-sm">
              <Share2 size={32} className="text-[hsl(var(--border))] mx-auto mb-3" />
              <p className="text-[hsl(var(--muted))] text-sm">Henüz bağlantı yok.</p>
              <p className="text-[hsl(var(--muted))] text-xs mt-1">
                Yukarıdaki "Bağlantı Ekle" butonundan notlar arası ilişki tanımlayabilirsiniz.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
