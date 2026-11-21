// Componentes compartilhados entre as telas de gestão do dono (Grupo E).
import { useRef, type ReactNode } from 'react';
import { Camera, Check, Lock, Minus, Plus } from 'lucide-react';

import { Badge, Button, EmptyState, useToast } from '@/components/ui';
import type { Plan } from '@/types/api';
import { apiErrorMessage } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { WEEKDAYS } from '@/utils/date';
import { formatCents } from '@/utils/format';

import type { UploadKind } from './types';
import { useImageUpload } from './useImageUpload';
import { featureLabel, limitLabel, type DaySchedule } from './utils';

// ---------------------------------------------------------------------------------------------
// Editor da semana (funcionamento da filial / jornada do barbeiro)
// ---------------------------------------------------------------------------------------------

const timeInput =
  'h-10 w-[128px] rounded-lg border border-transparent bg-surface-low px-2 text-sm text-ink focus:border-primary-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 disabled:opacity-50';

export const WeekScheduleEditor = ({
  value,
  onChange,
  disabled,
  allowSplit = true,
}: {
  value: DaySchedule[];
  onChange: (next: DaySchedule[]) => void;
  disabled?: boolean;
  allowSplit?: boolean;
}) => {
  const update = (weekday: number, patch: (day: DaySchedule) => DaySchedule) =>
    onChange(value.map((day) => (day.weekday === weekday ? patch(day) : day)));

  return (
    <ul className="divide-y divide-surface-low">
      {value.map((day) => (
        <li key={day.weekday} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start">
          <label className="flex min-h-10 w-40 shrink-0 cursor-pointer items-center gap-3 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              className="h-5 w-5 rounded accent-primary-600"
              checked={day.enabled}
              disabled={disabled}
              onChange={(event) => update(day.weekday, (d) => ({ ...d, enabled: event.target.checked }))}
            />
            {WEEKDAYS[day.weekday]}
          </label>
          {day.enabled ? (
            <div className="flex flex-1 flex-col gap-2">
              {day.ranges.map((range, index) => (
                <div key={index} className="flex flex-wrap items-center gap-2">
                  <input
                    type="time"
                    aria-label={`${WEEKDAYS[day.weekday]} — início do intervalo ${index + 1}`}
                    className={timeInput}
                    value={range.start}
                    disabled={disabled}
                    onChange={(event) =>
                      update(day.weekday, (d) => ({ ...d, ranges: d.ranges.map((r, i) => (i === index ? { ...r, start: event.target.value } : r)) }))
                    }
                  />
                  <span className="text-sm text-ink-variant">até</span>
                  <input
                    type="time"
                    aria-label={`${WEEKDAYS[day.weekday]} — fim do intervalo ${index + 1}`}
                    className={timeInput}
                    value={range.end}
                    disabled={disabled}
                    onChange={(event) =>
                      update(day.weekday, (d) => ({ ...d, ranges: d.ranges.map((r, i) => (i === index ? { ...r, end: event.target.value } : r)) }))
                    }
                  />
                  {allowSplit && index > 0 ? (
                    <button
                      type="button"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink-subtle hover:bg-surface-low hover:text-danger-600"
                      aria-label={`Remover intervalo ${index + 1} de ${WEEKDAYS[day.weekday]}`}
                      disabled={disabled}
                      onClick={() => update(day.weekday, (d) => ({ ...d, ranges: d.ranges.filter((_, i) => i !== index) }))}
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                  ) : null}
                  {allowSplit && index === day.ranges.length - 1 && day.ranges.length < 4 ? (
                    <button
                      type="button"
                      className="inline-flex h-10 items-center gap-1 rounded-lg px-2 text-xs font-semibold text-primary-600 hover:bg-surface-low"
                      disabled={disabled}
                      onClick={() => update(day.weekday, (d) => ({ ...d, ranges: [...d.ranges, { start: d.ranges[d.ranges.length - 1].end, end: d.ranges[d.ranges.length - 1].end }] }))}
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" /> Intervalo
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <span className="flex min-h-10 items-center text-sm text-ink-subtle">Fechado</span>
          )}
        </li>
      ))}
    </ul>
  );
};

// ---------------------------------------------------------------------------------------------
// Imagem com troca via upload (logo, capa, foto do barbeiro)
// ---------------------------------------------------------------------------------------------

export const ImageUploadButton = ({
  kind,
  barbershopId,
  barberId,
  label,
  onUploaded,
  children,
  className,
  disabled,
}: {
  kind: UploadKind;
  barbershopId?: number;
  barberId?: number;
  label: string;
  onUploaded?: (url: string) => void;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const { upload, uploading } = useImageUpload();

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const url = await upload(file, { kind, barbershopId, barberId });
      toast.success('Imagem atualizada.');
      onUploaded?.(url);
    } catch (error) {
      toast.error(apiErrorMessage(error, 'Não foi possível enviar a imagem.'));
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => void onFile(event.target.files?.[0])}
      />
      {children ? (
        <button type="button" className={className} onClick={() => inputRef.current?.click()} disabled={disabled || uploading} aria-label={label} aria-busy={uploading || undefined}>
          {children}
        </button>
      ) : (
        <Button variant="secondary" size="sm" icon={<Camera className="h-4 w-4" aria-hidden="true" />} loading={uploading} disabled={disabled} onClick={() => inputRef.current?.click()} className={className}>
          {label}
        </Button>
      )}
    </>
  );
};

// ---------------------------------------------------------------------------------------------
// Cartão de plano (Assinatura)
// ---------------------------------------------------------------------------------------------

export const PlanCard = ({
  plan,
  highlighted,
  current,
  badge,
  action,
}: {
  plan: Plan;
  highlighted?: boolean;
  current?: boolean;
  badge?: string;
  action: ReactNode;
}) => (
  <article
    className={cn(
      'relative flex flex-col rounded-xl p-6 sm:p-8',
      highlighted ? 'bg-primary-600 text-white shadow-primary lg:-my-4 lg:py-12' : 'bg-white text-ink shadow-card'
    )}
  >
    {badge ? (
      <span className={cn('absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-label', highlighted ? 'bg-tertiary-fixed text-tertiary' : 'bg-primary-100 text-primary-600')}>
        {badge}
      </span>
    ) : null}
    <div className="flex items-center justify-between gap-2">
      <h3 className={cn('text-lg font-bold tracking-[-0.025em]', highlighted ? 'text-white' : 'text-ink')}>{plan.name}</h3>
      {current ? <Badge tone={highlighted ? 'gray' : 'blue'}>Plano atual</Badge> : null}
    </div>
    <p className="mt-4 flex items-baseline gap-1">
      <span className="text-4xl font-black tracking-[-0.05em]">{formatCents(plan.price_cents)}</span>
      <span className={cn('text-sm', highlighted ? 'text-primary-100' : 'text-ink-variant')}>/mês</span>
    </p>
    <ul className={cn('mt-6 flex-1 space-y-3 text-sm', highlighted ? 'text-primary-50' : 'text-ink-variant')}>
      <li className="flex gap-2">
        <Check className={cn('mt-0.5 h-4 w-4 shrink-0', highlighted ? 'text-white' : 'text-primary-600')} aria-hidden="true" />
        {limitLabel(plan.limits.branches, 'filial', 'filiais', true)}
      </li>
      <li className="flex gap-2">
        <Check className={cn('mt-0.5 h-4 w-4 shrink-0', highlighted ? 'text-white' : 'text-primary-600')} aria-hidden="true" />
        {limitLabel(plan.limits.barbers, 'barbeiro', 'barbeiros')}
      </li>
      {plan.features.map((feature) => (
        <li key={feature} className="flex gap-2">
          <Check className={cn('mt-0.5 h-4 w-4 shrink-0', highlighted ? 'text-white' : 'text-primary-600')} aria-hidden="true" />
          {featureLabel(feature)}
        </li>
      ))}
    </ul>
    <div className="mt-8">{action}</div>
  </article>
);

// ---------------------------------------------------------------------------------------------
// Bloqueio para quem não é dono
// ---------------------------------------------------------------------------------------------

export const OwnerOnlyNotice = () => (
  <EmptyState
    icon={<Lock className="h-8 w-8" aria-hidden="true" />}
    title="Acesso restrito ao dono"
    description="Somente o dono da barbearia pode ver e alterar esta área."
  />
);
