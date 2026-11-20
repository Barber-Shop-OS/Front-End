// FE-07/FE-09: painel do dono, gerente e barbeiro — menu por papel, seletor de barbearia/filial e
// avisos (assinatura, e-mail não confirmado). Mobile: menu em gaveta.
import { useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarPlus,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings,
  ShieldCheck,
  User,
  Users,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Alert, buttonClass } from '@/components/ui';
import { useAuth, useLogout } from '@/features/auth/hooks';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { EmailVerificationBanner } from '@/features/account/EmailVerificationBanner';
import { cn } from '@/utils/cn';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const ownerNav = (isOwner: boolean): NavItem[] => [
  { to: '/dashboard', label: 'Visão geral', icon: <LayoutDashboard className="h-5 w-5" />, end: true },
  { to: '/dashboard/agenda', label: 'Agenda', icon: <CalendarDays className="h-5 w-5" /> },
  { to: '/dashboard/agendamentos/novo', label: 'Novo agendamento', icon: <CalendarPlus className="h-5 w-5" /> },
  { to: '/dashboard/clientes', label: 'Clientes', icon: <UsersRound className="h-5 w-5" /> },
  { to: '/dashboard/financeiro', label: 'Financeiro', icon: <Wallet className="h-5 w-5" /> },
  { to: '/dashboard/filiais', label: 'Filiais', icon: <Building2 className="h-5 w-5" /> },
  { to: '/dashboard/barbeiros', label: 'Barbeiros', icon: <Users className="h-5 w-5" /> },
  ...(isOwner
    ? [
        { to: '/dashboard/servicos', label: 'Serviços', icon: <Scissors className="h-5 w-5" /> },
        { to: '/dashboard/equipe', label: 'Gerentes', icon: <ShieldCheck className="h-5 w-5" /> },
        { to: '/dashboard/assinatura', label: 'Assinatura', icon: <CreditCard className="h-5 w-5" /> },
        { to: '/dashboard/configuracoes', label: 'Configurações', icon: <Settings className="h-5 w-5" /> },
      ]
    : []),
];

const barberNav: NavItem[] = [
  { to: '/barbeiro', label: 'Minha agenda', icon: <CalendarDays className="h-5 w-5" />, end: true },
  { to: '/barbeiro/desempenho', label: 'Meu desempenho', icon: <BarChart3 className="h-5 w-5" /> },
  { to: '/barbeiro/folgas', label: 'Folgas e bloqueios', icon: <CalendarPlus className="h-5 w-5" /> },
];

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn('flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition', isActive ? 'bg-primary-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900');

const ContextSwitcher = () => {
  const ctx = useActiveContext();
  if (!ctx.barbershop) return null;
  return (
    <div className="space-y-2 rounded-xl bg-slate-50 p-3">
      {ctx.barbershops.length > 1 ? (
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
          Barbearia
          <select className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800" value={ctx.barbershop.id} onChange={(event) => ctx.setBarbershop(Number(event.target.value))}>
            {ctx.barbershops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <p className="truncate text-sm font-bold text-slate-900">{ctx.barbershop.name}</p>
      )}
      {ctx.branches.length > 0 ? (
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted">
          Filial
          <select className="mt-1 h-9 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm font-semibold text-slate-800" value={ctx.branch?.id ?? ''} onChange={(event) => ctx.setBranch(Number(event.target.value))}>
            {ctx.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
                {branch.active ? '' : ' (inativa)'}
              </option>
            ))}
          </select>
        </label>
      ) : null}
    </div>
  );
};

const BillingBanner = () => {
  const { user } = useAuth();
  const ctx = useActiveContext();
  const banner = user?.billing_banners.find((item) => item.barbershop_id === ctx.barbershop?.id);
  if (!banner) return null;
  const tone = banner.severity === 'error' ? 'error' : banner.severity === 'warning' ? 'warning' : 'info';
  return (
    <Alert
      tone={tone}
      className="mb-4"
      action={
        ctx.isOwner ? (
          <Link to="/dashboard/assinatura" className={buttonClass(tone === 'error' ? 'danger' : 'primary', 'sm')}>
            {banner.type === 'trial_ending' ? 'Assinar agora' : 'Ver assinatura'}
          </Link>
        ) : null
      }
    >
      {banner.message}
    </Alert>
  );
};

export const WorkspaceLayout = ({ area }: { area: 'owner' | 'barber' }) => {
  const { user, areas } = useAuth();
  const ctx = useActiveContext();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const nav = area === 'owner' ? ownerNav(ctx.isOwner) : barberNav;

  const sidebar = (
    <div className="flex h-full flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <Logo to={area === 'owner' ? '/dashboard' : '/barbeiro'} />
        <button type="button" className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      {area === 'owner' ? <ContextSwitcher /> : null}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Painel">
        {nav.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass} onClick={() => setOpen(false)}>
            {item.icon}
            {item.label}
          </NavLink>
        ))}
        {area === 'owner' && areas.includes('barber') ? (
          <NavLink to="/barbeiro" className={linkClass} onClick={() => setOpen(false)}>
            <Scissors className="h-5 w-5" /> Minha agenda de barbeiro
          </NavLink>
        ) : null}
        {area === 'barber' && areas.includes('owner') ? (
          <NavLink to="/dashboard" className={linkClass} onClick={() => setOpen(false)}>
            <LayoutDashboard className="h-5 w-5" /> Painel da barbearia
          </NavLink>
        ) : null}
      </nav>
      <div className="border-t border-slate-100 pt-3">
        <NavLink to="/conta" className={linkClass} onClick={() => setOpen(false)}>
          <User className="h-5 w-5" /> {user?.name.split(' ')[0] ?? 'Minha conta'}
        </NavLink>
        <button type="button" onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-danger-700 hover:bg-danger-50">
          <LogOut className="h-5 w-5" /> Sair
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:sticky lg:top-0 lg:block lg:h-screen">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/40" aria-label="Fechar menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-xl">{sidebar}</aside>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2" aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </button>
          <span className="truncate text-sm font-bold text-slate-800">{area === 'owner' ? ctx.barbershop?.name ?? 'Painel' : 'Minha agenda'}</span>
          <span className="w-10" />
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8 lg:py-8" key={location.pathname}>
          <EmailVerificationBanner />
          {area === 'owner' ? <BillingBanner /> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
