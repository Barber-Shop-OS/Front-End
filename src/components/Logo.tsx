// Logo oficial (emblema da landing page do Figma, nó 1:410) + wordmark "BarberOS" (Inter Bold, #004ac6).
import { Link } from 'react-router-dom';

import logoUrl from '@/assets/figma/brand/logo.png';
import { cn } from '@/utils/cn';

interface LogoProps {
  to?: string;
  light?: boolean;
  /** Linha de apoio abaixo do nome (ex.: "Front Desk" no painel do atendimento). */
  tagline?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const LogoMark = ({ className }: { className?: string }) => (
  <img src={logoUrl} alt="" aria-hidden="true" width={26} height={29} className={cn('h-[29px] w-[26px] object-contain', className)} />
);

export const Logo = ({ to = '/', light = false, tagline, size = 'md', className }: LogoProps) => (
  <Link to={to} className={cn('inline-flex items-center gap-2.5', className)} aria-label="BarberOS — início">
    <LogoMark className={size === 'sm' ? 'h-6 w-[22px]' : undefined} />
    <span className="flex flex-col">
      <span className={cn('font-bold leading-7 tracking-[-0.05em]', size === 'sm' ? 'text-lg' : 'text-xl', light ? 'text-white' : 'text-primary-600')}>BarberOS</span>
      {tagline ? <span className="text-xs font-semibold uppercase leading-4 tracking-label text-muted">{tagline}</span> : null}
    </span>
  </Link>
);
