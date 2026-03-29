import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import AdminCalendarClient from "@/components/admin/AdminCalendarClient";

export const metadata: Metadata = { title: "Takvim Yönetimi" };

export default async function AdminCalendarPage() {
  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: true });

  return <AdminCalendarClient initialEvents={events ?? []} />;
}
