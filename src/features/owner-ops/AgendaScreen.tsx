// Figma 1:4201 "Agenda da Filial" / 1:5337 "Agenda - Atendimento": navegação por dia/semana, filtro por
// barbeiro e status, colunas por barbeiro (dia) ou por dia (semana), resumo do período e detalhe com ações.
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

import { ButtonLink, ErrorState, PageHeader, Select, Skeleton, Tabs } from '@/components/ui';
import { useListAppointmentsQuery } from '@/features/appointments/api';
import type { ActiveContext } from '@/features/workspace/useActiveContext';
import type { Appointment, AppointmentStatus } from '@/types/api';
import { addDays, formatLocalDateLong, formatLocalDateShort, todayIn } from '@/utils/date';

import { agendaDays, countByStatus, groupByBarber, groupByDay, type AgendaView } from './agenda';
import { useOwnerOpsBarbersQuery } from './api';
import { rangeToUtc } from './metrics';
import { AppointmentDetailModal, DayBoard, WeekBoard } from './staff';

export const AgendaScreen = ({ ctx, newAppointmentPath, title }: { ctx: ActiveContext; newAppointmentPath: string; title: string }) => {
  const branch = ctx.branch!;
  const timeZone = branch.timezone;
  const today = todayIn(timeZone);
  const [date, setDate] = useState(today);
  const [view, setView] = useState<AgendaView>('day');
  const [barberId, setBarberId] = useState<number | ''>('');
  const [status, setStatus] = useState<AppointmentStatus | ''>('');
  const [selected, setSelected] = useState<Appointment | null>(null);

  const days = useMemo(() => agendaDays(date, view), [date, view]);
  const range = rangeToUtc({ from: days[0], to: days[days.length - 1] }, timeZone);
  const { data, isLoading, isFetching, error, refetch } = useListAppointmentsQuery(
    { branch_id: branch.id, barber_id: barberId || undefined, status: status || undefined, from: range.from, to: range.to, pageSize: 100, sortBy: 'start_at', sortDir: 'ASC' },
    { pollingInterval: 60000 }
  );
  const { data: barbers = [] } = useOwnerOpsBarbersQuery({ branch_id: branch.id });
  const items = data?.items ?? [];
  const counts = countByStatus(items);
  const columns = groupByBarber(items, barberId ? barbers.filter((b) => b.id === barberId) : barbers);
  const byDay = groupByDay(items, days, timeZone);
  // Mantém o detalhe atualizado depois das ações (a lista é refeita pelo cache).
  const current = selected ? items.find((a) => a.id === selected.id) ?? selected : null;

  const step = view === 'day' ? 1 : 7;
  const label = view === 'day' ? formatLocalDateLong(date) : `${formatLocalDateShort(days[0])} – ${formatLocalDateShort(days[6])}`;

  return (
    <div>
      <PageHeader
        title={title}
        description={branch.name}
        action={
          <ButtonLink to={newAppointmentPath} icon={<Plus className="h-4 w-4" aria-hidden="true" />}>
            Novo Agendamento
          </ButtonLink>
        }
      />

      <div className="mb-6 flex flex-col gap-3 rounded-xl bg-white p-3 shadow-card lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low" aria-label="Anterior" onClick={() => setDate(addDays(date, -step))}>
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button type="button" className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-600 hover:bg-surface-low" onClick={() => setDate(today)}>
            Hoje
          </button>
          <button type="button" className="rounded-lg p-2 text-ink-variant hover:bg-surface-low" aria-label="Próximo" onClick={() => setDate(addDays(date, step))}>
            <ChevronRight className="h-5 w-5" />
          </button>
          <label className="sr-only" htmlFor="agenda-date">
            Data
          </label>
          <input id="agenda-date" type="date" value={date} onChange={(e) => e.target.value && setDate(e.target.value)} className="h-10 rounded-lg bg-surface-low px-3 text-sm" />
        </div>
        <p className="flex-1 text-base font-bold capitalize text-ink">
          {label}
          {isFetching && !isLoading ? <span className="ml-2 text-xs font-normal text-ink-subtle">atualizando…</span> : null}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label="Barbeiro" className="h-10" containerClassName="w-44" value={barberId} onChange={(e) => setBarberId(e.target.value ? Number(e.target.value) : '')}>
            <option value="">Todos os barbeiros</option>
            {barbers.map((b) => (
              <option key={b.id} value={b.id}>
                {b.display_name || `Barbeiro #${b.id}`}
              </option>
            ))}
          </Select>
          <Select aria-label="Status" className="h-10" containerClassName="w-40" value={status} onChange={(e) => setStatus(e.target.value as AppointmentStatus | '')}>
            <option value="">Todos os status</option>
            <option value="confirmado">Confirmados</option>
            <option value="concluido">Concluídos</option>
            <option value="nao_compareceu">Não compareceu</option>
            <option value="cancelado">Cancelados</option>
          </Select>
          <Tabs
            value={view}
            onChange={setView}
            tabs={[
              { value: 'day', label: 'Dia' },
              { value: 'week', label: 'Semana' },
            ]}
          />
        </div>
      </div>

      <dl className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Confirmados', value: counts.confirmado, cls: 'text-primary-600' },
          { label: 'Concluídos', value: counts.concluido, cls: 'text-success-700' },
          { label: 'Não compareceu', value: counts.nao_compareceu, cls: 'text-danger-600' },
          { label: 'Cancelados', value: counts.cancelado, cls: 'text-ink-variant' },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-white px-4 py-3 shadow-card">
            <dt className="text-xs font-semibold uppercase tracking-label text-ink-variant">{item.label}</dt>
            <dd className={`text-2xl font-black ${item.cls}`}>{item.value}</dd>
          </div>
        ))}
      </dl>

      {isLoading ? (
        <div className="flex gap-4">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-72 w-72" />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : view === 'day' ? (
        <DayBoard columns={columns} onOpen={setSelected} />
      ) : (
        <WeekBoard
          days={days}
          byDay={byDay}
          onOpen={setSelected}
          timeZone={timeZone}
          barbers={barbers}
          onPickDay={(day) => {
            setDate(day);
            setView('day');
          }}
        />
      )}
      {data && data.total > items.length ? <p className="mt-3 text-xs text-ink-variant">Mostrando {items.length} de {data.total} agendamentos. Filtre por barbeiro para ver todos.</p> : null}

      <AppointmentDetailModal appointment={current} onClose={() => setSelected(null)} barbers={barbers} />
    </div>
  );
};
