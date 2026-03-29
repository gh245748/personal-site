import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CalendarView from "@/components/calendar/CalendarView";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Takvim" };
export const revalidate = 300;

export default async function CalendarPage() {
  const supabase = await createClient();

  const [eventsResult, goalsResult] = await Promise.all([
    supabase
      .from("events")
      .select("id, title, date, type, description, time")
      .order("date", { ascending: true }),
    supabase
      .from("goals")
      .select("id, title, target_date, progress")
      .eq("status", "active")
      .not("target_date", "is", null),
  ]);

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs tracking-[0.3em] text-amber uppercase mb-3" style={{ fontFamily: "var(--font-mono)" }}>
            Planlama
          </p>
          <h1 className="text-[#F0EDE4]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4.5rem)", letterSpacing: "-0.03em", lineHeight: 0.95 }}>
            Takvim
          </h1>
        </div>

        <CalendarView
          events={eventsResult.data ?? []}
          goals={goalsResult.data ?? []}
        />
      </main>
      <Footer />
    </div>
  );
}
