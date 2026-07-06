"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { BrushStroke, DriedFlowers, TornEdge, WashiTape, PALETTE } from "./decor";
import { formatPosterDate } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

type Billet = Database["public"]["Functions"]["get_billet"]["Returns"][number];

/** Particules dorées qui flottent doucement sur le hero (côté festif). */
function GoldenDust() {
  const dots = [
    { left: "8%", size: 5, delay: 0, dur: 9 },
    { left: "18%", size: 3, delay: 2.2, dur: 11 },
    { left: "31%", size: 4, delay: 1.1, dur: 8 },
    { left: "44%", size: 3, delay: 3.4, dur: 12 },
    { left: "57%", size: 5, delay: 0.6, dur: 10 },
    { left: "68%", size: 3, delay: 2.8, dur: 9 },
    { left: "79%", size: 4, delay: 1.7, dur: 11 },
    { left: "90%", size: 3, delay: 0.3, dur: 8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {dots.map((d, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: d.left,
            bottom: "-2%",
            width: d.size,
            height: d.size,
            background: PALETTE.gold,
            boxShadow: `0 0 ${d.size * 2}px ${PALETTE.gold}`,
          }}
          animate={{ y: ["0vh", "-105vh"], opacity: [0, 0.9, 0.9, 0] }}
          transition={{ duration: d.dur, delay: d.delay, repeat: Infinity, ease: "linear" }}
        />
      ))}
    </div>
  );
}

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay: 0.35 + i * 0.18, ease: "easeOut" as const },
  }),
};

export function PosterHero({ billet }: { billet: Billet }) {
  const date = formatPosterDate(billet.date_debut);

  return (
    <header className="relative flex min-h-svh flex-col overflow-hidden bg-[#efe7d7]">
      {/* ——— Photo voilée, comme en haut de l'affiche ——— */}
      <div className="relative h-[52svh] min-h-[320px] w-full">
        <Image
          src="/images/maries.jpg"
          alt={`${billet.nom_mariee} et ${billet.nom_marie}`}
          fill
          priority
          sizes="100vw"
          className="object-cover object-[50%_30%]"
        />
        {/* voile crème translucide */}
        <div className="absolute inset-0 bg-[#f4ecdd]/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#efe7d7]/45 via-transparent to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#efe7d7]/60" />

        {/* étiquette personnalisée scotchée, façon collage */}
        <motion.div
          className="absolute right-4 top-5 rotate-3 sm:right-10"
          initial={{ opacity: 0, y: -12, rotate: 8 }}
          animate={{ opacity: 1, y: 0, rotate: 3 }}
          transition={{ duration: 0.7, delay: 1.2 }}
        >
          <div className="relative bg-[#fbf6ea] px-4 py-2 shadow-md">
            <WashiTape className="absolute -top-3 left-1/2 h-6 w-20 -translate-x-1/2" rotate={-4} />
            <p className="text-[10px] tracking-[0.28em] text-[#5c5343] uppercase">Invitation pour</p>
            <p className="font-serif text-base leading-tight text-[#332e25]">{billet.nom_complet}</p>
          </div>
        </motion.div>

        {/* coup de pinceau « LE MARIAGE DE » ancré en bas de la photo */}
        <motion.div
          className="absolute bottom-6 left-1/2 z-10 w-[290px] -translate-x-1/2 sm:w-[360px]"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <BrushStroke className="w-full drop-shadow-sm" />
          <p className="absolute inset-0 flex items-center justify-center pb-1 text-[13px] font-semibold tracking-[0.42em] text-[#f6efe2] uppercase sm:text-sm">
            Le mariage de
          </p>
        </motion.div>

        {/* bord déchiré qui mord sur la photo */}
        <TornEdge className="absolute -bottom-px left-0 z-[5] h-12 w-full sm:h-16" />
      </div>

      {/* ——— Partie papier de l'affiche ——— */}
      <div className="relative flex flex-1 flex-col items-center px-6 pb-16 pt-6 text-center">
        {/* branche de fleurs séchées sur le bord gauche */}
        <DriedFlowers className="pointer-events-none absolute -left-10 -top-40 z-10 w-44 opacity-95 sm:-left-4 sm:w-56" />
        <WashiTape className="pointer-events-none absolute -left-14 bottom-16 z-10 h-10 w-32 sm:-left-6" rotate={-14} />

        <motion.h1
          className="font-script text-[clamp(3.2rem,12vw,5.5rem)] leading-[1.05] text-[#332e25]"
          variants={rise}
          initial="hidden"
          animate="show"
          custom={0}
        >
          {billet.nom_mariee}
          <span className="mx-3 inline-block text-[0.8em] text-[#8a7360]">&amp;</span>
          {billet.nom_marie}
        </motion.h1>

        {date && (
          <motion.div
            className="mt-8 space-y-4"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={1}
          >
            <p className="font-serif text-sm font-semibold tracking-[0.5em] text-[#332e25]">
              {date.month}
            </p>
            <div className="flex items-center justify-center gap-5 font-serif text-[#332e25]">
              <span className="text-xs tracking-[0.35em]">{date.weekday}</span>
              <span className="border-x border-[#33302599] px-5 py-1 text-4xl font-semibold">
                {date.day}
              </span>
              <span className="text-xs tracking-[0.35em]">À {date.time}</span>
            </div>
            <p className="font-serif text-lg tracking-[0.45em] text-[#332e25]">{date.year}</p>
          </motion.div>
        )}

        {billet.lieu && (
          <motion.p
            className="mt-6 max-w-xs font-serif text-[11px] leading-relaxed tracking-[0.3em] text-[#5c5343] uppercase"
            variants={rise}
            initial="hidden"
            animate="show"
            custom={2}
          >
            {billet.lieu}
          </motion.p>
        )}

        <motion.a
          href="#maries"
          className="group mt-auto flex flex-col items-center gap-3 pt-10"
          variants={rise}
          initial="hidden"
          animate="show"
          custom={3}
        >
          {/* étincelles qui scintillent de part et d'autre de l'invitation à défiler */}
          <span className="flex items-center gap-3 text-[10px] tracking-[0.35em] text-[#8a7360] uppercase">
            <motion.svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7], rotate: [0, 20, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >
              <path d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z" fill={PALETTE.gold} />
            </motion.svg>
            La fête continue plus bas
            <motion.svg
              viewBox="0 0 24 24"
              className="h-4 w-4"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1.2, 0.7], rotate: [0, -20, 0] }}
              transition={{ duration: 2.2, delay: 1.1, repeat: Infinity, ease: "easeInOut" }}
              aria-hidden
            >
              <path d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z" fill={PALETTE.gold} />
            </motion.svg>
          </span>

          {/* double chevron doré qui descend en cascade */}
          <span className="relative flex h-8 flex-col items-center" aria-hidden>
            {[0, 1].map((i) => (
              <motion.svg
                key={i}
                viewBox="0 0 24 12"
                className="h-3 w-6"
                animate={{ y: [0, 7, 0], opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1.6, delay: i * 0.25, repeat: Infinity, ease: "easeInOut" }}
              >
                <path d="M2 2 L12 10 L22 2" fill="none" stroke={PALETTE.gold} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            ))}
          </span>
        </motion.a>
      </div>

      <GoldenDust />
    </header>
  );
}
