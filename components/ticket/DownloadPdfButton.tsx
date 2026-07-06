"use client";

import { useCallback, useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { InvitationPdf } from "./InvitationPdf";
import type { Database } from "@/lib/supabase/database.types";

type Billet = Database["public"]["Functions"]["get_billet"]["Returns"][number];

async function toDataUrl(url: string): Promise<string> {
  const blob = await fetch(url).then((r) => r.blob());
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/** Prépare le QR + la photo puis génère le billet PDF à la demande. */
export function useBilletPdf(billet: Billet, billetUrl: string) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(billetUrl, { margin: 1, width: 300 }).then(setQrDataUrl);
    // La photo est optionnelle : si le chargement échoue, le PDF sort sans elle.
    toDataUrl("/images/maries.jpg").then(setPhotoDataUrl).catch(() => setPhotoDataUrl(null));
  }, [billetUrl]);

  const download = useCallback(async () => {
    if (!qrDataUrl) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvitationPdf billet={billet} qrDataUrl={qrDataUrl} photoDataUrl={photoDataUrl} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `billet-${billet.nom_complet.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setGenerating(false);
    }
  }, [billet, billetUrl, qrDataUrl, photoDataUrl]);

  return { ready: Boolean(qrDataUrl), generating, download };
}

export function DownloadPdfButton({ billet, billetUrl }: { billet: Billet; billetUrl: string }) {
  const { ready, generating, download } = useBilletPdf(billet, billetUrl);

  return (
    <button
      onClick={download}
      disabled={!ready || generating}
      className="w-full rounded-sm bg-[#8a7360] px-4 py-3 text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#6f5a49] disabled:opacity-50"
    >
      {generating ? "Génération..." : "Télécharger mon billet (PDF)"}
    </button>
  );
}

/** Bouton flottant : le billet se télécharge sans devoir dérouler toute la page. */
export function FloatingDownloadButton({
  billet,
  billetUrl,
}: {
  billet: Billet;
  billetUrl: string;
}) {
  const { ready, generating, download } = useBilletPdf(billet, billetUrl);

  return (
    <button
      onClick={download}
      disabled={!ready || generating}
      aria-label="Télécharger mon billet en PDF"
      className="pointer-events-auto flex items-center gap-2 rounded-full bg-[#332e25] py-3 pl-4 pr-5 text-[10px] tracking-[0.2em] text-[#f6efe2] uppercase shadow-[0_10px_24px_rgba(51,46,37,0.4)] transition hover:bg-[#4a4335] disabled:opacity-60"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M12 3v12m0 0 4-4m-4 4-4-4" />
        <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>
      {generating ? "Génération..." : "Mon billet"}
    </button>
  );
}
