"use client";

import { motion } from "framer-motion";
import { ExternalLink, GitBranch, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Badge from "@/components/ui/Badge";
import Link from "next/link";

interface Project {
  id: string;
  title: string;
  tagline?: string | null;
  description?: string | null;
  stack: string[];
  url?: string | null;
  github_url?: string | null;
  cover_url?: string | null;
  status: string;
  featured: boolean;
}

const statusVariant: Record<string, "green" | "amber" | "default"> = {
  active:    "green",
  completed: "amber",
  archived:  "default",
};

const statusLabel: Record<string, string> = {
  active:    "Aktif",
  completed: "Tamamlandı",
  archived:  "Arşiv",
};

export default function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className="group relative border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] overflow-hidden"
    >
      {/* Cover */}
      <div className="h-36 bg-gradient-to-br from-[hsl(var(--surface))] to-obsidian relative overflow-hidden">
        {project.cover_url ? (
          <Image
            src={project.cover_url}
            alt={project.title}
            fill
            className="object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-300"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at 30% 60%, #D4872A18, transparent 60%)`,
            }}
          />
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-obsidian/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          {project.url && (
            <Link
              href={project.url}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber text-obsidian text-xs font-medium rounded-sm"
            >
              İncele <ArrowUpRight size={12} />
            </Link>
          )}
          {project.github_url && (
            <Link
              href={project.github_url}
              target="_blank"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-[#F0EDE4]/30 text-[#F0EDE4] text-xs rounded-sm"
            >
              <GitBranch size={12} /> Kod
            </Link>
          )}
        </div>

        {/* Featured star */}
        {project.featured && (
          <div className="absolute top-3 right-3 w-2 h-2 bg-amber rounded-full" />
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/projects/${project.id}`}>
            <h3
              className="text-[#F0EDE4] text-lg leading-tight hover:text-amber transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {project.title}
            </h3>
          </Link>
          <Badge variant={statusVariant[project.status] ?? "default"}>
            {statusLabel[project.status] ?? project.status}
          </Badge>
        </div>

        {project.tagline && (
          <p className="text-sm text-[hsl(var(--muted))] mb-4 leading-relaxed">
            {project.tagline}
          </p>
        )}

        {/* Stack */}
        {project.stack.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <Badge key={tech} variant="default">{tech}</Badge>
            ))}
          </div>
        )}

        {/* Links row */}
        {(project.url || project.github_url) && (
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-[hsl(var(--border))]">
            {project.url && (
              <Link
                href={project.url}
                target="_blank"
                className="flex items-center gap-1 text-xs text-[hsl(var(--muted))] hover:text-amber transition-colors"
              >
                <ExternalLink size={11} /> Website
              </Link>
            )}
            {project.github_url && (
              <Link
                href={project.github_url}
                target="_blank"
                className="flex items-center gap-1 text-xs text-[hsl(var(--muted))] hover:text-amber transition-colors"
              >
                <GitBranch size={11} /> GitHub
              </Link>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
