import type { Metadata } from "next";
import { Great_Vibes, Cormorant_Garamond } from "next/font/google";

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "Livre d'or — Diane & Martial",
  description: "Laissez un message ou une photo aux mariés.",
};

export default function LivreDorLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${greatVibes.variable} ${cormorant.variable}`}>{children}</div>;
}
