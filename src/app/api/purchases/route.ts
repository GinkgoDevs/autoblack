import { NextResponse } from "next/server";
import { sendPurchaseReceivedEmail } from "@/lib/email";
import { sanitizeFileName } from "@/lib/format";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getActiveRaffle } from "@/lib/supabase/queries";

const RECEIPT_BUCKET = "receipts";
const MAX_RECEIPT_SIZE = 10 * 1024 * 1024;
const ALLOWED_RECEIPT_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

function getString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const ticketPackId = getString(formData, "ticketPackId");
    const customerName = getString(formData, "customerName");
    const customerEmail = getString(formData, "customerEmail").toLowerCase();
    const customerPhone = getString(formData, "customerPhone");
    const customerDni = getString(formData, "customerDni");
    const transferReference = getString(formData, "transferReference");
    const customerNotes = getString(formData, "customerNotes");
    const receipt = formData.get("receipt");

    if (!ticketPackId || !customerName || !customerEmail || !customerPhone) {
      return NextResponse.json(
        { error: "Completá pack, nombre, email y teléfono" },
        { status: 400 },
      );
    }

    if (!(receipt instanceof File) || receipt.size === 0) {
      return NextResponse.json(
        { error: "Subí el comprobante de transferencia" },
        { status: 400 },
      );
    }

    if (receipt.size > MAX_RECEIPT_SIZE) {
      return NextResponse.json(
        { error: "El comprobante no puede superar los 10 MB" },
        { status: 400 },
      );
    }

    if (!ALLOWED_RECEIPT_TYPES.has(receipt.type)) {
      return NextResponse.json(
        { error: "El comprobante debe ser imagen JPG/PNG/WebP o PDF" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAdminClient();
    const raffle = await getActiveRaffle();

    const { data: ticketPack, error: ticketPackError } = await supabase
      .from("ticket_packs")
      .select("*")
      .eq("id", ticketPackId)
      .eq("active", true)
      .single();

    if (ticketPackError || !ticketPack) {
      return NextResponse.json(
        { error: "El pack seleccionado no está disponible" },
        { status: 400 },
      );
    }

    const purchaseId = crypto.randomUUID();
    const receiptPath = `${raffle.id}/${purchaseId}/${Date.now()}-${sanitizeFileName(
      receipt.name || "comprobante",
    )}`;

    const { error: uploadError } = await supabase.storage
      .from(RECEIPT_BUCKET)
      .upload(receiptPath, receipt, {
        contentType: receipt.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json(
        { error: `No se pudo subir el comprobante: ${uploadError.message}` },
        { status: 500 },
      );
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .insert({
        id: purchaseId,
        raffle_id: raffle.id,
        ticket_pack_id: ticketPack.id,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_dni: customerDni || null,
        pack_name: ticketPack.name,
        quantity: ticketPack.chances,
        amount_cents: ticketPack.price_cents,
        currency: ticketPack.currency,
        status: "pending",
        transfer_reference: transferReference || null,
        receipt_bucket: RECEIPT_BUCKET,
        receipt_path: receiptPath,
        receipt_original_name: receipt.name || null,
        receipt_mime_type: receipt.type || null,
        customer_notes: customerNotes || null,
      })
      .select("*")
      .single();

    if (purchaseError) {
      await supabase.storage.from(RECEIPT_BUCKET).remove([receiptPath]);

      return NextResponse.json(
        { error: `No se pudo registrar la compra: ${purchaseError.message}` },
        { status: 500 },
      );
    }

    const emailResult = await sendPurchaseReceivedEmail({
      to: purchase.customer_email,
      customerName: purchase.customer_name,
      purchaseCode: purchase.purchase_code,
      packName: purchase.pack_name,
      quantity: purchase.quantity,
      amountCents: purchase.amount_cents,
      currency: purchase.currency,
    });

    await supabase.from("email_events").insert({
      purchase_id: purchase.id,
      recipient_email: purchase.customer_email,
      event_type: "purchase_received",
      status: emailResult.ok ? "sent" : "failed",
      subject: `Recibimos tu comprobante - ${purchase.purchase_code}`,
      resend_id: emailResult.messageId ?? null,
      error_message: emailResult.error ?? null,
      sent_at: emailResult.ok ? new Date().toISOString() : null,
    });

    return NextResponse.json(
      {
        purchase: {
          id: purchase.id,
          purchaseCode: purchase.purchase_code,
          status: purchase.status,
          amountCents: purchase.amount_cents,
          currency: purchase.currency,
          quantity: purchase.quantity,
          emailSent: emailResult.ok,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo registrar la compra",
      },
      { status: 500 },
    );
  }
}
