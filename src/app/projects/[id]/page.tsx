import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";
import Badge from "@/components/ui/Badge";
import Link from "next/link";
import Image from "next/image";
import { ExternalLink, GitBranch, ArrowLeft } from "lucide-react";

export const revalidate = 3600;

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("title, tagline").eq("id", id).single();
  if (!data) return { title: "Proje Bulunamadı" };
  return { title: data.title, description: data.tagline ?? undefined };
}

const statusLabel: Record<string, string> = {
  active: "Aktif", completed: "Tamamlandı", archived: "Arşiv",
};
const statusVariant: Record<string, "green" | "amber" | "default"> = {
  active: "green", completed: "amber", archived: "default",
};

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase.from("projects").select("*").eq("id", id).single();
  if (!project) notFound();

  return (
    <div className="min-h-screen bg-obsidian">
      <Navbar />
      <main className="pt-24 pb-20 max-w-4xl mx-auto px-6">
        {/* Back */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted))] hover:text-amber transition-colors mb-10"
        >
          <ArrowLeft size={14} /> Tüm Projeler
        </Link>

        {/* Cover */}
        {project.cover_url && (
          <div className="relative w-full h-64 rounded-sm overflow-hidden mb-10 border border-[hsl(var(--border))]">
            <Image src={project.cover_url} alt={project.title} fill className="object-cover" />
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant={statusVariant[project.status] ?? "default"}>
              {statusLabel[project.status] ?? project.status}
            </Badge>
            {project.featured && (
              <span
                className="text-xs text-amber"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                ★ Öne Çıkan
              </span>
            )}
          </div>

          <h1
            className="text-[#F0EDE4] mb-3"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 3.5rem)",
              letterSpacing: "-0.03em",
              lineHeight: 1.0,
            }}
          >
            {project.title}
          </h1>

          {project.tagline && (
            <p
              className="text-lg text-[hsl(var(--muted))] font-light italic"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.tagline}
            </p>
          )}
        </div>

        {/* Links */}
        {(project.url || project.github_url) && (
          <div className="flex flex-wrap gap-3 mb-10">
            {project.url && (
              <Link
                href={project.url}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber text-obsidian text-sm font-medium rounded-sm hover:bg-amber/90 transition-colors"
              >
                <ExternalLink size={14} /> Projeyi İncele
              </Link>
            )}
            {project.github_url && (
              <Link
                href={project.github_url}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-[hsl(var(--border))] text-[#F0EDE4] text-sm rounded-sm hover:border-amber hover:text-amber transition-colors"
              >
                <GitBranch size={14} /> GitHub
              </Link>
            )}
          </div>
        )}

        {/* Tech stack */}
        {project.stack?.length > 0 && (
          <div className="mb-10">
            <p
              className="text-xs tracking-[0.25em] text-[hsl(var(--muted))] uppercase mb-3"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Teknolojiler
            </p>
            <div className="flex flex-wrap gap-2">
              {project.stack.map((tech: string) => (
                <Badge key={tech} variant="default">{tech}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {project.description && (
          <div className="border-t border-[hsl(var(--border))] pt-8">
            <p
              className="text-xs tracking-[0.25em] text-[hsl(var(--muted))] uppercase mb-4"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Hakkında
            </p>
            <div
              className="text-[hsl(var(--muted))] leading-relaxed whitespace-pre-wrap"
              style={{ lineHeight: 1.8 }}
            >
              {project.description}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
