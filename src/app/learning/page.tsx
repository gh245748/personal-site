import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import LearningPublicView from "@/components/learning/LearningPublicView";

export const metadata: Metadata = { title: "Öğrenme" };
export const revalidate = 300;

export default async function LearningPage() {
  const supabase = await createClient();

  const { data: cards } = await supabase
    .from("learning_items")
    .select("id, front, topic, category, repetitions, due_date, times_correct, times_wrong, created_at")
    .order("due_date", { ascending: true });

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.3em] text-amber uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            SM-2 Algoritması
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
            Öğrenme Takvimi
          </h1>
        </div>

        <LearningPublicView cards={cards ?? []} />
      </main>
      <Footer />
    </div>
  );
}
