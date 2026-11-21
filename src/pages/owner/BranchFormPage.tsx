// Figma 1:3012 "Gestão de Filiais" (criar/editar): dados da filial, endereço com busca por CEP, horário de
// funcionamento (/branch/{id}/opening-hours) e fechamentos (/branch/{id}/closures).
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { skipToken } from '@reduxjs/toolkit/query';
import { ArrowLeft, CalendarOff, Clock, MapPin, Plus, Save, Store, Trash2, Users } from 'lucide-react';

import {
  Alert,
  Button,
  ButtonLink,
  Card,
  CardTitle,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  Input,
  ListSkeleton,
  Modal,
  PageHeader,
  Select,
  Skeleton,
  useToast,
} from '@/components/ui';
import { WeekScheduleEditor } from '@/features/owner-admin/components';
import { BR_TIMEZONES, BR_UFS, branchSchema, type BranchFormValues } from '@/features/owner-admin/schemas';
import { fromWeek, lookupCep, maskCep, onlyDigits, toWeek, validateWeek, type DaySchedule } from '@/features/owner-admin/utils';
import {
  useCreateBranchMutation,
  useCreateClosureMutation,
  useDeleteClosureMutation,
  useGetBranchQuery,
  useGetOpeningHoursQuery,
  useListClosuresQuery,
  useReplaceOpeningHoursMutation,
  useUpdateBranchMutation,
} from '@/features/workspace/api';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { usePageTitle } from '@/hooks/usePageTitle';
import type { Branch, BranchClosure } from '@/types/api';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';
import { WEEKDAYS, formatLocalDateLong, todayIn } from '@/utils/date';

const DEFAULT_WEEK: DaySchedule[] = toWeek(
  [1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday, start: '09:00', end: weekday === 6 ? '18:00' : '20:00' }))
);

const emptyValues: BranchFormValues = {
  name: '',
  phone: '',
  whatsapp: '',
  timezone: 'America/Sao_Paulo',
  cep: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
};

const valuesFrom = (branch: Branch): BranchFormValues => ({
  name: branch.name,
  phone: branch.phone ?? '',
  whatsapp: branch.whatsapp ?? '',
  timezone: branch.timezone || 'America/Sao_Paulo',
  cep: maskCep(branch.Address?.cep ?? ''),
  street: branch.Address?.street ?? '',
  number: branch.Address?.number ? String(branch.Address.number) : '',
  complement: branch.Address?.complement ?? '',
  neighborhood: branch.Address?.neighborhood ?? '',
  city: branch.Address?.city ?? '',
  state: branch.Address?.state ?? '',
});

// ---------------------------------------------------------------------------------------------

const ClosuresCard = ({ branchId, timezone }: { branchId: number; timezone: string }) => {
  const toast = useToast();
  const { data: closures = [], isLoading, error, refetch } = useListClosuresQuery(branchId);
  const [createClosure, { isLoading: creating }] = useCreateClosureMutation();
  const [deleteClosure, { isLoading: deleting }] = useDeleteClosureMutation();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BranchClosure | null>(null);
  const [form, setForm] = useState({ date: todayIn(timezone), all_day: true, start_time: '12:00', end_time: '14:00', reason: '' });
  const [formError, setFormError] = useState<string | null>(null);

  const today = todayIn(timezone);
  const upcoming = closures.filter((closure) => closure.date >= today).sort((a, b) => a.date.localeCompare(b.date));

  const submit = async () => {
    if (!form.date) return setFormError('Informe a data.');
    if (!form.all_day && form.start_time >= form.end_time) return setFormError('O início precisa ser antes do fim.');
    setFormError(null);
    try {
      await createClosure({
        id: branchId,
        date: form.date,
        all_day: form.all_day,
        ...(form.all_day ? {} : { start_time: form.start_time, end_time: form.end_time }),
        reason: form.reason.trim() || undefined,
      }).unwrap();
      toast.success('Fechamento cadastrado.');
      setOpen(false);
      setForm((current) => ({ ...current, reason: '' }));
    } catch (err) {
      setFormError(apiErrorMessage(err));
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    try {
      await deleteClosure({ id: branchId, closureId: toDelete.id }).unwrap();
      toast.success('Fechamento removido.');
      setToDelete(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    }
  };

  return (
    <Card>
      <CardTitle
        action={
          <Button size="sm" variant="secondary" icon={<Plus className="h-4 w-4" aria-hidden="true" />} onClick={() => setOpen(true)}>
            Adicionar
          </Button>
        }
      >
        <span className="inline-flex items-center gap-2">
          <CalendarOff className="h-5 w-5 text-primary-600" aria-hidden="true" /> Fechamentos e feriados
        </span>
      </CardTitle>
      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : upcoming.length === 0 ? (
        <p className="rounded-lg bg-surface-low px-4 py-6 text-center text-sm text-ink-variant">Nenhum fechamento programado.</p>
      ) : (
        <ul className="divide-y divide-surface-low">
          {upcoming.map((closure) => (
            <li key={closure.id} className="flex items-center justify-between gap-3 py-3">
              <div>
                <p className="text-sm font-semibold text-ink">{formatLocalDateLong(closure.date)}</p>
                <p className="text-xs text-ink-variant">
                  {closure.all_day ? 'Dia inteiro' : `${closure.start_time?.slice(0, 5)} às ${closure.end_time?.slice(0, 5)}`}
                  {closure.reason ? ` · ${closure.reason}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setToDelete(closure)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-subtle hover:bg-danger-50 hover:text-danger-600"
                aria-label={`Remover fechamento de ${formatLocalDateLong(closure.date)}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Novo fechamento"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button loading={creating} onClick={() => void submit()}>
              Salvar
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Data" type="date" min={today} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          <Checkbox label="Fechado o dia inteiro" checked={form.all_day} onChange={(e) => setForm({ ...form, all_day: e.target.checked })} />
          {!form.all_day ? (
            <div className="grid grid-cols-2 gap-3">
              <Input label="Das" type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              <Input label="Até" type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
            </div>
          ) : null}
          <Input label="Motivo (opcional)" placeholder="Ex.: Feriado de Natal" maxLength={255} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
          {formError ? <Alert tone="error">{formError}</Alert> : null}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Remover fechamento?"
        description="A filial volta a aceitar agendamentos nesse período."
        confirmLabel="Remover"
        tone="danger"
        loading={deleting}
        onConfirm={() => void remove()}
        onCancel={() => setToDelete(null)}
      />
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const BranchFormPage = () => {
  const { branchId: branchParam } = useParams();
  const branchId = branchParam ? Number(branchParam) : null;
  const isEdit = branchId !== null;
  usePageTitle(isEdit ? 'Editar filial' : 'Nova filial');
  const navigate = useNavigate();
  const toast = useToast();
  const { barbershop, isOwner } = useActiveContext();

  const { data: branch, isLoading, error, refetch } = useGetBranchQuery(branchId ?? skipToken);
  const { data: openingHours, isLoading: hoursLoading } = useGetOpeningHoursQuery(branchId ?? skipToken);
  const [createBranch, { isLoading: creating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: updating }] = useUpdateBranchMutation();
  const [replaceHours, { isLoading: savingHours }] = useReplaceOpeningHoursMutation();

  const [week, setWeek] = useState<DaySchedule[]>(DEFAULT_WEEK);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [cepStatus, setCepStatus] = useState<'idle' | 'loading' | 'notfound'>('idle');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isDirty },
  } = useForm<BranchFormValues>({ resolver: zodResolver(branchSchema), defaultValues: emptyValues });

  useEffect(() => {
    if (branch) reset(valuesFrom(branch));
  }, [branch, reset]);

  useEffect(() => {
    if (openingHours) setWeek(toWeek(openingHours.map((h) => ({ weekday: h.weekday, start: h.opens_at, end: h.closes_at }))));
  }, [openingHours]);

  const cepField = register('cep');
  const onCepChange = async (raw: string) => {
    const masked = maskCep(raw);
    setValue('cep', masked, { shouldDirty: true });
    if (onlyDigits(masked).length !== 8) return setCepStatus('idle');
    setCepStatus('loading');
    const found = await lookupCep(masked);
    if (!found) return setCepStatus('notfound');
    setCepStatus('idle');
    if (found.street) setValue('street', found.street, { shouldDirty: true });
    if (found.neighborhood) setValue('neighborhood', found.neighborhood, { shouldDirty: true });
    if (found.city) setValue('city', found.city, { shouldDirty: true, shouldValidate: true });
    if (found.state) setValue('state', found.state, { shouldDirty: true, shouldValidate: true });
  };

  const hoursPayload = () => fromWeek(week).map((item) => ({ weekday: item.weekday, opens_at: item.start, closes_at: item.end }));
  const dayName = (weekday: number) => WEEKDAYS[weekday];

  const onSubmit = handleSubmit(async (values) => {
    if (!barbershop) return;
    const parsed = branchSchema.parse(values);
    const body = {
      name: parsed.name,
      phone: parsed.phone || null,
      whatsapp: parsed.whatsapp || null,
      timezone: parsed.timezone,
      cep: parsed.cep,
      street: parsed.street || null,
      number: Number(parsed.number),
      complement: parsed.complement || null,
      neighborhood: parsed.neighborhood || null,
      city: parsed.city,
      state: parsed.state,
    };
    try {
      if (isEdit && branchId) {
        await updateBranch({ id: branchId, ...body }).unwrap();
        toast.success('Filial atualizada.');
        reset(values);
      } else {
        const weekError = validateWeek(week, dayName);
        if (weekError) {
          setHoursError(weekError);
          return;
        }
        const result = await createBranch({ ...body, barbershop_id: barbershop.id }).unwrap();
        const created = result.branch;
        try {
          await replaceHours({ id: created.id, opening_hours: hoursPayload() }).unwrap();
        } catch (err) {
          toast.error(`Filial criada, mas o horário não foi salvo: ${apiErrorMessage(err)}`);
        }
        toast.success('Filial criada.');
        navigate(`/dashboard/filiais/${created.id}`, { replace: true });
      }
    } catch (err) {
      const fields = fieldErrors(err);
      Object.entries(fields).forEach(([field, message]) => {
        if (field in emptyValues) setError(field as keyof BranchFormValues, { message });
      });
      toast.error(apiErrorMessage(err));
    }
  });

  const saveHours = async () => {
    if (!branchId) return;
    const weekError = validateWeek(week, dayName);
    setHoursError(weekError);
    if (weekError) return;
    try {
      await replaceHours({ id: branchId, opening_hours: hoursPayload() }).unwrap();
      toast.success('Horário de funcionamento salvo.');
    } catch (err) {
      setHoursError(apiErrorMessage(err));
    }
  };

  if (!barbershop) return <EmptyState title="Nenhuma barbearia selecionada" />;
  if (!isEdit && !isOwner) return <EmptyState title="Acesso restrito ao dono" description="Somente o dono pode cadastrar novas filiais." />;
  if (isEdit && isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <ListSkeleton rows={4} />
      </div>
    );
  }
  if (isEdit && (error || !branch)) return <ErrorState error={error ?? { message: 'Filial não encontrada' }} title="Filial não encontrada" onRetry={refetch} />;

  const timezone = watch('timezone') || 'America/Sao_Paulo';

  return (
    <div>
      <PageHeader
        back={
          <Link to="/dashboard/filiais" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Filiais
          </Link>
        }
        title={isEdit ? branch?.name ?? 'Filial' : 'Nova Filial'}
        description={isEdit ? 'Atualize os dados, o horário de funcionamento e os fechamentos da unidade.' : 'Cadastre uma nova unidade da sua barbearia.'}
        action={
          isEdit ? (
            <ButtonLink to={`/dashboard/filiais/${branchId}/barbeiros`} variant="secondary" icon={<Users className="h-4 w-4" aria-hidden="true" />}>
              Barbeiros da filial
            </ButtonLink>
          ) : null
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        <form onSubmit={(e) => void onSubmit(e)} className="space-y-6 lg:col-span-3" noValidate>
          <Card>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <Store className="h-5 w-5 text-primary-600" aria-hidden="true" /> Dados da filial
              </span>
            </CardTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nome da filial" required placeholder="Ex.: Unidade Centro" error={errors.name?.message} containerClassName="sm:col-span-2" {...register('name')} />
              <Input label="Telefone" type="tel" inputMode="tel" placeholder="(11) 3333-4444" error={errors.phone?.message} {...register('phone')} />
              <Input label="WhatsApp" type="tel" inputMode="tel" placeholder="(11) 99999-9999" error={errors.whatsapp?.message} {...register('whatsapp')} />
              <Select label="Fuso horário" containerClassName="sm:col-span-2" error={errors.timezone?.message} {...register('timezone')}>
                {BR_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          <Card>
            <CardTitle>
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary-600" aria-hidden="true" /> Endereço
              </span>
            </CardTitle>
            <div className="grid gap-4 sm:grid-cols-6">
              <Input
                label="CEP"
                required
                inputMode="numeric"
                placeholder="00000-000"
                containerClassName="sm:col-span-2"
                error={errors.cep?.message}
                hint={cepStatus === 'loading' ? 'Buscando endereço…' : cepStatus === 'notfound' ? 'CEP não encontrado — preencha manualmente.' : undefined}
                {...cepField}
                onChange={(e) => void onCepChange(e.target.value)}
              />
              <Input label="Rua" containerClassName="sm:col-span-4" error={errors.street?.message} {...register('street')} />
              <Input label="Número" required inputMode="numeric" containerClassName="sm:col-span-2" error={errors.number?.message} {...register('number')} />
              <Input label="Complemento" containerClassName="sm:col-span-4" error={errors.complement?.message} {...register('complement')} />
              <Input label="Bairro" containerClassName="sm:col-span-3" error={errors.neighborhood?.message} {...register('neighborhood')} />
              <Input label="Cidade" required containerClassName="sm:col-span-2" error={errors.city?.message} {...register('city')} />
              <Select label="UF" required containerClassName="sm:col-span-1" error={errors.state?.message} {...register('state')}>
                <option value="">—</option>
                {BR_UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </Select>
            </div>
          </Card>

          {!isEdit ? (
            <Card>
              <CardTitle>
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" aria-hidden="true" /> Horário de funcionamento
                </span>
              </CardTitle>
              <WeekScheduleEditor value={week} onChange={setWeek} />
              {hoursError ? <Alert tone="error" className="mt-3">{hoursError}</Alert> : null}
            </Card>
          ) : null}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <ButtonLink to="/dashboard/filiais" variant="outline">
              Cancelar
            </ButtonLink>
            <Button type="submit" loading={creating || updating} disabled={isEdit && !isDirty} icon={<Save className="h-4 w-4" aria-hidden="true" />}>
              {isEdit ? 'Salvar alterações' : 'Criar filial'}
            </Button>
          </div>
        </form>

        {isEdit && branchId ? (
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardTitle
                action={
                  <Button size="sm" loading={savingHours} onClick={() => void saveHours()}>
                    Salvar
                  </Button>
                }
              >
                <span className="inline-flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary-600" aria-hidden="true" /> Funcionamento
                </span>
              </CardTitle>
              {hoursLoading ? <ListSkeleton rows={3} /> : <WeekScheduleEditor value={week} onChange={setWeek} />}
              {hoursError ? <Alert tone="error" className="mt-3">{hoursError}</Alert> : null}
            </Card>
            <ClosuresCard branchId={branchId} timezone={timezone} />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default BranchFormPage;
