"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { generateGuestToken } from "@/lib/token";
import { TextField } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { downloadGuestTemplate, downloadGuestsExport, parseGuestFile } from "@/lib/guestExcel";
import type { Tables } from "@/lib/supabase/database.types";

type Guest = Tables<"guests">;

function billetUrl(token: string) {
  if (typeof window === "undefined") return `/billet/${token}`;
  return `${window.location.origin}/billet/${token}`;
}

function whatsappUrl(telephone: string, link: string) {
  const digits = telephone.replace(/[^\d]/g, "");
  const text = encodeURIComponent(
    `Vous êtes cordialement invité(e) au mariage de Diane & Martial. Voici votre billet personnel : ${link}`,
  );
  return `https://wa.me/${digits}?text=${text}`;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function GuestsSection({ eventId }: { eventId: string }) {
  const supabase = createClient();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [nom, setNom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [table, setTable] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function loadGuests() {
    const { data } = await supabase
      .from("guests")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });
    setGuests(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial des invités
    loadGuests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!nom.trim()) {
      setError("Le nom complet est requis.");
      return;
    }

    setSaving(true);
    const token = generateGuestToken();
    const { error } = await supabase.from("guests").insert({
      event_id: eventId,
      nom_complet: nom.trim(),
      telephone: telephone.trim() || null,
      table_nom: table.trim() || null,
      token,
    });
    setSaving(false);

    if (error) {
      setError("Échec de l'ajout de l'invité.");
      return;
    }

    setNom("");
    setTelephone("");
    setTable("");
    loadGuests();
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage(null);

    try {
      const parsed = await parseGuestFile(file);

      if (parsed.length === 0) {
        setImportMessage({
          type: "error",
          text: "Aucune ligne valide trouvée. Vérifie que la colonne « Nom complet » est bien remplie.",
        });
        return;
      }

      const rows = parsed.map((guest) => ({
        event_id: eventId,
        nom_complet: guest.nom_complet,
        telephone: guest.telephone,
        table_nom: guest.table_nom,
        token: generateGuestToken(),
      }));

      const { error } = await supabase.from("guests").insert(rows);

      if (error) {
        setImportMessage({ type: "error", text: "Échec de l'import : " + error.message });
        return;
      }

      setImportMessage({ type: "success", text: `${rows.length} invité(s) importé(s) avec succès.` });
      loadGuests();
    } catch {
      setImportMessage({
        type: "error",
        text: "Impossible de lire ce fichier. Utilise le modèle fourni (.xlsx).",
      });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleExport() {
    downloadGuestsExport(guests, billetUrl);
  }

  async function handleDelete(id: string) {
    await supabase.from("guests").delete().eq("id", id);
    loadGuests();
  }

  async function handleCopy(token: string, id: string) {
    await navigator.clipboard.writeText(billetUrl(token));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <Card>
      <CardHeader
        title={`Invités${!loading ? ` (${guests.length})` : ""}`}
        description="Génère un lien de billet unique et sécurisé pour chaque invité."
      />

      <div className="flex flex-wrap items-center gap-2 border-b border-neutral-100 px-6 py-4">
        <Button type="button" variant="secondary" onClick={downloadGuestTemplate}>
          Télécharger le modèle
        </Button>
        <label className="cursor-pointer rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50">
          {importing ? "Import en cours..." : "Importer un fichier Excel"}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleImportFile}
            disabled={importing}
            className="hidden"
          />
        </label>
        <Button
          type="button"
          variant="secondary"
          onClick={handleExport}
          disabled={guests.length === 0}
          className="ml-auto"
        >
          Exporter la liste (.xlsx)
        </Button>
      </div>

      {importMessage && (
        <div className="px-6 pt-4">
          <Banner variant={importMessage.type}>{importMessage.text}</Banner>
        </div>
      )}

      <form
        onSubmit={handleAdd}
        className="flex flex-wrap items-end gap-3 border-b border-neutral-100 px-6 py-5"
      >
        <div className="min-w-[200px] flex-1">
          <TextField label="Nom complet" value={nom} onChange={(e) => setNom(e.target.value)} />
        </div>
        <div className="min-w-[180px] flex-1">
          <TextField
            label="Téléphone"
            description="Optionnel, pour WhatsApp"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="+237 6XX XXX XXX"
          />
        </div>
        <div className="min-w-[140px] flex-1">
          <TextField
            label="Table"
            description="Optionnel"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            placeholder="ex. Amitié"
          />
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Ajout..." : "Ajouter"}
        </Button>
      </form>

      {error && (
        <div className="px-6 pt-4">
          <Banner variant="error">{error}</Banner>
        </div>
      )}

      <div className="divide-y divide-neutral-100">
        {loading && <p className="px-6 py-6 text-sm text-neutral-500">Chargement...</p>}

        {!loading && guests.length === 0 && (
          <p className="px-6 py-6 text-sm text-neutral-500">
            Aucun invité pour le moment — ajoute le premier ci-dessus.
          </p>
        )}

        {guests.map((guest) => (
          <div
            key={guest.id}
            className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 transition hover:bg-neutral-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-900 text-xs font-medium text-white">
                {initials(guest.nom_complet)}
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-900">{guest.nom_complet}</p>
                <p className="text-xs text-neutral-500">{guest.telephone ?? "Pas de téléphone"}</p>
              </div>
              {guest.table_nom && (
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                  Table {guest.table_nom}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(guest.token, guest.id)}
                className="rounded-md border border-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-600 transition hover:bg-neutral-100"
              >
                {copiedId === guest.id ? "Copié !" : "Copier le lien"}
              </button>
              {guest.telephone && (
                <a
                  href={whatsappUrl(guest.telephone, billetUrl(guest.token))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                >
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => handleDelete(guest.id)}
                className="rounded-md px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-red-50 hover:text-red-600"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
