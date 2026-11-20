// FE-08: cadastro do dono — conta + barbearia + 14 dias de teste (POST /api/auth/register-owner).
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

import { Alert, Button, Checkbox, Input } from '@/components/ui';
import { APP_URL, TERMS_VERSION } from '@/config/env';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { loginWithGoogle, startSession } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/redux';
import { authHttp } from '@/services/http';
import { apiErrorMessage, fieldErrors } from '@/utils/apiErrors';

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

const schema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.string().trim().email('Informe um e-mail válido'),
  phone: z.string().trim().min(10, 'Informe o celular com DDD'),
  password: z.string().min(8, 'Mínimo de 8 caracteres').max(72),
  shopName: z.string().trim().min(2, 'Informe o nome da barbearia'),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'Use letras minúsculas, números e hífens')
    .min(3, 'Mínimo de 3 caracteres')
    .or(z.literal('')),
  terms: z.literal(true, { errorMap: () => ({ message: 'Aceite os termos para continuar' }) }),
});
type FormValues = z.infer<typeof schema>;

const OwnerSignupPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, formState, watch, setError: setFieldError } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { slug: '' } });
  const shopName = watch('shopName') || '';
  const slug = watch('slug') || slugify(shopName);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const { data } = await authHttp.post<{ token: string }>('/register-owner', {
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        terms_version: TERMS_VERSION,
        barbershop: { name: values.shopName, ...(values.slug ? { slug: values.slug } : {}) },
      });
      await dispatch(startSession(data.token)).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const fields = fieldErrors(err);
      if (fields['barbershop.slug']) setFieldError('slug', { message: fields['barbershop.slug'] });
      setError(apiErrorMessage(err));
    }
  });

  const onGoogle = async (idToken: string) => {
    const values = watch();
    if (!values.shopName || !values.phone) {
      setError('Preencha o nome da barbearia e o celular antes de continuar com o Google.');
      return;
    }
    try {
      await dispatch(loginWithGoogle({ id_token: idToken, intent: 'signup-owner', phone: values.phone, barbershop: { name: values.shopName } })).unwrap();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-black tracking-tight text-slate-900">Cadastre sua barbearia</h1>
      <ul className="mt-3 space-y-1 text-sm text-muted">
        {['14 dias grátis, sem cartão', 'Página de agendamento online pronta', 'Cancele quando quiser'].map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success-600" aria-hidden="true" /> {item}
          </li>
        ))}
      </ul>
      {error ? (
        <Alert tone="error" className="mt-6">
          {error}
        </Alert>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Nome da barbearia" error={formState.errors.shopName?.message} {...register('shopName')} />
        <Input
          label="Endereço da sua página"
          placeholder={slugify(shopName) || 'minha-barbearia'}
          hint={`${APP_URL.replace(/^https?:\/\//, '')}/b/${slug || 'minha-barbearia'}`}
          error={formState.errors.slug?.message}
          autoCapitalize="off"
          {...register('slug')}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Seu nome" autoComplete="name" error={formState.errors.name?.message} {...register('name')} />
          <Input label="Celular (WhatsApp)" type="tel" autoComplete="tel" inputMode="tel" placeholder="(11) 99999-9999" error={formState.errors.phone?.message} {...register('phone')} />
        </div>
        <Input label="E-mail" type="email" autoComplete="email" inputMode="email" error={formState.errors.email?.message} {...register('email')} />
        <Input label="Senha" type="password" autoComplete="new-password" hint="Pelo menos 8 caracteres." error={formState.errors.password?.message} {...register('password')} />
        <Checkbox
          error={formState.errors.terms?.message}
          label={
            <>
              Li e aceito os{' '}
              <Link to="/termos" target="_blank" className="font-semibold text-primary-700 underline">
                termos de uso
              </Link>{' '}
              e a{' '}
              <Link to="/privacidade" target="_blank" className="font-semibold text-primary-700 underline">
                política de privacidade
              </Link>
              .
            </>
          }
          {...register('terms')}
        />
        <Button type="submit" size="lg" block loading={formState.isSubmitting}>
          Começar teste grátis
        </Button>
      </form>
      <GoogleButton onCredential={onGoogle} text="signup_with" />
      <p className="mt-8 text-center text-sm text-muted">
        Já tem conta?{' '}
        <Link to="/login" className="font-semibold text-primary-700 hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
};

export default OwnerSignupPage;
