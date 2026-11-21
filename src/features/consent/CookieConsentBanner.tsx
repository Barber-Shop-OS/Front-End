// FE-42: banner de cookies + painel de preferências (LGPD; Guia de Cookies da ANPD, 2022).
// - Recusar é tão fácil quanto aceitar (botões do mesmo tamanho, na primeira camada);
// - nada pré-marcado: "Estatísticas" começa desligado no painel;
// - "Cookies" no rodapé, na política de privacidade e em Minha conta reabrem o painel (revogação a qualquer momento).
import { useEffect, useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Cookie } from 'lucide-react';

import { Button, Modal } from '@/components/ui';
import { cn } from '@/utils/cn';

import { isAnalyticsConfigured, trackPageView } from './analytics';
import { initCookieConsent, onOpenCookiePreferences, saveCookieConsent, useCookieConsent } from './consentStore';

const Switch = ({ checked, onChange, disabled, labelledBy }: { checked: boolean; onChange?: (value: boolean) => void; disabled?: boolean; labelledBy: string }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-labelledby={labelledBy}
    disabled={disabled}
    onClick={() => onChange?.(!checked)}
    className={cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600',
      checked ? 'bg-primary-600' : 'bg-outline-variant',
      disabled && 'cursor-not-allowed opacity-60'
    )}
  >
    <span className={cn('inline-block h-5 w-5 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-[22px]' : 'translate-x-0.5')} />
  </button>
);

export const CookiePreferences = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const consent = useCookieConsent();
  const [analytics, setAnalytics] = useState(false);
  const essentialId = useId();
  const analyticsId = useId();
  const configured = isAnalyticsConfigured();

  useEffect(() => {
    if (open) setAnalytics(consent?.analytics ?? false);
  }, [open, consent?.analytics]);

  const save = (value: boolean, action: Parameters<typeof saveCookieConsent>[1]) => {
    saveCookieConsent(value, action);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Preferências de cookies"
      footer={
        configured ? (
          <>
            <Button variant="outline" onClick={() => save(false, consent?.analytics ? 'withdraw' : 'reject_all')}>
              Recusar opcionais
            </Button>
            <Button variant="secondary" onClick={() => save(analytics, consent?.analytics && !analytics ? 'withdraw' : 'custom')}>
              Salvar escolhas
            </Button>
            <Button onClick={() => save(true, 'accept_all')}>Aceitar todos</Button>
          </>
        ) : (
          <Button onClick={onClose}>Fechar</Button>
        )
      }
    >
      <div className="space-y-5 text-sm text-ink-variant">
        <p>
          Escolha quais cookies o BarberOS pode usar neste navegador. Você pode mudar de ideia quando quiser. Detalhes na{' '}
          <Link to="/privacidade#cookies" onClick={onClose} className="font-semibold text-primary-600 hover:underline">
            Política de Privacidade
          </Link>
          .
        </p>
        <div className="flex items-start justify-between gap-4 rounded-xl bg-surface-low p-4">
          <div>
            <p id={essentialId} className="font-semibold text-ink">Essenciais</p>
            <p className="mt-1">Mantêm você conectado com segurança, lembram suas preferências e esta escolha. Sem eles o site não funciona, por isso ficam sempre ativos.</p>
          </div>
          <Switch checked disabled labelledBy={essentialId} />
        </div>
        {configured ? (
          <div className="flex items-start justify-between gap-4 rounded-xl bg-surface-low p-4">
            <div>
              <p id={analyticsId} className="font-semibold text-ink">Estatísticas (Google Analytics)</p>
              <p className="mt-1">
                Contam visitas e mostram quais páginas são mais usadas, para melhorarmos o BarberOS. Os dados são do Google (EUA), sem uso para
                publicidade e sem identificar você pelo nome. Expiram em até 13 meses.
              </p>
            </div>
            <Switch checked={analytics} onChange={setAnalytics} labelledBy={analyticsId} />
          </div>
        ) : (
          <p>No momento o BarberOS não usa cookies opcionais.</p>
        )}
      </div>
    </Modal>
  );
};

/** Montado uma vez dentro do BrowserRouter: aplica a escolha salva, registra page views e mostra o banner. */
export const CookieConsentBanner = () => {
  const consent = useCookieConsent();
  const location = useLocation();
  const [preferencesOpen, setPreferencesOpen] = useState(false);
  const titleId = useId();

  useEffect(() => {
    initCookieConsent();
  }, []);
  useEffect(() => onOpenCookiePreferences(() => setPreferencesOpen(true)), []);
  useEffect(() => {
    trackPageView(location.pathname);
  }, [location.pathname]);

  const showBanner = isAnalyticsConfigured() && !consent && !preferencesOpen;

  return (
    <>
      {showBanner ? (
        <div
          role="region"
          aria-labelledby={titleId}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-surface-low bg-white px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md sm:rounded-xl sm:border sm:pb-4"
        >
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-primary-600" aria-hidden="true" />
            <div>
              <p id={titleId} className="font-bold text-ink">Sua privacidade</p>
              <p className="mt-1 text-sm text-ink-variant">
                Usamos cookies essenciais para o site funcionar e, se você permitir, cookies do Google Analytics para entender como o BarberOS é
                usado. Saiba mais na{' '}
                <Link to="/privacidade#cookies" className="font-semibold text-primary-600 hover:underline">
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={() => saveCookieConsent(false, 'reject_all')}>
              Recusar
            </Button>
            <Button onClick={() => saveCookieConsent(true, 'accept_all')}>Aceitar</Button>
            <Button variant="ghost" className="col-span-2" onClick={() => setPreferencesOpen(true)}>
              Personalizar
            </Button>
          </div>
        </div>
      ) : null}
      <CookiePreferences open={preferencesOpen} onClose={() => setPreferencesOpen(false)} />
    </>
  );
};
