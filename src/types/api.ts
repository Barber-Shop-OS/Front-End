// FE-05: tipos das entidades da API (espelham as respostas de docs/openapi.json do Back-End).
export type BackendRole = 'cliente' | 'barbeiro' | 'owner' | 'admin';

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: BackendRole;
  email_verified_at: string | null;
  created_at?: string;
  terms_version?: string | null;
}

export interface BillingBanner {
  barbershop_id: number;
  type: 'trial_ending' | 'past_due' | 'read_only' | 'cancel_scheduled';
  severity: 'info' | 'warning' | 'error';
  message: string;
  days_left?: number;
  status: SubscriptionStatus;
}

export interface MeBarbershop {
  id: number;
  name: string;
  slug: string;
  status: string;
  logo_url: string | null;
  membership: 'owner' | 'manager' | 'receptionist';
  branch_ids: number[] | null;
}

export interface MeBarberProfile {
  id: number;
  branch_id: number;
  display_name: string | null;
  branch: { id: number; name: string; barbershop_id: number } | null;
}

export interface Me extends User {
  roles: string[];
  barbershops: MeBarbershop[];
  barber_profiles: MeBarberProfile[];
  billing_banner: BillingBanner | null;
  billing_banners: BillingBanner[];
}

export interface Address {
  id?: number;
  cep: string;
  street: string | null;
  number: number | string;
  complement: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
}

export interface Barbershop {
  id: number;
  name: string;
  slug: string;
  owner_id?: number;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  instagram: string | null;
  logo_url: string | null;
  cover_url: string | null;
  status?: string;
}

export interface Branch {
  id: number;
  name: string;
  barbershop_id: number;
  timezone: string;
  phone: string | null;
  whatsapp: string | null;
  active: boolean;
  Address?: Address | null;
}

export interface OpeningHour {
  weekday: number;
  opens_at: string;
  closes_at: string;
}

export interface BranchClosure {
  id: number;
  date: string;
  all_day: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface WorkingHour {
  weekday: number;
  start_time: string;
  end_time: string;
}

export interface TimeOff {
  id: number;
  start_at: string;
  end_at: string;
  reason: string | null;
}

export interface Barber {
  id: number;
  display_name: string | null;
  bio: string | null;
  photo_url: string | null;
  branch_id: number;
  active: boolean;
  user_id?: number;
  services?: { id: number; name: string }[];
  User?: { id: number; name: string; email?: string } | null;
}

export interface Service {
  id: number;
  name: string;
  description: string | null;
  price: string;
  duration: number;
  active: boolean;
  barbershop_id: number;
}

export type AppointmentStatus = 'confirmado' | 'concluido' | 'cancelado' | 'nao_compareceu';
export type AppointmentAction = 'cancel' | 'reschedule' | 'complete' | 'no_show';

export interface Appointment {
  id: number;
  user_id: number | null;
  client_id: number | null;
  barber_id: number;
  service_id: number;
  branch_id: number;
  start_at: string;
  end_at: string;
  duration_min: number;
  price_snapshot: string;
  service_name_snapshot: string;
  notes: string | null;
  status: AppointmentStatus;
  source: 'web' | 'mobile' | 'balcao';
  cancel_reason: string | null;
  client?: { id: number; name: string; email: string; phone: string | null } | null;
  customer?: { id: number; name: string; phone: string | null; email: string | null; user_id: number | null } | null;
  barber?: { id: number; user_id: number; branch_id: number; display_name?: string | null; user?: { id: number; name: string } } | null;
  Service?: { id: number; name: string; price: string; duration: number } | null;
  Branch?: { id: number; name: string; barbershop_id: number; timezone: string } | null;
  Payment?: Payment | null;
  can_cancel_until: string;
  allowed_actions: AppointmentAction[];
}

export interface Slot {
  start_at: string;
  end_at: string;
  barber_ids: number[];
}

export type PaymentMethod = 'PIX' | 'CASH' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface Payment {
  id: number;
  appointment_id: number;
  amount: string;
  method: PaymentMethod;
  status: PaymentStatus;
  paid_at: string | null;
  branch_id?: number | null;
  barbershop_id?: number | null;
  created_at?: string;
  appointment?: Appointment;
}

export interface PaymentTotals {
  count: number;
  amount: string;
  paid: { count: number; amount: string };
  pending: { count: number; amount: string };
  failed: { count: number; amount: string };
  paid_by_method: Record<PaymentMethod, string>;
}

export interface Client {
  id: number;
  barbershop_id: number;
  user_id: number | null;
  has_account: boolean;
  name: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  visits: number | null;
  no_shows: number | null;
  last_visit: string | null;
  total_spent: string | null;
}

export interface ClientHistoryItem {
  id: number;
  start_at: string;
  status: AppointmentStatus;
  service_name: string;
  price: string;
  branch: { id: number; name: string } | null;
  barber: { id: number; name: string | null } | null;
  payment: Payment | null;
}

export interface ClientDetail extends Client {
  history: ClientHistoryItem[];
}

export interface DashboardSummary {
  period: { from: string; to: string };
  revenue: { total: string; payments: number; average_ticket: string; by_method: Record<PaymentMethod, string> };
  appointments: { total: number; by_status: Record<AppointmentStatus, number> };
  occupancy: { booked_minutes: number; available_minutes: number; rate: number };
  top_services?: { service_id: number; name: string; count: number; revenue: string }[];
  revenue_by_day: { date: string; amount: string }[];
  revenue_by_branch?: { branch_id: number; name: string; appointments: number; revenue: string }[];
  revenue_by_barber?: { barber_id: number; name: string; appointments: number; revenue: string }[];
  locked_features?: string[];
}

export interface Plan {
  code: 'essencial' | 'profissional' | 'rede';
  name: string;
  price_cents: number;
  price: string;
  currency: 'BRL';
  interval: string;
  limits: { branches: number | null; barbers: number | null };
  features: string[];
}

export type SubscriptionStatus = 'trialing' | 'pending' | 'active' | 'past_due' | 'canceled' | 'expired';

export interface Subscription {
  barbershop_id: number;
  plan_code: Plan['code'];
  effective_plan_code: Plan['code'] | null;
  status: SubscriptionStatus;
  trial_ends_at: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  limits: Plan['limits'];
  features: string[];
  usage: { branches: number; barbers: number };
}

export interface PublicBranch {
  id: number;
  name: string;
  timezone: string;
  phone: string | null;
  whatsapp: string | null;
  address: Address | null;
  opening_hours: OpeningHour[];
  open_now: boolean;
}

export interface PublicBarbershop extends Barbershop {
  branches: PublicBranch[];
  services: { id: number; name: string; description: string | null; price: string; duration: number }[];
  barbers: { id: number; display_name: string | null; bio: string | null; photo_url: string | null; branch_id: number; services?: { id: number; name: string }[] }[];
}

export interface SearchBranch {
  id: number;
  name: string;
  barbershop: { id: number; name: string; slug: string; logo_url: string | null };
  address: Address | null;
  distance_km?: number | null;
  phone: string | null;
  whatsapp: string | null;
}

export interface Session {
  id: string;
  user_agent: string | null;
  ip: string | null;
  last_used_at: string;
  expires_at: string;
  current: boolean;
}

export interface Member {
  id: number;
  user: { id: number; name?: string; email?: string };
  role: 'manager';
  branch_ids: number[] | null;
  created_at: string;
}

export interface AppConfig {
  api_version: string;
  min_app_version: string;
  latest_app_version: string;
  maintenance: { message: string } | null;
  features: { google_login: boolean; google_client_id: string | null; billing: boolean; uploads: boolean };
  terms_version: string;
}
