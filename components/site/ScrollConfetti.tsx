"use client";

import { useEffect, useRef, useState } from "react";

type Particle = {
  id: number;
  left: number; // % de la largeur
  size: number; // px
  color: string;
  duration: number; // s
  drift: number; // dérive horizontale en px
  spin: number; // rotation totale en deg
  shape: "petal" | "dot" | "ribbon";
};

// Dominance jaune-or et bleu royal (couleurs du mariage), relevés de tons papier
const COLORS = ["#e0af2e", "#24439c", "#c8a862", "#ede0b7", "#3a5cc0", "#d29a6b"];

let nextId = 0;

function makeBurst(count: number): Particle[] {
  return Array.from({ length: count }, () => {
    const shapes: Particle["shape"][] = ["petal", "dot", "ribbon"];
    return {
      id: nextId++,
      left: Math.random() * 100,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      duration: 2.6 + Math.random() * 1.8,
      drift: (Math.random() - 0.5) * 160,
      spin: (Math.random() - 0.5) * 720,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  });
}

/**
 * Pluie de confettis / pétales déclenchée à chaque scroll : chaque geste
 * de défilement lâche une petite volée dorée qui traverse l'écran.
 */
export function ScrollConfetti() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const lastBurst = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    function onScroll() {
      const now = Date.now();
      if (now - lastBurst.current < 650) return;
      lastBurst.current = now;

      const burst = makeBurst(9);
      setParticles((prev) => [...prev.slice(-40), ...burst]);

      const maxDuration = Math.max(...burst.map((p) => p.duration));
      const ids = new Set(burst.map((p) => p.id));
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !ids.has(p.id)));
      }, maxDuration * 1000 + 200);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden" aria-hidden>
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti absolute top-0"
          style={
            {
              left: `${p.left}%`,
              width: p.shape === "ribbon" ? p.size * 0.45 : p.size,
              height: p.shape === "ribbon" ? p.size * 1.6 : p.size,
              background: p.color,
              borderRadius: p.shape === "dot" ? "50%" : p.shape === "petal" ? "50% 0 50% 50%" : "1px",
              boxShadow: p.shape === "dot" ? `0 0 ${p.size}px ${p.color}88` : undefined,
              animationDuration: `${p.duration}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
