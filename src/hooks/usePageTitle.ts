// FE-33: título e descrição da página (SEO básico de SPA).
import { useEffect } from 'react';

export const usePageTitle = (title: string | undefined, description?: string) => {
  useEffect(() => {
    if (!title) return;
    document.title = title.includes('BarberOS') ? title : `${title} · BarberOS`;
    if (description) {
      let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
};
