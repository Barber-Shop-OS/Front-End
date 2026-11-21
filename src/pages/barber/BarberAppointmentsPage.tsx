// Figma 1:4578 "Agendamentos do Barbeiro": faixa da semana para escolher o dia, resumo por status e lista
// agrupada em Manhã/Tarde/Noite; tocar no card abre o detalhe com as ações permitidas pela API.
import { useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, Phone } from 'lucide-react';

import { EmptyState, ErrorState, ListSkeleton, PageHeader } from '@/components/ui';
import { useListAppointmentsQuery } from '@/features/appointments/api';
import { countByStatus } from '@/features/owner-ops/agenda';
import { BarberProfileSelect, Initials, StatusChip, statusEdgeClass } from '@/features/barber/components';
import { DAY_PERIOD_LABEL, appointmentClientName, appointmentClientPhone, dayRangeUtc, groupByDayPeriod, monthLabel, weekDates } from '@/features/barber/helpers';
import { useBarberProfile } from '@/features/barber/useBarberProfile';
import { AppointmentDetailModal } from '@/features/owner-ops/staff';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Appointment } from '@/types/api';
import { cn } from '@/utils/cn';
import { WEEKDAYS_SHORT, addDays, formatTime, todayIn, weekdayOf } from '@/utils/date';
import { formatBRL, formatPhone, whatsappLink } from '@/utils/format';

const BarberAppointmentsPage = () => {
  usePageTitle('Meus agendamentos');
  const ctx = useBarberProfile();
  const tz = ctx.timezone;
  const today = todayIn(tz);
  const [date, setDate] = useState(today);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const range = dayRangeUtc(date, tz);
  const { data, isLoading, error, refetch } = useListAppointmentsQuery(
    { barber_id: ctx.profile?.id, from: range.from, to: range.to, pageSize: 100, sortBy: 'start_at', sortDir: 'ASC' },
    { skip: !ctx.profile, pollingInterval: 60000 }
  );

  if (!ctx.profile) return <EmptyState title="Você ainda não tem perfil de barbeiro" />;
  const items = data?.items ?? [];
  const counts = countByStatus(items);
  const groups = groupByDayPeriod(items, tz);
  const days = weekDates(date);
  const current = selected ? items.find((a) => a.id === selected.id) ?? selected : null;

  return (
    <div>
      <PageHeader title="Agendamentos" description={monthLabel(date)} action={<BarberProfileSelect ctx={ctx} />} />

      <div className="mb-6 flex items-center gap-2 rounded-xl bg-white p-2 shadow-card">
        <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low" aria-label="Semana anterior" onClick={() => setDate(addDays(date, -7))}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="grid flex-1 grid-cols-7 gap-1">
          {days.map((day) => (
            <button
              key={day}
              type="button"
              aria-pressed={day === date}
              onClick={() => setDate(day)}
              className={cn(
                'flex flex-col items-center rounded-lg py-2 text-xs font-semibold transition',
                day === date ? 'bg-primary-600 text-white shadow-primary' : day === today ? 'bg-primary-50 text-primary-600' : 'text-ink-variant hover:bg-surface-low'
              )}
            >
              <span className="uppercase tracking-label">{WEEKDAYS_SHORT[weekdayOf(day)]}</span>
              <span className="text-lg font-black">{day.slice(8)}</span>
            </button>
          ))}
        </div>
        <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low" aria-label="Próxima semana" onClick={() => setDate(addDays(date, 7))}>
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-primary-100 px-3 py-1 text-primary-600">{counts.confirmado} confirmados</span>
        <span className="rounded-full bg-success-50 px-3 py-1 text-success-700">{counts.concluido} concluídos</span>
        {counts.nao_compareceu ? <span className="rounded-full bg-danger-50 px-3 py-1 text-danger-700">{counts.nao_compareceu} faltas</span> : null}
        {counts.cancelado ? <span className="rounded-full bg-surface-high px-3 py-1 text-ink-variant">{counts.cancelado} cancelados</span> : null}
        {date !== today ? (
          <button type="button" className="ml-auto text-primary-600" onClick={() => setDate(today)}>
            Voltar para hoje
          </button>
        ) : null}
      </div>

      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : groups.length === 0 ? (
        <EmptyState title="Nenhum agendamento neste dia" description="Aproveite para descansar ou bloqueie horários em Folgas." />
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.period}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-label text-ink-variant">{DAY_PERIOD_LABEL[group.period]}</h2>
              <ul className="grid gap-3 lg:grid-cols-2">
                {group.items.map((a) => {
                  const phone = appointmentClientPhone(a);
                  const wa = whatsappLink(phone);
                  return (
                    <li key={a.id} className={cn('relative overflow-hidden rounded-xl bg-white shadow-card', a.status === 'cancelado' && 'opacity-60')}>
                      <span className={cn('absolute inset-y-0 left-0 w-1', statusEdgeClass(a.status))} aria-hidden="true" />
                      <button type="button" onClick={() => setSelected(a)} className="flex w-full items-center gap-4 p-4 pl-5 text-left">
                        <Initials name={appointmentClientName(a)} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-black text-primary-600">
                            {formatTime(a.start_at, tz)} – {formatTime(a.end_at, tz)}
                          </span>
                          <span className="block truncate font-semibold text-ink">{appointmentClientName(a)}</span>
                          <span className="block truncate text-xs text-ink-variant">
                            {a.service_name_snapshot} · {formatBRL(a.price_snapshot)}
                          </span>
                        </span>
                        <StatusChip status={a.status} />
                      </button>
                      {phone ? (
                        <div className="flex gap-4 border-t border-surface-low px-5 py-2 text-xs font-semibold">
                          <a href={`tel:${phone}`} className="inline-flex items-center gap-1 text-ink-variant hover:text-primary-600">
                            <Phone className="h-3.5 w-3.5" aria-hidden="true" /> {formatPhone(phone)}
                          </a>
                          {wa ? (
                            <a href={wa} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-success-700">
                              <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" /> WhatsApp
                            </a>
                          ) : null}
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      <AppointmentDetailModal appointment={current} onClose={() => setSelected(null)} />
    </div>
  );
};

export default BarberAppointmentsPage;
