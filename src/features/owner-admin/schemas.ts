// Schemas zod dos formulários da gestão do dono (espelham as validações Joi do Back-End).
import { z } from 'zod';

import { isValidTaxId, onlyDigits, parsePrice } from './utils';

const UFS = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
export const BR_UFS = UFS;

export const BR_TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (SP, RJ, MG, Sul, GO, DF…)' },
  { value: 'America/Bahia', label: 'Bahia' },
  { value: 'America/Fortaleza', label: 'Fortaleza (CE, RN, PB, PI, MA)' },
  { value: 'America/Recife', label: 'Recife (PE)' },
  { value: 'America/Maceio', label: 'Maceió (AL, SE)' },
  { value: 'America/Belem', label: 'Belém (PA, AP)' },
  { value: 'America/Araguaina', label: 'Araguaína (TO)' },
  { value: 'America/Manaus', label: 'Manaus (AM)' },
  { value: 'America/Cuiaba', label: 'Cuiabá (MT)' },
  { value: 'America/Campo_Grande', label: 'Campo Grande (MS)' },
  { value: 'America/Porto_Velho', label: 'Porto Velho (RO)' },
  { value: 'America/Boa_Vista', label: 'Boa Vista (RR)' },
  { value: 'America/Rio_Branco', label: 'Rio Branco (AC)' },
  { value: 'America/Noronha', label: 'Fernando de Noronha' },
];

const optionalPhone = z
  .string()
  .trim()
  .max(20, 'Máximo de 20 caracteres')
  .refine((value) => !value || [10, 11, 12, 13].includes(onlyDigits(value).length), 'Telefone inválido');

export const branchSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome da filial').max(120, 'Máximo de 120 caracteres'),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  timezone: z.string().min(1),
  cep: z.string().trim().regex(/^\d{5}-?\d{3}$/, 'CEP inválido. Use 00000-000'),
  street: z.string().trim().max(160).optional().or(z.literal('')),
  number: z
    .string()
    .trim()
    .regex(/^\d{1,6}$/, 'Informe só o número (sem letras)')
    .refine((value) => Number(value) > 0, 'Número inválido'),
  complement: z.string().trim().max(120).optional().or(z.literal('')),
  neighborhood: z.string().trim().max(100).optional().or(z.literal('')),
  city: z.string().trim().min(2, 'Informe a cidade').max(100),
  state: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .refine((value) => UFS.includes(value), 'UF inválida'),
});
export type BranchFormValues = z.input<typeof branchSchema>;

export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome do serviço').max(120, 'Máximo de 120 caracteres'),
  description: z.string().trim().min(1, 'Descreva o serviço').max(500, 'Máximo de 500 caracteres'),
  price: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(parsePrice(value)), 'Preço inválido (ex.: 45,00)')
    .refine((value) => parsePrice(value) <= 100000, 'Preço acima do permitido'),
  duration: z.coerce
    .number({ error: 'Informe a duração' })
    .int('Use minutos inteiros')
    .min(5, 'Mínimo de 5 minutos')
    .max(480, 'Máximo de 8 horas')
    .refine((value) => value % 5 === 0, 'Use múltiplos de 5 minutos'),
  active: z.boolean(),
});
export type ServiceFormValues = z.input<typeof serviceSchema>;

export const checkoutSchema = z.object({
  tax_id: z.string().trim().refine(isValidTaxId, 'CPF ou CNPJ inválido'),
  cellphone: z
    .string()
    .trim()
    .refine((value) => !value || [10, 11].includes(onlyDigits(value).length), 'Celular inválido'),
});
export type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export const barbershopProfileSchema = z.object({
  name: z.string().trim().min(2, 'Informe o nome').max(120),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(3, 'Mínimo de 3 caracteres')
    .max(60, 'Máximo de 60 caracteres')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens'),
  description: z.string().trim().max(1000, 'Máximo de 1000 caracteres'),
  phone: optionalPhone,
  whatsapp: optionalPhone,
  instagram: z
    .string()
    .trim()
    .max(31, 'Máximo de 30 caracteres')
    .regex(/^@?[A-Za-z0-9._]*$/, 'Use só o @usuário do Instagram'),
});
export type BarbershopProfileValues = z.infer<typeof barbershopProfileSchema>;

export const emailSchema = z.object({ email: z.string().trim().email('E-mail inválido') });
