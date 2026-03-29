"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, CalendarDays, Flag, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time: string | null;
  type: string;
}

const emptyForm = (): Omit<Event, "id"> => ({
  title: "",
  description: "",
  date: "",
  time: "",
  type: "event",
});

const typeVariant: Record<string, "amber" | "red" | "blue" | "green"> = {
  event:    "amber",
  deadline: "red",
  reminder: "blue",
  goal:     "green",
};

const typeLabel: Record<string, string> = {
  event:    "Etkinlik",
  deadline: "Deadline",
  reminder: "Hatırlatıcı",
  goal:     "Hedef",
};

const typeIcon = {
  event:    CalendarDays,
  deadline: Flag,
  reminder: Bell,
  goal:     Flag,
};

export default function AdminCalendarClient({ initialEvents }: { initialEvents: Event[] }) {
  const [events, setEvents] = useState(initialEvents);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const openNew  = () => { setEditing(null); setForm(emptyForm()); setFormOpen(true); };
  const openEdit = (e: Event) => { setEditing(e); setForm({ ...e }); setFormOpen(true); };

  const handleSave = async () => {
    if (!form.title.trim()) return toast.error("Başlık boş olamaz.");
    if (!form.date) return toast.error("Tarih seçmelisin.");
    setSaving(true);

    const payload = {
      ...form,
      description: form.description || null,
      time: form.time || null,
    };

    if (editing) {
      const { error } = await supabase.from("events").update(payload).eq("id", editing.id);
      if (!error) {
        setEvents(ev => ev.map(x => x.id === editing.id ? { ...x, ...payload } : x));
        toast.success("Güncellendi.");
        setEditing(null);
        setFormOpen(false);
      } else toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("events").insert(payload).select().single();
      if (!error && data) {
        setEvents(ev => [...ev, data].sort((a, b) => a.date.localeCompare(b.date)));
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
    await supabase.from("events").delete().eq("id", id);
    setEvents(ev => ev.filter(x => x.id !== id));
    toast.success("Silindi.");
  };

  const today = new Date().toISOString().split("T")[0];
  const upcoming = events.filter(e => e.date >= today);
  const past     = events.filter(e => e.date < today);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "2rem", letterSpacing: "-0.02em" }}>
          Takvim
        </h1>
        <Button size="sm" onClick={openNew} className="flex items-center gap-2">
          <Plus size={14} /> Yeni Etkinlik
        </Button>
      </div>

      {/* Form */}
      {formOpen && (
        <div className="mb-8 p-6 border border-amber/30 bg-amber/5 rounded-sm">
          <h2 className="text-[#F0EDE4] text-lg mb-5" style={{ fontFamily: "var(--font-display)" }}>
            {editing ? "Etkinliği Düzenle" : "Yeni Etkinlik"}
          </h2>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Başlık *</label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Etkinlik adı"
                className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber placeholder:text-[hsl(var(--muted))]"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Tür</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
              >
                <option value="event">Etkinlik</option>
                <option value="deadline">Deadline</option>
                <option value="reminder">Hatırlatıcı</option>
                <option value="goal">Hedef</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Tarih *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
              />
            </div>
            <div>
              <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Saat (opsiyonel)</label>
              <input
                type="time"
                value={form.time ?? ""}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber"
              />
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-xs text-[hsl(var(--muted))] mb-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>Açıklama</label>
            <textarea
              value={form.description ?? ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="Opsiyonel not"
              className="w-full px-3 py-2 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-sm text-[#F0EDE4] focus:outline-none focus:border-amber resize-none placeholder:text-[hsl(var(--muted))]"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} loading={saving}>Kaydet</Button>
            <Button variant="ghost" onClick={() => { setEditing(null); setForm(emptyForm()); setFormOpen(false); }}>İptal</Button>
          </div>
        </div>
      )}

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm text-[hsl(var(--muted))] mb-3 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Yaklaşan ({upcoming.length})
          </h2>
          <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden">
            {upcoming.map((ev, i) => {
              const Icon = typeIcon[ev.type as keyof typeof typeIcon] ?? CalendarDays;
              return (
                <div key={ev.id} className={`flex items-center gap-4 p-4 hover:bg-[hsl(var(--surface-2))] transition-colors ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}>
                  <Icon size={15} className="text-amber shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-[#F0EDE4] truncate">{ev.title}</p>
                    <p className="text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
                      {formatDate(ev.date)}{ev.time ? ` · ${ev.time}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={typeVariant[ev.type] ?? "default"}>{typeLabel[ev.type]}</Badge>
                    <button onClick={() => openEdit(ev)} className="p-1.5 text-[hsl(var(--muted))] hover:text-amber transition-colors"><Pencil size={14} /></button>
                    <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-[hsl(var(--muted))] hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <h2 className="text-sm text-[hsl(var(--muted))] mb-3 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Geçmiş ({past.length})
          </h2>
          <div className="border border-[hsl(var(--border))] rounded-sm overflow-hidden opacity-50">
            {past.slice(-10).reverse().map((ev, i) => {
              const Icon = typeIcon[ev.type as keyof typeof typeIcon] ?? CalendarDays;
              return (
                <div key={ev.id} className={`flex items-center gap-4 p-3 ${i > 0 ? "border-t border-[hsl(var(--border))]" : ""}`}>
                  <Icon size={13} className="text-[hsl(var(--muted))] shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[hsl(var(--muted))] truncate">{ev.title}</p>
                    <p className="text-xs text-[hsl(var(--border))]" style={{ fontFamily: "var(--font-mono)" }}>{formatDate(ev.date)}</p>
                  </div>
                  <button onClick={() => handleDelete(ev.id)} className="p-1 text-[hsl(var(--border))] hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {events.length === 0 && !formOpen && (
        <div className="text-center py-20 border border-[hsl(var(--border))] rounded-sm">
          <CalendarDays size={32} className="text-[hsl(var(--border))] mx-auto mb-3" />
          <p className="text-[hsl(var(--muted))] mb-4 text-sm">Henüz etkinlik yok.</p>
          <Button size="sm" onClick={openNew} className="flex items-center gap-2 mx-auto">
            <Plus size={14} /> İlk Etkinliği Ekle
          </Button>
        </div>
      )}
    </div>
  );
}
