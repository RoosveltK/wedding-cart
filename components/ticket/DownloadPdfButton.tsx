"use client";

import { useCallback, useEffect, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { InvitationPdf } from "./InvitationPdf";
import { guestbookUrl } from "@/lib/guestbook";
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
  const [guestbookQrDataUrl, setGuestbookQrDataUrl] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    QRCode.toDataURL(billetUrl, { margin: 1, width: 300 }).then(setQrDataUrl);
    // QR du livre d'or : arrive sur /livre-dor avec le code de l'invité pré-rempli.
    try {
      const url = guestbookUrl(new URL(billetUrl).origin, billet.code);
      QRCode.toDataURL(url, { margin: 1, width: 300, color: { dark: "#1a3277" } })
        .then(setGuestbookQrDataUrl)
        .catch(() => setGuestbookQrDataUrl(null));
    } catch {
      setGuestbookQrDataUrl(null);
    }
    // La photo est optionnelle : si le chargement échoue, le PDF sort sans elle.
    toDataUrl("/images/maries.jpg").then(setPhotoDataUrl).catch(() => setPhotoDataUrl(null));
  }, [billetUrl, billet.code]);

  const download = useCallback(async () => {
    if (!qrDataUrl) return;
    setGenerating(true);
    try {
      const blob = await pdf(
        <InvitationPdf
          billet={billet}
          qrDataUrl={qrDataUrl}
          guestbookQrDataUrl={guestbookQrDataUrl}
          photoDataUrl={photoDataUrl}
        />,
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
  }, [billet, billetUrl, qrDataUrl, guestbookQrDataUrl, photoDataUrl]);

  return { ready: Boolean(qrDataUrl), generating, download };
}

export function DownloadPdfButton({ billet, billetUrl }: { billet: Billet; billetUrl: string }) {
  const { ready, generating, download } = useBilletPdf(billet, billetUrl);

  return (
    <button
      onClick={download}
      disabled={!ready || generating}
      className="w-full rounded-sm bg-[#24439c] px-4 py-3 text-[11px] tracking-[0.25em] text-[#f6efe2] uppercase transition hover:bg-[#1a3277] disabled:opacity-50"
    >
      {generating ? "Génération..." : "Télécharger mon billet (PDF)"}
    </button>
  );
}
