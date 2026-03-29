import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminProjectsClient from "@/components/admin/AdminProjectsClient";

export const metadata: Metadata = { title: "Proje Yönetimi" };

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return <AdminProjectsClient initialProjects={projects ?? []} />;
}
