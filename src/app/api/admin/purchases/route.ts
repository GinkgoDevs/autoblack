import { NextResponse } from "next/server";
import { validateAdminRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const authError = validateAdminRequest(request);

  if (authError) {
    return authError;
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const supabase = createSupabaseAdminClient();

  let query = supabase
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (status !== "all") {
    query = query.eq(
      "status",
      status as "pending" | "paid" | "cancelled" | "rejected",
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ purchases: data });
}
