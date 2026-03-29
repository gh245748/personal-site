import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = { title: "Admin Girişi" };

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <span
            className="text-[#F0EDE4]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "3rem",
              letterSpacing: "-0.03em",
            }}
          >
            BK
          </span>
          <p className="text-xs text-[hsl(var(--muted))] mt-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
            Admin Panel
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
