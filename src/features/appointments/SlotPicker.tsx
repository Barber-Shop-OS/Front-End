// Escolha de dia + horário a partir de GET /availability (mesma regra da reserva — BE-13).
import { useMemo } from 'react';
import { skipToken } from '@reduxjs/toolkit/query';

import { EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { useGetAvailabilityQuery } from '@/features/public/api';
import type { Slot } from '@/types/api';
import { addDays, formatTime, todayIn, weekdayOf, WEEKDAYS_SHORT } from '@/utils/date';
import { cn } from '@/utils/cn';

interface SlotPickerProps {
  branchId: number;
  serviceId: number;
  barberId?: number;
  timezone: string;
  date: string;
  onDateChange: (date: string) => void;
  value: Slot | null;
  onChange: (slot: Slot) => void;
  days?: number;
}

export const SlotPicker = ({ branchId, serviceId, barberId, timezone, date, onDateChange, value, onChange, days = 30 }: SlotPickerProps) => {
  const today = todayIn(timezone);
  const dates = useMemo(() => Array.from({ length: days }, (_, index) => addDays(today, index)), [today, days]);
  const { data, isFetching, error, refetch } = useGetAvailabilityQuery(
    branchId && serviceId ? { branch_id: branchId, service_id: serviceId, date, barber_id: barberId } : skipToken
  );

  return (
    <div>
      <div className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2" role="listbox" aria-label="Dia">
        {dates.map((item) => {
          const [, month, day] = item.split('-');
          const selected = item === date;
          return (
            <button
              key={item}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => onDateChange(item)}
              className={cn('flex w-16 shrink-0 snap-start flex-col items-center rounded-xl border px-2 py-2 text-sm transition', selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-700 hover:border-primary-300')}
            >
              <span className="text-xs font-semibold uppercase">{item === today ? 'Hoje' : WEEKDAYS_SHORT[weekdayOf(item)]}</span>
              <span className="text-lg font-black">{day}</span>
              <span className="text-[11px] opacity-80">{month}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        {isFetching ? (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <Skeleton key={index} className="h-11" />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data?.length ? (
          <EmptyState title="Sem horários livres neste dia" description="Escolha outro dia ou outro barbeiro." />
        ) : (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" role="listbox" aria-label="Horário">
            {data.map((slot) => {
              const selected = value?.start_at === slot.start_at;
              return (
                <button
                  key={slot.start_at}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => onChange(slot)}
                  className={cn('h-11 rounded-xl border text-sm font-semibold transition', selected ? 'border-primary-600 bg-primary-600 text-white' : 'border-slate-200 bg-white text-slate-800 hover:border-primary-400')}
                >
                  {formatTime(slot.start_at, timezone)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
