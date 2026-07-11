"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  BrushStroke,
  DriedFlowers,
  PaperGrain,
  SprigDivider,
  TornEdge,
  WashiTape,
} from "@/components/site/decor";
import {
  guestbookPhotoUrl,
  MAX_MESSAGE_LONGUEUR,
  MAX_PHOTOS_PAR_INVITE,
  MAX_TAILLE_PHOTO,
  type GuestbookGroup,
  type GuestbookVerifyResponse,
} from "@/lib/guestbook";
import { PhotoLightbox } from "@/components/guestbook/PhotoLightbox";
import { ThankYouOverlay } from "@/components/guestbook/ThankYouOverlay";

const reveal = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

/** Inclinaisons déterministes des cartes du mur (pas d'aléatoire → pas de souci d'hydratation). */
const TILTS = ["rotate-[-1.8deg]", "rotate-[1.4deg]", "rotate-[-0.9deg]", "rotate-[2deg]", "rotate-[0.6deg]"];

function formatEntryDate(iso: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long" }).format(new Date(iso));
}

/* ————————————————— Identification ————————————————— */

function VerifyCard({
  onVerified,
  initialCode,
}: {
  onVerified: (guest: GuestbookVerifyResponse) => void;
  initialCode: string | null;
}) {
  const [identifier, setIdentifier] = useState(initialCode ?? "");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autoTried = useRef(false);

  const verify = useCallback(
    async (value: string) => {
      if (!value.trim()) {
        setError("Renseignez le nom inscrit sur votre billet ou votre code invité.");
        return;
      }
      setChecking(true);
      setError(null);
      try {
        const res = await fetch("/api/guestbook/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: value.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Vérification impossible. Réessayez.");
          return;
        }
        onVerified(data as GuestbookVerifyResponse);
      } catch {
        setError("Vérification impossible. Vérifiez votre connexion et réessayez.");
      } finally {
        setChecking(false);
      }
    },
    [onVerified],
  );

  // Arrivée depuis le billet ou le QR : ?code=XXXXX → vérification automatique
  useEffect(() => {
    if (initialCode && !autoTried.current) {
      autoTried.current = true;
      verify(initialCode);
    }
  }, [initialCode, verify]);

  return (
    <div className="relative mx-auto max-w-md">
      <WashiTape className="pointer-events-none absolute -top-4 left-8 z-10 h-8 w-24" rotate={-7} />
      <WashiTape className="pointer-events-none absolute -bottom-4 right-8 z-10 h-8 w-24" rotate={8} />

      <div className="relative rotate-[-0.8deg] bg-[#fbf6ea] px-7 py-8 shadow-[0_14px_30px_rgba(51,46,37,0.18)]">
        <p className="text-center text-[10px] font-semibold tracking-[0.35em] text-[#24439c] uppercase">
          Réservé aux invités
        </p>
        <p className="mt-3 text-center font-serif text-sm leading-relaxed text-[#5c5343]">
          Indiquez le nom inscrit sur votre billet, ou le code invité à 5 caractères qui y figure.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            verify(identifier);
          }}
          className="mt-6 flex flex-col gap-3"
        >
          <label className="sr-only" htmlFor="guestbook-identifier">
            Nom du billet ou code invité
          </label>
          <input
            id="guestbook-identifier"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="ex. Jean Kamga — ou K4T9B"
            className="w-full border border-[#8a7360]/40 bg-white/70 px-4 py-3 text-center font-serif text-base text-[#332e25] outline-none transition placeholder:text-[#8a7360]/60 focus:border-[#24439c]"
          />
          <button
            type="submit"
            disabled={checking}
            className="w-full rounded-sm bg-[#24439c] px-4 py-3 text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#1a3277] disabled:opacity-50"
          >
            {checking ? "Vérification..." : "Ouvrir le livre d'or"}
          </button>
        </form>

        {error && (
          <p role="alert" className="mt-4 border-l-2 border-[#a33] bg-[#a33]/5 px-3 py-2 font-serif text-sm text-[#7a2d2d]">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ————————————————— Dépôt d'un souvenir ————————————————— */

function ComposerCard({
  guest,
  onPosted,
}: {
  guest: GuestbookVerifyResponse;
  onPosted: (payload: { photosRestantes: number; hasMessage: boolean }) => void;
}) {
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [posted, setPosted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const mediasBloques = guest.storagePlein || guest.photosRestantes === 0;

  useEffect(() => {
    const urls = photos.map((p) => URL.createObjectURL(p));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [photos]);

  function handlePickPhotos(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const files = Array.from(e.target.files ?? []);
    if (files.some((f) => f.size > MAX_TAILLE_PHOTO)) {
      setError("Chaque photo doit faire moins de 3 Mo.");
      return;
    }
    const next = [...photos, ...files].slice(0, guest.photosRestantes);
    if (photos.length + files.length > guest.photosRestantes) {
      setError(
        guest.photosRestantes < MAX_PHOTOS_PAR_INVITE
          ? `Il ne vous reste que ${guest.photosRestantes} photo(s) sur ${MAX_PHOTOS_PAR_INVITE}.`
          : `${MAX_PHOTOS_PAR_INVITE} photos maximum.`,
      );
    }
    setPhotos(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const withMessage = !guest.hasMessage && message.trim().length > 0;
    if (!withMessage && photos.length === 0) {
      setError(
        guest.hasMessage
          ? "Ajoutez au moins une photo (vous avez déjà laissé votre message)."
          : "Écrivez un message ou ajoutez au moins une photo.",
      );
      return;
    }

    setSending(true);
    try {
      const form = new FormData();
      form.set("identifier", guest.code);
      if (withMessage) form.set("message", message.trim());
      photos.forEach((p) => form.append("photos", p));

      const res = await fetch("/api/guestbook/entries", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Échec de l'envoi. Réessayez.");
        return;
      }

      setMessage("");
      setPhotos([]);
      setPosted(true);
      setTimeout(() => setPosted(false), 4000);
      onPosted({
        photosRestantes: data.photosRestantes ?? guest.photosRestantes,
        hasMessage: data.hasMessage ?? guest.hasMessage,
      });
    } catch {
      setError("Échec de l'envoi. Vérifiez votre connexion et réessayez.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="relative mx-auto max-w-xl">
      <DriedFlowers className="pointer-events-none absolute -left-16 -top-10 w-28 rotate-[-15deg] opacity-90 sm:-left-20 sm:w-36" />
      <WashiTape className="pointer-events-none absolute -top-4 right-10 z-10 h-8 w-24" rotate={6} />

      <div className="relative rotate-[0.7deg] bg-[#fbf6ea] px-6 py-8 shadow-[0_16px_34px_rgba(51,46,37,0.2)] sm:px-9">
        <p className="text-center font-script text-3xl text-[#332e25]">Bienvenue, {guest.nom}</p>
        <p className="mt-2 text-center font-serif text-sm text-[#5c5343]">
          Un mot doux et/ou des photos (juste en dessous ↓) — tout rejoindra le mur des mariés.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-5">
          <div>
            <label
              htmlFor="guestbook-message"
              className="text-[10px] font-semibold tracking-[0.3em] text-[#8a7360] uppercase"
            >
              Votre message
            </label>
            {guest.hasMessage ? (
              <p className="mt-2 border-l-2 border-[#e0af2e] bg-[#e0af2e]/10 px-3 py-2 font-serif text-sm text-[#5c5343]">
                Vous avez déjà laissé un message — retrouvez-le (et supprimez-le si besoin) dans le mur des
                souvenirs ci-dessous pour en écrire un nouveau.
              </p>
            ) : (
              <>
                <textarea
                  id="guestbook-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LONGUEUR))}
                  rows={3}
                  placeholder="Quelques mots pour Diane & Martial..."
                  className="mt-2 w-full resize-none border border-[#8a7360]/40 bg-white/70 px-4 py-3 font-serif text-base leading-relaxed text-[#332e25] outline-none transition placeholder:text-[#8a7360]/60 focus:border-[#24439c]"
                />
                <p className="mt-1 text-right text-[10px] tracking-[0.2em] text-[#8a7360]">
                  {message.length}/{MAX_MESSAGE_LONGUEUR}
                </p>
              </>
            )}
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-[0.3em] text-[#8a7360] uppercase">
              Vos photos{" "}
              {!mediasBloques && (
                <span className="text-[#24439c]">— encore {guest.photosRestantes} sur {MAX_PHOTOS_PAR_INVITE}</span>
              )}
            </p>

            {mediasBloques ? (
              <p className="mt-2 border-l-2 border-[#e0af2e] bg-[#e0af2e]/10 px-3 py-2 font-serif text-sm text-[#5c5343]">
                {guest.storagePlein
                  ? "L'album photos est complet — mais votre message écrit, lui, trouvera toujours sa place."
                  : "Vous avez déjà offert vos 5 photos aux mariés. Votre plume reste la bienvenue !"}
              </p>
            ) : (
              <>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  {previews.map((src, i) => (
                    <div
                      key={src}
                      className={`relative bg-white p-1.5 pb-5 shadow-[0_6px_14px_rgba(51,46,37,0.25)] ${TILTS[i % TILTS.length]}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:) */}
                      <img src={src} alt={`Photo ${i + 1}`} className="h-16 w-16 object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, j) => j !== i))}
                        aria-label={`Retirer la photo ${i + 1}`}
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#332e25] text-[10px] leading-none text-[#f6efe2]"
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  {photos.length < guest.photosRestantes && (
                    <label className="flex h-[76px] w-[76px] cursor-pointer flex-col items-center justify-center gap-1 border border-dashed border-[#8a7360]/50 bg-white/50 text-[#8a7360] transition hover:border-[#24439c] hover:text-[#24439c]">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
                        <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                      </svg>
                      <span className="text-[9px] tracking-[0.15em] uppercase">Ajouter</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handlePickPhotos}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <p className="mt-2 text-[10px] tracking-[0.15em] text-[#8a7360] uppercase">3 Mo max par photo</p>
              </>
            )}
          </div>

          {error && (
            <p role="alert" className="border-l-2 border-[#a33] bg-[#a33]/5 px-3 py-2 font-serif text-sm text-[#7a2d2d]">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="w-full rounded-sm bg-[#24439c] px-4 py-3 text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#1a3277] disabled:opacity-50"
          >
            {sending ? "Envoi..." : "Déposer dans le livre d'or"}
          </button>
        </form>
      </div>

      {posted && <ThankYouOverlay nom={guest.nom} onClose={() => setPosted(false)} />}
    </div>
  );
}

/* ————————————————— Mur des souvenirs ————————————————— */

function WallCard({
  group,
  index,
  isOwner,
  deletingPhotoId,
  deletingEntryId,
  onOpenPhoto,
  onDeletePhoto,
  onDeleteMessage,
}: {
  group: GuestbookGroup;
  index: number;
  isOwner: boolean;
  deletingPhotoId: string | null;
  deletingEntryId: string | null;
  onOpenPhoto: (photoIndex: number) => void;
  onDeletePhoto: (photoId: string) => void;
  onDeleteMessage: (entryId: string) => void;
}) {
  return (
    <motion.div
      className={`relative bg-[#fbf6ea] p-4 pb-5 shadow-[0_12px_26px_rgba(51,46,37,0.16)] ${TILTS[index % TILTS.length]}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08 }}
    >
      <WashiTape
        className="pointer-events-none absolute -top-3.5 left-1/2 z-10 h-7 w-20 -translate-x-1/2"
        rotate={index % 2 === 0 ? -5 : 6}
      />

      {group.photos.length > 0 && (
        <div className="flex flex-wrap justify-center gap-3">
          {group.photos.map((photo, i) => (
            <div
              key={photo.id}
              className={`group/photo relative bg-white p-1.5 pb-4 shadow-[0_6px_16px_rgba(51,46,37,0.22)] ${TILTS[i % TILTS.length]}`}
            >
              <button
                type="button"
                onClick={() => onOpenPhoto(i)}
                aria-label={`Agrandir la photo ${i + 1} de ${group.nom_complet}`}
                className="relative block h-24 w-24 overflow-hidden bg-[#e7dcc6] sm:h-28 sm:w-28"
              >
                <Image
                  src={guestbookPhotoUrl(photo.path)}
                  alt={`Photo laissée par ${group.nom_complet}`}
                  fill
                  sizes="112px"
                  className="object-cover transition group-hover/photo:scale-105"
                />
              </button>
              {isOwner && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePhoto(photo.id);
                  }}
                  disabled={deletingPhotoId === photo.id}
                  aria-label="Supprimer cette photo"
                  title="Supprimer cette photo"
                  className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#332e25]/90 text-xs leading-none text-[#f6efe2] shadow transition hover:bg-red-600 disabled:opacity-60"
                >
                  {deletingPhotoId === photo.id ? "…" : "×"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {group.entries.map((entry, i) => (
        <div
          key={entry.id}
          className={`flex items-start justify-between gap-2 ${
            i > 0 ? "mt-2" : group.photos.length > 0 ? "mt-3" : ""
          }`}
        >
          <p className="font-serif text-[15px] italic leading-relaxed text-[#5c5343]">« {entry.message} »</p>
          {isOwner && (
            <button
              type="button"
              onClick={() => onDeleteMessage(entry.id)}
              disabled={deletingEntryId === entry.id}
              aria-label="Supprimer ce message"
              title="Supprimer ce message"
              className="shrink-0 rounded-full px-1.5 py-0.5 text-xs leading-none text-[#8a7360] transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              {deletingEntryId === entry.id ? "…" : "×"}
            </button>
          )}
        </div>
      ))}

      <div className="mt-4 flex items-end justify-between gap-2">
        <p className="font-script text-2xl leading-none text-[#24439c]">{group.nom_complet}</p>
        <p className="text-[9px] tracking-[0.25em] text-[#8a7360] uppercase">{formatEntryDate(group.last_activity)}</p>
      </div>
    </motion.div>
  );
}

/* ————————————————— Page ————————————————— */

export function GuestbookPage() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get("code");

  const [guest, setGuest] = useState<GuestbookVerifyResponse | null>(null);
  const [groups, setGroups] = useState<GuestbookGroup[] | null>(null);
  const [lightbox, setLightbox] = useState<{ groupIndex: number; photoIndex: number } | null>(null);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const loadWall = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_guestbook");
    setGroups((data as unknown as GuestbookGroup[] | null) ?? []);
  }, []);

  useEffect(() => {
    loadWall();
  }, [loadWall]);

  const handleDeletePhoto = useCallback(
    async (photoId: string) => {
      if (!guest) return;
      if (!window.confirm("Supprimer cette photo ?")) return;

      setDeletingPhotoId(photoId);
      setDeleteError(null);
      try {
        const res = await fetch("/api/guestbook/photos", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: guest.code, photoId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setDeleteError(data.error ?? "Échec de la suppression. Réessayez.");
          return;
        }
        setGuest((g) => (g ? { ...g, photosRestantes: data.photosRestantes ?? g.photosRestantes } : g));
        setLightbox(null);
        await loadWall();
      } catch {
        setDeleteError("Échec de la suppression. Vérifiez votre connexion et réessayez.");
      } finally {
        setDeletingPhotoId(null);
      }
    },
    [guest, loadWall],
  );

  const handleDeleteMessage = useCallback(
    async (entryId: string) => {
      if (!guest) return;
      if (!window.confirm("Supprimer ce message ?")) return;

      setDeletingEntryId(entryId);
      setDeleteError(null);
      try {
        const res = await fetch("/api/guestbook/messages", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ identifier: guest.code, entryId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setDeleteError(data.error ?? "Échec de la suppression. Réessayez.");
          return;
        }
        setGuest((g) => (g ? { ...g, hasMessage: false } : g));
        await loadWall();
      } catch {
        setDeleteError("Échec de la suppression. Vérifiez votre connexion et réessayez.");
      } finally {
        setDeletingEntryId(null);
      }
    },
    [guest, loadWall],
  );

  return (
    <main className="relative min-h-screen bg-[#efe7d7] text-[#332e25]">
      {/* ——— En-tête ——— */}
      <header className="relative overflow-hidden px-6 pb-14 pt-16 text-center">
        <DriedFlowers className="pointer-events-none absolute -left-10 top-6 w-32 rotate-[-24deg] opacity-70 sm:w-44" />
        <DriedFlowers className="pointer-events-none absolute -right-12 -top-2 w-32 rotate-[152deg] opacity-70 sm:w-44" />

        <motion.div variants={reveal} initial="hidden" animate="show" className="relative mx-auto max-w-xl">
          <div className="relative mx-auto h-14 w-56">
            <BrushStroke className="absolute inset-0 h-full w-full" />
            <p className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold tracking-[0.35em] text-[#f6efe2] uppercase">
              Diane &amp; Martial
            </p>
          </div>
          <h1 className="mt-5 font-script text-[clamp(3rem,11vw,4.5rem)] leading-tight text-[#332e25]">
            Le livre d&apos;or
          </h1>
          <SprigDivider className="mx-auto mt-3 h-8 w-52" />
          <p className="mx-auto mt-5 max-w-md font-serif text-base leading-relaxed text-[#5c5343]">
            Un mot doux, une anecdote, vos plus belles photos de la fête : laissez ici votre trace
            dans l&apos;histoire des mariés.
          </p>
        </motion.div>
      </header>

      {/* ——— Identification puis dépôt ——— */}
      <section className="relative px-6 pb-20">
        <AnimatePresence mode="wait">
          {guest ? (
            <motion.div key="composer" variants={reveal} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              <ComposerCard
                guest={guest}
                onPosted={({ photosRestantes, hasMessage }) => {
                  setGuest((g) => (g ? { ...g, photosRestantes, hasMessage } : g));
                  loadWall();
                }}
              />
            </motion.div>
          ) : (
            <motion.div key="verify" variants={reveal} initial="hidden" animate="show" exit={{ opacity: 0 }}>
              <VerifyCard initialCode={initialCode} onVerified={setGuest} />
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ——— Mur des souvenirs ——— */}
      <section className="relative bg-[#e7dcc6]/45 px-6 py-20">
        <TornEdge className="pointer-events-none absolute left-0 top-0 h-8 w-full" fill="#efe7d7" flip />

        <div className="mx-auto max-w-5xl">
          <h2 className="text-center font-script text-[clamp(2.4rem,8vw,3rem)] leading-tight text-[#332e25]">
            Leurs souvenirs
          </h2>
          <SprigDivider className="mx-auto mt-4 h-8 w-52" />

          {deleteError && (
            <p role="alert" className="mx-auto mt-6 max-w-sm border-l-2 border-[#a33] bg-[#a33]/5 px-3 py-2 text-center font-serif text-sm text-[#7a2d2d]">
              {deleteError}
            </p>
          )}

          <div className="mt-12">
            {groups === null && (
              <p className="text-center font-serif text-sm text-[#8a7360]">Ouverture du livre...</p>
            )}
            {groups !== null && groups.length === 0 && (
              <p className="mx-auto max-w-sm text-center font-serif text-base italic text-[#5c5343]">
                Les pages sont encore blanches — soyez les premiers à écrire un mot aux mariés.
              </p>
            )}
            {groups !== null && groups.length > 0 && (
              <div className="grid grid-cols-1 items-start gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {groups.map((group, i) => (
                  <WallCard
                    key={group.guest_id}
                    group={group}
                    index={i}
                    isOwner={guest?.id === group.guest_id}
                    deletingPhotoId={deletingPhotoId}
                    deletingEntryId={deletingEntryId}
                    onOpenPhoto={(photoIndex) => setLightbox({ groupIndex: i, photoIndex })}
                    onDeletePhoto={handleDeletePhoto}
                    onDeleteMessage={handleDeleteMessage}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <TornEdge className="pointer-events-none absolute bottom-0 left-0 h-8 w-full" fill="#efe7d7" />
      </section>

      {/* ——— Pied de page ——— */}
      <footer className="relative px-6 pb-14 pt-12 text-center">
        <p className="font-script text-4xl text-[#332e25]">Diane &amp; Martial</p>
        <p className="mt-4 font-serif text-sm italic text-[#5c5343]">
          Merci de faire partie de leur histoire.
        </p>
      </footer>

      {lightbox && groups?.[lightbox.groupIndex] && (
        <PhotoLightbox
          photos={groups[lightbox.groupIndex].photos}
          index={lightbox.photoIndex}
          nom={groups[lightbox.groupIndex].nom_complet}
          isOwner={guest?.id === groups[lightbox.groupIndex].guest_id}
          deleting={deletingPhotoId !== null}
          onClose={() => setLightbox(null)}
          onNavigate={(photoIndex) => setLightbox((l) => (l ? { ...l, photoIndex } : l))}
          onDelete={handleDeletePhoto}
        />
      )}

      <PaperGrain className="pointer-events-none fixed inset-0 z-40" />
    </main>
  );
}
