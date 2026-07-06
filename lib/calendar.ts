function toGoogleDate(iso: string) {
  return iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function buildGoogleCalendarUrl(params: {
  titre: string;
  dateDebut: string;
  dateFin?: string | null;
  lieu?: string | null;
  description?: string | null;
}) {
  const debut = toGoogleDate(params.dateDebut);
  const fin = params.dateFin
    ? toGoogleDate(params.dateFin)
    : toGoogleDate(new Date(new Date(params.dateDebut).getTime() + 3 * 60 * 60 * 1000).toISOString());

  const search = new URLSearchParams({
    action: "TEMPLATE",
    text: params.titre,
    dates: `${debut}/${fin}`,
  });

  if (params.lieu) search.set("location", params.lieu);
  if (params.description) search.set("details", params.description);

  return `https://calendar.google.com/calendar/render?${search.toString()}`;
}
