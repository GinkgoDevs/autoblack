const requiredServerEnv = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export function getRequiredEnv(name: (typeof requiredServerEnv)[number] | string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

export function assertServerEnv() {
  requiredServerEnv.forEach(getRequiredEnv);
}

export const transferConfig = {
  alias: process.env.TRANSFER_ALIAS || "Completar alias en .env.local",
  cbu: process.env.TRANSFER_CBU || "Completar CBU/CVU en .env.local",
  titular: process.env.TRANSFER_TITULAR || "Completar titular en .env.local",
  banco: process.env.TRANSFER_BANCO || "Completar banco en .env.local",
};
