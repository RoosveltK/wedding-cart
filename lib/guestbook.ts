/** Règles et helpers du livre d'or, partagés entre la page publique, les routes API et l'admin. */

export const MAX_PHOTOS_PAR_INVITE = 5;
export const MAX_TAILLE_PHOTO = 3 * 1024 * 1024; // 3 Mo
export const MAX_MESSAGE_LONGUEUR = 1000;
export const GUESTBOOK_BUCKET = "guestbook";

/** Seuil (en octets) au-delà duquel le stockage est considéré saturé : médias bloqués, textes OK. */
export function storageLimitBytes() {
  const mb = Number(process.env.GUESTBOOK_STORAGE_LIMIT_MB ?? 850);
  return (Number.isFinite(mb) && mb > 0 ? mb : 850) * 1024 * 1024;
}

/** Normalise un nom pour la vérification : minuscules, sans accents, espaces réduits. */
export function normalizeNom(nom: string) {
  return nom
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

/** Un code invité : 5 caractères alphanumériques (lettres et chiffres, insensible à la casse). */
export function isCode(identifier: string) {
  return /^[0-9A-Z]{5}$/.test(identifier.trim().toUpperCase());
}

/** URL publique d'une photo du bucket guestbook. */
export function guestbookPhotoUrl(path: string) {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${GUESTBOOK_BUCKET}/${path}`;
}

/** URL de la page livre d'or, avec le code de l'invité pré-rempli. */
export function guestbookUrl(origin: string, code?: string) {
  return code ? `${origin}/livre-dor?code=${code}` : `${origin}/livre-dor`;
}

export type GuestbookVerifyResponse = {
  id: string;
  nom: string;
  code: string;
  photosRestantes: number;
  storagePlein: boolean;
  hasMessage: boolean;
};

/** Une photo du mur, regroupée par invité. */
export type GuestbookPhotoItem = { id: string; path: string };

/** Un message du mur (un invité peut en avoir déposé plusieurs). */
export type GuestbookMessageItem = { id: string; message: string; created_at: string };

/** Tous les souvenirs (messages + photos) d'un même invité, tels que renvoyés par `get_guestbook`. */
export type GuestbookGroup = {
  guest_id: string;
  nom_complet: string;
  entries: GuestbookMessageItem[];
  photos: GuestbookPhotoItem[];
  last_activity: string;
};
