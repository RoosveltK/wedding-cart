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

export default function BilletLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${greatVibes.variable} ${cormorant.variable}`}>{children}</div>;
}
