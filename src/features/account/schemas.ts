// Validação dos formulários da conta (/conta) — espelha as regras da API (BE-20/29/40).
import { z } from 'zod';

const phoneDigits = (value: string) => value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '');

export const profileSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome (mínimo 2 caracteres)').max(120, 'Máximo de 120 caracteres'),
  phone: z
    .string()
    .trim()
    .refine((value) => value === '' || [10, 11].includes(phoneDigits(value).length), 'Telefone inválido. Use DDD + número, ex.: (11) 99999-9999'),
});
export type ProfileForm = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    current_password: z.string().max(72),
    new_password: z.string().min(8, 'Mínimo de 8 caracteres').max(72, 'Máximo de 72 caracteres'),
    confirm_password: z.string(),
  })
  .refine((data) => data.new_password === data.confirm_password, { message: 'As senhas não conferem', path: ['confirm_password'] })
  .refine((data) => !data.current_password || data.current_password !== data.new_password, {
    message: 'A nova senha deve ser diferente da atual',
    path: ['new_password'],
  });
export type PasswordForm = z.infer<typeof passwordSchema>;

export const emailSchema = z.object({
  new_email: z.string().trim().toLowerCase().min(1, 'Informe o novo e-mail').email('E-mail inválido').max(254),
  password: z.string().max(72),
});
export type EmailForm = z.infer<typeof emailSchema>;

/** Texto que a pessoa precisa digitar para liberar a exclusão da conta. */
export const DELETE_CONFIRMATION_WORD = 'EXCLUIR';

export const deleteAccountSchema = z.object({
  password: z.string().max(72),
  confirmation: z.string().refine((value) => value.trim().toUpperCase() === DELETE_CONFIRMATION_WORD, `Digite ${DELETE_CONFIRMATION_WORD} para confirmar`),
});
export type DeleteAccountForm = z.infer<typeof deleteAccountSchema>;
