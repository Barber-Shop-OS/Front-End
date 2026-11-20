// FE-05: datas — a API trabalha em UTC; a exibição é em pt-BR no fuso da filial.
export const DEFAULT_TIMEZONE = 'America/Sao_Paulo';

const fmt = (options: Intl.DateTimeFormatOptions, timeZone = DEFAULT_TIMEZONE) =>
  new Intl.DateTimeFormat('pt-BR', { timeZone, ...options });

const toDate = (value: string | Date): Date => (value instanceof Date ? value : new Date(value));

/** "seg., 10/11/2026" */
export const formatDate = (value: string | Date, timeZone?: string): string =>
  fmt({ weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }, timeZone).format(toDate(value));

/** "10/11" */
export const formatShortDate = (value: string | Date, timeZone?: string): string =>
  fmt({ day: '2-digit', month: '2-digit' }, timeZone).format(toDate(value));

/** "14:30" */
export const formatTime = (value: string | Date, timeZone?: string): string =>
  fmt({ hour: '2-digit', minute: '2-digit', hour12: false }, timeZone).format(toDate(value));

/** "10/11/2026 às 14:30" */
export const formatDateTime = (value: string | Date, timeZone?: string): string =>
  `${fmt({ day: '2-digit', month: '2-digit', year: 'numeric' }, timeZone).format(toDate(value))} às ${formatTime(value, timeZone)}`;

/** Data local YYYY-MM-DD de um instante no fuso. */
export const toLocalDate = (value: string | Date, timeZone = DEFAULT_TIMEZONE): string => {
  const parts = fmt({ year: 'numeric', month: '2-digit', day: '2-digit' }, timeZone).formatToParts(toDate(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
};

/** Hoje (YYYY-MM-DD) no fuso. */
export const todayIn = (timeZone = DEFAULT_TIMEZONE): string => toLocalDate(new Date(), timeZone);

/** Soma dias a uma data local YYYY-MM-DD. */
export const addDays = (date: string, days: number): string => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
};

/** Dia da semana (0 = domingo) de uma data local YYYY-MM-DD. */
export const weekdayOf = (date: string): number => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
};

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

/** "segunda-feira, 10 de novembro" a partir de YYYY-MM-DD. */
export const formatLocalDateLong = (date: string): string => {
  const [y, m, d] = date.split('-').map(Number);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(Date.UTC(y, m - 1, d))
  );
};

/** "10/11" a partir de YYYY-MM-DD. */
export const formatLocalDateShort = (date: string): string => {
  const [, m, d] = date.split('-');
  return `${d}/${m}`;
};

/** Converte data local + "HH:mm" no fuso para ISO UTC (ajusta pelo offset do fuso naquele instante). */
export const localToUtcIso = (date: string, hhmm: string, timeZone = DEFAULT_TIMEZONE): string => {
  const [y, m, d] = date.split('-').map(Number);
  const [hh, mm] = hhmm.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const offsetAt = (instant: number) => {
    const parts = fmt(
      { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false },
      timeZone
    ).formatToParts(new Date(instant));
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    return Date.UTC(get('year'), get('month') - 1, get('day'), get('hour') % 24, get('minute')) - instant;
  };
  const first = guess - offsetAt(guess);
  return new Date(guess - offsetAt(first)).toISOString();
};

/** Diferença relativa curta: "em 2 dias", "há 3 horas". */
export const relativeFromNow = (value: string | Date): string => {
  const diff = toDate(value).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' });
  const abs = Math.abs(diff);
  if (abs < 3600000) return rtf.format(Math.round(diff / 60000), 'minute');
  if (abs < 86400000) return rtf.format(Math.round(diff / 3600000), 'hour');
  return rtf.format(Math.round(diff / 86400000), 'day');
};
