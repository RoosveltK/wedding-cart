"use client";

import { motion } from "framer-motion";
import { WaxSeal } from "./WaxSeal";
import { DriedFlowers, PaperGrain, WashiTape, PALETTE } from "@/components/site/decor";

/** Étincelles dorées qui scintillent doucement autour de l'enveloppe. */
function Twinkles() {
  const stars = [
    { left: "16%", top: "22%", size: 8, delay: 0, tone: PALETTE.or },
    { left: "80%", top: "18%", size: 6, delay: 0.9, tone: PALETTE.royal },
    { left: "12%", top: "68%", size: 6, delay: 1.6, tone: PALETTE.royal },
    { left: "86%", top: "60%", size: 9, delay: 0.4, tone: PALETTE.or },
    { left: "70%", top: "80%", size: 5, delay: 2.1, tone: PALETTE.or },
    { left: "28%", top: "38%", size: 5, delay: 1.2, tone: PALETTE.royal },
  ];
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden>
      {stars.map((s, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 24 24"
          className="absolute"
          style={{ left: s.left, top: s.top, width: s.size * 2, height: s.size * 2 }}
          animate={{ opacity: [0.1, 1, 0.1], scale: [0.7, 1.15, 0.7] }}
          transition={{ duration: 2.6, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M12 2 C13 8 16 11 22 12 C16 13 13 16 12 22 C11 16 8 13 2 12 C8 11 11 8 12 2 Z"
            fill={s.tone}
          />
        </motion.svg>
      ))}
    </div>
  );
}

export function Envelope({
  guestName,
  onOpen,
}: {
  guestName: string;
  onOpen: () => void;
}) {
  return (
    <motion.button
      onClick={onOpen}
      className="relative flex min-h-screen w-full flex-col items-center justify-center gap-10 overflow-hidden bg-[#efe7d7] px-6 text-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Décors collage : fleurs séchées et rubans kraft, comme sur l'affiche */}
      <DriedFlowers className="pointer-events-none absolute -bottom-10 -left-10 w-44 sm:-left-4 sm:w-56" />
      <DriedFlowers className="pointer-events-none absolute -right-12 -top-14 w-40 rotate-180 sm:-right-6 sm:w-52" />
      <WashiTape className="pointer-events-none absolute -left-8 top-24 h-9 w-28" rotate={-16} />
      <WashiTape className="pointer-events-none absolute -right-8 bottom-28 h-9 w-28" rotate={12} />
      <Twinkles />

      <div className="relative space-y-2">
        <p className="text-xs font-semibold tracking-[0.3em] text-[#24439c] uppercase">Invitation pour</p>
        <p className="font-serif text-2xl text-[#332e25]">{guestName}</p>
      </div>

      <motion.div
        className="relative"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative h-[150px] w-[220px]">
          <svg width="220" height="150" viewBox="0 0 220 150" fill="none" className="absolute inset-0">
            <rect x="2" y="2" width="216" height="146" rx="4" fill="#fffdf8" stroke="#e0af2e" strokeWidth="1.8" />
            <path d="M4 6 L110 92 L216 6" stroke="#e0af2e" strokeWidth="1.8" fill="none" />
          </svg>
          <WaxSeal size={64} className="absolute left-1/2 top-[80px] -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
        </div>
      </motion.div>

      <p className="relative rounded-full bg-[#24439c] px-6 py-3 text-xs font-semibold tracking-[0.25em] text-[#fdf8ec] uppercase animate-pulse">
        Toucher pour ouvrir
      </p>

      <PaperGrain className="pointer-events-none absolute inset-0" />
    </motion.button>
  );
}
