// Tipos da área do barbeiro (respostas de /dashboard/barber, /dashboard/barber/clients, jornada e bloqueios).
import type { DashboardSummary, Payment, PaymentTotals, Paginated, WorkingHour } from '@/types/api';

/** BE-53: variação em relação ao período anterior (mesmo nº de dias). Opcional enquanto o BE-53 não chega. */
export interface MetricChange<T = string> {
  previous: T;
  change_pct: number | null;
}

export interface DashboardComparison {
  previous_period: { from: string; to: string };
  revenue: MetricChange<string>;
  payments: MetricChange<number>;
  average_ticket: MetricChange<string>;
  appointments: MetricChange<number>;
}

export interface BarberDashboard extends DashboardSummary {
  /** BE-53 (opcional). */
  comparison?: DashboardComparison;
  /** BE-53 (opcional): receita e atendimentos por serviço, todos os serviços. */
  revenue_by_service?: { service_id: number; name: string; appointments: number; revenue: string }[];
}

/** BE-53: GET /dashboard/barber/clients — clientes atendidos pelo barbeiro logado. */
export interface BarberClient {
  client_id: number | null;
  user_id: number | null;
  name: string | null;
  phone: string | null;
  visits: number;
  last_visit: string | null;
  total_spent: string;
}

export interface BarberClientFilters {
  search?: string;
  sortBy?: 'last_visit' | 'visits' | 'total_spent' | 'name';
  page?: number;
  pageSize?: number;
}

export interface BarberWorkingHours {
  barber_id: number;
  branch_id: number;
  timezone: string;
  uses_branch_hours: boolean;
  working_hours: WorkingHour[];
}

export interface BarberTimeOff {
  id: number;
  barber_id: number;
  start_at: string;
  end_at: string;
  reason: string | null;
}

/** Pagamento como vem em GET /payment (appointment incluso sem alias). */
export interface BarberPaymentRow extends Payment {
  Appointment?: {
    id: number;
    start_at: string;
    service_name_snapshot: string;
    price_snapshot: string;
    status: string;
    client?: { id: number; name: string } | null;
  } | null;
}

export type BarberPaymentsPage = Paginated<BarberPaymentRow> & { totals?: PaymentTotals };
