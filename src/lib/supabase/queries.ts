import { cache } from "react";
import { createSupabaseAdminClient } from "./admin";

export const getActiveRaffle = cache(async () => {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffles")
    .select("*")
    .eq("status", "active")
    .order("draw_at", { ascending: true, nullsFirst: false })
    .limit(1)
    .single();

  if (error) {
    throw new Error(`No se pudo obtener el sorteo activo: ${error.message}`);
  }

  return data;
});

export const getTicketPacks = cache(async () => {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("ticket_packs")
    .select("*")
    .eq("active", true)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`No se pudieron obtener los packs: ${error.message}`);
  }

  return data;
});

export async function getRaffleAvailability(raffleId: string) {
  const supabase = createSupabaseAdminClient();

  const { count: total, error: totalError } = await supabase
    .from("raffle_numbers")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffleId);

  if (totalError) {
    throw new Error(totalError.message);
  }

  const { count: available, error: availableError } = await supabase
    .from("raffle_numbers")
    .select("id", { count: "exact", head: true })
    .eq("raffle_id", raffleId)
    .eq("status", "available");

  if (availableError) {
    throw new Error(availableError.message);
  }

  return {
    total: total ?? 0,
    available: available ?? 0,
    sold: (total ?? 0) - (available ?? 0),
  };
}
