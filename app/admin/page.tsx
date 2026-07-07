import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";
import { GuestsSection } from "@/components/admin/GuestsSection";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: event } = await supabase.from("event").select("id").limit(1).maybeSingle();

  return (
    <div className="space-y-6">
      {/* Les invités d'abord : c'est l'activité du quotidien ; l'événement se règle une fois. */}
      {event && <GuestsSection eventId={event.id} />}
      <EventForm />
    </div>
  );
}
