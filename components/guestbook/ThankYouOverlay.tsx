"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DriedFlowers, SprigDivider, WashiTape } from "@/components/site/decor";

/** Carte de remerciement affichée en plein écran juste après un dépôt (message et/ou photos). */
export function ThankYouOverlay({ nom, onClose }: { nom: string; onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a160f]/70 px-6 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-sm rotate-[-0.5deg] bg-[#fbf6ea] px-8 py-10 text-center shadow-[0_24px_60px_rgba(0,0,0,0.45)]"
          initial={{ opacity: 0, scale: 0.9, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <WashiTape
            className="pointer-events-none absolute -top-4 left-1/2 z-10 h-8 w-24 -translate-x-1/2"
            rotate={-4}
          />
          <DriedFlowers className="pointer-events-none absolute -left-10 -top-8 w-20 rotate-[-20deg] opacity-80" />
          <DriedFlowers className="pointer-events-none absolute -right-10 -bottom-8 w-20 rotate-[150deg] opacity-80" />

          <p className="font-script text-4xl text-[#24439c]">Merci {nom} !</p>
          <SprigDivider className="mx-auto mt-3 h-6 w-36" />
          <p className="mt-4 font-serif text-sm leading-relaxed text-[#5c5343]">
            Votre souvenir vient de rejoindre le mur des mariés — merci de faire partie de leur histoire.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 rounded-sm border border-[#24439c]/30 px-5 py-2 text-[11px] tracking-[0.25em] text-[#24439c] uppercase transition hover:bg-[#24439c]/5"
          >
            Continuer
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
