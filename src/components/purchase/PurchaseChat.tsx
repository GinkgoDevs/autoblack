"use client";

import { FormEvent, useMemo, useState } from "react";
import { formatCurrencyFromCents } from "@/lib/format";
import type { TicketPack } from "@/lib/supabase/types";

type TransferConfig = {
  alias: string;
  cbu: string;
  titular: string;
  banco: string;
};

type PurchaseChatProps = {
  selectedPack: TicketPack;
  transfer: TransferConfig;
};

type PurchaseResult = {
  id: string;
  purchaseCode: string;
  status: string;
  quantity: number;
  amountCents: number;
  currency: string;
};

export default function PurchaseChat({
  selectedPack,
  transfer,
}: PurchaseChatProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PurchaseResult | null>(null);
  const amount = useMemo(
    () => formatCurrencyFromCents(selectedPack.price_cents, selectedPack.currency),
    [selectedPack.currency, selectedPack.price_cents],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.set("ticketPackId", selectedPack.id);

    try {
      const response = await fetch("/api/purchases", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo registrar la compra");
      }

      setResult(payload.purchase);
      event.currentTarget.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No se pudo registrar la compra",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-green-400">
          Comprobante recibido
        </p>
        <h3 className="mt-2 text-2xl font-black text-white">
          Tu compra quedó pendiente de aprobación
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          Código de compra:{" "}
          <span className="font-bold text-white">{result.purchaseCode}</span>.
          Revisaremos el comprobante y, cuando se apruebe, se asignarán{" "}
          <span className="font-bold text-white">{result.quantity}</span>{" "}
          números para el sorteo.
        </p>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-5 rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white transition hover:border-brand-red hover:text-brand-red"
        >
          Cargar otra compra
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
    >
      <div className="space-y-4">
        <div className="rounded-xl bg-brand-red/10 p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Paso 1 · Transferí el importe exacto
          </p>
          <div className="mt-3 grid gap-2 text-sm text-gray-300 sm:grid-cols-2">
            <p>
              Alias: <span className="font-bold text-white">{transfer.alias}</span>
            </p>
            <p>
              CBU/CVU: <span className="font-bold text-white">{transfer.cbu}</span>
            </p>
            <p>
              Titular:{" "}
              <span className="font-bold text-white">{transfer.titular}</span>
            </p>
            <p>
              Banco: <span className="font-bold text-white">{transfer.banco}</span>
            </p>
          </div>
          <p className="mt-3 text-lg font-black text-white">
            Total a transferir: {amount}
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Paso 2 · Tus datos
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <input
              name="customerName"
              required
              placeholder="Nombre y apellido"
              className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-red"
            />
            <input
              name="customerEmail"
              required
              type="email"
              placeholder="Email"
              className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-red"
            />
            <input
              name="customerPhone"
              required
              placeholder="Teléfono / WhatsApp"
              className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-red"
            />
            <input
              name="customerDni"
              placeholder="DNI"
              className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-red"
            />
            <input
              name="transferReference"
              placeholder="Referencia de transferencia (opcional)"
              className="rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-red sm:col-span-2"
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-red">
            Paso 3 · Subí el comprobante
          </p>
          <input
            name="receipt"
            required
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="mt-3 w-full rounded-lg border border-dashed border-white/20 bg-black px-4 py-4 text-sm text-gray-300 file:mr-4 file:rounded file:border-0 file:bg-brand-red file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
          />
          <textarea
            name="customerNotes"
            rows={3}
            placeholder="Mensaje adicional (opcional)"
            className="mt-3 w-full rounded-lg border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-brand-red"
          />
        </div>

        {error && (
          <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-brand-red py-4 text-base font-black tracking-wider text-white transition hover:bg-brand-red-dark disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "ENVIANDO COMPROBANTE..." : "ENVIAR COMPROBANTE"}
        </button>
      </div>
    </form>
  );
}
