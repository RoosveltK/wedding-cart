/**
 * Éléments décoratifs du thème « collage vintage » repris de l'affiche :
 * papier déchiré, fleurs séchées, coup de pinceau, ruban kraft, grain papier.
 */

export const PALETTE = {
  paper: "#efe7d7",
  paperDeep: "#e7dcc6",
  ink: "#332e25",
  inkSoft: "#5c5343",
  brush: "#8a7360",
  gold: "#c8a862",
  kraft: "#d29a6b",
  bloom: "#ede0b7",
  bloomDeep: "#d8c68e",
  stem: "#8f8055",
  // Couleurs du mariage : bleu royal & jaune-or
  royal: "#24439c",
  royalDeep: "#1a3277",
  or: "#e0af2e",
};

/** Bord de papier déchiré, à poser au-dessus d'une photo (pointe vers le haut). */
export function TornEdge({
  className,
  fill = PALETTE.paper,
  flip = false,
}: {
  className?: string;
  fill?: string;
  flip?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 1200 70"
      preserveAspectRatio="none"
      className={className}
      style={flip ? { transform: "scaleY(-1)" } : undefined}
      aria-hidden
    >
      <path
        d="M0 70 L0 34 L38 28 L61 37 L92 22 L131 30 L170 18 L212 33 L255 24 L294 36 L338 20 L382 31 L419 15 L466 29 L509 21 L552 35 L590 19 L634 30 L676 16 L719 32 L764 22 L806 36 L848 18 L893 28 L934 14 L979 30 L1022 20 L1065 34 L1105 17 L1148 29 L1200 24 L1200 70 Z"
        fill={fill}
      />
      <path
        d="M0 34 L38 28 L61 37 L92 22 L131 30 L170 18 L212 33 L255 24 L294 36 L338 20 L382 31 L419 15 L466 29 L509 21 L552 35 L590 19 L634 30 L676 16 L719 32 L764 22 L806 36 L848 18 L893 28 L934 14 L979 30 L1022 20 L1065 34 L1105 17 L1148 29 L1200 24"
        fill="none"
        stroke="#00000018"
        strokeWidth="2"
      />
    </svg>
  );
}

/** Coup de pinceau taupe derrière « LE MARIAGE DE ». */
export function BrushStroke({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 420 90" className={className} aria-hidden>
      <path
        d="M18 52 C36 30 96 24 168 24 C250 24 340 20 396 34 C412 38 414 52 400 60 C356 78 268 72 196 74 C124 76 48 78 24 66 C10 59 8 60 18 52 Z"
        fill={PALETTE.brush}
        opacity="0.92"
      />
      <path
        d="M30 60 C60 70 150 68 210 66 M60 32 C130 26 300 24 380 36"
        stroke="#6f5a49"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.35"
        fill="none"
      />
    </svg>
  );
}

/** Une tête de fleur séchée (petites corolles crème type gypsophile). */
function Bloom({ x, y, r, tone = PALETTE.bloom }: { x: number; y: number; r: number; tone?: string }) {
  const petals = Array.from({ length: 6 }, (_, i) => (i * 360) / 6);
  return (
    <g transform={`translate(${x} ${y})`}>
      {petals.map((a) => (
        <ellipse
          key={a}
          cx={0}
          cy={-r * 0.75}
          rx={r * 0.52}
          ry={r * 0.8}
          fill={tone}
          stroke={PALETTE.bloomDeep}
          strokeWidth="0.6"
          transform={`rotate(${a})`}
        />
      ))}
      <circle r={r * 0.34} fill={PALETTE.bloomDeep} />
    </g>
  );
}

/** Branche de fleurs séchées, comme sur le bord gauche de l'affiche. */
export function DriedFlowers({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 340" className={className} aria-hidden>
      <g stroke={PALETTE.stem} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.9">
        <path d="M30 330 C50 250 60 190 96 128" />
        <path d="M30 330 C60 270 96 230 148 196" />
        <path d="M30 330 C40 260 34 200 52 140" />
        <path d="M74 240 C96 214 118 200 150 190" strokeWidth="1.6" />
        <path d="M56 200 C70 176 84 160 104 146" strokeWidth="1.6" />
        <path d="M46 250 C36 220 36 196 42 168" strokeWidth="1.6" />
      </g>
      <Bloom x={96} y={122} r={16} />
      <Bloom x={128} y={96} r={13} tone="#f2e8c8" />
      <Bloom x={72} y={104} r={12} />
      <Bloom x={150} y={132} r={12} tone="#f2e8c8" />
      <Bloom x={110} y={158} r={11} />
      <Bloom x={152} y={188} r={14} />
      <Bloom x={182} y={158} r={11} tone="#f2e8c8" />
      <Bloom x={52} y={136} r={11} tone="#f2e8c8" />
      <Bloom x={42} y={164} r={9} />
      <Bloom x={186} y={196} r={9} />
      <Bloom x={104} y={144} r={8} tone="#f2e8c8" />
    </svg>
  );
}

/** Morceau de ruban / papier kraft froissé façon washi tape. */
export function WashiTape({
  className,
  rotate = -6,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 160 44"
      className={className}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <path
        d="M6 8 L152 2 L156 34 L10 42 Z"
        fill={PALETTE.kraft}
        opacity="0.85"
      />
      <path d="M22 6 L26 40 M58 5 L61 39 M96 4 L99 38 M132 3 L135 36" stroke="#b07f4e" strokeWidth="1.4" opacity="0.5" />
    </svg>
  );
}

/** Grain de papier à poser en overlay (pointer-events none). */
export function PaperGrain({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={className}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/** Petit ornement « brin » pour séparer les sections. */
export function SprigDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 36" className={className} aria-hidden>
      <path d="M10 18 H86 M134 18 H210" stroke={PALETTE.gold} strokeWidth="1" />
      <g stroke={PALETTE.stem} strokeWidth="1.4" fill="none" strokeLinecap="round">
        <path d="M96 26 C104 18 112 14 124 12" />
        <path d="M100 22 C102 16 102 12 100 8" />
        <path d="M108 19 C112 14 118 12 124 12" />
      </g>
      <circle cx="124" cy="12" r="3.4" fill={PALETTE.bloomDeep} />
      <circle cx="100" cy="8" r="2.6" fill={PALETTE.bloom} stroke={PALETTE.bloomDeep} strokeWidth="0.6" />
      <circle cx="96" cy="26" r="2.2" fill={PALETTE.bloom} stroke={PALETTE.bloomDeep} strokeWidth="0.6" />
    </svg>
  );
}
