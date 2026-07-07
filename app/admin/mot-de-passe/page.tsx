"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";

export default function ChangePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 8) {
      setMessage({ type: "error", text: "Le mot de passe doit faire au moins 8 caractères." });
      return;
    }
    if (password !== confirm) {
      setMessage({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (error) {
      setMessage({ type: "error", text: "Impossible de mettre à jour le mot de passe." });
      return;
    }

    setPassword("");
    setConfirm("");
    setMessage({ type: "success", text: "Mot de passe mis à jour." });
  }

  return (
    <div className="max-w-sm">
      <Card>
        <CardHeader
          title="Changer le mot de passe"
          description="Au moins 8 caractères. La modification est immédiate."
        />
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <TextField
            label="Nouveau mot de passe"
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            label="Confirmer le mot de passe"
            id="confirm"
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {message && <Banner variant={message.type}>{message.text}</Banner>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "..." : "Mettre à jour"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
