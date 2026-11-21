// Figma 1:1477 "Perfil & Notificações" (/conta): dados pessoais, segurança (senha, e-mail, sessões),
// central de notificações e privacidade (exportar dados / excluir conta — LGPD).
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Bell, Download, KeyRound, LogOut, Mail, Monitor, ShieldCheck, Smartphone, Trash2, UserRound } from 'lucide-react';

import { Alert, Avatar, Badge, Button, Card, CardTitle, ConfirmDialog, EmptyState, ErrorState, Input, ListSkeleton, Modal, PageHeader, Pagination, Tabs, useToast } from '@/components/ui';
import {
  useChangePasswordMutation,
  useDeleteAccountMutation,
  useLazyExportDataQuery,
  useListSessionsQuery,
  useLogoutAllSessionsMutation,
  useRequestEmailChangeMutation,
  useRevokeSessionMutation,
  useUpdateProfileMutation,
} from '@/features/account/api';
import { EmailVerificationBanner } from '@/features/account/EmailVerificationBanner';
import { TwoFactorCard } from '@/features/account/TwoFactorCard';
import { describeUserAgent, downloadJson, isMobileUserAgent } from '@/features/account/helpers';
import {
  DELETE_CONFIRMATION_WORD,
  deleteAccountSchema,
  emailSchema,
  passwordSchema,
  profileSchema,
  type DeleteAccountForm,
  type EmailForm,
  type PasswordForm,
  type ProfileForm,
} from '@/features/account/schemas';
import { startSession, userUpdated } from '@/features/auth/authSlice';
import { useAuth, useLogout } from '@/features/auth/hooks';
import { useListNotificationsQuery, useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation } from '@/features/notifications/api';
import { useAppDispatch } from '@/hooks/redux';
import { usePageTitle } from '@/hooks/usePageTitle';
import { apiErrorMessage, errorCode, fieldErrors } from '@/utils/apiErrors';
import { cn } from '@/utils/cn';
import { formatDate, relativeFromNow } from '@/utils/date';
import { formatPhone } from '@/utils/format';

type Section = 'profile' | 'security' | 'notifications' | 'privacy';

// ---------------------------------------------------------------------------------------------

const ProfileSection = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const [update, { isLoading }] = useUpdateProfileMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });
  useEffect(() => {
    if (user) reset({ name: user.name, phone: formatPhone(user.phone) || '' });
  }, [user, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await update({ name: values.name, phone: values.phone || null }).unwrap();
      dispatch(userUpdated(result.user ?? { name: values.name, phone: values.phone || null }));
      toast.success('Dados atualizados.');
    } catch (error) {
      Object.entries(fieldErrors(error)).forEach(([name, message]) => setError(name as keyof ProfileForm, { message }));
      toast.error(apiErrorMessage(error));
    }
  });

  return (
    <Card>
      <CardTitle>Dados pessoais</CardTitle>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Nome completo" required error={errors.name?.message} {...register('name')} />
        <Input label="Telefone / WhatsApp" inputMode="tel" placeholder="(11) 99999-9999" error={errors.phone?.message} {...register('phone')} />
        <Input label="E-mail" value={user?.email ?? ''} disabled hint="Para trocar o e-mail, use a aba Segurança." />
        <div className="flex justify-end">
          <Button type="submit" loading={isLoading} disabled={!isDirty}>
            Salvar
          </Button>
        </div>
      </form>
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const PasswordCard = () => {
  const toast = useToast();
  const dispatch = useAppDispatch();
  const [change, { isLoading }] = useChangePasswordMutation();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema), defaultValues: { current_password: '', new_password: '', confirm_password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await change({ current_password: values.current_password || undefined, new_password: values.new_password }).unwrap();
      if (result.token) await dispatch(startSession(result.token));
      reset();
      toast.success('Senha alterada. As outras sessões foram encerradas.');
    } catch (error) {
      if (['INVALID_CURRENT_PASSWORD', 'PASSWORD_REQUIRED'].includes(errorCode(error) ?? '')) setError('current_password', { message: 'Senha atual incorreta' });
      else Object.entries(fieldErrors(error)).forEach(([name, message]) => setError(name as keyof PasswordForm, { message }));
      toast.error(apiErrorMessage(error));
    }
  });

  return (
    <Card>
      <CardTitle>
        <span className="inline-flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-primary-600" aria-hidden="true" /> Senha
        </span>
      </CardTitle>
      <form className="space-y-4" onSubmit={onSubmit} noValidate>
        <Input label="Senha atual" type="password" autoComplete="current-password" hint="Deixe em branco se você entrou só com o Google e ainda não tem senha." error={errors.current_password?.message} {...register('current_password')} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nova senha" type="password" autoComplete="new-password" error={errors.new_password?.message} {...register('new_password')} />
          <Input label="Confirmar nova senha" type="password" autoComplete="new-password" error={errors.confirm_password?.message} {...register('confirm_password')} />
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={isLoading}>
            Alterar senha
          </Button>
        </div>
      </form>
    </Card>
  );
};

const EmailCard = () => {
  const toast = useToast();
  const { user } = useAuth();
  const [request, { isLoading }] = useRequestEmailChangeMutation();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<EmailForm>({ resolver: zodResolver(emailSchema), defaultValues: { new_email: '', password: '' } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await request(values).unwrap();
      setSentTo(values.new_email);
      reset();
    } catch (error) {
      Object.entries(fieldErrors(error)).forEach(([name, message]) => setError(name as keyof EmailForm, { message }));
      toast.error(apiErrorMessage(error));
    }
  });

  return (
    <Card>
      <CardTitle>
        <span className="inline-flex items-center gap-2">
          <Mail className="h-5 w-5 text-primary-600" aria-hidden="true" /> E-mail
        </span>
      </CardTitle>
      <p className="mb-4 text-sm text-ink-variant">
        Atual: <strong className="text-ink">{user?.email}</strong>{' '}
        {user?.email_verified_at ? <Badge tone="green">Verificado</Badge> : <Badge tone="yellow">Não verificado</Badge>}
      </p>
      {sentTo ? (
        <Alert tone="success" className="mb-4" title="Confirme no novo endereço">
          Enviamos um link para {sentTo}. A troca só vale depois que você clicar nele.
        </Alert>
      ) : null}
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit} noValidate>
        <Input label="Novo e-mail" type="email" autoComplete="email" error={errors.new_email?.message} {...register('new_email')} />
        <Input label="Sua senha" type="password" autoComplete="current-password" error={errors.password?.message} {...register('password')} />
        <div className="flex justify-end sm:col-span-2">
          <Button type="submit" variant="secondary" loading={isLoading}>
            Enviar confirmação
          </Button>
        </div>
      </form>
    </Card>
  );
};

const SessionsCard = () => {
  const toast = useToast();
  const logoutLocal = useLogout();
  const { data = [], isLoading, error, refetch } = useListSessionsQuery();
  const [revoke] = useRevokeSessionMutation();
  const [logoutAll, { isLoading: loggingOut }] = useLogoutAllSessionsMutation();
  const [confirmAll, setConfirmAll] = useState(false);

  return (
    <Card>
      <CardTitle
        action={
          data.length > 1 ? (
            <Button size="sm" variant="ghost" className="hover:text-danger-600" icon={<LogOut className="h-4 w-4" aria-hidden="true" />} onClick={() => setConfirmAll(true)}>
              Sair de todos
            </Button>
          ) : null
        }
      >
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-600" aria-hidden="true" /> Sessões ativas
        </span>
      </CardTitle>
      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : error ? (
        <ErrorState error={error} onRetry={refetch} />
      ) : (
        <ul className="divide-y divide-surface-low">
          {data.map((s) => {
            const Icon = isMobileUserAgent(s.user_agent) ? Smartphone : Monitor;
            return (
              <li key={s.id} className="flex items-center gap-3 py-3">
                <Icon className="h-5 w-5 shrink-0 text-ink-subtle" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    {describeUserAgent(s.user_agent)} {s.current ? <Badge tone="blue">Este dispositivo</Badge> : null}
                  </p>
                  <p className="text-xs text-ink-variant">
                    {s.ip ? `${s.ip} · ` : ''}último uso {relativeFromNow(s.last_used_at)}
                  </p>
                </div>
                {!s.current ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      try {
                        await revoke(s.id).unwrap();
                        toast.success('Sessão encerrada.');
                      } catch (err) {
                        toast.error(apiErrorMessage(err));
                      }
                    }}
                  >
                    Encerrar
                  </Button>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
      <ConfirmDialog
        open={confirmAll}
        title="Sair de todos os dispositivos?"
        description="Você também sairá deste navegador e precisará entrar de novo."
        tone="danger"
        confirmLabel="Sair de todos"
        loading={loggingOut}
        onCancel={() => setConfirmAll(false)}
        onConfirm={async () => {
          try {
            await logoutAll().unwrap();
          } catch {
            // mesmo com erro, encerra localmente
          }
          await logoutLocal();
        }}
      />
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const NotificationsSection = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [onlyUnread, setOnlyUnread] = useState(false);
  const { data, isLoading, error, refetch } = useListNotificationsQuery({ page, unread: onlyUnread });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();

  return (
    <Card>
      <CardTitle
        action={
          data?.unread_count ? (
            <Button size="sm" variant="secondary" loading={markingAll} onClick={() => void markAll()}>
              Marcar todas como lidas
            </Button>
          ) : null
        }
      >
        <span className="inline-flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary-600" aria-hidden="true" /> Notificações {data?.unread_count ? <Badge tone="red">{data.unread_count} novas</Badge> : null}
        </span>
      </CardTitle>
      <Tabs
        value={onlyUnread ? 'unread' : 'all'}
        onChange={(v) => {
          setOnlyUnread(v === 'unread');
          setPage(1);
        }}
        tabs={[
          { value: 'all', label: 'Todas' },
          { value: 'unread', label: 'Não lidas' },
        ]}
      />
      <div className="mt-4">
        {isLoading ? (
          <ListSkeleton rows={3} />
        ) : error ? (
          <ErrorState error={error} onRetry={refetch} />
        ) : !data?.items.length ? (
          <EmptyState title="Nenhuma notificação" description="Avisos de agendamentos, lembretes e da sua barbearia aparecem aqui." />
        ) : (
          <>
            <ul className="divide-y divide-surface-low">
              {data.items.map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    className={cn('flex w-full gap-3 rounded-lg px-2 py-3 text-left hover:bg-surface-low', !n.read_at && 'bg-primary-50/60')}
                    onClick={() => {
                      if (!n.read_at) void markRead(n.id);
                      if (n.link) navigate(n.link);
                    }}
                  >
                    <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', n.read_at ? 'bg-transparent' : 'bg-primary-600')} aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">{n.title}</span>
                      {n.body ? <span className="block text-sm text-ink-variant">{n.body}</span> : null}
                      <span className="mt-1 block text-xs text-ink-subtle">{relativeFromNow(n.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <Pagination page={page} totalPages={data.totalPages} onChange={setPage} />
          </>
        )}
      </div>
      <p className="mt-4 text-xs text-ink-variant">Lembretes de agendamento também são enviados para o seu e-mail.</p>
    </Card>
  );
};

// ---------------------------------------------------------------------------------------------

const PrivacySection = () => {
  const toast = useToast();
  const logoutLocal = useLogout();
  const [exportData, { isFetching: exporting }] = useLazyExportDataQuery();
  const [deleteAccount, { isLoading: deleting }] = useDeleteAccountMutation();
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<DeleteAccountForm>({ resolver: zodResolver(deleteAccountSchema), defaultValues: { password: '', confirmation: '' } });

  const onDelete = handleSubmit(async (values) => {
    try {
      await deleteAccount({ password: values.password || undefined }).unwrap();
      toast.success('Conta excluída. Sentiremos sua falta!');
      setOpen(false);
      await logoutLocal();
    } catch (error) {
      if (['INVALID_CURRENT_PASSWORD', 'PASSWORD_REQUIRED'].includes(errorCode(error) ?? '')) setError('password', { message: 'Senha incorreta' });
      toast.error(errorCode(error) === 'ACTIVE_SUBSCRIPTION' ? 'Cancele a assinatura da sua barbearia antes de excluir a conta.' : apiErrorMessage(error));
    }
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Download className="h-5 w-5 text-primary-600" aria-hidden="true" /> Exportar meus dados
          </span>
        </CardTitle>
        <p className="mb-4 text-sm text-ink-variant">Baixe uma cópia dos seus dados (perfil, agendamentos e pagamentos) em JSON, conforme a LGPD.</p>
        <Button
          variant="secondary"
          loading={exporting}
          onClick={async () => {
            try {
              const data = await exportData().unwrap();
              downloadJson(data, `barberos-meus-dados-${new Date().toISOString().slice(0, 10)}.json`);
            } catch (error) {
              toast.error(apiErrorMessage(error));
            }
          }}
        >
          Baixar dados
        </Button>
      </Card>
      <Card className="border border-danger-600/20">
        <CardTitle>
          <span className="inline-flex items-center gap-2 text-danger-700">
            <Trash2 className="h-5 w-5" aria-hidden="true" /> Excluir conta
          </span>
        </CardTitle>
        <p className="mb-4 text-sm text-ink-variant">
          Seus dados pessoais são anonimizados e você perde o acesso. Agendamentos futuros são cancelados. Se você é dono de uma barbearia com assinatura ativa, cancele a assinatura antes.
        </p>
        <Button
          variant="danger"
          onClick={() => {
            reset();
            setOpen(true);
          }}
        >
          Excluir minha conta
        </Button>
      </Card>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Excluir conta definitivamente"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={deleting} onClick={() => void onDelete()}>
              Excluir conta
            </Button>
          </>
        }
      >
        <form className="space-y-4" onSubmit={onDelete} noValidate>
          <Alert tone="error">Esta ação não pode ser desfeita.</Alert>
          <Input label="Senha" type="password" autoComplete="current-password" hint="Em branco se você só usa login com o Google." error={errors.password?.message} {...register('password')} />
          <Input label={`Digite ${DELETE_CONFIRMATION_WORD} para confirmar`} autoComplete="off" error={errors.confirmation?.message} {...register('confirmation')} />
          <button type="submit" className="hidden" tabIndex={-1} aria-hidden="true" />
        </form>
      </Modal>
    </div>
  );
};

// ---------------------------------------------------------------------------------------------

const AccountPage = () => {
  usePageTitle('Minha conta');
  const { user } = useAuth();
  const [section, setSection] = useState<Section>(() => (window.location.hash === '#notificacoes' ? 'notifications' : window.location.hash === '#seguranca' ? 'security' : 'profile'));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <PageHeader title="Perfil & Notificações" description="Gerencie seus dados, segurança e avisos." />
      <EmailVerificationBanner />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="min-w-0 space-y-4">
          <Card className="flex items-center gap-3 lg:flex-col lg:text-center">
            <Avatar name={user?.name} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-bold text-ink">{user?.name}</p>
              <p className="truncate text-xs text-ink-variant">{user?.email}</p>
              {user?.created_at ? <p className="mt-1 text-xs text-ink-subtle">Cliente desde {formatDate(user.created_at)}</p> : null}
            </div>
          </Card>
          <nav className="flex gap-1 overflow-x-auto rounded-xl bg-white p-2 shadow-card lg:flex-col" aria-label="Seções da conta">
            {(
              [
                { value: 'profile', label: 'Dados pessoais', icon: UserRound },
                { value: 'security', label: 'Segurança', icon: ShieldCheck },
                { value: 'notifications', label: 'Notificações', icon: Bell },
                { value: 'privacy', label: 'Privacidade', icon: Download },
              ] as const
            ).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                aria-current={section === value ? 'page' : undefined}
                onClick={() => setSection(value)}
                className={cn('flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition', section === value ? 'bg-primary-50 text-primary-600' : 'text-ink-variant hover:bg-surface-low')}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </button>
            ))}
          </nav>
        </aside>
        <div className="min-w-0 space-y-6">
          {section === 'profile' ? <ProfileSection /> : null}
          {section === 'security' ? (
            <>
              <PasswordCard />
              <TwoFactorCard />
              <EmailCard />
              <SessionsCard />
            </>
          ) : null}
          {section === 'notifications' ? <NotificationsSection /> : null}
          {section === 'privacy' ? <PrivacySection /> : null}
        </div>
      </div>
    </div>
  );
};

export default AccountPage;
