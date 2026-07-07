import {
  Document,
  Page,
  View,
  Text,
  Image,
  Font,
  StyleSheet,
  Svg,
  Path,
  Circle,
  Rect,
  Line,
} from "@react-pdf/renderer";
import { formatPosterDate } from "@/lib/format";
import type { Database } from "@/lib/supabase/database.types";

type Billet = Database["public"]["Functions"]["get_billet"]["Returns"][number];

let fontsRegistered = false;
function registerFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  // Le moteur PDF (fontkit) ne lit pas le woff2 : il faut du TTF,
  // sinon les textes disparaissent silencieusement du document.
  Font.register({
    family: "GreatVibes",
    src: "/fonts/GreatVibes-Regular.ttf",
  });
  Font.register({
    family: "CormorantGaramond",
    fonts: [
      { src: "/fonts/CormorantGaramond-Medium.ttf", fontWeight: 500 },
      { src: "/fonts/CormorantGaramond-SemiBold.ttf", fontWeight: 600 },
    ],
  });
}

// A5 portrait en points (72dpi) : 148 x 210 mm — même format que l'affiche.
const W = 419.53;
const H = 595.28;
const PHOTO_H = 235;

const C = {
  paper: "#efe7d7",
  ink: "#332e25",
  inkSoft: "#5c5343",
  brush: "#8a7360",
  brushText: "#f6efe2",
  gold: "#c8a862",
  kraft: "#d29a6b",
  bloom: "#ede0b7",
  bloomDeep: "#d8c68e",
  stem: "#8f8055",
  // Couleurs du mariage
  royal: "#24439c",
  or: "#e0af2e",
};

const styles = StyleSheet.create({
  page: {
    width: W,
    height: H,
    backgroundColor: C.paper,
    fontFamily: "CormorantGaramond",
    position: "relative",
  },
  photo: {
    position: "absolute",
    top: 0,
    left: 0,
    width: W,
    height: PHOTO_H,
    objectFit: "cover",
  },
  veil: {
    position: "absolute",
    top: 0,
    left: 0,
    width: W,
    height: PHOTO_H,
    backgroundColor: "#f4ecdd",
    opacity: 0.22,
  },
  brushWrap: {
    position: "absolute",
    top: 168,
    left: (W - 264) / 2,
    width: 264,
    height: 57,
  },
  brushText: {
    position: "absolute",
    top: 188,
    left: 0,
    width: W,
    textAlign: "center",
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 5,
    color: C.brushText,
    textTransform: "uppercase",
  },
  content: {
    position: "absolute",
    top: PHOTO_H + 18,
    left: 0,
    width: W,
    alignItems: "center",
    textAlign: "center",
  },
  names: {
    fontFamily: "GreatVibes",
    fontSize: 37,
    color: C.ink,
  },
  month: {
    marginTop: 16,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 6,
    color: C.royal,
  },
  dateRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },
  dateSide: {
    fontSize: 8.5,
    letterSpacing: 3,
    color: C.ink,
    textTransform: "uppercase",
  },
  dateDay: {
    fontSize: 30,
    fontWeight: 600,
    color: C.royal,
    borderLeftWidth: 1.4,
    borderRightWidth: 1.4,
    borderColor: C.or,
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  year: {
    marginTop: 12,
    fontSize: 15,
    letterSpacing: 6,
    color: C.ink,
  },
  lieu: {
    marginTop: 12,
    fontSize: 8,
    letterSpacing: 2.5,
    color: C.inkSoft,
    textTransform: "uppercase",
    maxWidth: 280,
    lineHeight: 1.6,
  },
  ticketZone: {
    position: "absolute",
    bottom: 16,
    left: 0,
    width: W,
    alignItems: "center",
  },
  guestEyebrow: {
    fontSize: 7.5,
    letterSpacing: 2.5,
    color: C.inkSoft,
    textTransform: "uppercase",
    marginBottom: 3,
  },
  guestName: {
    fontFamily: "GreatVibes",
    fontSize: 24,
    color: C.royal,
    marginBottom: 7,
  },
  qr: {
    width: 66,
    height: 66,
    padding: 4,
    backgroundColor: "#ffffff",
    borderWidth: 1.4,
    borderColor: C.or,
  },
  qrHint: {
    marginTop: 5,
    fontSize: 6.5,
    letterSpacing: 2,
    color: C.royal,
    textTransform: "uppercase",
  },
});

/** Fleur séchée simplifiée : 6 pétales ronds autour d'un cœur. */
function PdfBloom({
  x,
  y,
  r,
  tone = C.bloom,
}: {
  x: number;
  y: number;
  r: number;
  tone?: string;
}) {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3;
    return { cx: x + Math.sin(a) * r * 0.72, cy: y - Math.cos(a) * r * 0.72 };
  });
  return (
    <>
      {petals.map((p, i) => (
        <Circle
          key={i}
          cx={String(p.cx)}
          cy={String(p.cy)}
          r={String(r * 0.48)}
          fill={tone}
          stroke={C.bloomDeep}
          strokeWidth="0.5"
        />
      ))}
      <Circle
        cx={String(x)}
        cy={String(y)}
        r={String(r * 0.3)}
        fill={C.bloomDeep}
      />
    </>
  );
}

export function InvitationPdf({
  billet,
  qrDataUrl,
  photoDataUrl,
}: {
  billet: Billet;
  qrDataUrl: string;
  photoDataUrl: string | null;
}) {
  registerFonts();
  const date = formatPosterDate(billet.date_debut);

  return (
    <Document>
      <Page size={[W, H]} style={styles.page}>
        {/* Photo voilée en haut, comme sur l'affiche */}
        {photoDataUrl && (
          <>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de @react-pdf/renderer */}
            <Image src={photoDataUrl} style={styles.photo} />
            <View style={styles.veil} />
          </>
        )}

        {/* Bord de papier déchiré entre la photo et le papier */}
        <Svg
          viewBox="0 0 1200 70"
          preserveAspectRatio="none"
          style={{
            position: "absolute",
            top: PHOTO_H - 32,
            left: 0,
            width: W,
            height: 34,
          }}
        >
          <Path
            d="M0 70 L0 34 L38 28 L61 37 L92 22 L131 30 L170 18 L212 33 L255 24 L294 36 L338 20 L382 31 L419 15 L466 29 L509 21 L552 35 L590 19 L634 30 L676 16 L719 32 L764 22 L806 36 L848 18 L893 28 L934 14 L979 30 L1022 20 L1065 34 L1105 17 L1148 29 L1200 24 L1200 70 Z"
            fill={C.paper}
          />
        </Svg>

        {/* Coup de pinceau bleu royal + « LE MARIAGE DE » */}
        <Svg viewBox="0 0 420 90" style={styles.brushWrap}>
          <Path
            d="M18 52 C36 30 96 24 168 24 C250 24 340 20 396 34 C412 38 414 52 400 60 C356 78 268 72 196 74 C124 76 48 78 24 66 C10 59 8 60 18 52 Z"
            fill={C.royal}
            opacity="0.95"
          />
        </Svg>
        <Text style={styles.brushText}>Le mariage de</Text>

        {/* Branche de fleurs séchées sur la gauche */}
        <Svg
          viewBox="0 0 220 340"
          style={{
            position: "absolute",
            top: 178,
            left: -26,
            width: 132,
            height: 204,
          }}
        >
          <Path
            d="M30 330 C50 250 60 190 96 128"
            stroke={C.stem}
            strokeWidth="2.4"
            fill="none"
          />
          <Path
            d="M30 330 C60 270 96 230 148 196"
            stroke={C.stem}
            strokeWidth="2.4"
            fill="none"
          />
          <Path
            d="M30 330 C40 260 34 200 52 140"
            stroke={C.stem}
            strokeWidth="2.4"
            fill="none"
          />
          <PdfBloom x={96} y={122} r={16} />
          <PdfBloom x={128} y={96} r={13} tone="#f2e8c8" />
          <PdfBloom x={72} y={104} r={12} />
          <PdfBloom x={150} y={132} r={12} tone="#f2e8c8" />
          <PdfBloom x={110} y={158} r={11} />
          <PdfBloom x={152} y={188} r={14} />
          <PdfBloom x={182} y={158} r={11} tone="#f2e8c8" />
          <PdfBloom x={52} y={136} r={11} tone="#f2e8c8" />
          <PdfBloom x={42} y={164} r={9} />
        </Svg>

        {/* Morceau de kraft façon washi tape */}
        <Svg
          viewBox="0 0 160 44"
          style={{
            position: "absolute",
            top: 400,
            left: -14,
            width: 96,
            height: 27,
          }}
        >
          <Path
            d="M6 8 L152 2 L156 34 L10 42 Z"
            fill={C.kraft}
            opacity="0.85"
          />
        </Svg>

        {/* Bloc central : noms + date, disposition de l'affiche */}
        <View style={styles.content}>
          <Text style={styles.names}>
            {billet.nom_mariee} &amp; {billet.nom_marie}
          </Text>

          {date && (
            <>
              <Text style={styles.month}>{date.month}</Text>
              <View style={styles.dateRow}>
                <Text style={styles.dateSide}>{date.weekday}</Text>
                <Text style={styles.dateDay}>{date.day}</Text>
                <Text style={styles.dateSide}>À {date.time}</Text>
              </View>
              <Text style={styles.year}>{date.year}</Text>
            </>
          )}

          {billet.lieu && <Text style={styles.lieu}>{billet.lieu}</Text>}
        </View>

        {/* Cadre d'apparat aux couleurs du mariage : filet or + filet bleu royal.
            Les Svg sont enveloppés dans des View absolues, sinon react-pdf les
            garde dans le flux et rejette la fin du billet sur une 2e page. */}
        <View
          style={{ position: "absolute", top: 0, left: 0, width: W, height: H }}
        >
          <Svg viewBox={`0 0 ${W} ${H}`} style={{ width: W, height: H }}>
            <Rect
              x="9"
              y="9"
              width={String(W - 18)}
              height={String(H - 18)}
              fill="none"
              stroke={C.or}
              strokeWidth="2.2"
            />
            <Rect
              x="14"
              y="14"
              width={String(W - 28)}
              height={String(H - 28)}
              fill="none"
              stroke={C.royal}
              strokeWidth="0.8"
            />
          </Svg>
        </View>

        {/* Ornement or et bleu au-dessus du nom de l'invité */}
        <View
          style={{
            position: "absolute",
            bottom: 148,
            left: (W - 170) / 2,
            width: 170,
            height: 12,
          }}
        >
          <Svg viewBox="0 0 220 16" style={{ width: 170, height: 12 }}>
            <Line
              x1="10"
              y1="8"
              x2="88"
              y2="8"
              stroke={C.or}
              strokeWidth="1.2"
            />
            <Line
              x1="132"
              y1="8"
              x2="210"
              y2="8"
              stroke={C.or}
              strokeWidth="1.2"
            />
            <Path d="M110 1 L117 8 L110 15 L103 8 Z" fill={C.royal} />
            <Circle cx="93" cy="8" r="2.4" fill={C.or} />
            <Circle cx="127" cy="8" r="2.4" fill={C.or} />
          </Svg>
        </View>

        {/* Zone billet : nom de l'invité bien visible (billet unique) + QR */}
        <View style={styles.ticketZone}>
          <Text style={styles.guestEyebrow}>Billet personnel de</Text>
          <Text style={styles.guestName}>{billet.nom_complet}</Text>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- Image de @react-pdf/renderer */}
          <Image src={qrDataUrl} style={styles.qr} />
          <Text style={styles.qrHint}>Billet unique</Text>
        </View>
      </Page>
    </Document>
  );
}
