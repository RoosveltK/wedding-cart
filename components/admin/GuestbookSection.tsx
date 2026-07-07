"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader } from "@/components/ui/Card";
import { Banner } from "@/components/ui/Banner";
import { GUESTBOOK_BUCKET, guestbookPhotoUrl } from "@/lib/guestbook";

type EntryRow = {
  id: string;
  message: string | null;
  created_at: string;
  guests: { nom_complet: string; code: string } | null;
  guestbook_photos: { id: string; path: string; size_bytes: number }[];
};

function formatMo(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function formatDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** Tuile de statistique : gros chiffre en encre neutre, libellé discret, icône porteuse d'identité. */
function StatTile({
  label,
  value,
  icon,
  children,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e2d2] bg-white px-5 py-4 shadow-[0_1px_3px_rgba(51,46,37,0.06)]">
      <div className="flex items-center gap-2 text-[#8a7f6a]">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#24439c]/8 text-[#24439c]">
          {icon}
        </span>
        <span className="text-xs font-medium tracking-[0.08em] uppercase">{label}</span>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tabular-nums text-[#332e25]">{value}</p>
      {children}
    </div>
  );
}

export function GuestbookSection({ storageLimit }: { storageLimit: number }) {
  const supabase = createClient();
  const [entries, setEntries] = useState<EntryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [storageUsed, setStorageUsed] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [{ data: rows }, { data: usage }] = await Promise.all([
      supabase
        .from("guestbook_entries")
        .select("id, message, created_at, guests(nom_complet, code), guestbook_photos(id, path, size_bytes)")
        .order("created_at", { ascending: false }),
      supabase.rpc("get_storage_usage"),
    ]);
    setEntries(rows ?? []);
    setStorageUsed(usage ?? null);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- chargement initial du livre d'or
    load();
  }, [load]);

  async function handleDeleteEntry(entry: EntryRow) {
    if (!window.confirm(`Supprimer le message de ${entry.guests?.nom_complet ?? "cet invité"} ?`)) return;
    setError(null);

    if (entry.guestbook_photos.length > 0) {
      const { error: storageError } = await supabase.storage
        .from(GUESTBOOK_BUCKET)
        .remove(entry.guestbook_photos.map((p) => p.path));
      if (storageError) {
        setError("Échec de la suppression des photos du stockage.");
        return;
      }
    }

    const { error: dbError } = await supabase.from("guestbook_entries").delete().eq("id", entry.id);
    if (dbError) {
      setError("Échec de la suppression du message.");
      return;
    }
    load();
  }

  async function handleDeletePhoto(photo: EntryRow["guestbook_photos"][number]) {
    if (!window.confirm("Supprimer cette photo ?")) return;
    setError(null);

    const { error: storageError } = await supabase.storage.from(GUESTBOOK_BUCKET).remove([photo.path]);
    if (storageError) {
      setError("Échec de la suppression de la photo du stockage.");
      return;
    }
    const { error: dbError } = await supabase.from("guestbook_photos").delete().eq("id", photo.id);
    if (dbError) {
      setError("Échec de la suppression de la photo.");
      return;
    }
    load();
  }

  const usagePct = storageUsed !== null ? Math.min(100, (storageUsed / storageLimit) * 100) : null;
  const sature = storageUsed !== null && storageUsed >= storageLimit;
  const alerte = !sature && usagePct !== null && usagePct > 75;
  const totalPhotos = entries.reduce((n, e) => n + e.guestbook_photos.length, 0);

  return (
    <div className="space-y-6">
      {/* ——— Statistiques ——— */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          label="Messages"
          value={loading ? "—" : String(entries.length)}
          icon={
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path
                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        />
        <StatTile
          label="Photos"
          value={loading ? "—" : String(totalPhotos)}
          icon={
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" strokeLinecap="round" />
            </svg>
          }
        />
        <StatTile
          label="Stockage"
          value={storageUsed === null ? "—" : `${formatMo(storageUsed)}`}
          icon={
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12H3M21 12a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2M21 12l-2.4-7.2A2 2 0 0 0 16.7 3H7.3a2 2 0 0 0-1.9 1.4L3 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          <div className="mt-2">
            <div
              className="h-1.5 overflow-hidden rounded-full bg-[#f0ebdd]"
              role="meter"
              aria-label="Occupation du stockage"
              aria-valuenow={usagePct !== null ? Math.round(usagePct) : undefined}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              {usagePct !== null && (
                <div
                  className={`h-full rounded-full transition-all ${sature ? "bg-red-500" : alerte ? "bg-amber-500" : "bg-[#24439c]"}`}
                  style={{ width: `${Math.max(2, usagePct)}%` }}
                />
              )}
            </div>
            <p className="mt-1.5 text-xs text-[#8a7f6a]">
              {usagePct !== null
                ? `${Math.round(usagePct)} % de ${formatMo(storageLimit)}`
                : "Mesure indisponible"}
            </p>
          </div>
        </StatTile>
      </div>

      {sature && (
        <Banner variant="error">
          Stockage saturé : les invités ne peuvent plus envoyer de photos (les messages écrits restent
          possibles). Supprimez des photos pour libérer de l&apos;espace.
        </Banner>
      )}

      {/* ——— Messages ——— */}
      <Card>
        <CardHeader
          title="Les souvenirs des invités"
          description="Tout ce qui est déposé sur la page publique /livre-dor apparaît ici."
        />

        {error && (
          <div className="px-6 pt-4">
            <Banner variant="error">{error}</Banner>
          </div>
        )}

        <div className="divide-y divide-[#f0ebdd]">
          {loading && <p className="px-6 py-6 text-sm text-[#8a7f6a]">Chargement...</p>}

          {!loading && entries.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="font-script text-3xl text-[#b3a98f]">Les pages sont encore blanches</p>
              <p className="mt-2 text-sm text-[#8a7f6a]">
                Les messages et photos laissés par vos invités apparaîtront ici.
              </p>
            </div>
          )}

          {entries.map((entry) => (
            <div key={entry.id} className="px-6 py-5 transition hover:bg-[#faf7f0]/70">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#24439c] to-[#1a3277] text-xs font-semibold text-[#f6efe2] shadow-sm">
                    {initials(entry.guests?.nom_complet ?? "?")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#332e25]">
                      {entry.guests?.nom_complet ?? "Invité supprimé"}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-[#8a7f6a]">
                      <span>{formatDate(entry.created_at)}</span>
                      {entry.guests && (
                        <>
                          <span aria-hidden className="text-[#e3dccb]">•</span>
                          <span title="Code livre d'or" className="font-semibold tracking-[0.15em] text-[#24439c]">
                            {entry.guests.code}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteEntry(entry)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#b3a98f] transition hover:bg-red-50 hover:text-red-600"
                >
                  Supprimer
                </button>
              </div>

              {entry.message && (
                <blockquote className="mt-3 border-l-2 border-[#e0af2e] pl-3.5 text-sm leading-relaxed whitespace-pre-line text-[#4a4234]">
                  {entry.message}
                </blockquote>
              )}

              {entry.guestbook_photos.length > 0 && (
                <div className="mt-3.5 flex flex-wrap gap-3">
                  {entry.guestbook_photos.map((photo) => (
                    <div key={photo.id} className="relative">
                      <a
                        href={guestbookPhotoUrl(photo.path)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Ouvrir la photo en grand"
                      >
                        <div className="relative h-28 w-28 overflow-hidden rounded-xl border border-[#e8e2d2] bg-[#faf7f0]">
                          <Image
                            src={guestbookPhotoUrl(photo.path)}
                            alt={`Photo de ${entry.guests?.nom_complet ?? "l'invité"}`}
                            fill
                            sizes="112px"
                            className="object-cover transition hover:scale-105"
                          />
                        </div>
                      </a>
                      <button
                        onClick={() => handleDeletePhoto(photo)}
                        aria-label="Supprimer cette photo"
                        title="Supprimer cette photo"
                        className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full border border-white bg-[#332e25]/90 text-xs leading-none text-white shadow transition hover:bg-red-600"
                      >
                        ×
                      </button>
                      <p className="mt-1 text-center text-[10px] text-[#b3a98f]">{formatMo(photo.size_bytes)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
