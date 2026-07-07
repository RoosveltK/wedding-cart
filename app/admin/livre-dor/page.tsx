import { GuestbookSection } from "@/components/admin/GuestbookSection";
import { storageLimitBytes } from "@/lib/guestbook";

export default function AdminLivreDorPage() {
  // Le seuil est lu côté serveur (GUESTBOOK_STORAGE_LIMIT_MB) puis passé au client.
  return <GuestbookSection storageLimit={storageLimitBytes()} />;
}
