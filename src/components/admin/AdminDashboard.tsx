"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { formatCurrencyFromCents, formatDateTime } from "@/lib/format";
import type { Purchase } from "@/lib/supabase/types";

type StatusFilter = "pending" | "paid" | "rejected" | "cancelled" | "all";

const statusLabels: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagada",
  rejected: "Rechazada",
  cancelled: "Cancelada",
};

export default function AdminDashboard() {
  const [secret, setSecret] = useState("");
  const [savedSecret, setSavedSecret] = useState("");
  const [status, setStatus] = useState<StatusFilter>("pending");
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadPurchases(adminSecret = savedSecret, nextStatus = status) {
    if (!adminSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/purchases?status=${nextStatus}`, {
        headers: {
          "x-admin-secret": adminSecret,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "No se pudieron cargar las compras");
      }

      setPurchases(payload.purchases);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las compras",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function submitSecret(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavedSecret(secret);
    await loadPurchases(secret, status);
  }

  async function runAction(purchaseId: string, action: "approve" | "reject") {
    setActionId(purchaseId);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/purchases/${purchaseId}/${action}`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-admin-secret": savedSecret,
          },
          body: JSON.stringify({}),
        },
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo ejecutar la acción");
      }

      await loadPurchases(savedSecret, status);
    } catch (actionError) {
      setError(
        actionError instanceof Error
          ? actionError.message
          : "No se pudo ejecutar la acción",
      );
    } finally {
      setActionId(null);
    }
  }

  async function openReceipt(purchaseId: string) {
    setActionId(purchaseId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/purchases/${purchaseId}/receipt`, {
        headers: {
          "x-admin-secret": savedSecret,
        },
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "No se pudo abrir el comprobante");
      }

      window.open(payload.signedUrl, "_blank", "noopener,noreferrer");
    } catch (receiptError) {
      setError(
        receiptError instanceof Error
          ? receiptError.message
          : "No se pudo abrir el comprobante",
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-brand-red">
              Admin
            </p>
            <h1 className="mt-2 text-4xl font-black">Compras del sorteo</h1>
            <p className="mt-3 max-w-2xl text-sm text-gray-400">
              Revisá comprobantes, aprobá transferencias y asigná números
              automáticamente desde Supabase.
            </p>
          </div>

          <form onSubmit={submitSecret} className="flex gap-2">
            <input
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              type="password"
              placeholder="ADMIN_SECRET"
              className="min-w-0 rounded-lg border border-white/10 bg-zinc-950 px-4 py-3 text-sm text-white outline-none focus:border-brand-red"
            />
            <button className="rounded-lg bg-brand-red px-5 py-3 text-sm font-black text-white">
              Entrar
            </button>
          </form>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {(["pending", "paid", "rejected", "cancelled", "all"] as const).map(
              (item) => (
                <button
                  key={item}
                  onClick={() => {
                    setStatus(item);

                    if (savedSecret) {
                      void loadPurchases(savedSecret, item);
                    }
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-bold transition ${
                    status === item
                      ? "bg-brand-red text-white"
                      : "bg-white/5 text-gray-300 hover:bg-white/10"
                  }`}
                >
                  {item === "all" ? "Todas" : statusLabels[item]}
                </button>
              ),
            )}
          </div>
          <button
            onClick={() => loadPurchases()}
            disabled={!savedSecret || isLoading}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
          >
            {isLoading ? "Actualizando..." : "Actualizar"}
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 overflow-hidden rounded-2xl border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-4 py-3">Compra</th>
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Pack</th>
                  <th className="px-4 py-3">Monto</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Números</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="bg-zinc-950/40">
                    <td className="px-4 py-4 font-bold text-white">
                      {purchase.purchase_code}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-semibold text-white">
                        {purchase.customer_name}
                      </p>
                      <p className="text-gray-400">{purchase.customer_email}</p>
                      <p className="text-gray-500">{purchase.customer_phone}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-white">{purchase.pack_name}</p>
                      <p className="text-gray-400">
                        {purchase.quantity} chances
                      </p>
                    </td>
                    <td className="px-4 py-4 font-bold text-brand-red">
                      {formatCurrencyFromCents(
                        purchase.amount_cents,
                        purchase.currency,
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded bg-white/10 px-2 py-1 text-xs font-bold text-white">
                        {statusLabels[purchase.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-300">
                      {purchase.assigned_numbers.length > 0
                        ? purchase.assigned_numbers.join(", ")
                        : "-"}
                    </td>
                    <td className="px-4 py-4 text-gray-400">
                      {formatDateTime(purchase.created_at)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => openReceipt(purchase.id)}
                          disabled={actionId === purchase.id}
                          className="rounded border border-white/20 px-3 py-2 text-xs font-bold text-white hover:border-brand-red hover:text-brand-red disabled:opacity-50"
                        >
                          Comprobante
                        </button>
                        {purchase.status === "pending" && (
                          <>
                            <button
                              onClick={() => runAction(purchase.id, "approve")}
                              disabled={actionId === purchase.id}
                              className="rounded bg-green-600 px-3 py-2 text-xs font-bold text-white hover:bg-green-700 disabled:opacity-50"
                            >
                              Aprobar
                            </button>
                            <button
                              onClick={() => runAction(purchase.id, "reject")}
                              disabled={actionId === purchase.id}
                              className="rounded bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-50"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {!isLoading && purchases.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                      No hay compras para mostrar.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
