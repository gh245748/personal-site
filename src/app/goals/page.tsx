import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import GoalCard from "@/components/goals/GoalCard";

export const metadata: Metadata = { title: "Hedefler" };
export const revalidate = 3600;

const categories = [
  { key: "all",      label: "Tümü" },
  { key: "learning", label: "Öğrenme" },
  { key: "fitness",  label: "Fitness" },
  { key: "finance",  label: "Finans" },
  { key: "project",  label: "Projeler" },
];

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  if (cat && cat !== "all") {
    query = query.eq("category", cat);
  }

  const { data: goals } = await query;

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <p
            className="text-xs tracking-[0.3em] text-amber uppercase mb-3"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Takip
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
            Hedefler
          </h1>
        </div>

        {/* Category tabs */}
        <div className="flex flex-wrap gap-2 mb-10 border-b border-[hsl(var(--border))] pb-6">
          {categories.map(({ key, label }) => (
            <a
              key={key}
              href={key === "all" ? "/goals" : `/goals?cat=${key}`}
              className={`px-4 py-2 text-sm rounded-sm transition-colors ${
                (key === "all" && !cat) || cat === key
                  ? "bg-amber/10 text-amber border border-amber/30"
                  : "text-[hsl(var(--muted))] hover:text-[#F0EDE4] border border-transparent hover:border-[hsl(var(--border))]"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        {/* Goals grid */}
        {goals && goals.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {goals.map((goal, i) => (
              <GoalCard key={goal.id} goal={goal} index={i} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-[hsl(var(--muted))]">
            <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
              Bu kategoride hedef yok.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
