import { NextResponse } from "next/server";
import { getTicketPacks } from "@/lib/supabase/queries";

export async function GET() {
  try {
    const packs = await getTicketPacks();

    return NextResponse.json({ packs });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron obtener los packs",
      },
      { status: 500 },
    );
  }
}
