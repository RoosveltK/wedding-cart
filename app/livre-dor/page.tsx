import { Suspense } from "react";
import { GuestbookPage } from "@/components/guestbook/GuestbookPage";

export default function LivreDorPage() {
  return (
    // Suspense requis par useSearchParams (?code=XXXXX pré-rempli depuis le billet / QR)
    <Suspense fallback={<div className="min-h-screen bg-[#efe7d7]" />}>
      <GuestbookPage />
    </Suspense>
  );
}
