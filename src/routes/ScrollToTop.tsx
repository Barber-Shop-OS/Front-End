import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Volta ao topo ao trocar de página (SPA). */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};
