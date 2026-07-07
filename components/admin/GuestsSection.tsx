"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function GuestsSection({ eventId }: { eventId: string }) {
  const supabase = createClient();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
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

  const filtered = useMemo(() => {
    const q = normalize(search.trim());
    if (!q) return guests;
    return guests.filter(
      (g) =>
        normalize(g.nom_complet).includes(q) ||
        (g.telephone ?? "").includes(search.trim()) ||
        normalize(g.table_nom ?? "").includes(q) ||
        g.code.toUpperCase().includes(search.trim().toUpperCase()),
    );
  }, [guests, search]);

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

  async function handleDelete(guest: Guest) {
    if (
      !window.confirm(
        `Supprimer ${guest.nom_complet} ? Son billet ne fonctionnera plus et ses messages du livre d'or seront effacés.`,
      )
    )
      return;
    await supabase.from("guests").delete().eq("id", guest.id);
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
        description="Chaque invité reçoit un lien de billet unique et un code livre d'or."
        actions={
          <>
            <Button type="button" variant="ghost" onClick={downloadGuestTemplate} className="text-xs">
              Modèle .xlsx
            </Button>
            <label className="cursor-pointer rounded-lg border border-[#e3dccb] bg-white px-3.5 py-2 text-sm font-medium text-[#4a4234] transition hover:border-[#c8a862] hover:bg-[#faf7f0]">
              {importing ? "Import..." : "Importer"}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleImportFile}
                disabled={importing}
                className="hidden"
              />
            </label>
            <Button type="button" variant="secondary" onClick={handleExport} disabled={guests.length === 0}>
              Exporter
            </Button>
          </>
        }
      />

      {importMessage && (
        <div className="px-6 pt-4">
          <Banner variant={importMessage.type}>{importMessage.text}</Banner>
        </div>
      )}

      {/* Ajout rapide d'un invité */}
      <form onSubmit={handleAdd} className="border-b border-[#f0ebdd] bg-[#faf7f0]/60 px-6 py-5">
        <p className="mb-3 text-[11px] font-semibold tracking-[0.18em] text-[#24439c] uppercase">
          Ajouter un invité
        </p>
        {/* Pas de description sous les champs : toutes les colonnes gardent la même
            hauteur (label + input) et restent alignées avec le bouton. */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[200px] flex-1">
            <TextField
              label="Nom complet"
              placeholder="ex. Jean Kamga"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </div>
          <div className="min-w-[180px] flex-1">
            <TextField
              label="Téléphone (optionnel, pour WhatsApp)"
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="+237 6XX XXX XXX"
            />
          </div>
          <div className="min-w-[140px] flex-1">
            <TextField
              label="Table (optionnel)"
              value={table}
              onChange={(e) => setTable(e.target.value)}
              placeholder="ex. Amitié"
            />
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Ajout..." : "Ajouter"}
          </Button>
        </div>
        {error && (
          <div className="mt-3">
            <Banner variant="error">{error}</Banner>
          </div>
        )}
      </form>

      {/* Recherche */}
      {!loading && guests.length > 0 && (
        <div className="border-b border-[#f0ebdd] px-6 py-3">
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#b3a98f]"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par nom, téléphone, table ou code..."
              aria-label="Rechercher un invité"
              className="w-full rounded-lg border border-transparent bg-[#faf7f0] py-2 pl-9 pr-3 text-sm text-[#332e25] outline-none transition placeholder:text-[#b3a98f] focus:border-[#24439c] focus:bg-white"
            />
          </div>
        </div>
      )}

      <div className="divide-y divide-[#f0ebdd]">
        {loading && <p className="px-6 py-6 text-sm text-[#8a7f6a]">Chargement...</p>}

        {!loading && guests.length === 0 && (
          <div className="px-6 py-10 text-center">
            <p className="font-script text-3xl text-[#b3a98f]">La liste est vide</p>
            <p className="mt-2 text-sm text-[#8a7f6a]">
              Ajoute ton premier invité ci-dessus, ou importe la liste complète depuis Excel.
            </p>
          </div>
        )}

        {!loading && guests.length > 0 && filtered.length === 0 && (
          <p className="px-6 py-6 text-sm text-[#8a7f6a]">
            Aucun invité ne correspond à « {search} ».
          </p>
        )}

        {filtered.map((guest) => (
          <div
            key={guest.id}
            className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 transition hover:bg-[#faf7f0]/70"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#24439c] to-[#1a3277] text-xs font-semibold text-[#f6efe2] shadow-sm">
                {initials(guest.nom_complet)}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[#332e25]">{guest.nom_complet}</p>
                <p className="flex flex-wrap items-center gap-x-2 text-xs text-[#8a7f6a]">
                  <span>{guest.telephone ?? "Pas de téléphone"}</span>
                  <span aria-hidden className="text-[#e3dccb]">•</span>
                  <span title="Code livre d'or" className="font-semibold tracking-[0.15em] text-[#24439c]">
                    {guest.code}
                  </span>
                  {guest.table_nom && (
                    <>
                      <span aria-hidden className="text-[#e3dccb]">•</span>
                      <span className="text-[#a8862f]">Table {guest.table_nom}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopy(guest.token, guest.id)}
                className="rounded-lg border border-[#e3dccb] bg-white px-2.5 py-1.5 text-xs font-medium text-[#4a4234] transition hover:border-[#c8a862] hover:bg-[#faf7f0]"
              >
                {copiedId === guest.id ? "✓ Copié !" : "Copier le lien"}
              </button>
              {guest.telephone && (
                <a
                  href={whatsappUrl(guest.telephone, billetUrl(guest.token))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                >
                  WhatsApp
                </a>
              )}
              <button
                onClick={() => handleDelete(guest)}
                aria-label={`Supprimer ${guest.nom_complet}`}
                className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#b3a98f] transition hover:bg-red-50 hover:text-red-600"
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
