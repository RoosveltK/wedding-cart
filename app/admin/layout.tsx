import { Great_Vibes } from "next/font/google";
import { createClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";

// Monogramme et titres façon papeterie de mariage (fournit --font-script au back-office).
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-script",
});

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className={`${greatVibes.variable} min-h-screen bg-[#f7f4ec]`}>
      {/* Liseré or tout en haut, comme un ruban */}
      <div aria-hidden className="h-1 bg-gradient-to-r from-[#c8a862] via-[#e0af2e] to-[#c8a862]" />

      <header className="sticky top-0 z-10 border-b border-[#e8e2d2] bg-[#fdfcf8]/95 backdrop-blur">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#24439c] font-script text-xl leading-none text-[#f6efe2] shadow-[0_0_0_2px_#fdfcf8,0_0_0_3.5px_#e0af2e]">
                D&amp;M
              </div>
              <div>
                <p className="font-script text-2xl leading-none text-[#332e25]">Diane &amp; Martial</p>
                <p className="mt-1 text-[11px] tracking-[0.18em] text-[#8a7f6a] uppercase">
                  Espace des mariés
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <span className="hidden text-xs text-[#8a7f6a] sm:block">{user?.email}</span>
              <span aria-hidden className="hidden h-4 w-px bg-[#e3dccb] sm:block" />
              <SignOutButton />
            </div>
          </div>

          <AdminNav />
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</div>

      <footer className="pb-8 text-center text-[11px] tracking-[0.2em] text-[#b3a98f] uppercase">
        Mariage de Diane &amp; Martial
      </footer>
    </div>
  );
}
