import { createClient } from "@supabase/supabase-js";
import { getRequiredEnv } from "@/lib/env";
import type { Database } from "./types";

export function createSupabaseAdminClient() {
  return createClient<Database>(
    getRequiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  );
}
