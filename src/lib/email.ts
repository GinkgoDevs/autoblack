import { Resend } from "resend";
import { formatCurrencyFromCents } from "@/lib/format";

type EmailResult = {
  ok: boolean;
  skipped?: boolean;
  resendId?: string;
  error?: string;
};

type PurchaseReceivedEmail = {
  to: string;
  customerName: string;
  purchaseCode: string;
  packName: string;
  quantity: number;
  amountCents: number;
  currency: string;
};

type PurchaseApprovedEmail = PurchaseReceivedEmail & {
  numbers: string[];
};

type PurchaseRejectedEmail = {
  to: string;
  customerName: string;
  purchaseCode: string;
  adminNotes?: string | null;
};

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    return null;
  }

  return {
    resend: new Resend(apiKey),
    from,
  };
}

async function sendEmail({
  to,
  subject,
  html,
  text,
}: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<EmailResult> {
  const config = getEmailConfig();

  if (!config) {
    return {
      ok: false,
      skipped: true,
      error: "Resend no está configurado",
    };
  }

  try {
    const { data, error } = await config.resend.emails.send({
      from: config.from,
      to,
      subject,
      html,
      text,
    });

    if (error) {
      return {
        ok: false,
        error: error.message,
      };
    }

    return {
      ok: true,
      resendId: data?.id,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "No se pudo enviar email",
    };
  }
}

function emailLayout(content: string) {
  return `
    <div style="margin:0;background:#0a0a0a;padding:32px;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
      <div style="max-width:600px;margin:0 auto;border:1px solid #27272a;border-radius:16px;overflow:hidden;background:#111111;">
        <div style="background:#e31e24;padding:18px 24px;">
          <strong style="font-size:22px;letter-spacing:-0.04em;">AUTO<span style="color:#111111;">BLACK</span></strong>
        </div>
        <div style="padding:28px 24px;color:#e5e5e5;font-size:15px;line-height:1.6;">
          ${content}
        </div>
      </div>
    </div>
  `;
}

export async function sendPurchaseReceivedEmail(input: PurchaseReceivedEmail) {
  const amount = formatCurrencyFromCents(input.amountCents, input.currency);

  return sendEmail({
    to: input.to,
    subject: `Recibimos tu comprobante - ${input.purchaseCode}`,
    text: [
      `Hola ${input.customerName}, recibimos tu comprobante.`,
      `Compra: ${input.purchaseCode}`,
      `Pack: ${input.packName}`,
      `Chances: ${input.quantity}`,
      `Monto: ${amount}`,
      "Tu compra queda pendiente de revisión. Cuando aprobemos el pago, te enviaremos tus números.",
    ].join("\n"),
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#ffffff;">Recibimos tu comprobante</h1>
      <p>Hola <strong>${input.customerName}</strong>, tu compra quedó registrada y pendiente de revisión.</p>
      <ul>
        <li><strong>Código:</strong> ${input.purchaseCode}</li>
        <li><strong>Pack:</strong> ${input.packName}</li>
        <li><strong>Chances:</strong> ${input.quantity}</li>
        <li><strong>Monto:</strong> ${amount}</li>
      </ul>
      <p>Cuando aprobemos el pago, te enviaremos tus números para el sorteo.</p>
    `),
  });
}

export async function sendPurchaseApprovedEmail(input: PurchaseApprovedEmail) {
  const amount = formatCurrencyFromCents(input.amountCents, input.currency);
  const numbers = input.numbers.join(", ");

  return sendEmail({
    to: input.to,
    subject: `Tus números del sorteo - ${input.purchaseCode}`,
    text: [
      `Hola ${input.customerName}, tu pago fue aprobado.`,
      `Compra: ${input.purchaseCode}`,
      `Pack: ${input.packName}`,
      `Monto: ${amount}`,
      `Tus números: ${numbers}`,
      "Gracias por participar.",
    ].join("\n"),
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#ffffff;">Tu pago fue aprobado</h1>
      <p>Hola <strong>${input.customerName}</strong>, ya estás participando del sorteo.</p>
      <ul>
        <li><strong>Código:</strong> ${input.purchaseCode}</li>
        <li><strong>Pack:</strong> ${input.packName}</li>
        <li><strong>Monto:</strong> ${amount}</li>
      </ul>
      <p style="margin:20px 0 8px;"><strong>Tus números:</strong></p>
      <p style="background:#000000;border:1px solid #e31e24;border-radius:12px;padding:16px;color:#ffffff;font-size:18px;font-weight:bold;">
        ${numbers}
      </p>
      <p>Guardá este email como comprobante de participación.</p>
    `),
  });
}

export async function sendPurchaseRejectedEmail(input: PurchaseRejectedEmail) {
  return sendEmail({
    to: input.to,
    subject: `Necesitamos revisar tu comprobante - ${input.purchaseCode}`,
    text: [
      `Hola ${input.customerName}, no pudimos aprobar tu comprobante.`,
      `Compra: ${input.purchaseCode}`,
      input.adminNotes ? `Motivo: ${input.adminNotes}` : "",
      "Respondé este email o contactanos por WhatsApp para resolverlo.",
    ]
      .filter(Boolean)
      .join("\n"),
    html: emailLayout(`
      <h1 style="margin:0 0 16px;font-size:24px;color:#ffffff;">No pudimos aprobar tu comprobante</h1>
      <p>Hola <strong>${input.customerName}</strong>, necesitamos revisar tu compra <strong>${input.purchaseCode}</strong>.</p>
      ${
        input.adminNotes
          ? `<p><strong>Motivo:</strong> ${input.adminNotes}</p>`
          : ""
      }
      <p>Contactanos por WhatsApp para resolverlo.</p>
    `),
  });
}
