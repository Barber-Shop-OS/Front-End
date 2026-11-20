// Painéis (dono/gerente, barbeiro, atendimento e admin) — casca do Figma "Dashboard do Dono" (1:3879) e
// "Dashboard - Atendimento" (1:5522): sidebar branca de 256px com logo, CTA primário, navegação e usuário no
// rodapé; topbar translúcida de 64px com notificações, configurações e avatar. Abaixo de lg o menu vira gaveta.
import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Building2,
  CalendarDays,
  CalendarOff,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Scissors,
  Search,
  Settings,
  ShieldCheck,
  Store,
  UserPlus,
  Users,
  UsersRound,
  Wallet,
  X,
} from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Alert, Avatar, buttonClass } from '@/components/ui';
import { EmailVerificationBanner } from '@/features/account/EmailVerificationBanner';
import { useAuth, useLogout } from '@/features/auth/hooks';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { useActiveContext } from '@/features/workspace/useActiveContext';
import { cn } from '@/utils/cn';

export type WorkspaceArea = 'owner' | 'barber' | 'frontdesk' | 'admin';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  end?: boolean;
}

const icon = (Icon: typeof LayoutDashboard) => <Icon className="h-[18px] w-[18px]" aria-hidden="true" />;

const ownerNav = (isOwner: boolean): NavItem[] => [
  { to: '/dashboard', label: 'Dashboard', icon: icon(LayoutDashboard), end: true },
  { to: '/dashboard/agenda', label: 'Agenda', icon: icon(CalendarDays) },
  { to: '/dashboard/clientes', label: 'Clientes', icon: icon(UsersRound) },
  { to: '/dashboard/financeiro', label: 'Financeiro', icon: icon(Wallet) },
  { to: '/dashboard/filiais', label: 'Filiais', icon: icon(Store) },
  { to: '/dashboard/barbeiros', label: 'Barbeiros', icon: icon(Scissors) },
  { to: '/dashboard/servicos', label: 'Serviços', icon: icon(ClipboardList) },
  { to: '/dashboard/equipe', label: 'Equipe', icon: icon(ShieldCheck) },
  ...(isOwner
    ? [
        { to: '/dashboard/assinatura', label: 'Assinatura', icon: icon(CreditCard) },
        { to: '/dashboard/configuracoes', label: 'Configurações', icon: icon(Settings) },
      ]
    : []),
];

const barberNav: NavItem[] = [
  { to: '/barbeiro', label: 'Dashboard', icon: icon(LayoutDashboard), end: true },
  { to: '/barbeiro/agendamentos', label: 'Agendamentos', icon: icon(CalendarDays) },
  { to: '/barbeiro/rendimentos', label: 'Rendimentos', icon: icon(BarChart3) },
  { to: '/barbeiro/clientes', label: 'Clientes', icon: icon(Users) },
  { to: '/barbeiro/folgas', label: 'Folgas e bloqueios', icon: icon(CalendarOff) },
];

const frontdeskNav: NavItem[] = [
  { to: '/atendimento', label: 'Dashboard', icon: icon(LayoutDashboard), end: true },
  { to: '/atendimento/agenda', label: 'Agenda', icon: icon(CalendarDays) },
  { to: '/atendimento/clientes', label: 'Clientes', icon: icon(Users) },
  { to: '/atendimento/pagamentos', label: 'Pagamentos', icon: icon(Wallet) },
];

const adminNav: NavItem[] = [
  { to: '/admin', label: 'Visão geral', icon: icon(LayoutDashboard), end: true },
  { to: '/admin/barbearias', label: 'Barbearias', icon: icon(Building2) },
  { to: '/admin/usuarios', label: 'Usuários', icon: icon(Users) },
];

const AREA_CONFIG: Record<WorkspaceArea, { home: string; tagline: string; cta?: { to: string; label: string } }> = {
  owner: { home: '/dashboard', tagline: 'Gestão', cta: { to: '/dashboard/agendamentos/novo', label: 'Agendar Novo' } },
  barber: { home: '/barbeiro', tagline: 'Barbeiro' },
  frontdesk: { home: '/atendimento', tagline: 'Front Desk', cta: { to: '/atendimento/agendamentos/novo', label: 'Novo Agendamento' } },
  admin: { home: '/admin', tagline: 'Plataforma' },
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-3 rounded px-4 py-3 text-sm tracking-[-0.025em] transition',
    isActive ? 'bg-surface-low font-bold text-primary-600' : 'text-muted hover:bg-surface-low/60 hover:text-ink'
  );

const selectClass = 'mt-1 h-9 w-full rounded-lg border-0 bg-surface-low px-2 text-sm font-semibold text-ink focus:ring-2 focus:ring-primary-100';

const ContextSwitcher = ({ area }: { area: WorkspaceArea }) => {
  const ctx = useActiveContext(area === 'frontdesk' ? 'frontdesk' : 'owner');
  if (!ctx.barbershop) return null;
  return (
    <div className="space-y-2 px-6 pb-6">
      {ctx.barbershops.length > 1 ? (
        <label className="block text-[11px] font-semibold uppercase tracking-label text-muted">
          Barbearia
          <select className={selectClass} value={ctx.barbershop.id} onChange={(event) => ctx.setBarbershop(Number(event.target.value))}>
            {ctx.barbershops.map((shop) => (
              <option key={shop.id} value={shop.id}>
                {shop.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {ctx.branches.length > 1 ? (
        <label className="block text-[11px] font-semibold uppercase tracking-label text-muted">
          Filial
          <select className={selectClass} value={ctx.branch?.id ?? ''} onChange={(event) => ctx.setBranch(Number(event.target.value))}>
            {ctx.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
                {branch.active ? '' : ' (inativa)'}
              </option>
            ))}
          </select>
        </label>
      ) : ctx.branch ? (
        <p className="truncate text-xs text-muted">{ctx.branch.name}</p>
      ) : null}
    </div>
  );
};

const BillingBanner = () => {
  const { user } = useAuth();
  const ctx = useActiveContext('owner');
  const banner = user?.billing_banners.find((item) => item.barbershop_id === ctx.barbershop?.id);
  if (!banner) return null;
  const tone = banner.severity === 'error' ? 'error' : banner.severity === 'warning' ? 'warning' : 'info';
  return (
    <Alert
      tone={tone}
      className="mb-6"
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

/** Busca de clientes da topbar do atendimento (Figma 1:5522) — leva à lista de clientes já filtrada. */
const ClientSearch = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  return (
    <form
      role="search"
      className="relative hidden w-full max-w-[256px] sm:block"
      onSubmit={(event) => {
        event.preventDefault();
        navigate(`/atendimento/clientes${term.trim() ? `?q=${encodeURIComponent(term.trim())}` : ''}`);
      }}
    >
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden="true" />
      <input
        type="search"
        value={term}
        onChange={(event) => setTerm(event.target.value)}
        placeholder="Buscar cliente..."
        aria-label="Buscar cliente"
        className="h-9 w-full rounded border border-outline-variant bg-surface-low pl-9 pr-3 text-sm text-ink placeholder:text-ink-subtle focus:border-primary-600 focus:outline-none"
      />
    </form>
  );
};

export const WorkspaceLayout = ({ area }: { area: WorkspaceArea }) => {
  const { user, areas } = useAuth();
  const ctx = useActiveContext(area === 'frontdesk' ? 'frontdesk' : 'owner');
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const config = AREA_CONFIG[area];
  const nav = area === 'owner' ? ownerNav(ctx.isOwner) : area === 'barber' ? barberNav : area === 'frontdesk' ? frontdeskNav : adminNav;

  useEffect(() => setOpen(false), [location.pathname]);

  const switchLinks: NavItem[] = [
    ...(area !== 'owner' && areas.includes('owner') ? [{ to: '/dashboard', label: 'Painel da barbearia', icon: icon(LayoutDashboard) }] : []),
    ...(area !== 'barber' && areas.includes('barber') ? [{ to: '/barbeiro', label: 'Minha agenda de barbeiro', icon: icon(Scissors) }] : []),
    ...(area !== 'frontdesk' && areas.includes('frontdesk') ? [{ to: '/atendimento', label: 'Atendimento', icon: icon(UserPlus) }] : []),
    ...(area !== 'admin' && areas.includes('admin') ? [{ to: '/admin', label: 'Admin da plataforma', icon: icon(ShieldCheck) }] : []),
  ];

  const roleLabel =
    area === 'admin' ? 'Admin' : area === 'barber' ? 'Barbeiro' : area === 'frontdesk' ? 'Atendimento' : ctx.isOwner ? 'Proprietário' : 'Gerente';

  const sidebar = (
    <div className="flex h-full flex-col pb-[30px] pt-8">
      <div className="flex items-start justify-between px-6 pb-6">
        <Logo to={config.home} tagline={area === 'owner' ? ctx.barbershop?.name ?? config.tagline : config.tagline} />
        <button type="button" className="rounded-lg p-2 text-ink-variant lg:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
          <X className="h-5 w-5" />
        </button>
      </div>
      {area === 'owner' || area === 'frontdesk' ? <ContextSwitcher area={area} /> : null}
      {config.cta && area === 'owner' ? (
        <div className="px-4 pb-8">
          <Link to={config.cta.to} className={buttonClass('primary', 'lg', 'w-full font-bold')}>
            {config.cta.label}
          </Link>
        </div>
      ) : null}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-2" aria-label="Painel">
        {nav.map((item) => (
          <div key={item.to} className="pl-2">
            <NavLink to={item.to} end={item.end} className={linkClass}>
              {item.icon}
              {item.label}
            </NavLink>
          </div>
        ))}
        {switchLinks.length > 0 ? (
          <div className="mt-4 border-t border-surface-low pt-4">
            {switchLinks.map((item) => (
              <div key={item.to} className="pl-2">
                <NavLink to={item.to} className={linkClass}>
                  {item.icon}
                  {item.label}
                </NavLink>
              </div>
            ))}
          </div>
        ) : null}
      </nav>
      {config.cta && area === 'frontdesk' ? (
        <div className="px-4 pb-6">
          <Link to={config.cta.to} className={buttonClass('primary', 'lg', 'w-full')}>
            <Plus className="h-4 w-4" aria-hidden="true" /> {config.cta.label}
          </Link>
        </div>
      ) : null}
      <div className="border-t border-surface-low px-6 pt-6">
        <div className="flex items-center gap-3">
          <Avatar name={user?.name} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-ink">{user?.name ?? 'Minha conta'}</p>
            <p className="truncate text-xs text-ink-variant">{roleLabel}</p>
          </div>
          <button type="button" onClick={logout} className="rounded-lg p-2 text-ink-variant hover:bg-danger-50 hover:text-danger-600" aria-label="Sair" title="Sair">
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="hidden w-64 shrink-0 bg-white shadow-sidebar lg:sticky lg:top-0 lg:block lg:h-screen">{sidebar}</aside>
      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label="Fechar menu" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-white shadow-elevated">{sidebar}</aside>
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 bg-surface/80 px-4 shadow-card backdrop-blur-[6px] sm:px-6">
          <button type="button" onClick={() => setOpen(true)} className="rounded-lg p-2 text-ink-variant lg:hidden" aria-label="Abrir menu">
            <Menu className="h-6 w-6" />
          </button>
          {area === 'frontdesk' ? <ClientSearch /> : <span className="truncate text-sm font-bold text-ink lg:hidden">{config.tagline}</span>}
          <div className="ml-auto flex items-center gap-2">
            <NotificationBell />
            <Link to="/conta" className="rounded-xl p-2 text-ink-variant hover:bg-surface-low" aria-label="Configurações da conta" title="Configurações da conta">
              <Settings className="h-5 w-5" />
            </Link>
            <Link to="/conta" className="ml-2" aria-label="Minha conta">
              <Avatar name={user?.name} size="sm" />
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-[1024px] px-4 py-8 sm:px-8" key={location.pathname}>
          <EmailVerificationBanner />
          {area === 'owner' ? <BillingBanner /> : null}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default WorkspaceLayout;
