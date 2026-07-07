export function WaxSeal({ size = 72, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="waxBody" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#3a5cc0" />
          <stop offset="55%" stopColor="#24439c" />
          <stop offset="100%" stopColor="#14265c" />
        </radialGradient>
        <radialGradient id="waxShine" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Blob de cire à bords irréguliers, comme une empreinte de sceau pressée à la main */}
      <path
        d="M105.9 48.5
           Q112 60 105.9 71.5
           Q99.8 83 93.15 94.45
           Q86.5 105.9 73.25 105.45
           Q60 105 46.5 105.9
           Q33 106.8 27.45 94.4
           Q21.9 82 14.95 71
           Q8 60 14.5 48.75
           Q21 37.5 27.25 25.8
           Q33.5 14.1 46.75 14.55
           Q60 15 73.5 14.1
           Q87 13.2 93.4 25.1
           Q99.8 37 105.9 48.5 Z"
        fill="url(#waxBody)"
      />
      <ellipse cx="46" cy="40" rx="30" ry="20" fill="url(#waxShine)" />

      {/* Anneaux gravés */}
      <circle cx="60" cy="60" r="38" fill="none" stroke="#0f1c45" strokeOpacity="0.5" strokeWidth="1" />
      <circle cx="60" cy="60" r="33" fill="none" stroke="#e0af2e" strokeOpacity="0.7" strokeWidth="0.75" />

      {/* Petits motifs floraux évoquant une rosette gravée */}
      {[0, 60, 120, 180, 240, 300].map((angle) => (
        <ellipse
          key={angle}
          cx="60"
          cy="34"
          rx="4"
          ry="7"
          fill="#e0af2e"
          fillOpacity="0.28"
          transform={`rotate(${angle} 60 60)`}
        />
      ))}

      <text
        x="60"
        y="68"
        textAnchor="middle"
        fontSize="22"
        fill="#e0af2e"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontStyle="italic"
        letterSpacing="1"
      >
        D&amp;M
      </text>
    </svg>
  );
}
