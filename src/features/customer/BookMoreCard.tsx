// Bloco "Espaço para mais um?" do Figma (1:1216) — convite para um novo agendamento (leva à busca).
import { Link } from 'react-router-dom';
import { Scissors } from 'lucide-react';

import { cn } from '@/utils/cn';

export const BookMoreCard = ({ title = 'Espaço para mais um?', description = 'Mantenha seu estilo impecável agendando sua próxima visita agora mesmo.', className }: { title?: string; description?: string; className?: string }) => (
  <section className={cn('relative overflow-hidden rounded-3xl bg-primary-600/5 p-6 sm:p-8', className)}>
    <Scissors className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 -rotate-45 text-ink-subtle/20" aria-hidden="true" />
    <div className="relative max-w-sm space-y-2">
      <h2 className="text-2xl font-black tracking-[-0.025em] text-primary-600">{title}</h2>
      <p className="pb-4 text-sm text-ink-variant">{description}</p>
      <Link
        to="/filiais"
        className="inline-flex min-h-[44px] items-center justify-center rounded-lg bg-primary-600 px-8 text-xs font-bold uppercase tracking-[0.15em] text-white shadow-primary transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
      >
        Novo agendamento
      </Link>
    </div>
  </section>
);
