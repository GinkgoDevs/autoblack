import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { sendPurchaseRejectedEmail } from "@/lib/email";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { rejectPurchaseRpc } from "@/lib/supabase/rpc";

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
  const adminNotes =
    typeof body.adminNotes === "string" ? body.adminNotes.trim() : null;

  const { data, error } = await rejectPurchaseRpc(
    supabase,
    id,
    adminNotes,
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
    const emailResult = await sendPurchaseRejectedEmail({
      to: purchase.customer_email,
      customerName: purchase.customer_name,
      purchaseCode: purchase.purchase_code,
      adminNotes,
    });

    await supabase.from("email_events").insert({
      purchase_id: purchase.id,
      recipient_email: purchase.customer_email,
      event_type: "purchase_rejected",
      status: emailResult.ok ? "sent" : "failed",
      subject: `Necesitamos revisar tu comprobante - ${purchase.purchase_code}`,
      resend_id: emailResult.resendId ?? null,
      error_message: emailResult.error ?? null,
      sent_at: emailResult.ok ? new Date().toISOString() : null,
    });
  }

  return NextResponse.json({ result: data });
}
