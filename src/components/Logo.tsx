import { Scissors } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Logo = ({ to = '/', light = false }: { to?: string; light?: boolean }) => (
  <Link to={to} className="inline-flex items-center gap-2 font-black tracking-tight" aria-label="BarberOS — início">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
      <Scissors className="h-5 w-5" aria-hidden="true" />
    </span>
    <span className={light ? 'text-lg text-white' : 'text-lg text-slate-900'}>BarberOS</span>
  </Link>
);
