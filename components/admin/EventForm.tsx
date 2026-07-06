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
        <p className="text-sm text-neutral-500">Chargement...</p>
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
      <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
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

        <TextAreaField
          label="Description"
          rows={3}
          value={event.description ?? ""}
          onChange={(e) => setEvent({ ...event, description: e.target.value })}
        />

        <div className="space-y-1.5">
          <span className="block text-sm font-medium text-neutral-800">Vidéo des mariés</span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="cursor-pointer rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
              Choisir un fichier vidéo
              <input type="file" accept="video/mp4" onChange={handleVideoChange} className="hidden" />
            </label>
            {uploading && <span className="text-xs text-neutral-500">Envoi en cours...</span>}
            {videoFileName && !uploading && (
              <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs text-neutral-600">
                {videoFileName}
              </span>
            )}
          </div>
        </div>

        {message && <Banner variant={message.type}>{message.text}</Banner>}

        <div className="flex justify-end border-t border-neutral-100 pt-5">
          <Button type="submit" disabled={saving || uploading}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
