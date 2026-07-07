"use client";

import { use, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Envelope } from "@/components/ticket/Envelope";
import { WeddingSite } from "@/components/site/WeddingSite";
import type { Database } from "@/lib/supabase/database.types";

type Billet = Database["public"]["Functions"]["get_billet"]["Returns"][number];
type Stage = "loading" | "not-found" | "envelope" | "ticket";

export default function BilletPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [stage, setStage] = useState<Stage>("loading");
  const [billet, setBillet] = useState<Billet | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_billet", { p_token: token });

      if (error || !data || data.length === 0) {
        setStage("not-found");
        return;
      }

      setBillet(data[0]);
      setStage("envelope");
    })();
  }, [token]);

  function handleOpenEnvelope() {
    setStage("ticket");
  }

  if (stage === "loading") {
    return <div className="min-h-screen bg-[#efe7d7]" />;
  }

  if (stage === "not-found" || !billet) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#efe7d7] px-4 text-center">
        <p className="font-serif text-neutral-600">Ce billet est introuvable.</p>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {stage === "envelope" && (
        <Envelope key="envelope" guestName={billet.nom_complet} onOpen={handleOpenEnvelope} />
      )}
      {stage === "ticket" && (
        <WeddingSite
          key="ticket"
          billet={billet}
          billetUrl={typeof window !== "undefined" ? window.location.href : ""}
        />
      )}
    </AnimatePresence>
  );
}
