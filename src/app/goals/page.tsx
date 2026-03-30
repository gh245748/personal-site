import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import GoalCard from "@/components/goals/GoalCard";

export const metadata: Metadata = { title: "Hedefler" };
export const revalidate = 3600;

const DEFAULT_CATEGORIES = [
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

  // Fetch dynamic categories, fallback to defaults if table doesn't exist
  const { data: categoryRows } = await supabase
    .from("goal_categories")
    .select("key, label")
    .order("sort_order", { ascending: true });

  const categories = categoryRows && categoryRows.length > 0
    ? [{ key: "all", label: "Tümü" }, ...categoryRows]
    : [{ key: "all", label: "Tümü" }, ...DEFAULT_CATEGORIES];

  const { data: allGoals } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });

  const goals = allGoals ?? [];

  // If a category is selected, filter; otherwise group by category
  const filtered = cat && cat !== "all"
    ? goals.filter((g) => g.category === cat)
    : null;

  // Group goals by category (used when no filter)
  const grouped = categories
    .filter((c) => c.key !== "all")
    .map((c) => ({
      key: c.key,
      label: c.label,
      goals: goals.filter((g) => g.category === c.key),
    }))
    .filter((g) => g.goals.length > 0);

  const activeLabel = categories.find((c) => c.key === (cat ?? "all"))?.label ?? "Tümü";

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
              <span
                className="ml-1.5 text-xs opacity-60"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ({goals.filter((g) => key === "all" ? true : g.category === key).length})
              </span>
            </a>
          ))}
        </div>

        {/* Content */}
        {filtered ? (
          // Filtered view — flat grid
          filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {filtered.map((goal, i) => (
                <GoalCard key={goal.id} goal={goal} index={i} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[hsl(var(--muted))]">
              <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
                {activeLabel} kategorisinde hedef yok.
              </p>
            </div>
          )
        ) : (
          // Grouped view — all categories
          grouped.length > 0 ? (
            <div className="flex flex-col gap-14">
              {grouped.map((group) => (
                <section key={group.key}>
                  <div className="flex items-center gap-3 mb-6">
                    <p
                      className="text-xs tracking-[0.25em] text-amber uppercase"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {group.label}
                    </p>
                    <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                    <span
                      className="text-xs text-[hsl(var(--muted))]"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {group.goals.length} hedef
                    </span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {group.goals.map((goal, i) => (
                      <GoalCard key={goal.id} goal={goal} index={i} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-[hsl(var(--muted))]">
              <p className="text-lg" style={{ fontFamily: "var(--font-display)" }}>
                Henüz hedef yok.
              </p>
            </div>
          )
        )}
      </main>
      <Footer />
    </div>
  );
}
