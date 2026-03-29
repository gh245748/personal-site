"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      toast.error("Email veya şifre hatalı.");
    } else {
      toast.success("Hoşgeldin!");
      router.push("/admin");
      router.refresh();
    }

    setLoading(false);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      animate={shake ? { x: [0, -8, 8, -8, 8, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-4"
    >
      <div>
        <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-[#F0EDE4] text-sm placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-amber transition-colors"
          placeholder="admin@example.com"
        />
      </div>

      <div>
        <label className="block text-xs text-[hsl(var(--muted))] mb-2 tracking-widest uppercase" style={{ fontFamily: "var(--font-mono)" }}>
          Şifre
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 pr-11 bg-[hsl(var(--surface-2))] border border-[hsl(var(--border))] rounded-sm text-[#F0EDE4] text-sm placeholder:text-[hsl(var(--muted))] focus:outline-none focus:border-amber transition-colors"
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted))] hover:text-[#F0EDE4] transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full mt-2">
        Giriş Yap
      </Button>
    </motion.form>
  );
}
