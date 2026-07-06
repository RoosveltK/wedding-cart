"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { PosterHero } from "./PosterHero";
import { ScrollConfetti } from "./ScrollConfetti";
import { DriedFlowers, PaperGrain, SprigDivider, TornEdge, WashiTape } from "./decor";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { formatDateDots, formatPosterDate, formatTime } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

const DownloadPdfButton = dynamic(
  () => import("@/components/ticket/DownloadPdfButton").then((m) => m.DownloadPdfButton),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-sm bg-[#332e25]/10 px-4 py-3 text-[11px] tracking-[0.25em] text-[#5c5343] uppercase">
        Préparation du billet...
      </div>
    ),
  },
);

const FloatingDownloadButton = dynamic(
  () => import("@/components/ticket/DownloadPdfButton").then((m) => m.FloatingDownloadButton),
  { ssr: false },
);

/** Bouton flottant visible dès qu'on quitte le haut du hero. */
function FloatingTicket({ billet, billetUrl }: { billet: Billet; billetUrl: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 260);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="pointer-events-none fixed bottom-5 right-5 z-50"
          initial={{ opacity: 0, y: 24, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.9 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <FloatingDownloadButton billet={billet} billetUrl={billetUrl} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

type Billet = Database["public"]["Functions"]["get_billet"]["Returns"][number];

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

function Section({
  id,
  title,
  children,
  tinted = false,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  tinted?: boolean;
}) {
  return (
    <section id={id} className={`relative px-6 py-20 ${tinted ? "bg-[#e7dcc6]/45" : ""}`}>
      <motion.div
        className="mx-auto w-full max-w-2xl"
        variants={reveal}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
      >
        <h2 className="text-center font-script text-5xl text-[#332e25]">{title}</h2>
        <SprigDivider className="mx-auto mt-4 h-8 w-52" />
        <div className="mt-10">{children}</div>
      </motion.div>
    </section>
  );
}

function LinkButton({
  href,
  children,
  solid = false,
}: {
  href: string;
  children: React.ReactNode;
  solid?: boolean;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={
        solid
          ? "w-full rounded-sm bg-[#332e25] px-4 py-3 text-center text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#4a4335]"
          : "w-full rounded-sm border border-[#8a7360] px-4 py-3 text-center text-[11px] tracking-[0.25em] text-[#5c5343] uppercase transition hover:bg-[#8a7360]/10"
      }
    >
      {children}
    </a>
  );
}

export function WeddingSite({ billet, billetUrl }: { billet: Billet; billetUrl: string }) {
  const date = formatPosterDate(billet.date_debut);

  const calendarUrl = billet.date_debut
    ? buildGoogleCalendarUrl({
        titre: billet.titre ?? `Mariage de ${billet.nom_mariee} & ${billet.nom_marie}`,
        dateDebut: billet.date_debut,
        dateFin: billet.date_fin,
        lieu: billet.lieu,
        description: billet.description,
      })
    : null;

  const mapsUrl = billet.lieu
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(billet.lieu)}`
    : null;

  const programme = [
    { heure: billet.date_debut ? formatTime(billet.date_debut) : "•", titre: "Accueil & cérémonie", detail: "Nous échangeons nos vœux entourés de ceux que nous aimons." },
    { heure: "•", titre: "Cocktail doré", detail: "Bulles, sourires et photos sous les guirlandes lumineuses." },
    { heure: "•", titre: "Dîner festif", detail: "Un repas à partager, des toasts et quelques surprises." },
    { heure: "•", titre: "Soirée dansante", detail: "La piste est à vous jusqu'au bout de la nuit !" },
  ];

  return (
    <motion.main
      className="relative min-h-screen bg-[#efe7d7] text-[#332e25]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <PosterHero billet={billet} />

      {/* ——— Les mariés ——— */}
      <Section id="maries" title="Les mariés">
        <div className="relative mx-auto max-w-md rotate-[-1.5deg] bg-[#fbf6ea] p-3 pb-6 shadow-[0_14px_30px_rgba(51,46,37,0.18)]">
          <WashiTape className="absolute -top-4 left-6 h-8 w-24 -rotate-6" />
          <WashiTape className="absolute -top-3 right-8 h-7 w-20" rotate={5} />
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src="/images/maries.jpg"
              alt={`${billet.nom_mariee} et ${billet.nom_marie}`}
              fill
              sizes="(max-width: 640px) 100vw, 448px"
              className="object-cover"
            />
          </div>
          <p className="mt-4 text-center font-script text-2xl text-[#5c5343]">
            {billet.nom_mariee} &amp; {billet.nom_marie}
          </p>
        </div>

        <div className="mt-12 grid gap-8 sm:grid-cols-2">
          <div className="border-l-2 border-[#c8a862] pl-5">
            <p className="text-[10px] tracking-[0.35em] text-[#8a7360] uppercase">La mariée</p>
            <p className="mt-1 font-script text-3xl">{billet.nom_mariee}</p>
            <p className="mt-2 font-serif text-sm leading-relaxed text-[#5c5343]">
              Un sourire qui illumine chaque pièce, un cœur immense et l&apos;élégance en héritage.
            </p>
          </div>
          <div className="border-l-2 border-[#c8a862] pl-5 sm:border-l-0 sm:border-r-2 sm:pl-0 sm:pr-5 sm:text-right">
            <p className="text-[10px] tracking-[0.35em] text-[#8a7360] uppercase">Le marié</p>
            <p className="mt-1 font-script text-3xl">{billet.nom_marie}</p>
            <p className="mt-2 font-serif text-sm leading-relaxed text-[#5c5343]">
              Une joie contagieuse, une parole qui rassure et une promesse tenue depuis le premier jour.
            </p>
          </div>
        </div>

        {billet.description && (
          <blockquote className="mx-auto mt-12 max-w-md text-center">
            <p className="font-serif text-lg italic leading-relaxed text-[#5c5343]">
              « {billet.description} »
            </p>
          </blockquote>
        )}
      </Section>

      {/* ——— Programme ——— */}
      <Section id="programme" title="La célébration" tinted>
        <TornEdge className="pointer-events-none absolute left-0 top-0 h-8 w-full" fill="#efe7d7" flip />
        <ol className="relative mx-auto max-w-lg space-y-10 border-l border-[#c8a862]/70 pl-8">
          {programme.map((etape, i) => (
            <motion.li
              key={etape.titre}
              className="relative"
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
            >
              <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#c8a862] bg-[#efe7d7]">
                <span className="h-2 w-2 rounded-full bg-[#c8a862]" />
              </span>
              <p className="text-[10px] tracking-[0.35em] text-[#8a7360] uppercase">{etape.heure}</p>
              <p className="mt-1 font-serif text-xl font-semibold">{etape.titre}</p>
              <p className="mt-1 font-serif text-sm leading-relaxed text-[#5c5343]">{etape.detail}</p>
            </motion.li>
          ))}
        </ol>
        <TornEdge className="pointer-events-none absolute bottom-0 left-0 h-8 w-full" fill="#efe7d7" />
      </Section>

      {/* ——— Le lieu ——— */}
      <Section id="lieu" title="Le lieu">
        <div className="relative mx-auto max-w-md bg-[#fbf6ea] px-8 py-10 text-center shadow-[0_14px_30px_rgba(51,46,37,0.14)]">
          <DriedFlowers className="pointer-events-none absolute -right-8 -top-10 w-24 rotate-[140deg] opacity-80" />
          {date && (
            <p className="text-[10px] tracking-[0.35em] text-[#8a7360] uppercase">
              {date.weekday} {date.day} {date.month} {date.year} — À {date.time}
            </p>
          )}
          <p className="mt-4 font-serif text-2xl leading-snug">
            {billet.lieu ?? "Le lieu vous sera communiqué très bientôt."}
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {mapsUrl && <LinkButton href={mapsUrl} solid>Voir l&apos;itinéraire</LinkButton>}
            {calendarUrl && <LinkButton href={calendarUrl}>Ajouter à Google Agenda</LinkButton>}
          </div>
        </div>
      </Section>

      {/* ——— Le billet ——— */}
      <Section id="billet" title="Votre billet" tinted>
        <TornEdge className="pointer-events-none absolute left-0 top-0 h-8 w-full" fill="#efe7d7" flip />
        <div className="relative mx-auto max-w-md">
          <div className="relative bg-[#fbf6ea] px-8 py-10 text-center shadow-[0_14px_30px_rgba(51,46,37,0.16)]">
            {/* encoches de ticket */}
            <span className="absolute -left-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#e7dcc6]" />
            <span className="absolute -right-3 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-[#e7dcc6]" />

            <p className="text-[10px] tracking-[0.35em] text-[#8a7360] uppercase">Billet d&apos;entrée personnel</p>
            <p className="mt-3 font-script text-4xl">{billet.nom_complet}</p>
            {date && (
              <p className="mt-2 font-serif text-xs tracking-[0.25em] text-[#5c5343]">
                {formatDateDots(billet.date_debut)} — {date.time}
              </p>
            )}

            <div className="my-7 border-t border-dashed border-[#8a7360]/50" />

            <div className="flex justify-center">
              <div className="rounded-sm border border-[#c8a862]/60 bg-white p-3">
                <QRCodeSVG value={billetUrl} size={132} fgColor="#332e25" bgColor="#ffffff" />
              </div>
            </div>
            <p className="mt-4 text-[10px] tracking-[0.25em] text-[#8a7360] uppercase">
              À présenter à l&apos;entrée
            </p>

            <div className="mt-8">
              <DownloadPdfButton billet={billet} billetUrl={billetUrl} />
            </div>
          </div>
        </div>
      </Section>

      {/* ——— Pied de page ——— */}
      <footer className="relative px-6 pb-14 pt-16 text-center">
        <p className="font-script text-4xl text-[#332e25]">
          {billet.nom_mariee} &amp; {billet.nom_marie}
        </p>
        {date && (
          <p className="mt-3 font-serif text-[11px] tracking-[0.4em] text-[#8a7360] uppercase">
            {date.day} {date.month} {date.year}
          </p>
        )}
        <p className="mt-6 font-serif text-sm italic text-[#5c5343]">
          Nous avons hâte de célébrer ce jour avec vous.
        </p>
      </footer>

      <ScrollConfetti />
      <FloatingTicket billet={billet} billetUrl={billetUrl} />
      <PaperGrain className="pointer-events-none fixed inset-0 z-40" />
    </motion.main>
  );
}
