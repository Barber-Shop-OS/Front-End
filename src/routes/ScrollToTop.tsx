import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Volta ao topo ao trocar de página (SPA). Com âncora (ex.: /privacidade#cookies) rola até a seção —
 * tenta por até ~1 s porque a página é carregada sob demanda.
 */
export const ScrollToTop = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
      return undefined;
    }
    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const attempt = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        target.scrollIntoView({ block: 'start' });
        return;
      }
      if (tries++ < 20) timer = setTimeout(attempt, 50);
    };
    attempt();
    return () => clearTimeout(timer);
  }, [pathname, hash]);
  return null;
};
