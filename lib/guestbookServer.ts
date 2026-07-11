import { createAdminClient } from "@/lib/supabase/admin";
import { isCode, MAX_PHOTOS_PAR_INVITE, normalizeNom, storageLimitBytes } from "@/lib/guestbook";

type AdminClient = ReturnType<typeof createAdminClient>;

export type VerifiedGuest = {
  id: string;
  nom_complet: string;
  code: string;
};

/**
 * Retrouve l'invité à partir de son code à 5 chiffres ou du nom exact du billet
 * (comparaison insensible à la casse et aux accents). Retourne null si inconnu.
 */
export async function findGuest(
  supabase: AdminClient,
  identifier: string,
): Promise<VerifiedGuest | null> {
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  // Un code d'abord ; si rien ne correspond, on retente comme un nom
  // (un prénom de 5 lettres comme « Marie » ressemble aussi à un code).
  if (isCode(trimmed)) {
    const { data } = await supabase
      .from("guests")
      .select("id, nom_complet, code")
      .eq("code", trimmed.toUpperCase())
      .maybeSingle();
    if (data) return data;
  }

  // Liste d'invités d'un mariage : assez petite pour matcher le nom côté serveur.
  const cible = normalizeNom(trimmed);
  if (!cible) return null;
  const { data } = await supabase.from("guests").select("id, nom_complet, code");
  return data?.find((g) => normalizeNom(g.nom_complet) === cible) ?? null;
}

/** Nombre de photos que l'invité peut encore déposer (quota cumulé, toutes sessions). */
export async function photosRestantes(supabase: AdminClient, guestId: string) {
  const { count } = await supabase
    .from("guestbook_photos")
    .select("id", { count: "exact", head: true })
    .eq("guest_id", guestId);
  return Math.max(0, MAX_PHOTOS_PAR_INVITE - (count ?? 0));
}

/** Vrai si l'occupation totale du storage dépasse le seuil : plus de médias, textes seulement. */
export async function storagePlein(supabase: AdminClient) {
  const { data, error } = await supabase.rpc("get_storage_usage");
  // En cas d'échec de la mesure, on bloque les médias par prudence.
  if (error || data === null) return true;
  return data >= storageLimitBytes();
}

/** Vrai si l'invité a déjà laissé un message texte (un seul autorisé, tant qu'il n'est pas supprimé). */
export async function guestHasMessage(supabase: AdminClient, guestId: string) {
  const { count } = await supabase
    .from("guestbook_entries")
    .select("id", { count: "exact", head: true })
    .eq("guest_id", guestId)
    .not("message", "is", null);
  return (count ?? 0) > 0;
}
