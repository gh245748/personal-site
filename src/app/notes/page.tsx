import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import NoteCard from "@/components/notes/NoteCard";

export const metadata: Metadata = { title: "Notlar" };
export const revalidate = 3600;

const types = [
  { key: "all",     label: "Tümü" },
  { key: "book",    label: "Kitaplar" },
  { key: "film",    label: "Filmler" },
  { key: "article", label: "Makaleler" },
  { key: "album",   label: "Albümler" },
];

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("notes")
    .select("*")
    .order("finished_at", { ascending: false });

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const { data: notes } = await query;

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <div className="mb-12">
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

        {/* Type tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-[hsl(var(--border))] pb-6">
          {types.map(({ key, label }) => (
            <a
              key={key}
              href={key === "all" ? "/notes" : `/notes?type=${key}`}
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                (key === "all" && !type) || type === key
                  ? "bg-amber/10 text-amber border border-amber/30"
                  : "text-[hsl(var(--muted))] hover:text-[#F0EDE4] border border-transparent hover:border-[hsl(var(--border))]"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {notes && notes.length > 0 ? (
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
      </main>
      <Footer />
    </div>
  );
}
