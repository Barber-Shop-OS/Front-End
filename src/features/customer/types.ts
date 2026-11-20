// Formato real dos agendamentos vistos pelo cliente (GET /me/appointments e GET /appointment/{id}).
// As associações do Sequelize chegam com o nome do modelo (`Barber`, `Service`, `Branch`), por isso o
// tipo fica aqui, na feature, sem alterar o `Appointment` compartilhado de `types/api.ts`.
import type { Address, Appointment } from '@/types/api';

export interface CustomerAppointmentBarber {
  id: number;
  user_id?: number;
  branch_id?: number;
  display_name?: string | null;
  User?: { id: number; name: string } | null;
}

export interface CustomerAppointment extends Omit<Appointment, 'Service' | 'Branch' | 'barber'> {
  Barber?: CustomerAppointmentBarber | null;
  barber?: CustomerAppointmentBarber | null;
  Service?: { id: number; name: string; price?: string; duration?: number } | null;
  Branch?: { id: number; name: string; barbershop_id: number; timezone: string } | null;
}

/** GET /barbershop/{id} (público): barbearia com filiais ativas e endereço. */
export interface CustomerBarbershop {
  id: number;
  name: string;
  slug: string;
  logo_url: string | null;
  cover_url: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  Branches?: { id: number; name: string; phone?: string | null; whatsapp?: string | null; timezone?: string; Address?: Address | null }[];
}

/** Barbearia frequente derivada do histórico do cliente. */
export interface FrequentBarbershop {
  barbershopId: number;
  branchId: number;
  branchName: string;
  visits: number;
  lastVisit: string | null;
  nextVisit: string | null;
}
