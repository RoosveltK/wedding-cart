import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";
import { GuestsSection } from "@/components/admin/GuestsSection";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: event } = await supabase.from("event").select("id").limit(1).maybeSingle();

  return (
    <div className="space-y-6">
      <EventForm />
      {event && <GuestsSection eventId={event.id} />}
    </div>
  );
}
