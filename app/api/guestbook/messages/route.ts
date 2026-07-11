import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findGuest } from "@/lib/guestbookServer";

/**
 * Supprime le message texte d'une entrée du livre d'or — réservé à l'invité qui l'a
 * lui-même déposé. Si l'entrée porte aussi des photos, elles sont conservées (seul le
 * texte est retiré) ; sinon l'entrée, devenue vide, est supprimée.
 */
export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { identifier, entryId } = (body ?? {}) as { identifier?: unknown; entryId?: unknown };
  if (typeof identifier !== "string" || !identifier.trim() || typeof entryId !== "string" || !entryId.trim()) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const guest = await findGuest(supabase, identifier);
  if (!guest) {
    return NextResponse.json(
      { error: "Aucun invité ne correspond. Vérifiez le nom exact de votre billet ou votre code invité." },
      { status: 403 },
    );
  }

  const { data: entry } = await supabase
    .from("guestbook_entries")
    .select("id, guest_id")
    .eq("id", entryId)
    .maybeSingle();

  // On ne révèle pas si l'entrée existe pour un autre invité : même message dans les deux cas.
  if (!entry || entry.guest_id !== guest.id) {
    return NextResponse.json({ error: "Ce message ne vous appartient pas." }, { status: 403 });
  }

  const { count: photoCount } = await supabase
    .from("guestbook_photos")
    .select("id", { count: "exact", head: true })
    .eq("entry_id", entry.id);

  const { error } =
    photoCount && photoCount > 0
      ? await supabase.from("guestbook_entries").update({ message: null }).eq("id", entry.id)
      : await supabase.from("guestbook_entries").delete().eq("id", entry.id);

  if (error) {
    return NextResponse.json({ error: "Échec de la suppression du message." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
