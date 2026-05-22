import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import RaffleDateSection from "@/components/RaffleDateSection";
import HowItWorksSection from "@/components/HowItWorksSection";
import WinnersSection from "@/components/WinnersSection";
import DescriptionSection from "@/components/DescriptionSection";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { transferConfig } from "@/lib/env";
import { getActiveRaffle, getTicketPacks } from "@/lib/supabase/queries";
import type { Raffle, TicketPack } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  let ticketPacks: TicketPack[] = [];
  let raffle: Raffle | null = null;
  let databaseError: string | null = null;

  try {
    [ticketPacks, raffle] = await Promise.all([
      getTicketPacks(),
      getActiveRaffle(),
    ]);
  } catch (error) {
    databaseError =
      error instanceof Error
        ? error.message
        : "No se pudo conectar con Supabase";
  }

  return (
    <>
      <Header />
      <main>
        {databaseError && (
          <section className="border-b border-red-500/20 bg-red-950/30 px-4 py-4">
            <div className="mx-auto max-w-7xl rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
              <p className="font-bold">No se pudo conectar con Supabase.</p>
              <p className="mt-1 text-red-200/80">
                Revisá `NEXT_PUBLIC_SUPABASE_URL`, que el proyecto esté activo y
                que tu red pueda resolver el dominio de Supabase. Detalle:{" "}
                {databaseError}
              </p>
            </div>
          </section>
        )}
        <HeroSection
          ticketPacks={ticketPacks}
          transfer={transferConfig}
          drawAt={raffle?.draw_at}
        />
        <RaffleDateSection drawAt={raffle?.draw_at} />
        <HowItWorksSection />
        <WinnersSection />
        <DescriptionSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
