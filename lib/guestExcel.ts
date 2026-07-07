import * as XLSX from "xlsx";

export type ImportedGuest = {
  nom_complet: string;
  telephone: string | null;
  table_nom: string | null;
};

const HEADER_ALIASES: Record<string, keyof ImportedGuest> = {
  "nom complet": "nom_complet",
  "nom": "nom_complet",
  "invite": "nom_complet",
  "invité": "nom_complet",
  "telephone": "telephone",
  "téléphone": "telephone",
  "tel": "telephone",
  "table": "table_nom",
};

function normalizeHeader(header: string) {
  return header
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function triggerDownload(data: ArrayBuffer, filename: string) {
  const blob = new Blob([data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadGuestTemplate() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet([
    ["Nom complet", "Téléphone", "Table"],
    ["Jean Dupont", "+237600000000", "Amitié"],
    ["M. et Mme Ekwalla", "", "Courtoisie"],
  ]);
  ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, ws, "Invités");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  triggerDownload(out, "modele-invites.xlsx");
}

export async function parseGuestFile(file: File): Promise<ImportedGuest[]> {
  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

  return rows
    .map((row) => {
      const mapped: Partial<Record<keyof ImportedGuest, string>> = {};
      for (const [key, value] of Object.entries(row)) {
        const field = HEADER_ALIASES[normalizeHeader(key)];
        if (field) mapped[field] = String(value).trim();
      }
      return {
        nom_complet: mapped.nom_complet ?? "",
        telephone: mapped.telephone || null,
        table_nom: mapped.table_nom || null,
      };
    })
    .filter((guest) => guest.nom_complet.length > 0);
}

export function downloadGuestsExport(
  guests: {
    nom_complet: string;
    telephone: string | null;
    table_nom: string | null;
    token: string;
    code: string;
  }[],
  billetUrl: (token: string) => string,
) {
  const wb = XLSX.utils.book_new();
  const rows = [
    ["Nom complet", "Téléphone", "Table", "Code livre d'or", "Lien du billet"],
    ...guests.map((g) => [g.nom_complet, g.telephone ?? "", g.table_nom ?? "", g.code, billetUrl(g.token)]),
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 16 }, { wch: 14 }, { wch: 48 }];
  XLSX.utils.book_append_sheet(wb, ws, "Invités");
  const out = XLSX.write(wb, { bookType: "xlsx", type: "array" }) as ArrayBuffer;
  triggerDownload(out, "invites-diane-martial.xlsx");
}
