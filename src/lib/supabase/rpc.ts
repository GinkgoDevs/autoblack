import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Json } from "./types";

type AdminClient = SupabaseClient<Database>;

export async function approvePurchaseRpc(
  supabase: AdminClient,
  purchaseId: string,
  adminNotes: string | null,
) {
  const response = await supabase.rpc("approve_purchase", {
    p_purchase_id: purchaseId,
    p_admin_notes: adminNotes,
  });

  return response as { data: Json | null; error: Error | null };
}

export async function rejectPurchaseRpc(
  supabase: AdminClient,
  purchaseId: string,
  adminNotes: string | null,
) {
  const response = await supabase.rpc("reject_purchase", {
    p_purchase_id: purchaseId,
    p_admin_notes: adminNotes,
  });

  return response as { data: Json | null; error: Error | null };
}
