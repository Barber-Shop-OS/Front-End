// Figma 1:2444 "Gestão de Barbeiros" — detalhe/edição de um barbeiro: perfil (foto, nome, bio, filial),
// serviços que realiza, jornada de trabalho (ou horário da filial) e folgas/bloqueios.
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarOff, Camera, Clock, Plus, Save, Scissors, Trash2 } from 'lucide-react';

import { Alert, Avatar, Badge, Button, Card, CardTitle, ConfirmDialog, EmptyState, ErrorState, Input, ListSkeleton, Modal, PageHeader, Select, Skeleton, Textarea, useToast } from '@/components/ui';
import {
  useOwnerCreateTimeOffMutation,
  useOwnerDeleteTimeOffMutation,
  useOwnerGetBarberHoursQuery,
  useOwnerGetBarberQuery,
  useOwnerListServicesQuery,
  useOwnerListTimeOffQuery,
  useOwnerReplaceBarberHoursMutation,
  useOwnerSetBarberServicesMutation,
  useOwnerUpdateBarberMutation,
} from '@/features/owner-admin/api';
import { ImageUploadButton, WeekScheduleEditor } from '@/features/owner-admin/components';
import type { BarberTimeOff } from '@/features/owner-admin/types';
import { fromWeek, toWeek, validateWeek, type DaySchedule } from '@/features/owner-admin/utils';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage } from '@/utils/apiErrors';
import { WEEKDAYS, formatDateTime, localToUtcIso, todayIn } from '@/utils/date';
import { formatBRL, formatDuration } from '@/utils/format';

// ---------------------------------------------------------------------------------------------

const ProfileCard = ({ barberId }: { barberId: number }) => {
  const toast = useToast();
  const { barbershop, branches } = useActiveContext();
  const { data: barber } = useOwnerGetBarberQuery(barberId);
  const [update, { isLoading }] = useOwnerUpdateBarberMutation();
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [branchId, setBranchId] = useState<number>(0);

  useEffect(() => {
    if (!barber) return;
    setDisplayName(barber.display_name ?? '');
    setBio(barber.bio ?? '');
    setBranchId(barber.branch_id);
  }, [barber]);

  if (!barber) return <Skeleton className="h-72 w-full" />;
  const name = barber.display_name || barber.User?.name || `Barbeiro #${barber.id}`;

  const save = async () => {
    try {
      await update({
        id: barber.id,
        display_name: displayName.trim() || null,
        ...(bio.trim() ? { bio: bio.trim() } : {}),
        ...(branchId !== barber.branch_id ? { branch_id: branchId } : {}),
      }).unwrap();
      toast.success('Perfil atualizado.');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <Card>
      <div className="flex flex-col items-center text-center">
        <div className="relative">
          <Avatar name={name} src={barber.photo_url} size="lg" />
          <ImageUploadButton
            kind="barber_photo"
            barberId={barber.id}
            barbershopId={barbershop?.id}
            label="Trocar foto do barbeiro"
            className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-white shadow-elevated hover:bg-primary-700"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
          </ImageUploadButton>
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-[-0.025em] text-ink">{name}</h2>
        {barber.User?.email ? <p className="text-sm text-ink-variant">{barber.User.email}</p> : null}
        <Badge tone={barber.active ? 'green' : 'gray'} className="mt-2">
          {barber.active ? 'Ativo' : 'Inativo'}
        </Badge>
      </div>
      <form
        className="mt-6 space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <Input label="Nome de exibição" value={displayName} maxLength={120} onChange={(e) => setDisplayName(e.target.value)} />
        <Textarea label="Bio" value={bio} maxLength={500} onChange={(e) => setBio(e.target.value)} placeholder="Especialidades, experiência…" />
        {branches.length > 1 ? (
          <Select label="Filial" value={branchId} onChange={(e) => setBranchId(Number(e.target.value))} hint="Transferir muda onde o barbeiro recebe agendamentos.">
            {branches
              .filter((b) => b.active || b.id === barber.branch_id)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </Select>
        ) : null}
        <Button type="submit" block loading={isLoading} icon={<Save className="h-4 w-4" aria-hidden="true" />}>
          Salvar perfil
        </Button>
      </form>
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const ServicesCard = ({ barberId }: { barberId: number }) => {
  const toast = useToast();
  const { barbershop } = useActiveContext();
  const { data: barber } = useOwnerGetBarberQuery(barberId);
  const { data: services = [], isLoading } = useOwnerListServicesQuery(barbershop?.id ?? 0, { skip: !barbershop });
  const [setServices, { isLoading: saving }] = useOwnerSetBarberServicesMutation();
  const [selected, setSelected] = useState<number[]>([]);

  useEffect(() => {
    if (barber) setSelected((barber.services ?? []).map((s) => s.id));
  }, [barber]);

  const active = services.filter((s) => s.active);
  const dirty = barber ? [...selected].sort().join(',') !== (barber.services ?? []).map((s) => s.id).sort().join(',') : false;

  return (
    <Card>
      <CardTitle
        action={
          <Button
            size="sm"
            disabled={!dirty}
            loading={saving}
            onClick={async () => {
              try {
                await setServices({ id: barberId, service_ids: selected }).unwrap();
                toast.success('Serviços atualizados.');
              } catch (error) {
                toast.error(apiErrorMessage(error));
              }
            }}
          >
            Salvar
          </Button>
        }
      >
        <span className="inline-flex items-center gap-2">
          <Scissors className="h-5 w-5 text-primary-600" aria-hidden="true" /> Serviços realizados
        </span>
      </CardTitle>
      {isLoading ? (
        <ListSkeleton rows={3} />
      ) : active.length === 0 ? (
        <EmptyState title="Nenhum serviço ativo" description="Cadastre serviços para vinculá-los aos barbeiros." action={<Link className="font-semibold text-primary-600" to="/dashboard/servicos">Ir para serviços</Link>} />
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {active.map((service) => {
            const checked = selected.includes(service.id);
            return (
              <li key={service.id}>
                {/* eslint-disable-next-line jsx-a11y/label-has-associated-control -- input aninhado */}
                <label className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 transition ${checked ? 'border-primary-600 bg-primary-50' : 'border-outline-variant/40 hover:bg-surface-low'}`}>
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary-600"
                    checked={checked}
                    onChange={() => setSelected((cur) => (checked ? cur.filter((id) => id !== service.id) : [...cur, service.id]))}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-ink">{service.name}</span>
                    <span className="text-xs text-ink-variant">
                      {formatBRL(service.price)} · {formatDuration(service.duration)}
                    </span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const HoursCard = ({ barberId }: { barberId: number }) => {
  const toast = useToast();
  const { data, isLoading, error, refetch } = useOwnerGetBarberHoursQuery(barberId);
  const [replace, { isLoading: saving }] = useOwnerReplaceBarberHoursMutation();
  const [week, setWeek] = useState<DaySchedule[]>([]);
  const [custom, setCustom] = useState(false);

  useEffect(() => {
    if (!data) return;
    setWeek(toWeek(data.working_hours.map((h) => ({ weekday: h.weekday, start: h.start_time, end: h.end_time }))));
    setCustom(!data.uses_branch_hours);
  }, [data]);

  const save = async () => {
    const problem = custom ? validateWeek(week, (d) => WEEKDAYS[d]) : null;
    if (problem) {
      toast.error(problem);
      return;
    }
    try {
      await replace({
        id: barberId,
        working_hours: custom ? fromWeek(week).map((r) => ({ weekday: r.weekday, start_time: r.start, end_time: r.end })) : [],
      }).unwrap();
      toast.success(custom ? 'Jornada salva.' : 'O barbeiro voltou a seguir o horário da filial.');
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardTitle
        action={
          <Button size="sm" onClick={() => void save()} loading={saving} disabled={!data}>
            Salvar
          </Button>
        }
      >
        <span className="inline-flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary-600" aria-hidden="true" /> Jornada de trabalho
        </span>
      </CardTitle>
      {isLoading ? (
        <ListSkeleton rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <>
          <div className="mb-4 flex rounded-lg bg-surface-low p-1 text-sm font-semibold" role="radiogroup" aria-label="Origem da jornada">
            {[
              { value: false, label: 'Horário da filial' },
              { value: true, label: 'Jornada personalizada' },
            ].map((opt) => (
              <button
                key={String(opt.value)}
                type="button"
                role="radio"
                aria-checked={custom === opt.value}
                onClick={() => setCustom(opt.value)}
                className={`flex-1 rounded-lg px-3 py-2 transition ${custom === opt.value ? 'bg-white text-primary-600 shadow-card' : 'text-ink-variant'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {custom ? (
            <>
              <p className="mb-2 text-xs text-ink-variant">A jornada precisa caber dentro do horário de funcionamento da filial.</p>
              <WeekScheduleEditor value={week} onChange={setWeek} />
            </>
          ) : (
            <ul className="divide-y divide-surface-low text-sm">
              {week.map((day) => (
                <li key={day.weekday} className="flex justify-between py-2">
                  <span className="font-semibold text-ink">{WEEKDAYS[day.weekday]}</span>
                  <span className="text-ink-variant">{day.enabled ? day.ranges.map((r) => `${r.start}–${r.end}`).join(', ') : 'Fechado'}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const TimeOffCard = ({ barberId }: { barberId: number }) => {
  const toast = useToast();
  const { data: hours } = useOwnerGetBarberHoursQuery(barberId);
  const timeZone = hours?.timezone;
  const today = todayIn(timeZone);
  const { data = [], isLoading } = useOwnerListTimeOffQuery({ id: barberId, from: new Date().toISOString() });
  const [create, { isLoading: creating }] = useOwnerCreateTimeOffMutation();
  const [remove, { isLoading: removing }] = useOwnerDeleteTimeOffMutation();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BarberTimeOff | null>(null);
  const [form, setForm] = useState({ date: today, endDate: today, allDay: true, start: '12:00', end: '13:00', reason: '' });

  const submit = async () => {
    const startAt = localToUtcIso(form.date, form.allDay ? '00:00' : form.start, timeZone);
    const endAt = form.allDay ? localToUtcIso(form.endDate, '23:59', timeZone) : localToUtcIso(form.date, form.end, timeZone);
    if (new Date(endAt) <= new Date(startAt)) {
      toast.error('O fim precisa ser depois do início.');
      return;
    }
    try {
      await create({ id: barberId, start_at: startAt, end_at: endAt, reason: form.reason.trim() || undefined }).unwrap();
      toast.success('Bloqueio criado.');
      setOpen(false);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  };

  return (
    <Card>
      <CardTitle
        action={
          <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={() => setOpen(true)}>
            Bloquear
          </Button>
        }
      >
        <span className="inline-flex items-center gap-2">
          <CalendarOff className="h-5 w-5 text-primary-600" aria-hidden="true" /> Folgas e bloqueios
        </span>
      </CardTitle>
      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : data.length === 0 ? (
        <p className="text-sm text-ink-variant">Nenhuma folga ou bloqueio futuro.</p>
      ) : (
        <ul className="divide-y divide-surface-low">
          {data.map((item) => (
            <li key={item.id} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink">
                  {formatDateTime(item.start_at, timeZone)} → {formatDateTime(item.end_at, timeZone)}
                </p>
                {item.reason ? <p className="text-xs text-ink-variant">{item.reason}</p> : null}
              </div>
              <button type="button" className="rounded-lg p-2 text-ink-subtle hover:bg-danger-50 hover:text-danger-600" aria-label="Remover bloqueio" onClick={() => setToDelete(item)}>
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

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
            <Button onClick={() => void submit()} loading={creating}>
              Criar bloqueio
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-ink">
            <input type="checkbox" className="h-4 w-4 accent-primary-600" checked={form.allDay} onChange={(e) => setForm({ ...form, allDay: e.target.checked })} />
            Dia inteiro
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input label={form.allDay ? 'De' : 'Data'} type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value, endDate: e.target.value > form.endDate ? e.target.value : form.endDate })} />
            {form.allDay ? <Input label="Até" type="date" min={form.date} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /> : <div />}
          </div>
          {!form.allDay ? (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Início" type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} />
              <Input label="Fim" type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} />
            </div>
          ) : null}
          <Input label="Motivo" value={form.reason} maxLength={200} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Ex.: consulta médica, férias" />
          <Alert tone="info">Se houver agendamentos no período, a criação é bloqueada — reagende-os antes.</Alert>
        </div>
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
            await remove({ id: barberId, timeOffId: toDelete.id }).unwrap();
            toast.success('Bloqueio removido.');
            setToDelete(null);
          } catch (error) {
            toast.error(apiErrorMessage(error));
          }
        }}
      />
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const BarberDetailPage = () => {
  const barberId = Number(useParams().barberId);
  const { data: barber, isLoading, error, refetch } = useOwnerGetBarberQuery(barberId, { skip: !barberId });
  const name = barber ? barber.display_name || barber.User?.name || `Barbeiro #${barber.id}` : 'Barbeiro';
  usePageTitle(name);

  const back = (
    <Link to="/dashboard/barbeiros" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600">
      <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Barbeiros
    </Link>
  );

  if (isLoading) return <ListSkeleton rows={5} />;
  if (error || !barber) {
    return (
      <div>
        <PageHeader back={back} title="Barbeiro" />
        <ErrorState error={error} title="Barbeiro não encontrado ou inativo" onRetry={refetch} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader back={back} title={name} description="Perfil, serviços, jornada e bloqueios do profissional." />
      {!barber.active ? (
        <Alert tone="warning" className="mb-6" title="Barbeiro inativo">
          Ele não recebe novos agendamentos. Reative pela lista de barbeiros.
        </Alert>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <ProfileCard barberId={barber.id} />
        <div className="space-y-6">
          <ServicesCard barberId={barber.id} />
          <HoursCard barberId={barber.id} />
          <TimeOffCard barberId={barber.id} />
        </div>
      </div>
    </div>
  );
};

export default BarberDetailPage;
