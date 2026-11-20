// Peças visuais das telas de entrada (Figma 1:470 Login, 1:892 Cadastro, 1:2 Recuperação, 1:427 Verificação).
// Layout dividido (imagem editorial + formulário de 600px) e layout centralizado (cartão sobre fundo com brilho).
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

import barberTools from '@/assets/figma/auth/barber-tools.png';
import { buttonClass } from '@/components/ui';
import { cn } from '@/utils/cn';

/** Botão principal do Figma: gradiente primary → primary-container, 50px, texto 14px. */
export const authPrimaryButton = (className?: string) =>
  buttonClass(
    'primary',
    'lg',
    cn('w-full bg-gradient-to-r from-primary-600 to-primary-500 text-sm font-semibold shadow-card hover:from-primary-700 hover:to-primary-600', className)
  );

/** Coluna esquerda (Figma "Left Side: Editorial Image Container"). */
const EditorialPanel = () => (
  <aside className="relative hidden items-center justify-center overflow-hidden bg-inverse-surface lg:flex" aria-hidden="true">
    <img src={barberTools} alt="" className="absolute inset-0 h-full w-full object-cover opacity-60 grayscale" />
    <div className="absolute inset-0 bg-gradient-to-br from-primary-600/80 to-inverse-surface/90 mix-blend-multiply" />
    <div className="relative flex max-w-[512px] flex-col gap-6 p-16">
      <p className="text-5xl font-bold leading-[60px] tracking-[-0.02em] text-white">
        A Arte da
        <br />
        Precisão Digital.
      </p>
      <p className="text-lg leading-[29px] text-inverse-on/90">Gestão rigorosa para profissionais que não aceitam menos que a excelência.</p>
    </div>
  </aside>
);

export const SplitAuthShell = ({ children }: { children: ReactNode }) => (
  <div className="grid min-h-screen bg-surface lg:grid-cols-[minmax(0,1fr)_600px]">
    <EditorialPanel />
    <main className="relative flex items-center justify-center overflow-hidden px-4 py-10 sm:p-12">
      <div className="pointer-events-none absolute -right-48 -top-48 h-96 w-96 rounded-xl bg-surface-high opacity-50 blur-[50px]" aria-hidden="true" />
      <div className="relative w-full max-w-[384px]">{children}</div>
    </main>
  </div>
);

export const CenteredAuthShell = ({ children }: { children: ReactNode }) => (
  <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-surface px-4 py-12">
    <div
      className="pointer-events-none absolute left-1/2 top-1/2 h-[min(800px,140vw)] w-[min(800px,140vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-primary-100/70 to-surface-high/40 blur-3xl"
      aria-hidden="true"
    />
    <div className="relative w-full max-w-[448px]">
      <div className="mb-8 text-center">
        <Link to="/" className="text-3xl font-bold tracking-[-0.05em] text-primary-600">
          BarberOS
        </Link>
        <p className="mt-2 text-xs font-semibold uppercase tracking-label text-ink-variant">A Arte da Precisão Digital</p>
      </div>
      {children}
    </div>
  </div>
);

/** Cabeçalho do formulário (Figma "Brand Header"): marca, título e apoio. */
export const AuthHeader = ({ title, subtitle }: { title: string; subtitle?: ReactNode }) => (
  <header className="flex flex-col gap-2">
    <Link to="/" className="w-fit text-2xl leading-8 tracking-[-0.02em] text-primary-600">
      BarberOS
    </Link>
    <h1 className="text-[30px] leading-9 tracking-[-0.02em] text-ink">{title}</h1>
    {subtitle ? <p className="text-base leading-6 text-ink-variant">{subtitle}</p> : null}
  </header>
);

/** Cartão das telas centralizadas (recuperação, verificação, convite, troca de e-mail). */
export const AuthCard = ({ icon, title, description, children, tone = 'primary' }: { icon?: ReactNode; title: string; description?: ReactNode; children?: ReactNode; tone?: 'primary' | 'success' | 'danger' }) => (
  <section className="relative">
    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-primary-200/60 via-transparent to-primary-100/60 blur-sm" aria-hidden="true" />
    <div className="relative rounded-xl bg-surface-lowest px-6 py-10 shadow-soft sm:px-10">
      <div className="flex flex-col items-center text-center">
        {icon ? (
          <span
            className={cn(
              'mb-3 inline-flex h-16 w-16 items-center justify-center rounded-xl',
              tone === 'success' ? 'bg-success-50 text-success-600' : tone === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-primary-100 text-primary-600'
            )}
            aria-hidden="true"
          >
            {icon}
          </span>
        ) : null}
        <h1 className="pt-3 text-2xl font-bold leading-8 tracking-[-0.02em] text-ink">{title}</h1>
        {description ? <div className="mt-3 max-w-[312px] text-sm leading-5 text-ink-variant">{description}</div> : null}
      </div>
      {children ? <div className="mt-8">{children}</div> : null}
    </div>
  </section>
);

/** Rodapé "Ainda não possui acesso? Criar conta". */
export const AuthFooterLink = ({ text, to, label, state }: { text: string; to: string; label: string; state?: unknown }) => (
  <p className="pt-2 text-center text-sm text-ink-variant">
    {text}{' '}
    <Link to={to} state={state} className="font-semibold text-primary-600 hover:underline">
      {label}
    </Link>
  </p>
);
