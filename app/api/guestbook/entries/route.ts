import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { findGuest, photosRestantes, storagePlein } from "@/lib/guestbookServer";
import {
  GUESTBOOK_BUCKET,
  MAX_MESSAGE_LONGUEUR,
  MAX_TAILLE_PHOTO,
} from "@/lib/guestbook";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
};

/** Dépose une entrée du livre d'or : message et/ou photos, avec quotas contrôlés côté serveur. */
export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const identifier = form.get("identifier");
  const messageRaw = form.get("message");
  const photos = form.getAll("photos").filter((p): p is File => p instanceof File && p.size > 0);

  if (typeof identifier !== "string" || !identifier.trim()) {
    return NextResponse.json({ error: "Identifiez-vous d'abord (nom du billet ou code)." }, { status: 400 });
  }

  const message = typeof messageRaw === "string" ? messageRaw.trim() : "";
  if (!message && photos.length === 0) {
    return NextResponse.json({ error: "Écrivez un message ou ajoutez au moins une photo." }, { status: 400 });
  }
  if (message.length > MAX_MESSAGE_LONGUEUR) {
    return NextResponse.json(
      { error: `Le message ne doit pas dépasser ${MAX_MESSAGE_LONGUEUR} caractères.` },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const guest = await findGuest(supabase, identifier);
  if (!guest) {
    return NextResponse.json(
      { error: "Aucun invité ne correspond. Vérifiez le nom exact de votre billet ou votre code invité à 5 caractères." },
      { status: 403 },
    );
  }

  // ——— Validation des photos ———
  if (photos.length > 0) {
    if (await storagePlein(supabase)) {
      return NextResponse.json(
        { error: "L'espace photos est plein : seuls les messages écrits sont encore acceptés.", storagePlein: true },
        { status: 400 },
      );
    }

    const restantes = await photosRestantes(supabase, guest.id);
    if (photos.length > restantes) {
      return NextResponse.json(
        {
          error:
            restantes === 0
              ? "Vous avez déjà utilisé vos 5 photos. Vous pouvez encore laisser un message écrit."
              : `Il ne vous reste que ${restantes} photo(s) sur 5.`,
        },
        { status: 400 },
      );
    }

    for (const photo of photos) {
      if (!EXTENSIONS[photo.type]) {
        return NextResponse.json({ error: "Seules les images (JPEG, PNG, WebP…) sont acceptées." }, { status: 400 });
      }
      if (photo.size > MAX_TAILLE_PHOTO) {
        return NextResponse.json({ error: "Chaque photo doit faire moins de 3 Mo." }, { status: 400 });
      }
    }
  }

  // ——— Upload des photos puis insertion ———
  const uploaded: { path: string; size: number }[] = [];
  for (const photo of photos) {
    const path = `${guest.id}/${crypto.randomUUID()}.${EXTENSIONS[photo.type]}`;
    const { error } = await supabase.storage.from(GUESTBOOK_BUCKET).upload(path, photo, {
      contentType: photo.type,
    });
    if (error) {
      // Nettoyage best effort de ce qui a déjà été envoyé
      if (uploaded.length > 0) {
        await supabase.storage.from(GUESTBOOK_BUCKET).remove(uploaded.map((u) => u.path));
      }
      return NextResponse.json({ error: "Échec de l'envoi d'une photo. Réessayez." }, { status: 500 });
    }
    uploaded.push({ path, size: photo.size });
  }

  const { data: entry, error: entryError } = await supabase
    .from("guestbook_entries")
    .insert({ guest_id: guest.id, message: message || null })
    .select("id")
    .single();

  if (entryError || !entry) {
    if (uploaded.length > 0) {
      await supabase.storage.from(GUESTBOOK_BUCKET).remove(uploaded.map((u) => u.path));
    }
    return NextResponse.json({ error: "Échec de l'enregistrement du message. Réessayez." }, { status: 500 });
  }

  if (uploaded.length > 0) {
    const { error: photosError } = await supabase.from("guestbook_photos").insert(
      uploaded.map((u) => ({
        entry_id: entry.id,
        guest_id: guest.id,
        path: u.path,
        size_bytes: u.size,
      })),
    );
    if (photosError) {
      await supabase.storage.from(GUESTBOOK_BUCKET).remove(uploaded.map((u) => u.path));
      await supabase.from("guestbook_entries").delete().eq("id", entry.id);
      return NextResponse.json({ error: "Échec de l'enregistrement des photos. Réessayez." }, { status: 500 });
    }
  }

  return NextResponse.json({
    ok: true,
    photosRestantes: await photosRestantes(supabase, guest.id),
  });
}
