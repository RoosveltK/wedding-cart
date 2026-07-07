"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { PosterHero } from "./PosterHero";
import { ScrollConfetti } from "./ScrollConfetti";
import { BrushStroke, DriedFlowers, PaperGrain, SprigDivider, TornEdge, WashiTape, PALETTE } from "./decor";
import { buildGoogleCalendarUrl } from "@/lib/calendar";
import { formatDateDots, formatPosterDate } from "@/lib/format";
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

type Billet = Database["public"]["Functions"]["get_billet"]["Returns"][number];

/** Carte vidéo façon collage : ruban kraft, fleurs séchées et coup de pinceau autour du message des mariés. */
function VideoMessage({ videoUrl }: { videoUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  function handlePlay() {
    setPlaying(true);
    videoRef.current?.play().catch(() => {});
  }

  return (
    <div className="relative mx-auto max-w-md">
      <DriedFlowers className="pointer-events-none absolute -left-16 -top-12 w-28 rotate-[-18deg] opacity-90 sm:-left-20 sm:w-36" />
      <DriedFlowers className="pointer-events-none absolute -right-14 -bottom-16 w-28 rotate-[160deg] opacity-90 sm:-right-16 sm:w-36" />
      <WashiTape className="pointer-events-none absolute -top-4 left-10 z-10 h-8 w-24" rotate={-8} />
      <WashiTape className="pointer-events-none absolute -bottom-4 right-10 z-10 h-8 w-24" rotate={9} />

      <div className="relative rotate-[-1deg] bg-[#fbf6ea] p-3 pb-5 shadow-[0_16px_34px_rgba(51,46,37,0.22)]">
        <BrushStroke className="pointer-events-none absolute -top-7 left-1/2 h-14 w-44 -translate-x-1/2" />
        <p className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold tracking-[0.3em] text-[#f6efe2] uppercase">
          À regarder
        </p>

        <div className="relative aspect-[9/16] max-h-[70vh] overflow-hidden bg-black">
          <video
            ref={videoRef}
            src={videoUrl}
            controls={playing}
            playsInline
            className="h-full w-full object-contain"
          />
          {!playing && (
            <button
              onClick={handlePlay}
              aria-label="Lire le message des mariés"
              className="absolute inset-0 flex items-center justify-center bg-black/25 transition hover:bg-black/35"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf6ea]/95 shadow-lg">
                <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill={PALETTE.ink} aria-hidden>
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const reveal = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" as const } },
};

function Section({
  id,
  title,
  children,
  tinted = false,
  nextId,
  nextLabel,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
  tinted?: boolean;
  nextId?: string;
  nextLabel?: string;
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
        <h2 className="text-center font-script text-[clamp(2.4rem,8vw,3rem)] leading-tight text-[#332e25]">
          {title}
        </h2>
        <SprigDivider className="mx-auto mt-4 h-8 w-52" />
        <div className="mt-10">{children}</div>

        {/* Guide de navigation : un bouton clair vers la section suivante */}
        {nextId && nextLabel && (
          <div className="mt-12 flex justify-center px-2 sm:mt-14">
            <a
              href={`#${nextId}`}
              className="flex w-full max-w-xs items-center justify-center gap-3 rounded-full border-2 border-[#24439c] bg-[#fbf6ea] px-5 py-3.5 text-center text-xs font-semibold tracking-[0.12em] text-[#24439c] uppercase shadow-sm transition hover:bg-[#24439c] hover:text-[#fdf8ec] sm:w-auto sm:px-6"
            >
              {nextLabel}
              <motion.svg
                viewBox="0 0 24 12"
                className="h-3 w-5"
                animate={{ y: [0, 4, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                aria-hidden
              >
                <path d="M2 2 L12 10 L22 2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </motion.svg>
            </a>
          </div>
        )}
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
          ? "w-full rounded-sm bg-[#24439c] px-4 py-3 text-center text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#1a3277]"
          : "w-full rounded-sm border border-[#24439c] px-4 py-3 text-center text-[11px] tracking-[0.25em] text-[#24439c] uppercase transition hover:bg-[#24439c]/10"
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
    {
      heure: "10h00",
      titre: "Cérémonie civile — Mairie d'Efoulan",
      detail: "Diane et Martial se disent oui devant monsieur le maire, entourés de leurs familles et témoins.",
    },
    {
      heure: "13h00",
      titre: "Bénédictions nuptiales — Nsimeyong",
      detail: "À la Salle du Royaume des Témoins de Jéhovah, suivies d'un casse-croûte partagé (pas de vin d'honneur).",
    },
    {
      heure: "18h30",
      titre: "Soirée festive — Safari Hôtel",
      detail: "Dîner, toasts et piste de danse pour célébrer jusqu'au bout de la nuit !",
    },
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
      <Section
        id="maries"
        title="Les mariés"
        nextId={billet.video_url ? "message" : "programme"}
        nextLabel={billet.video_url ? "Voir le message des mariés" : "Voir le programme"}
      >
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

      {/* ——— Message vidéo des mariés ——— */}
      {billet.video_url && (
        <Section
          id="message"
          title="Les mariés vous disent quelque chose"
          nextId="programme"
          nextLabel="Voir le programme"
        >
          <VideoMessage videoUrl={billet.video_url} />
        </Section>
      )}

      {/* ——— Programme ——— */}
      <Section
        id="programme"
        title="La célébration"
        tinted
        nextId="lieu"
        nextLabel="Voir le lieu"
      >
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
              <span className="absolute -left-[41px] top-1 flex h-5 w-5 items-center justify-center rounded-full border border-[#e0af2e] bg-[#efe7d7]">
                <span className="h-2 w-2 rounded-full bg-[#e0af2e]" />
              </span>
              <p className="text-sm font-semibold tracking-[0.3em] text-[#24439c]">{etape.heure}</p>
              <p className="mt-1 font-serif text-xl font-semibold">{etape.titre}</p>
              <p className="mt-1 font-serif text-sm leading-relaxed text-[#5c5343]">{etape.detail}</p>
            </motion.li>
          ))}
        </ol>

        {/* Consignes des mariés */}
        <div className="mx-auto mt-12 max-w-lg border-l-4 border-[#24439c] bg-[#fbf6ea] px-6 py-5 shadow-sm">
          <p className="text-[11px] font-semibold tracking-[0.3em] text-[#24439c] uppercase">À noter</p>
          <p className="mt-2 font-serif text-sm leading-relaxed text-[#5c5343]">
            Par égard pour les mariés, merci de vous abstenir de jet de riz et de farotage.
            Votre présence et vos sourires sont les plus beaux des cadeaux.
          </p>
        </div>
        <TornEdge className="pointer-events-none absolute bottom-0 left-0 h-8 w-full" fill="#efe7d7" />
      </Section>

      {/* ——— Le lieu ——— */}
      <Section id="lieu" title="Le lieu" nextId="livredor" nextLabel="Signer le livre d'or">
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

      {/* ——— Le livre d'or ——— */}
      <Section id="livredor" title="Le livre d'or" nextId="billet" nextLabel="Voir votre billet">
        <div className="relative mx-auto max-w-md">
          <DriedFlowers className="pointer-events-none absolute -left-12 -bottom-12 w-24 rotate-[24deg] opacity-80" />
          <WashiTape className="pointer-events-none absolute -top-4 right-8 z-10 h-8 w-24" rotate={7} />

          <div className="relative rotate-[0.8deg] bg-[#fbf6ea] px-8 py-10 text-center shadow-[0_14px_30px_rgba(51,46,37,0.16)]">
            <p className="font-serif text-base leading-relaxed text-[#5c5343]">
              Un mot doux, une anecdote, vos plus belles photos : laissez un souvenir aux mariés
              dans leur livre d&apos;or.
            </p>

            <p className="mt-6 text-[10px] font-semibold tracking-[0.35em] text-[#8a7360] uppercase">
              Votre code invité
            </p>
            <p className="mt-2 inline-block border-2 border-dashed border-[#e0af2e] bg-white px-6 py-2 font-serif text-2xl font-semibold tracking-[0.45em] text-[#24439c]">
              {billet.code}
            </p>

            <div className="mt-8">
              <a
                href={`/livre-dor?code=${billet.code}`}
                className="block w-full rounded-sm bg-[#24439c] px-4 py-3 text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#1a3277]"
              >
                Ouvrir le livre d&apos;or
              </a>
            </div>
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

            <p className="text-[10px] font-semibold tracking-[0.35em] text-[#24439c] uppercase">Billet d&apos;entrée personnel</p>
            <p className="mt-3 font-script text-4xl">{billet.nom_complet}</p>
            {date && (
              <p className="mt-2 font-serif text-xs tracking-[0.25em] text-[#5c5343]">
                {formatDateDots(billet.date_debut)} — {date.time}
              </p>
            )}

            <div className="my-7 border-t border-dashed border-[#8a7360]/50" />

            <div className="flex justify-center">
              <div className="rounded-sm border-2 border-[#e0af2e] bg-white p-3">
                <QRCodeSVG value={billetUrl} size={132} fgColor="#1a3277" bgColor="#ffffff" />
              </div>
            </div>
            <p className="mt-4 text-[10px] tracking-[0.25em] text-[#8a7360] uppercase">
              À présenter à l&apos;entrée
            </p>
            <p className="mt-2 text-[10px] tracking-[0.25em] text-[#8a7360] uppercase">
              Code invité : <span className="font-semibold text-[#24439c]">{billet.code}</span>
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
      <PaperGrain className="pointer-events-none fixed inset-0 z-40" />
    </motion.main>
  );
}
