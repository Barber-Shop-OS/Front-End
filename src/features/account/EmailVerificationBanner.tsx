// FE-26: aviso para quem ainda não confirmou o e-mail (dono não publica a página até confirmar).
import { useState } from 'react';

import { Alert, Button, useToast } from '@/components/ui';
import { useAuth } from '@/features/auth/hooks';
import { authHttp } from '@/services/http';
import { apiErrorMessage } from '@/utils/apiErrors';

export const EmailVerificationBanner = () => {
  const { user, areas } = useAuth();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  if (!user || user.email_verified_at) return null;

  const resend = async () => {
    setSending(true);
    try {
      const { data } = await authHttp.post<{ message: string }>('/resend-verification');
      toast.success(data.message || 'Enviamos um novo link de confirmação.');
    } catch (error) {
      toast.error(apiErrorMessage(error));
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert
      tone="warning"
      className="mb-4"
      title="Confirme seu e-mail"
      action={
        <Button size="sm" variant="outline" onClick={resend} loading={sending}>
          Reenviar link
        </Button>
      }
    >
      Enviamos um link para <strong>{user.email}</strong>.
      {areas.includes('owner') ? ' Sua página pública e o agendamento online só ficam no ar depois da confirmação.' : ''}
    </Alert>
  );
};
