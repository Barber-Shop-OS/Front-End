// Validação dos formulários de entrada (zod). Mesmas regras da API: senha 8–72, e-mail válido, termos aceitos.
import { z } from 'zod';

const terms = z.literal(true, { error: 'Aceite os termos para continuar' });
const password = z.string().min(8, 'Mínimo de 8 caracteres').max(72, 'Máximo de 72 caracteres');
const email = z.string().trim().email('Informe um e-mail válido');

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Informe a senha'),
});

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email,
  password,
  terms,
});

export const forgotSchema = z.object({ email });

export const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((values) => values.password === values.confirm, { message: 'As senhas não conferem', path: ['confirm'] });

export const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

export const ownerSignupSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email,
  phone: z
    .string()
    .trim()
    .refine((value) => /^\d{10,11}$/.test(value.replace(/\D/g, '').replace(/^55(?=\d{10,11}$)/, '')), 'Informe o celular com DDD'),
  password,
  shopName: z.string().trim().min(2, 'Informe o nome da barbearia'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens')
    .min(3, 'Mínimo de 3 caracteres')
    .or(z.literal('')),
  terms,
});

export const invitationAccountSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  password,
});
