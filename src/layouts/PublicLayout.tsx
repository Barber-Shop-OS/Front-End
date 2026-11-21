// Páginas públicas e área do cliente — casca do Figma "Landing Page" (1:252): topbar #f9f9ff com logo, links
// (Início/Filiais/…) e, logado, notificações + configurações + avatar; rodapé centralizado em caixa-alta.
// Mobile-first: abaixo de md os links vão para um menu suspenso.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, LayoutDashboard, LogOut, Menu, Search, Settings, User, X } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { Avatar, buttonClass } from '@/components/ui';
import { homePathFor, useAuth, useLogout } from '@/features/auth/hooks';
import { openCookiePreferences } from '@/features/consent/consentStore';
import { NotificationBell } from '@/features/notifications/NotificationBell';
import { cn } from '@/utils/cn';

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-sm px-2 py-1 text-sm tracking-[-0.025em] transition', isActive ? 'font-semibold text-primary-600' : 'text-muted hover:text-ink');

const mobileLink = 'flex items-center gap-2 rounded-lg px-3 py-3 font-semibold text-ink hover:bg-surface-low';

const UserMenu = () => {
  const { user, areas } = useAuth();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const hasPanel = areas.some((area) => area !== 'customer');
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => ref.current && !ref.current.contains(event.target as Node) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-xl border-2 border-primary-100 bg-surface-high p-0.5"
        aria-label="Menu da conta"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar name={user?.name} size="sm" />
      </button>
      {open ? (
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl bg-white py-2 shadow-elevated" role="menu">
          <p className="truncate px-4 pb-2 text-xs text-ink-variant">{user?.email}</p>
          {hasPanel ? (
            <Link to={homePathFor(user)} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary-600 hover:bg-surface-low" role="menuitem">
              <LayoutDashboard className="h-4 w-4" /> Meu painel
            </Link>
          ) : null}
          <Link to="/cliente/agendamentos" className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface-low" role="menuitem">
            <CalendarDays className="h-4 w-4" /> Meus agendamentos
          </Link>
          <Link to="/conta" className="flex items-center gap-2 px-4 py-2 text-sm text-ink hover:bg-surface-low" role="menuitem">
            <User className="h-4 w-4" /> Perfil e notificações
          </Link>
          <button type="button" onClick={logout} className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-danger-600 hover:bg-danger-50" role="menuitem">
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      ) : null}
    </div>
  );
};

export const PublicLayout = () => {
  const { isAuthenticated, user, areas } = useAuth();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const home = isAuthenticated ? '/cliente' : '/';

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-[6px]">
        <div className="mx-auto flex h-[60px] w-full max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Logo to={home} />
            <nav className="hidden items-center gap-6 md:flex" aria-label="Principal">
              <NavLink to={home} end className={navLink}>
                Início
              </NavLink>
              <NavLink to="/filiais" className={navLink}>
                Filiais
              </NavLink>
              {isAuthenticated ? (
                <NavLink to="/cliente/agendamentos" className={navLink}>
                  Agendamentos
                </NavLink>
              ) : (
                <NavLink to="/para-barbearias" className={navLink}>
                  Para barbearias
                </NavLink>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {isAuthenticated ? (
              <>
                <NotificationBell />
                <Link to="/conta" className="hidden rounded-xl p-2 text-ink-variant hover:bg-surface-low sm:inline-flex" aria-label="Configurações da conta">
                  <Settings className="h-5 w-5" />
                </Link>
                <UserMenu />
              </>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link to="/login" className={buttonClass('ghost', 'sm')}>
                  Entrar
                </Link>
                <Link to="/cadastro-barbearia" className={buttonClass('primary', 'sm')}>
                  Cadastrar barbearia
                </Link>
              </div>
            )}
            <button type="button" className="rounded-lg p-2 text-ink md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open ? (
          <nav className="border-t border-surface-low bg-white px-4 py-3 shadow-soft md:hidden" aria-label="Menu móvel">
            <div className="flex flex-col gap-1">
              <Link to="/filiais" className={mobileLink}>
                <Search className="h-4 w-4" /> Encontrar barbearia
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cliente/agendamentos" className={mobileLink}>
                    <CalendarDays className="h-4 w-4" /> Meus agendamentos
                  </Link>
                  {areas.some((area) => area !== 'customer') ? (
                    <Link to={homePathFor(user)} className={cn(mobileLink, 'text-primary-600')}>
                      <LayoutDashboard className="h-4 w-4" /> Meu painel
                    </Link>
                  ) : null}
                  <Link to="/conta" className={mobileLink}>
                    <User className="h-4 w-4" /> Perfil e notificações
                  </Link>
                  <button type="button" onClick={logout} className={cn(mobileLink, 'text-left text-danger-600 hover:bg-danger-50')}>
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/para-barbearias" className={mobileLink}>
                    Para barbearias
                  </Link>
                  <Link to="/login" className={buttonClass('outline', 'md', 'mt-2')}>
                    Entrar
                  </Link>
                  <Link to="/cadastro-barbearia" className={buttonClass('primary', 'md')}>
                    Cadastrar minha barbearia
                  </Link>
                </>
              )}
            </div>
          </nav>
        ) : null}
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-surface-low bg-surface px-8 pb-8 pt-8">
        <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pb-4" aria-label="Rodapé">
          {[
            { to: '/para-barbearias', label: 'Sobre' },
            { to: '/termos', label: 'Termos de uso' },
            { to: '/privacidade', label: 'Privacidade' },
          ].map((item) => (
            <Link key={item.to} to={item.to} className="text-xs uppercase tracking-label text-slate-400 hover:text-ink-variant">
              {item.label}
            </Link>
          ))}
          <button type="button" onClick={openCookiePreferences} className="text-xs uppercase tracking-label text-slate-400 hover:text-ink-variant">
            Cookies
          </button>
          <a href={`mailto:${import.meta.env.VITE_SUPPORT_EMAIL || 'suporte@barberos.app'}`} className="text-xs uppercase tracking-label text-slate-400 hover:text-ink-variant">
            Suporte
          </a>
        </nav>
        <p className="text-center text-xs uppercase tracking-label text-slate-400">© {new Date().getFullYear()} BarberOS. A arte da precisão digital.</p>
      </footer>
    </div>
  );
};

export default PublicLayout;
