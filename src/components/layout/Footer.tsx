import Link from "next/link";
import { Globe, X, ExternalLink } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[hsl(var(--border))] mt-24">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[hsl(var(--muted))] font-[family-name:var(--font-mono)]">
          © {year} Batuhan M.
        </p>

        <div className="flex items-center gap-5">
          <Link
            href="https://github.com/batuhankilic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--muted))] hover:text-amber transition-colors"
            aria-label="GitHub"
          >
            <Globe size={16} />
          </Link>
          <Link
            href="https://x.com/batuhankilic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--muted))] hover:text-amber transition-colors"
            aria-label="X (Twitter)"
          >
            <X size={16} />
          </Link>
          <Link
            href="https://linkedin.com/in/batuhankilic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[hsl(var(--muted))] hover:text-amber transition-colors"
            aria-label="LinkedIn"
          >
            <ExternalLink size={16} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
