import { NextResponse } from "next/server";

export function validateAdminRequest(request: Request) {
  const configuredSecret = process.env.ADMIN_SECRET;

  if (!configuredSecret) {
    return NextResponse.json(
      { error: "ADMIN_SECRET no está configurado" },
      { status: 500 },
    );
  }

  const providedSecret = request.headers.get("x-admin-secret");

  if (providedSecret !== configuredSecret) {
    return NextResponse.json(
      { error: "No autorizado" },
      { status: 401 },
    );
  }

  return null;
}
