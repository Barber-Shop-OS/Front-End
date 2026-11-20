// Validação dos formulários do grupo D (cliente rápido, pagamento presencial, onboarding).
import { z } from 'zod';

const phone = z
  .string()
  .trim()
  .refine((value) => {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 13;
  }, 'Informe o telefone com DDD');

export const clientSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do cliente').max(120),
  phone,
  email: z.string().trim().email('E-mail inválido').or(z.literal('')).optional(),
  notes: z.string().trim().max(500, 'Máximo de 500 caracteres').optional(),
});
export type ClientFormValues = z.infer<typeof clientSchema>;

/** Corpo da API a partir do formulário (campos vazios viram null). */
export const toClientInput = (values: ClientFormValues) => ({
  name: values.name.trim(),
  phone: values.phone.trim(),
  email: values.email?.trim() ? values.email.trim() : null,
  notes: values.notes?.trim() ? values.notes.trim() : null,
});

/** "55,90" ou "55.90" → 55.9; inválido → NaN. */
export const parseMoney = (value: string): number => {
  const normalized = value.trim().replace(/\s|R\$/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  return normalized ? Number(normalized) : Number.NaN;
};

export const paymentSchema = z.object({
  method: z.enum(['PIX', 'CASH', 'CARD']),
  amount: z
    .string()
    .trim()
    .refine((value) => {
      const amount = parseMoney(value);
      return Number.isFinite(amount) && amount > 0;
    }, 'Informe um valor válido'),
});
export type PaymentFormValues = z.infer<typeof paymentSchema>;

export const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'] as const;

export const onboardingSchema = z.object({
  shopName: z.string().trim().min(2, 'Informe o nome da barbearia').max(120),
  branchName: z.string().trim().min(2, 'Informe o nome da filial').max(120),
  phone: z.string().trim().max(20).optional(),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, 'CEP inválido. Use 00000-000'),
  street: z.string().trim().max(160).optional(),
  number: z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, 'Informe o número'),
  complement: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().max(100).optional(),
  city: z.string().trim().min(2, 'Informe a cidade').max(100),
  state: z.enum(UFS, { errorMap: () => ({ message: 'Selecione o estado' }) }),
});
export type OnboardingValues = z.infer<typeof onboardingSchema>;
