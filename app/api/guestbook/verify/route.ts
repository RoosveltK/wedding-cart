import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findGuest, guestHasMessage, photosRestantes, storagePlein } from "@/lib/guestbookServer";
import type { GuestbookVerifyResponse } from "@/lib/guestbook";

/** Vérifie qu'un visiteur est bien un invité (nom du billet ou code à 5 chiffres). */
export async function POST(request: Request) {
  let identifier: unknown;
  try {
    ({ identifier } = await request.json());
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (typeof identifier !== "string" || !identifier.trim()) {
    return NextResponse.json(
      { error: "Renseignez le nom inscrit sur votre billet ou votre code invité." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const guest = await findGuest(supabase, identifier);

  if (!guest) {
    return NextResponse.json(
      { error: "Aucun invité ne correspond. Vérifiez le nom exact de votre billet ou votre code invité à 5 caractères." },
      { status: 404 },
    );
  }

  const [restantes, plein, hasMessage] = await Promise.all([
    photosRestantes(supabase, guest.id),
    storagePlein(supabase),
    guestHasMessage(supabase, guest.id),
  ]);

  const payload: GuestbookVerifyResponse = {
    id: guest.id,
    nom: guest.nom_complet,
    code: guest.code,
    photosRestantes: restantes,
    storagePlein: plein,
    hasMessage,
  };
  return NextResponse.json(payload);
}
