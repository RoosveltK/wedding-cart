import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/admin/SignOutButton";

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
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 font-script text-lg text-white">
              D&amp;M
            </div>
            <div>
              <p className="text-sm font-semibold text-neutral-900">Back-office</p>
              <p className="text-xs text-neutral-500">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/admin/mot-de-passe" className="text-neutral-500 transition hover:text-neutral-900">
              Mot de passe
            </Link>
            <SignOutButton />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
