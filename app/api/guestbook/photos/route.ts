import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findGuest, photosRestantes } from "@/lib/guestbookServer";
import { GUESTBOOK_BUCKET } from "@/lib/guestbook";

/** Supprime une photo du livre d'or — réservé à l'invité qui l'a lui-même déposée. */
export async function DELETE(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const { identifier, photoId } = (body ?? {}) as { identifier?: unknown; photoId?: unknown };
  if (typeof identifier !== "string" || !identifier.trim() || typeof photoId !== "string" || !photoId.trim()) {
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

  const { data: photo } = await supabase
    .from("guestbook_photos")
    .select("id, path, entry_id, guest_id")
    .eq("id", photoId)
    .maybeSingle();

  // On ne révèle pas si la photo existe pour un autre invité : même message dans les deux cas.
  if (!photo || photo.guest_id !== guest.id) {
    return NextResponse.json({ error: "Cette photo ne vous appartient pas." }, { status: 403 });
  }

  const { error: storageError } = await supabase.storage.from(GUESTBOOK_BUCKET).remove([photo.path]);
  if (storageError) {
    return NextResponse.json({ error: "Échec de la suppression de la photo." }, { status: 500 });
  }

  const { error: dbError } = await supabase.from("guestbook_photos").delete().eq("id", photo.id);
  if (dbError) {
    return NextResponse.json({ error: "Échec de la suppression de la photo." }, { status: 500 });
  }

  // Si l'entrée n'a ni message ni photo restante, elle est vide : on la retire aussi.
  const { data: entry } = await supabase
    .from("guestbook_entries")
    .select("id, message")
    .eq("id", photo.entry_id)
    .maybeSingle();
  if (entry && !entry.message) {
    const { count } = await supabase
      .from("guestbook_photos")
      .select("id", { count: "exact", head: true })
      .eq("entry_id", entry.id);
    if (!count) {
      await supabase.from("guestbook_entries").delete().eq("id", entry.id);
    }
  }

  return NextResponse.json({
    ok: true,
    photosRestantes: await photosRestantes(supabase, guest.id),
  });
}
