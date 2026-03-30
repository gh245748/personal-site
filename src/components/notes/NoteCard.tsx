"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Badge from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils";

interface Note {
  id: string;
  title: string;
  author?: string | null;
  type: string;
  cover_url?: string | null;
  rating?: number | null;
  content?: string | null;
  tags: string[];
  finished_at?: string | null;
}

const typeLabel: Record<string, string> = {
  book: "Kitap", film: "Film", article: "Makale", music: "Müzik",
};

export default function NoteCard({ note, index = 0 }: { note: Note; index?: number }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.05 }}
        className="group cursor-pointer border border-[hsl(var(--border))] rounded-sm bg-[hsl(var(--surface-2))] overflow-hidden hover:border-amber/40 transition-all duration-300"
        onClick={() => setOpen(true)}
      >
        {/* Cover */}
        <div className="h-44 bg-[hsl(var(--surface))] relative overflow-hidden">
          {note.cover_url ? (
            <Image
              src={note.cover_url}
              alt={note.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #1A1A1A, #0A0A0A)" }}
            >
              <span
                className="text-3xl text-[hsl(var(--border))]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {note.title[0]}
              </span>
            </div>
          )}
          <div className="absolute top-2 right-2">
            <Badge variant="amber">{typeLabel[note.type] ?? note.type}</Badge>
          </div>
        </div>

        {/* Body */}
        <div className="p-4">
          <h3
            className="text-[#F0EDE4] text-base leading-tight mb-1 line-clamp-2"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {note.title}
          </h3>
          {note.author && (
            <p className="text-xs text-[hsl(var(--muted))] mb-2">{note.author}</p>
          )}

          {/* Stars */}
          {note.rating && (
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={11}
                  className={i < note.rating! ? "text-amber fill-amber" : "text-[hsl(var(--border))]"}
                />
              ))}
            </div>
          )}

          {/* Content preview */}
          {note.content && (
            <p className="text-xs text-[hsl(var(--muted))] mt-2 line-clamp-2 leading-relaxed">
              {note.content.replace(/[#*`]/g, "").slice(0, 100)}…
            </p>
          )}
        </div>
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <Modal open={open} onClose={() => setOpen(false)} title={note.title} size="lg">
            <div className="flex gap-5 mb-6">
              {note.cover_url && (
                <div className="w-24 h-36 relative shrink-0 rounded-sm overflow-hidden">
                  <Image
                    src={note.cover_url}
                    alt={note.title}
                    fill
                    className="object-cover rounded-sm"
                  />
                </div>
              )}
              <div>
                {note.author && (
                  <p className="text-sm text-[hsl(var(--muted))] mb-1">{note.author}</p>
                )}
                <Badge variant="amber" className="mb-3">
                  {typeLabel[note.type] ?? note.type}
                </Badge>
                {note.rating && (
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < note.rating! ? "text-amber fill-amber" : "text-[hsl(var(--border))]"}
                      />
                    ))}
                  </div>
                )}
                {note.finished_at && (
                  <p className="text-xs text-[hsl(var(--muted))]" style={{ fontFamily: "var(--font-mono)" }}>
                    {formatDateShort(note.finished_at)}
                  </p>
                )}
                {note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {note.tags.map((t) => (
                      <Badge key={t} variant="default">{t}</Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {note.content ? (
              <div className="prose-custom text-sm border-t border-[hsl(var(--border))] pt-4">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{note.content}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-sm text-[hsl(var(--muted))] border-t border-[hsl(var(--border))] pt-4">
                Henüz not girilmemiş.
              </p>
            )}
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
}
