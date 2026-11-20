// Tipos locais da gestão do dono (Grupo E). Espelham as respostas da API (Back-End/src/modules/*).
import type { Plan, Subscription } from '@/types/api';

/** Barbeiro como aparece no painel: junta o DTO público (/barber) com a linha crua de /branch/{id} (inclui inativos). */
export interface ManagedBarber {
  id: number;
  user_id: number | null;
  branch_id: number;
  display_name: string | null;
  bio: string | null;
  photo_url: string | null;
  active: boolean;
  services: { id: number; name: string }[];
}

/** Linha crua de Barber incluída em GET /branch/{id}. */
export interface RawBranchBarber {
  id: number;
  user_id: number;
  branch_id: number;
  display_name: string | null;
  bio: string | null;
  photo_url: string | null;
  active: boolean;
}

export interface BarberWorkingHours {
  barber_id: number;
  branch_id: number;
  timezone: string;
  uses_branch_hours: boolean;
  working_hours: { weekday: number; start_time: string; end_time: string }[];
}

export interface BarberTimeOff {
  id: number;
  barber_id?: number;
  start_at: string;
  end_at: string;
  reason: string | null;
}

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export interface Invitation {
  id: number;
  branch_id: number;
  email: string;
  display_name: string | null;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
}

export type MemberRole = 'manager' | 'receptionist';

export interface TeamMember {
  id: number;
  user: { id: number; name?: string; email?: string };
  role: MemberRole;
  branch_ids: number[] | null;
  branch_id: number | null;
  created_at: string;
}

export type UploadKind = 'logo' | 'cover' | 'barber_photo';

export interface PresignResponse {
  upload_id: number;
  upload_url: string;
  method: string;
  headers: Record<string, string>;
  expires_in: number;
}

export interface CheckoutResponse {
  checkout_url: string;
  checkout_id: string;
  subscription: Partial<Subscription>;
}

export type PlanCode = Plan['code'];
