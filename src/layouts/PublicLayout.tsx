// FE-07: layout das páginas públicas e da área do cliente (mobile-first).
import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { CalendarDays, LogOut, Menu, Search, User, X } from 'lucide-react';

import { Logo } from '@/components/Logo';
import { buttonClass } from '@/components/ui';
import { homePathFor, useAuth, useLogout } from '@/features/auth/hooks';
import { cn } from '@/utils/cn';

const navLink = ({ isActive }: { isActive: boolean }) =>
  cn('rounded-lg px-3 py-2 text-sm font-semibold transition', isActive ? 'text-primary-700' : 'text-slate-600 hover:text-slate-900');

export const PublicLayout = () => {
  const { isAuthenticated, user, areas } = useAuth();
  const logout = useLogout();
  const [open, setOpen] = useState(false);
  const panelHome = homePathFor(user);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            <NavLink to="/filiais" className={navLink}>
              Encontrar barbearia
            </NavLink>
            <NavLink to="/para-barbearias" className={navLink}>
              Para barbearias
            </NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/cliente/agendamentos" className={navLink}>
                  Meus agendamentos
                </NavLink>
                {areas.includes('owner') || areas.includes('barber') || areas.includes('admin') ? (
                  <Link to={panelHome} className={buttonClass('secondary', 'sm', 'ml-2')}>
                    Meu painel
                  </Link>
                ) : null}
                <Link to="/conta" className={buttonClass('ghost', 'sm')} aria-label="Minha conta">
                  <User className="h-4 w-4" /> {user?.name.split(' ')[0]}
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClass('ghost', 'sm', 'ml-2')}>
                  Entrar
                </Link>
                <Link to="/cadastro-barbearia" className={buttonClass('primary', 'sm')}>
                  Cadastrar barbearia
                </Link>
              </>
            )}
          </nav>
          <button type="button" className="rounded-lg p-2 text-slate-700 md:hidden" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Fechar menu' : 'Abrir menu'} aria-expanded={open}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {open ? (
          <nav className="border-t border-slate-100 bg-white px-4 py-3 md:hidden" aria-label="Menu móvel">
            <div className="flex flex-col gap-1" onClick={() => setOpen(false)} role="presentation">
              <Link to="/filiais" className="flex items-center gap-2 rounded-lg px-3 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                <Search className="h-4 w-4" /> Encontrar barbearia
              </Link>
              <Link to="/para-barbearias" className="rounded-lg px-3 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                Para barbearias
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/cliente/agendamentos" className="flex items-center gap-2 rounded-lg px-3 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                    <CalendarDays className="h-4 w-4" /> Meus agendamentos
                  </Link>
                  {areas.includes('owner') || areas.includes('barber') || areas.includes('admin') ? (
                    <Link to={panelHome} className="rounded-lg px-3 py-3 font-semibold text-primary-700 hover:bg-slate-50">
                      Meu painel
                    </Link>
                  ) : null}
                  <Link to="/conta" className="flex items-center gap-2 rounded-lg px-3 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                    <User className="h-4 w-4" /> Minha conta
                  </Link>
                  <button type="button" onClick={logout} className="flex items-center gap-2 rounded-lg px-3 py-3 text-left font-semibold text-danger-700 hover:bg-danger-50">
                    <LogOut className="h-4 w-4" /> Sair
                  </button>
                </>
              ) : (
                <>
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
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <span>© {new Date().getFullYear()} BarberOS</span>
          </div>
          <nav className="flex flex-wrap gap-4" aria-label="Rodapé">
            <Link to="/termos" className="hover:text-slate-900">
              Termos de uso
            </Link>
            <Link to="/privacidade" className="hover:text-slate-900">
              Privacidade
            </Link>
            <a href="mailto:privacidade@barberos.app" className="hover:text-slate-900">
              Encarregado (LGPD)
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
