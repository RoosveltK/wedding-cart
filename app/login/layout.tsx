import { Great_Vibes } from "next/font/google";

// Fournit --font-script à la page de connexion (monogramme et titre).
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <div className={greatVibes.variable}>{children}</div>;
}
