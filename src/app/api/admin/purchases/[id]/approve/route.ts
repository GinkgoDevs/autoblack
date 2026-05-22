import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { sendPurchaseApprovedEmail } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { approvePurchaseRpc } from "@/lib/supabase/rpc";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const authError = validateAdminRequest(request);

  if (authError) {
    return authError;
  }

  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const supabase = createSupabaseAdminClient();

  const { data, error } = await approvePurchaseRpc(
    supabase,
    id,
    typeof body.adminNotes === "string" ? body.adminNotes.trim() : null,
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const { data: purchase } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single();

  if (purchase) {
    const emailResult = await sendPurchaseApprovedEmail({
      to: purchase.customer_email,
      customerName: purchase.customer_name,
      purchaseCode: purchase.purchase_code,
      packName: purchase.pack_name,
      quantity: purchase.quantity,
      amountCents: purchase.amount_cents,
      currency: purchase.currency,
      numbers: purchase.assigned_numbers,
    });

    await supabase.from("email_events").insert({
      purchase_id: purchase.id,
      recipient_email: purchase.customer_email,
      event_type: "purchase_approved",
      status: emailResult.ok ? "sent" : "failed",
      subject: `Tus números del sorteo - ${purchase.purchase_code}`,
      resend_id: emailResult.messageId ?? null,
      error_message: emailResult.error ?? null,
      sent_at: emailResult.ok ? new Date().toISOString() : null,
    });
  }

  return NextResponse.json({ result: data });
}
