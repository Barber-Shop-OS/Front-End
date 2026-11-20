// Figma "Home do Cliente" (1:2209) — /cliente. Saudação, busca (leva a /filiais), próximas reservas
// (GET /me/appointments?scope=upcoming), barbearias frequentes derivadas do histórico (scope=past) e atalhos.
// Mobile-first: reservas em carrossel horizontal com snap; frequentes em 1 → 3 colunas.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarDays, Search, Store, UserCog } from 'lucide-react';

import { ErrorState, Skeleton } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks';
import { RescheduleModal } from '@/features/customer/AppointmentActions';
import { BookMoreCard } from '@/features/customer/BookMoreCard';
import { FrequentBarbershopCard, QuickAction, UpcomingBookingCard } from '@/features/customer/HomeCards';
import { useCustomerAppointmentsQuery } from '@/features/customer/api';
import { deriveFrequentBarbershops } from '@/features/customer/helpers';
import type { CustomerAppointment } from '@/features/customer/types';
import { usePageTitle } from '@/hooks/usePageTitle';

const sectionTitle = 'text-xl font-bold leading-7 tracking-[-0.025em] text-ink';

const CustomerHomePage = () => {
  usePageTitle('Início');
  const { user } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [toReschedule, setToReschedule] = useState<CustomerAppointment | null>(null);
  const upcoming = useCustomerAppointmentsQuery({ scope: 'upcoming', pageSize: 10 });
  const past = useCustomerAppointmentsQuery({ scope: 'past', pageSize: 50 });

  const firstName = user?.name?.trim().split(/\s+/)[0];
  const bookings = (upcoming.data?.items ?? []).filter((item) => item.status === 'confirmado');
  const frequent = deriveFrequentBarbershops(past.data?.items ?? [], upcoming.data?.items ?? []);

  const search = (event: FormEvent) => {
    event.preventDefault();
    const q = query.trim();
    navigate(q ? `/filiais?q=${encodeURIComponent(q)}` : '/filiais');
  };

  return (
    <div className="mx-auto w-full max-w-[1024px] space-y-10 px-4 pb-16 pt-6 sm:px-8 sm:pt-10">
      <header className="space-y-5">
        <div className="space-y-1">
          <h1 className="text-[28px] font-bold leading-9 tracking-[-0.025em] text-ink sm:text-3xl">{firstName ? `Olá, ${firstName}.` : 'Olá!'}</h1>
          <p className="text-sm text-ink-variant">O que vamos alinhar hoje?</p>
        </div>
        <form onSubmit={search} role="search" className="relative max-w-[576px]">
          <label htmlFor="customer-search" className="sr-only">
            Buscar barbearias ou serviços
          </label>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
          <input
            id="customer-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar barbearias ou serviços..."
            className="h-12 w-full rounded-lg border border-transparent bg-surface-low pl-10 pr-28 text-sm text-ink placeholder:text-ink-subtle focus:border-primary-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <button type="submit" className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-lg bg-primary-600 px-4 text-xs font-semibold text-white hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2">
            Buscar
          </button>
        </form>
      </header>

      <section className="space-y-6" aria-labelledby="home-upcoming">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="home-upcoming" className={sectionTitle}>
              Minhas Próximas Reservas
            </h2>
            <p className="text-xs text-ink-variant">Acompanhe seus horários agendados</p>
          </div>
          <Link to="/cliente/agendamentos" className="inline-flex min-h-[40px] shrink-0 items-center text-xs font-bold uppercase tracking-label text-primary-600 hover:text-primary-700">
            Ver todas
          </Link>
        </div>
        {upcoming.isLoading ? (
          <div className="flex gap-6 overflow-hidden" role="status" aria-label="Carregando reservas">
            <Skeleton className="h-60 w-[85vw] max-w-[340px] shrink-0" />
            <Skeleton className="h-60 w-[85vw] max-w-[340px] shrink-0" />
          </div>
        ) : upcoming.error ? (
          <ErrorState error={upcoming.error} onRetry={upcoming.refetch} />
        ) : bookings.length ? (
          <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:-mx-2 sm:gap-6 sm:px-2" aria-label="Próximas reservas">
            {bookings.map((item, index) => (
              <UpcomingBookingCard key={item.id} appointment={item} featured={index === 0} onReschedule={setToReschedule} />
            ))}
          </div>
        ) : (
          <BookMoreCard title="Nenhuma reserva por enquanto" description="Encontre uma barbearia perto de você e garanta seu próximo horário." />
        )}
      </section>

      {frequent.length ? (
        <section className="space-y-6 pt-2" aria-labelledby="home-frequent">
          <h2 id="home-frequent" className={sectionTitle}>
            Frequentes
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {frequent.map((entry, index) => (
              <FrequentBarbershopCard key={entry.barbershopId} entry={entry} index={index} badge={index === 0 && entry.visits > 1 ? 'Mais visitada' : undefined} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="space-y-6 pt-2" aria-labelledby="home-shortcuts">
        <h2 id="home-shortcuts" className={sectionTitle}>
          Atalhos
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          <QuickAction to="/filiais" icon={<Store className="h-5 w-5" />} title="Encontrar barbearia" description="Busque por nome, serviço ou cidade" />
          <QuickAction to="/cliente/agendamentos" icon={<CalendarDays className="h-5 w-5" />} title="Meus agendamentos" description="Próximos horários e histórico" />
          <QuickAction to="/conta" icon={<UserCog className="h-5 w-5" />} title="Meu perfil" description="Dados, segurança e notificações" />
        </div>
      </section>

      <RescheduleModal appointment={toReschedule} onClose={() => setToReschedule(null)} />
    </div>
  );
};

export default CustomerHomePage;
