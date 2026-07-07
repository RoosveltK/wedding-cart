"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Banner } from "@/components/ui/Banner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f4ec] px-4">
      <div className="w-full max-w-sm">
        <form
          onSubmit={handleSubmit}
          className="space-y-5 overflow-hidden rounded-2xl border border-[#e8e2d2] bg-white p-8 shadow-[0_10px_30px_rgba(51,46,37,0.08)]"
        >
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#24439c] font-script text-2xl leading-none text-[#f6efe2] shadow-[0_0_0_3px_#ffffff,0_0_0_4.5px_#e0af2e]">
              D&amp;M
            </div>
            <h1 className="mt-4 font-script text-4xl text-[#332e25]">Diane &amp; Martial</h1>
            <p className="mt-1 text-[11px] tracking-[0.22em] text-[#8a7f6a] uppercase">
              Espace des mariés
            </p>
          </div>

          <TextField
            label="Email"
            id="email"
            type="email"
            required
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Mot de passe"
            id="password"
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <Banner variant="error">{error}</Banner>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Connexion..." : "Se connecter"}
          </Button>
        </form>

        <p className="mt-6 text-center text-[11px] tracking-[0.2em] text-[#b3a98f] uppercase">
          25 juillet 2026 — Yaoundé
        </p>
      </div>
    </main>
  );
}
