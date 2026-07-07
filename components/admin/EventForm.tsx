"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { TextField, TextAreaField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import type { Tables } from "@/lib/supabase/database.types";

type EventRow = Tables<"event">;

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** Petit intitulé de sous-section du formulaire. */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.18em] text-[#24439c] uppercase">
      {children}
      <span aria-hidden className="h-px flex-1 bg-[#f0ebdd]" />
    </p>
  );
}

export function EventForm() {
  const supabase = createClient();
  const [event, setEvent] = useState<EventRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("event").select("*").limit(1).maybeSingle();
      setEvent(data);
      setLoading(false);
    }
    load();
  }, [supabase]);

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !event) return;

    setUploading(true);
    setMessage(null);

    const path = `videos/${event.id}-${Date.now()}.mp4`;
    const { error: uploadError } = await supabase.storage
      .from("event-media")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      setMessage({ type: "error", text: "Échec de l'upload de la vidéo." });
      setUploading(false);
      return;
    }

    const { data: publicUrl } = supabase.storage.from("event-media").getPublicUrl(path);
    setEvent({ ...event, video_url: publicUrl.publicUrl });
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!event) return;

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from("event")
      .update({
        titre: event.titre,
        nom_marie: event.nom_marie,
        nom_mariee: event.nom_mariee,
        date_debut: event.date_debut,
        date_fin: event.date_fin,
        lieu: event.lieu,
        description: event.description,
        video_url: event.video_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", event.id);

    setSaving(false);
    setMessage(
      error
        ? { type: "error", text: "Échec de l'enregistrement." }
        : { type: "success", text: "Enregistré avec succès." },
    );
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-[#8a7f6a]">Chargement...</p>
      </Card>
    );
  }

  if (!event) {
    return (
      <Card className="p-6">
        <Banner variant="error">Aucun événement trouvé.</Banner>
      </Card>
    );
  }

  const videoFileName = event.video_url ? event.video_url.split("/").pop() : null;

  return (
    <Card>
      <CardHeader
        title="Événement"
        description="Ces informations sont utilisées sur chaque billet et pour l'ajout à Google Agenda."
      />
      <form onSubmit={handleSubmit} className="space-y-7 px-6 py-6">
        {/* ——— Les mariés ——— */}
        <div className="space-y-4">
          <SectionLabel>Les mariés</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Prénom de la mariée"
              value={event.nom_mariee ?? ""}
              onChange={(e) => setEvent({ ...event, nom_mariee: e.target.value })}
            />
            <TextField
              label="Prénom du marié"
              value={event.nom_marie ?? ""}
              onChange={(e) => setEvent({ ...event, nom_marie: e.target.value })}
            />
          </div>
          <TextField
            label="Titre"
            description="Utilisé comme intitulé de l'événement dans Google Agenda."
            value={event.titre ?? ""}
            onChange={(e) => setEvent({ ...event, titre: e.target.value })}
          />
        </div>

        {/* ——— Date & lieu ——— */}
        <div className="space-y-4">
          <SectionLabel>Date &amp; lieu</SectionLabel>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <TextField
              label="Date et heure de début"
              type="datetime-local"
              value={toLocalInputValue(event.date_debut)}
              onChange={(e) =>
                setEvent({
                  ...event,
                  date_debut: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
            <TextField
              label="Date et heure de fin"
              description="Optionnel"
              type="datetime-local"
              value={toLocalInputValue(event.date_fin)}
              onChange={(e) =>
                setEvent({
                  ...event,
                  date_fin: e.target.value ? new Date(e.target.value).toISOString() : null,
                })
              }
            />
          </div>
          <TextField
            label="Lieu"
            value={event.lieu ?? ""}
            onChange={(e) => setEvent({ ...event, lieu: e.target.value })}
          />
        </div>

        {/* ——— Message des mariés ——— */}
        <div className="space-y-4">
          <SectionLabel>Message des mariés</SectionLabel>
          <TextAreaField
            label="Description"
            description="Citation affichée sur le billet, sous la présentation des mariés."
            rows={3}
            value={event.description ?? ""}
            onChange={(e) => setEvent({ ...event, description: e.target.value })}
          />

          <div className="rounded-xl border border-dashed border-[#e3dccb] bg-[#faf7f0]/60 px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#24439c]/10 text-[#24439c]">
                  <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="m22 8-6 4 6 4V8Z" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="2" y="6" width="14" height="12" rx="2" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-medium text-[#4a4234]">Vidéo des mariés</p>
                  <p className="text-xs text-[#8a7f6a]">
                    {uploading
                      ? "Envoi en cours..."
                      : videoFileName
                        ? videoFileName
                        : "Aucune vidéo — le billet n'affichera pas la section « message »."}
                  </p>
                </div>
              </div>
              <label className="cursor-pointer rounded-lg border border-[#e3dccb] bg-white px-3.5 py-2 text-sm font-medium text-[#4a4234] transition hover:border-[#c8a862] hover:bg-[#faf7f0]">
                {videoFileName ? "Remplacer" : "Choisir un fichier"}
                <input type="file" accept="video/mp4" onChange={handleVideoChange} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        {message && <Banner variant={message.type}>{message.text}</Banner>}

        <div className="flex justify-end border-t border-[#f0ebdd] pt-5">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
