import type { UserRole } from "@/types";

/**
 * Rota inicial de cada perfil de usuário após autenticar.
 */
export const ROLE_HOME: Record<UserRole, string> = {
  customer: "/cliente",
  barber: "/dashboard/barber",
  owner: "/dashboard",
};

/**
 * Rota padrão usada quando o usuário autenticado ainda não tem role definida
 * (fallback para não quebrar o fluxo atual).
 */
export const DEFAULT_HOME = "/dashboard";

