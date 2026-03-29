import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminGoalsClient from "@/components/admin/AdminGoalsClient";

export const metadata: Metadata = { title: "Hedef Yönetimi" };

export default async function AdminGoalsPage() {
  const supabase = await createClient();
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminGoalsClient initialGoals={goals ?? []} />;
}
