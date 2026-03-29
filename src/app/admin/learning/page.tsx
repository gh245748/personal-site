import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminLearningClient from "@/components/admin/AdminLearningClient";

export const metadata: Metadata = { title: "Öğrenme Yönetimi" };

export default async function AdminLearningPage() {
  const supabase = await createClient();
  const { data: cards } = await supabase
    .from("learning_items")
    .select("*")
    .order("due_date", { ascending: true });

  return <AdminLearningClient initialCards={cards ?? []} />;
}
