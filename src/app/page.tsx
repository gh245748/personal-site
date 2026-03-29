import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import LatestPosts from "@/components/home/LatestPosts";
import FeaturedGoals from "@/components/home/FeaturedGoals";
import LearningStats from "@/components/home/LearningStats";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600;

export default async function HomePage() {
  const supabase = await createClient();

  const [postsResult, goalsResult, learningResult] = await Promise.all([
    supabase
      .from("blog_posts")
      .select("id, slug, title, subtitle, tags, reading_time, published_at")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("goals")
      .select("id, title, category, progress")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("learning_items")
      .select("repetitions, due_date"),
  ]);

  const posts = postsResult.data ?? [];
  const goals = goalsResult.data ?? [];
  const allCards = learningResult.data ?? [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueToday = allCards.filter(
    (c) => c.due_date && new Date(c.due_date) <= today
  ).length;

  const mastered = allCards.filter((c) => c.repetitions >= 6).length;

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main>
        <HeroSection />

        {/* Stats bar */}
        <div className="border-y border-[hsl(var(--border))] bg-[hsl(var(--surface-2))]">
          <div
            className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-6 text-xs text-[hsl(var(--muted))]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>{posts.length} yazı</span>
            <span className="text-[hsl(var(--border))]">/</span>
            <span>{goals.length} aktif hedef</span>
            <span className="text-[hsl(var(--border))]">/</span>
            <span>{allCards.length} öğrenme kartı</span>
            <span className="text-[hsl(var(--border))]">/</span>
            <span>{dueToday} bugün bekleyen</span>
          </div>
        </div>

        <LatestPosts posts={posts} />
        <FeaturedGoals goals={goals} />
        <LearningStats
          totalCards={allCards.length}
          dueToday={dueToday}
          masteredCards={mastered}
        />
      </main>
      <Footer />
    </div>
  );
}
