import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import NotesPageClient from "@/components/notes/NotesPageClient";

export const metadata: Metadata = { title: "Notlar" };
export const revalidate = 3600;

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

  const [{ data: notes }, { data: connections }] = await Promise.all([
    query,
    supabase.from("note_connections").select("*"),
  ]);

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <NotesPageClient
          notes={notes ?? []}
          connections={connections ?? []}
          activeType={type ?? "all"}
        />
      </main>
      <Footer />
    </div>
  );
}
