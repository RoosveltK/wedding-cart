"use client";

import Image from "next/image";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WashiTape } from "@/components/site/decor";
import { guestbookPhotoUrl, type GuestbookPhotoItem } from "@/lib/guestbook";

/**
 * Aperçu plein écran d'une photo du mur, avec navigation entre les photos
 * d'un même invité (celles regroupées dans sa carte).
 */
export function PhotoLightbox({
  photos,
  index,
  nom,
  isOwner = false,
  deleting = false,
  onClose,
  onNavigate,
  onDelete,
}: {
  photos: GuestbookPhotoItem[];
  index: number;
  nom: string;
  isOwner?: boolean;
  deleting?: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
  onDelete?: (photoId: string) => void;
}) {
  const photo = photos[index];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && index < photos.length - 1) onNavigate(index + 1);
      if (e.key === "ArrowLeft" && index > 0) onNavigate(index - 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a160f]/90 px-6 py-10 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          key={photo.id}
          className="relative max-h-full max-w-lg rotate-[-0.6deg] bg-[#fbf6ea] p-3 pb-8 shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <WashiTape className="pointer-events-none absolute -top-4 left-1/2 z-10 h-8 w-24 -translate-x-1/2" rotate={-4} />

          <div className="relative max-h-[75vh] min-h-[40vh] w-[min(80vw,32rem)] overflow-hidden bg-[#e7dcc6]">
            <Image
              src={guestbookPhotoUrl(photo.path)}
              alt={`Photo de ${nom}`}
              fill
              sizes="(max-width: 640px) 90vw, 32rem"
              className="object-contain"
              priority
            />
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <p className="text-center font-script text-2xl text-[#332e25]">{nom}</p>
            {isOwner && onDelete && (
              <button
                type="button"
                onClick={() => onDelete(photo.id)}
                disabled={deleting}
                className="rounded-full border border-red-600/30 px-3 py-1 text-[10px] tracking-[0.15em] text-red-700 uppercase transition hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Suppression…" : "Supprimer"}
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer l'aperçu"
            className="absolute -right-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#332e25] text-sm leading-none text-[#f6efe2] shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
          >
            ×
          </button>

          {photos.length > 1 && (
            <>
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onNavigate(index - 1)}
                aria-label="Photo précédente"
                className="absolute top-1/2 -left-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#fbf6ea] text-[#332e25] shadow-[0_4px_10px_rgba(0,0,0,0.3)] disabled:opacity-30"
              >
                ‹
              </button>
              <button
                type="button"
                disabled={index === photos.length - 1}
                onClick={() => onNavigate(index + 1)}
                aria-label="Photo suivante"
                className="absolute top-1/2 -right-4 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#fbf6ea] text-[#332e25] shadow-[0_4px_10px_rgba(0,0,0,0.3)] disabled:opacity-30"
              >
                ›
              </button>
              <p className="mt-1 text-center text-[10px] tracking-[0.2em] text-[#8a7360] uppercase">
                {index + 1} / {photos.length}
              </p>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
