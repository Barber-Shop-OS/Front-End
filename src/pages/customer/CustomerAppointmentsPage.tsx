// Figma "Meus Agendamentos" (1:1112) — /cliente/agendamentos. Abas Próximos/Histórico (GET /me/appointments
// com scope), paginação, reagendar e cancelar conforme `allowed_actions` da API. Mobile-first.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CalendarX2, History } from 'lucide-react';

import { EmptyState, ErrorState, ListSkeleton, Pagination, buttonClass } from '@/components/ui';
import { CancelAppointmentDialog, RescheduleModal } from '@/features/customer/AppointmentActions';
import { AppointmentCard } from '@/features/customer/AppointmentCard';
import { BookMoreCard } from '@/features/customer/BookMoreCard';
import { useCustomerAppointmentsQuery } from '@/features/customer/api';
import type { CustomerAppointment } from '@/features/customer/types';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/utils/cn';

type Scope = 'upcoming' | 'past';
const PAGE_SIZE = 10;

const TABS: { value: Scope; label: string }[] = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'past', label: 'Histórico' },
];

const CustomerAppointmentsPage = () => {
  usePageTitle('Meus agendamentos');
  const [params, setParams] = useSearchParams();
  const scope: Scope = params.get('aba') === 'historico' ? 'past' : 'upcoming';
  const page = Math.max(1, Number(params.get('pagina')) || 1);
  const { data, isLoading, isFetching, error, refetch } = useCustomerAppointmentsQuery({ scope, page, pageSize: PAGE_SIZE });
  const [toCancel, setToCancel] = useState<CustomerAppointment | null>(null);
  const [toReschedule, setToReschedule] = useState<CustomerAppointment | null>(null);

  const go = (next: { scope?: Scope; page?: number }) => {
    const nextScope = next.scope ?? scope;
    const nextPage = next.page ?? 1;
    const search: Record<string, string> = {};
    if (nextScope === 'past') search.aba = 'historico';
    if (nextPage > 1) search.pagina = String(nextPage);
    setParams(search);
  };

  const items = data?.items ?? [];
  const firstConfirmedId = scope === 'upcoming' && page === 1 ? items.find((item) => item.status === 'confirmado')?.id : undefined;

  return (
    <div className="mx-auto w-full max-w-[768px] px-4 pb-16 pt-6 sm:px-6 sm:pt-8">
      <header className="space-y-2">
        <h1 className="text-[28px] font-bold leading-9 tracking-[-0.04em] text-ink sm:text-4xl sm:leading-10">Meus agendamentos</h1>
        <p className="text-base text-ink-variant">Gerencie seus horários e serviços agendados.</p>
      </header>

      <div className="mt-6 flex gap-8 py-2" role="tablist" aria-label="Agendamentos">
        {TABS.map((tab) => {
          const active = tab.value === scope;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => go({ scope: tab.value })}
              className={cn('flex min-h-[40px] flex-col items-start gap-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600', !active && 'opacity-40 hover:opacity-70')}
            >
              <span className={cn('text-sm font-bold uppercase tracking-[0.05em]', active ? 'text-primary-600' : 'text-ink')}>{tab.label}</span>
              <span className={cn('h-1 rounded-xl', active ? 'w-6 bg-primary-600' : 'w-2 bg-ink')} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      <section className={cn('mt-6 space-y-6', isFetching && !isLoading && 'opacity-60 transition-opacity')} role="tabpanel" aria-busy={isFetching}>
        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !items.length && page > 1 ? (
          <EmptyState
            icon={<CalendarX2 className="h-8 w-8" />}
            title="Nada nesta página"
            action={
              <button type="button" className={buttonClass('outline')} onClick={() => go({ page: 1 })}>
                Voltar à primeira página
              </button>
            }
          />
        ) : !items.length ? (
          scope === 'upcoming' ? (
            <BookMoreCard title="Nenhum horário marcado" description="Você não tem agendamentos futuros. Encontre uma barbearia e reserve em poucos toques." />
          ) : (
            <EmptyState
              icon={<History className="h-8 w-8" />}
              title="Seu histórico está vazio"
              description="Os atendimentos concluídos e cancelados aparecem aqui."
              action={
                <Link to="/filiais" className={buttonClass('primary', 'md')}>
                  Encontrar barbearia
                </Link>
              }
            />
          )
        ) : (
          <>
            {items.map((item) => (
              <AppointmentCard
                key={item.id}
                appointment={item}
                variant={scope === 'past' || item.status !== 'confirmado' ? 'minimal' : item.id === firstConfirmedId ? 'highlight' : 'default'}
                onCancel={setToCancel}
                onReschedule={setToReschedule}
              />
            ))}
            <Pagination page={data?.page ?? page} totalPages={data?.totalPages ?? 1} onChange={(next) => go({ page: next })} />
            {scope === 'upcoming' ? <BookMoreCard className="mt-8" /> : null}
          </>
        )}
      </section>

      <CancelAppointmentDialog appointment={toCancel} onClose={() => setToCancel(null)} />
      <RescheduleModal appointment={toReschedule} onClose={() => setToReschedule(null)} />
    </div>
  );
};

export default CustomerAppointmentsPage;
