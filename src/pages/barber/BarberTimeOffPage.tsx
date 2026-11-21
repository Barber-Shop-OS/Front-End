// Folgas e bloqueios do barbeiro (sem frame no Figma): jornada efetiva (somente leitura) e bloqueios
// futuros com criação/remoção. Conflito com agendamentos retorna TIME_OFF_CONFLICT.
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarOff, Clock, Plus, Trash2 } from 'lucide-react';

import { Alert, Button, Card, CardTitle, Checkbox, ConfirmDialog, EmptyState, ErrorState, Input, ListSkeleton, Modal, PageHeader, useToast } from '@/components/ui';
import { useCreateBarberTimeOffMutation, useDeleteBarberTimeOffMutation, useGetBarberWorkingHoursQuery, useListBarberTimeOffQuery } from '@/features/barber/api';
import { BarberProfileSelect } from '@/features/barber/components';
import { describeTimeOff, timeOffSchema, timeOffToPayload, type TimeOffForm } from '@/features/barber/helpers';
import type { BarberTimeOff } from '@/features/barber/types';
import { useBarberProfile } from '@/features/barber/useBarberProfile';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage, errorCode } from '@/utils/apiErrors';
import { WEEKDAYS, todayIn } from '@/utils/date';

const ORDER = [1, 2, 3, 4, 5, 6, 0];

const BarberTimeOffPage = () => {
  usePageTitle('Folgas e bloqueios');
  const toast = useToast();
  const ctx = useBarberProfile();
  const barberId = ctx.profile?.id ?? 0;
  const tz = ctx.timezone;
  const today = todayIn(tz);
  const [nowIso] = useState(() => new Date().toISOString());
  const hours = useGetBarberWorkingHoursQuery(barberId, { skip: !barberId });
  const list = useListBarberTimeOffQuery({ barberId, from: nowIso }, { skip: !barberId });
  const [create, { isLoading: creating }] = useCreateBarberTimeOffMutation();
  const [remove, { isLoading: removing }] = useDeleteBarberTimeOffMutation();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BarberTimeOff | null>(null);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<TimeOffForm>({ resolver: zodResolver(timeOffSchema), defaultValues: { start_date: today, end_date: today, all_day: true, start_time: '12:00', end_time: '13:00', reason: '' } });

  if (!ctx.profile) return <EmptyState title="Você ainda não tem perfil de barbeiro" />;
  const allDay = watch('all_day');

  const onSubmit = handleSubmit(async (values) => {
    try {
      await create({ barberId, ...timeOffToPayload(values, tz) }).unwrap();
      toast.success('Bloqueio criado.');
      setOpen(false);
    } catch (error) {
      toast.error(errorCode(error) === 'TIME_OFF_CONFLICT' ? 'Há agendamentos nesse período. Peça ao atendimento para reagendá-los antes.' : apiErrorMessage(error));
    }
  });

  return (
    <div>
      <PageHeader
        title="Folgas e bloqueios"
        description="Bloqueie períodos para que ninguém agende com você."
        action={
          <>
            <BarberProfileSelect ctx={ctx} />
            <Button
              icon={<Plus className="h-4 w-4" aria-hidden="true" />}
              onClick={() => {
                reset({ start_date: today, end_date: today, all_day: true, start_time: '12:00', end_time: '13:00', reason: '' });
                setOpen(true);
              }}
            >
              Novo bloqueio
            </Button>
          </>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <CalendarOff className="h-5 w-5 text-primary-600" aria-hidden="true" /> Próximos bloqueios
            </span>
          </CardTitle>
          {list.isLoading ? (
            <ListSkeleton rows={3} />
          ) : list.error ? (
            <ErrorState error={list.error} onRetry={list.refetch} />
          ) : !list.data?.length ? (
            <p className="py-6 text-center text-sm text-ink-variant">Nenhum bloqueio futuro.</p>
          ) : (
            <ul className="divide-y divide-surface-low">
              {list.data.map((item) => {
                const d = describeTimeOff(item.start_at, item.end_at, tz);
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold capitalize text-ink">{d.dates}</p>
                      <p className="text-xs text-ink-variant">
                        {d.hours}
                        {item.reason ? ` · ${item.reason}` : ''}
                      </p>
                    </div>
                    <button type="button" className="rounded-lg p-2 text-ink-subtle hover:bg-danger-50 hover:text-danger-600" aria-label="Remover bloqueio" onClick={() => setToDelete(item)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" aria-hidden="true" /> Minha jornada
            </span>
          </CardTitle>
          {hours.isLoading ? (
            <ListSkeleton rows={4} />
          ) : hours.data ? (
            <>
              <ul className="divide-y divide-surface-low text-sm">
                {ORDER.map((weekday) => {
                  const ranges = hours.data!.working_hours.filter((h) => h.weekday === weekday);
                  return (
                    <li key={weekday} className="flex justify-between py-2">
                      <span className="font-semibold text-ink">{WEEKDAYS[weekday]}</span>
                      <span className="text-ink-variant">{ranges.length ? ranges.map((r) => `${r.start_time.slice(0, 5)}–${r.end_time.slice(0, 5)}`).join(', ') : 'Folga'}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-3 text-xs text-ink-variant">{hours.data.uses_branch_hours ? 'Segue o horário da filial.' : 'Jornada personalizada.'} Alterações são feitas pelo dono.</p>
            </>
          ) : null}
        </Card>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo bloqueio"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => void onSubmit()} loading={creating}>
              Bloquear
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <Checkbox label="Dia inteiro" {...register('all_day')} />
          <div className="grid grid-cols-2 gap-3">
            <Input label="De" type="date" min={today} error={errors.start_date?.message} {...register('start_date')} />
            <Input label="Até" type="date" min={today} error={errors.end_date?.message} {...register('end_date')} />
          </div>
          {!allDay ? (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Início" type="time" error={errors.start_time?.message} {...register('start_time')} />
              <Input label="Fim" type="time" error={errors.end_time?.message} {...register('end_time')} />
            </div>
          ) : null}
          <Input label="Motivo (opcional)" maxLength={255} error={errors.reason?.message} {...register('reason')} />
          <Alert tone="info">Se houver agendamentos no período, o bloqueio não é criado.</Alert>
          <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
        </form>
      </Modal>
      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remover bloqueio?"
        description="O período volta a ficar disponível para agendamentos."
        tone="danger"
        confirmLabel="Remover"
        loading={removing}
        onCancel={() => setToDelete(null)}
        onConfirm={async () => {
          if (!toDelete) return;
          try {
            await remove({ barberId, timeOffId: toDelete.id }).unwrap();
            toast.success('Bloqueio removido.');
            setToDelete(null);
          } catch (error) {
            toast.error(apiErrorMessage(error));
          }
        }}
      />
    </div>
  );
};

export default BarberTimeOffPage;
