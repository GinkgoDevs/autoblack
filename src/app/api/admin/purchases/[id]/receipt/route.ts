import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Purchase } from "@/lib/supabase/types";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const authError = validateAdminRequest(request);

  if (authError) {
    return authError;
  }

  const { id } = await context.params;
  const supabase = createSupabaseAdminClient();

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .select("*")
    .eq("id", id)
    .single<Purchase>();

  if (purchaseError || !purchase?.receipt_bucket || !purchase.receipt_path) {
    return NextResponse.json(
      { error: "Comprobante no encontrado" },
      { status: 404 },
    );
  }

  const { data, error } = await supabase.storage
    .from(purchase.receipt_bucket)
    .createSignedUrl(purchase.receipt_path, 60 * 10);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ signedUrl: data.signedUrl });
}
