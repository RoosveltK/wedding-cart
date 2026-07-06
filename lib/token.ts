import { customAlphabet } from "nanoid";

// Alphabet sans caractères ambigus, 24 caractères => entropie largement suffisante
// pour empêcher de deviner le lien d'un autre invité.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const generateGuestToken = customAlphabet(alphabet, 24);
