// FE-27: botão "Entrar com Google" (Google Identity Services → id_token → POST /api/auth/google).
// Sem VITE_GOOGLE_CLIENT_ID o botão não aparece (FE-03).
import { useEffect, useRef, useState } from 'react';

import { GOOGLE_CLIENT_ID } from '@/config/env';

interface GoogleCredentialResponse {
  credential?: string;
}
interface GoogleId {
  initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; ux_mode?: 'popup' }) => void;
  renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
}
type WindowWithGoogle = Window & { google?: { accounts?: { id?: GoogleId } } };

const SCRIPT = 'https://accounts.google.com/gsi/client';

const loadScript = () =>
  new Promise<void>((resolve, reject) => {
    if ((window as WindowWithGoogle).google?.accounts?.id) return resolve();
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    const script = existing ?? document.createElement('script');
    script.addEventListener('load', () => resolve(), { once: true });
    script.addEventListener('error', () => reject(new Error('Falha ao carregar o Google')), { once: true });
    if (!existing) {
      script.src = SCRIPT;
      script.async = true;
      document.head.appendChild(script);
    }
  });

export const GoogleButton = ({ onCredential, text = 'continue_with' }: { onCredential: (idToken: string) => void; text?: 'signin_with' | 'signup_with' | 'continue_with' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const callback = useRef(onCredential);
  callback.current = onCredential;
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        const google = (window as WindowWithGoogle).google?.accounts?.id;
        if (cancelled || !google || !ref.current) return;
        google.initialize({ client_id: GOOGLE_CLIENT_ID as string, callback: (response) => response.credential && callback.current(response.credential) });
        google.renderButton(ref.current, { theme: 'outline', size: 'large', text, shape: 'pill', width: ref.current.offsetWidth || 320, locale: 'pt-BR' });
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (!GOOGLE_CLIENT_ID || failed) return null;
  return (
    <div>
      <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted">
        <span className="h-px flex-1 bg-slate-200" /> ou <span className="h-px flex-1 bg-slate-200" />
      </div>
      <div ref={ref} className="flex min-h-[44px] w-full justify-center" />
    </div>
  );
};
