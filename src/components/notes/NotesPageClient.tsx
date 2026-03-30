"use client";

import { useState } from "react";
import { LayoutGrid, Share2 } from "lucide-react";
import NoteCard from "@/components/notes/NoteCard";
import NotesGraph from "@/components/notes/NotesGraph";

interface Note {
  id: string;
  title: string;
  author?: string | null;
  type: string;
  cover_url?: string | null;
  rating?: number | null;
  content?: string | null;
  tags: string[];
  finished_at?: string | null;
}

interface Connection {
  id: string;
  note_a: string;
  note_b: string;
  label?: string | null;
}

const TYPES = [
  { key: "all",     label: "Tümü" },
  { key: "book",    label: "Kitaplar" },
  { key: "film",    label: "Filmler" },
  { key: "article", label: "Makaleler" },
  { key: "album",   label: "Albümler" },
];

export default function NotesPageClient({
  notes,
  connections,
  activeType,
}: {
  notes: Note[];
  connections: Connection[];
  activeType: string;
}) {
  const [view, setView] = useState<"grid" | "graph">("grid");

  // For graph: include all notes regardless of type filter
  const graphNodes = notes.map((n) => ({
    id: n.id,
    title: n.title,
    author: n.author,
    type: n.type,
    rating: n.rating,
  }));

  const graphLinks = connections.map((c) => ({
    source: c.note_a,
    target: c.note_b,
    label: c.label,
  }));

  return (
    <>
      {/* Header */}
      <div className="mb-10">
        <p
          className="text-xs tracking-[0.3em] text-amber uppercase mb-3"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Okumalar & İzlemeler
        </p>
        <h1
          className="text-[#F0EDE4]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            letterSpacing: "-0.03em",
            lineHeight: 0.95,
          }}
        >
          Notlar
        </h1>
      </div>

      {/* Controls row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-10 border-b border-[hsl(var(--border))] pb-6">
        {/* Type tabs */}
        {view === "grid" && (
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ key, label }) => (
              <a
                key={key}
                href={key === "all" ? "/notes" : `/notes?type=${key}`}
                className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                  activeType === key
                    ? "bg-amber/10 text-amber border border-amber/30"
                    : "text-[hsl(var(--muted))] hover:text-[#F0EDE4] border border-transparent hover:border-[hsl(var(--border))]"
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        )}

        {view === "graph" && (
          <p
            className="text-xs text-[hsl(var(--muted))]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {graphNodes.length} not · {graphLinks.length} bağlantı
          </p>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 border border-[hsl(var(--border))] rounded-sm p-0.5 ml-auto">
          <button
            onClick={() => setView("grid")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors ${
              view === "grid"
                ? "bg-amber/10 text-amber"
                : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
            }`}
          >
            <LayoutGrid size={13} /> Liste
          </button>
          <button
            onClick={() => setView("graph")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs transition-colors ${
              view === "graph"
                ? "bg-amber/10 text-amber"
                : "text-[hsl(var(--muted))] hover:text-[#F0EDE4]"
            }`}
          >
            <Share2 size={13} /> Grafik
          </button>
        </div>
      </div>

      {/* Content */}
      {view === "graph" ? (
        <NotesGraph nodes={graphNodes} links={graphLinks} />
      ) : notes.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {notes.map((note, i) => (
            <NoteCard key={note.id} note={note} index={i} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-[hsl(var(--muted))]">
          <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
            Henüz not yok.
          </p>
        </div>
      )}
    </>
  );
}
