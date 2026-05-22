"use client";

import { useState } from "react";
import Image from "next/image";
import { formatCurrencyFromCents } from "@/lib/format";
import type { TicketPack } from "@/lib/supabase/types";
import Countdown from "./Countdown";
import PurchaseChat from "./purchase/PurchaseChat";
import TicketOption from "./TicketOption";

type HeroSectionProps = {
  ticketPacks: TicketPack[];
  transfer: {
    alias: string;
    cbu: string;
    titular: string;
    banco: string;
  };
  drawAt?: string | null;
};

export default function HeroSection({
  ticketPacks,
  transfer,
  drawAt,
}: HeroSectionProps) {
  const [selectedId, setSelectedId] = useState(ticketPacks[1]?.id ?? ticketPacks[0]?.id);
  const selectedPack =
    ticketPacks.find((pack) => pack.id === selectedId) ?? ticketPacks[0];

  if (!selectedPack) {
    return (
      <section className="bg-black py-16">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-black text-white">
            No hay packs disponibles
          </h1>
          <p className="mt-3 text-gray-400">
            Revisá en Supabase que exista un sorteo activo y packs habilitados.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black py-8 sm:py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:gap-12">
        {/* Left - Promo visual */}
        <div className="relative overflow-hidden rounded-2xl border border-white/10 lg:sticky lg:top-24 lg:self-start">
          <div className="relative aspect-[4/3] w-full">
            <Image
              src="https://xakxekhcustioqktwgom.supabase.co/storage/v1/object/public/product-images/products/1777579556253-kj51hghayas.png"
              alt="Vehículos del sorteo"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <span className="mb-2 inline-block rounded bg-brand-red px-3 py-1 text-xs font-black tracking-widest text-white">
                SORTEO TRIPLE
              </span>
              <h2 className="text-3xl font-black uppercase leading-tight text-white sm:text-4xl">
                Camioneta + Motos
                <br />
                <span className="text-brand-red">0km</span>
              </h2>
              <p className="mt-2 text-sm text-gray-300">
                10 · 17 · 24 de Junio 2026
              </p>
            </div>
          </div>
        </div>

        {/* Right - Purchase */}
        <div className="flex flex-col justify-center">
          <h1 className="text-2xl font-black uppercase leading-tight text-white sm:text-3xl lg:text-4xl">
            Pack de cursos Autoblack +{" "}
            <span className="text-brand-red">chances para el triple sorteo</span>
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Comprá tu pack de cursos online y recibí chances automáticas para
            participar en nuestro triple sorteo de vehículos 0km. Más chances,
            más oportunidades de ganar.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            {ticketPacks.map((pack) => (
              <TicketOption
                key={pack.id}
                pack={pack}
                selected={selectedId === pack.id}
                onSelect={setSelectedId}
              />
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-brand-red/40 bg-brand-red/10 p-4 text-center">
            <p className="mb-3 text-xs font-black uppercase tracking-[0.25em] text-white">
              El sorteo cierra en
            </p>
            <Countdown drawAt={drawAt} compact />
          </div>

          <button
            type="button"
            onClick={() => {
              document
                .getElementById("purchase-form")
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className="mt-6 w-full rounded-lg bg-brand-red py-4 text-lg font-black tracking-wider text-white transition hover:bg-brand-red-dark"
          >
            COMPRAR AHORA —{" "}
            {formatCurrencyFromCents(
              selectedPack.price_cents,
              selectedPack.currency,
            )}
          </button>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs text-gray-500">
            <span className="rounded border border-white/20 px-2 py-1">
              TRANSFERENCIA
            </span>
            <span className="rounded border border-white/20 px-2 py-1">
              COMPROBANTE
            </span>
            <span className="rounded border border-white/20 px-2 py-1">
              APROBACIÓN MANUAL
            </span>
          </div>

          <div id="purchase-form">
            <PurchaseChat selectedPack={selectedPack} transfer={transfer} />
          </div>
        </div>
      </div>
    </section>
  );
}
