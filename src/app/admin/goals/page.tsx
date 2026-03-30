import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminGoalsClient from "@/components/admin/AdminGoalsClient";

export const metadata: Metadata = { title: "Hedef Yönetimi" };

const DEFAULT_CATEGORIES = [
  { key: "learning", label: "Öğrenme" },
  { key: "fitness",  label: "Fitness" },
  { key: "finance",  label: "Finans" },
  { key: "project",  label: "Projeler" },
];

export default async function AdminGoalsPage() {
  const supabase = await createClient();

  const [{ data: goals }, { data: categoryRows }] = await Promise.all([
    supabase.from("goals").select("*").order("created_at", { ascending: false }),
    supabase.from("goal_categories").select("key, label").order("sort_order", { ascending: true }),
  ]);

  const categories = categoryRows && categoryRows.length > 0
    ? categoryRows
    : DEFAULT_CATEGORIES;

  return <AdminGoalsClient initialGoals={goals ?? []} categories={categories} />;
}
