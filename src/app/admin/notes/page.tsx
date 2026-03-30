import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminNotesClient from "@/components/admin/AdminNotesClient";

export const metadata: Metadata = { title: "Not Yönetimi" };

export default async function AdminNotesPage() {
  const supabase = await createClient();

  const [{ data: notes }, { data: connections }] = await Promise.all([
    supabase.from("notes").select("*").order("created_at", { ascending: false }),
    supabase.from("note_connections").select("*").order("created_at", { ascending: false }),
  ]);

  return (
    <AdminNotesClient
      initialNotes={notes ?? []}
      initialConnections={connections ?? []}
    />
  );
}
