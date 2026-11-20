// FE-05: dinheiro (BRL) e telefone.
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** "R$ 55,00" a partir de "55.00" ou 55. */
export const formatBRL = (value: string | number | null | undefined): string => brl.format(Number(value || 0));

/** "R$ 99,00" a partir de centavos. */
export const formatCents = (cents: number): string => brl.format(cents / 100);

/** "(11) 99999-9999" a partir de E.164 ou dígitos. */
export const formatPhone = (value: string | null | undefined): string => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');
  if (digits.length === 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return value;
};

/** Link do WhatsApp a partir do telefone. */
export const whatsappLink = (value: string | null | undefined, text?: string): string | null => {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  const full = digits.length <= 11 ? `55${digits}` : digits;
  return `https://wa.me/${full}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

/** Duração "1h 15min". */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} min`;
  return m ? `${h}h ${m}min` : `${h}h`;
};
