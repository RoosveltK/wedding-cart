export function formatDateDots(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())} . ${pad(d.getMonth() + 1)} . ${d.getFullYear()}`;
}

/** Décompose une date ISO en morceaux façon affiche : SEPTEMBRE / SAMEDI / 25 / 2022. */
export function formatPosterDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  const fr = (opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("fr-FR", opts).format(d);
  return {
    month: fr({ month: "long" }).toUpperCase(),
    weekday: fr({ weekday: "long" }).toUpperCase(),
    day: String(d.getDate()).padStart(2, "0"),
    year: String(d.getFullYear()),
    time: formatTime(iso),
  };
}

export function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getHours())}h${pad(d.getMinutes())}`;
}
