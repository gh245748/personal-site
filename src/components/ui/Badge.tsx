import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "amber" | "green" | "red" | "blue";
  className?: string;
}

export default function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-[hsl(var(--surface-2))] text-[hsl(var(--muted))] border border-[hsl(var(--border))]",
    amber:   "bg-amber/10 text-amber border border-amber/20",
    green:   "bg-green-900/20 text-green-400 border border-green-700/30",
    red:     "bg-red-900/20 text-red-400 border border-red-700/30",
    blue:    "bg-blue-900/20 text-blue-400 border border-blue-700/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-sm",
        "font-[family-name:var(--font-mono)]",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
