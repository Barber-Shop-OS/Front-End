// SEC-27: verificação em duas etapas (TOTP) na página de conta — ativar com QR code, guardar os códigos de
// recuperação (mostrados uma única vez) e desativar com senha + código. Obrigatória para admin.
import { useEffect, useState } from 'react';
import { Copy, Download, ShieldCheck } from 'lucide-react';

import { Alert, Badge, Button, Card, CardTitle, Input, ListSkeleton, Modal, useToast } from '@/components/ui';
import { refreshMe } from '@/features/auth/authSlice';
import { useAppDispatch } from '@/hooks/redux';
import { apiErrorMessage } from '@/utils/apiErrors';
import { formatDate } from '@/utils/date';

import { groupSecret } from './helpers';
import { useTwoFactorDisableMutation, useTwoFactorEnableMutation, useTwoFactorSetupMutation, useTwoFactorStatusQuery } from './api';

const onlyDigits = (value: string) => value.replace(/\D/g, '').slice(0, 6);

const QrCode = ({ value }: { value: string }) => {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    import('qrcode')
      .then((qr) => qr.toDataURL(value, { margin: 1, width: 200, errorCorrectionLevel: 'M' }))
      .then((url) => alive && setSrc(url))
      .catch(() => alive && setSrc(null));
    return () => {
      alive = false;
    };
  }, [value]);
  if (!src) return <div className="h-[200px] w-[200px] animate-pulse rounded-lg bg-surface-low" aria-hidden="true" />;
  return <img src={src} width={200} height={200} alt="QR code para o app autenticador" className="rounded-lg border border-slate-200" />;
};

const downloadText = (text: string, filename: string) => {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const RecoveryCodes = ({ codes, onClose }: { codes: string[]; onClose: () => void }) => {
  const toast = useToast();
  const text = `Códigos de recuperação do BarberOS (cada um vale uma vez)\n\n${codes.join('\n')}\n`;
  return (
    <div className="space-y-4">
      <Alert tone="warning">Guarde estes códigos em um lugar seguro. Eles só aparecem agora e servem para entrar se você perder o celular.</Alert>
      <ul className="grid grid-cols-2 gap-2 rounded-lg bg-surface-low p-4 font-mono text-sm text-ink" aria-label="Códigos de recuperação">
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ul>
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          variant="secondary"
          icon={<Copy className="h-4 w-4" aria-hidden="true" />}
          onClick={() => navigator.clipboard?.writeText(codes.join('\n')).then(() => toast.success('Códigos copiados.'), () => toast.error('Não foi possível copiar.'))}
        >
          Copiar
        </Button>
        <Button variant="secondary" icon={<Download className="h-4 w-4" aria-hidden="true" />} onClick={() => downloadText(text, 'barberos-codigos-de-recuperacao.txt')}>
          Baixar
        </Button>
        <Button onClick={onClose}>Já guardei</Button>
      </div>
    </div>
  );
};

const EnableFlow = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const [setup, setupState] = useTwoFactorSetupMutation();
  const [enable, enableState] = useTwoFactorEnableMutation();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [codes, setCodes] = useState<string[] | null>(null);

  useEffect(() => {
    setup();
  }, [setup]);

  if (codes) return <RecoveryCodes codes={codes} onClose={onClose} />;
  if (setupState.isLoading || setupState.isUninitialized) return <ListSkeleton rows={3} />;
  if (setupState.error || !setupState.data) {
    return (
      <div className="space-y-4">
        <Alert tone="error">{apiErrorMessage(setupState.error)}</Alert>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={() => setup()}>
            Tentar de novo
          </Button>
        </div>
      </div>
    );
  }

  const { secret, otpauth_url: url } = setupState.data;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (code.length !== 6) return setError('Digite o código de 6 dígitos que aparece no app.');
    setError(null);
    try {
      const result = await enable({ code }).unwrap();
      setCodes(result.recovery_codes);
      dispatch(refreshMe());
    } catch (err) {
      setError(apiErrorMessage(err));
      setCode('');
    }
  };

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <ol className="list-decimal space-y-2 pl-5 text-sm text-ink-variant">
        <li>Instale um app autenticador (Google Authenticator, Microsoft Authenticator, 1Password…).</li>
        <li>Escaneie o QR code abaixo ou digite a chave manualmente.</li>
        <li>Digite o código de 6 dígitos que o app mostrar.</li>
      </ol>
      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <QrCode value={url} />
        <div className="min-w-0 flex-1 space-y-1 text-sm">
          <p className="text-xs font-semibold uppercase tracking-label text-ink-variant">Chave manual</p>
          <p className="break-all font-mono text-ink">{groupSecret(secret)}</p>
        </div>
      </div>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Input label="Código do app" inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="000000" value={code} onChange={(e) => setCode(onlyDigits(e.target.value))} />
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" loading={enableState.isLoading}>
          Ativar
        </Button>
      </div>
    </form>
  );
};

const DisableFlow = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [disable, { isLoading }] = useTwoFactorDisableMutation();
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [useRecovery, setUseRecovery] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!password || !code.trim()) return setError('Informe a senha e o código.');
    setError(null);
    try {
      await disable(useRecovery ? { password, recovery_code: code.trim() } : { password, code: code.trim() }).unwrap();
      dispatch(refreshMe());
      toast.success('Verificação em duas etapas desativada.');
      onClose();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  return (
    <form className="space-y-4" onSubmit={submit} noValidate>
      <p className="text-sm text-ink-variant">Sem a verificação, só a senha protege sua conta. Confirme com a senha e um código.</p>
      {error ? <Alert tone="error">{error}</Alert> : null}
      <Input label="Senha" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Input
        label={useRecovery ? 'Código de recuperação' : 'Código do app'}
        inputMode={useRecovery ? 'text' : 'numeric'}
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(useRecovery ? e.target.value : onlyDigits(e.target.value))}
      />
      <button type="button" className="text-sm font-semibold text-primary-600 hover:underline" onClick={() => (setUseRecovery((v) => !v), setCode(''))}>
        {useRecovery ? 'Usar o código do app' : 'Usar um código de recuperação'}
      </button>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="danger" loading={isLoading}>
          Desativar
        </Button>
      </div>
    </form>
  );
};

export const TwoFactorCard = () => {
  const { data, isLoading, error } = useTwoFactorStatusQuery();
  const [mode, setMode] = useState<'enable' | 'disable' | null>(null);

  return (
    <Card>
      <CardTitle>
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary-600" aria-hidden="true" /> Verificação em duas etapas
        </span>
      </CardTitle>
      {isLoading ? (
        <ListSkeleton rows={2} />
      ) : error || !data ? (
        <Alert tone="error">{apiErrorMessage(error)}</Alert>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-0 flex-1 text-sm text-ink-variant">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                {data.enabled ? <Badge tone="green">Ativa</Badge> : <Badge>Desativada</Badge>}
                {data.required ? <Badge tone="orange">Obrigatória para administradores</Badge> : null}
              </div>
              {data.enabled
                ? `Ativada${data.enabled_at ? ` em ${formatDate(data.enabled_at)}` : ''}. Restam ${data.recovery_codes_left} código(s) de recuperação.`
                : 'Além da senha, peça um código do app autenticador do celular ao entrar.'}
            </div>
            {data.enabled ? (
              data.required ? null : (
                <Button variant="secondary" onClick={() => setMode('disable')}>
                  Desativar
                </Button>
              )
            ) : (
              <Button onClick={() => setMode('enable')}>Ativar</Button>
            )}
          </div>
          {data.enabled && data.recovery_codes_left <= 2 ? (
            <Alert tone="warning">Poucos códigos de recuperação. Desative e ative de novo para gerar novos códigos.</Alert>
          ) : null}
        </div>
      )}
      <Modal open={mode !== null} onClose={() => setMode(null)} title={mode === 'disable' ? 'Desativar verificação em duas etapas' : 'Ativar verificação em duas etapas'}>
        {mode === 'enable' ? <EnableFlow onClose={() => setMode(null)} /> : null}
        {mode === 'disable' ? <DisableFlow onClose={() => setMode(null)} /> : null}
      </Modal>
    </Card>
  );
};
