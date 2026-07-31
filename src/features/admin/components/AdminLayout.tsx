import type { PropsWithChildren, ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  Bell,
  CircleDollarSign,
  ClipboardList,
  Home,
  HelpCircle,
  LogOut,
  Scissors,
  Settings,
  Store,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Financeiro", to: "/dashboard/financeiro", icon: CircleDollarSign },
  { label: "Filiais", to: "/dashboard/filiais", icon: Store },
  { label: "Barbeiros", to: "/dashboard/barbeiros", icon: Scissors },
  { label: "Servicos", to: "/dashboard/servicos", icon: ClipboardList },
  { label: "Clientes", to: "/dashboard/clientes", icon: Users },
];

const SidebarItem = ({ label, to, icon: Icon }: (typeof navItems)[number]) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
        isActive ? "bg-white text-[#0b4bd8] shadow-sm" : "text-slate-600 hover:bg-white/70"
      }`
    }
  >
    <Icon className="h-4 w-4" />
    {label}
  </NavLink>
);

interface AdminLayoutProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  action?: ReactNode;
  topLabel?: string;
}

const AdminLayout = ({
  children,
  title,
  subtitle,
  action,
  topLabel,
}: AdminLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen bg-[#f7f8fe] text-slate-900">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r border-slate-100 bg-[#eef2ff] px-4 py-5 lg:flex">
          <div className="mb-8">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-[#0b4bd8] p-2 text-white">
                <Scissors className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-black text-[#0b4bd8]">BarberOS</div>
                <div className="text-sm text-slate-500">Gestao de Precisao</div>
              </div>
            </div>
          </div>

          <Link
            to="/dashboard/agenda-da-filial"
            className="mb-6 rounded-xl bg-[#0b4bd8] px-4 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/20"
          >
            + Novo Agendamento
          </Link>

          <nav className="space-y-2">
            {navItems.map((item) => (
              <SidebarItem key={item.label} {...item} />
            ))}
          </nav>

          <div className="mt-auto space-y-2 border-t border-slate-200 pt-6">
            <Link
              to="/dashboard/configuracoes"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-white/70"
            >
              <Settings className="h-4 w-4" />
              Configuracoes
            </Link>
            <Link
              to="/logout"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-600 hover:bg-white/70"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          </div>
        </aside>

        <main className="flex-1">
          <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white/80 px-4 backdrop-blur lg:px-8">
            <div className="text-sm font-semibold text-[#0b4bd8]">
              {topLabel ?? title ?? "Dashboard"}
            </div>
            <div className="flex items-center gap-3">
              <button type="button" className="text-slate-500">
                <Bell className="h-5 w-5" />
              </button>
              <button type="button" className="text-slate-500">
                <HelpCircle className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-900" />
            </div>
          </header>

          <div className="px-4 py-8 lg:px-8">
            {(title || subtitle || action) && (
              <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
                <div>
                  {title ? (
                    <h1 className="text-4xl font-black tracking-tight text-slate-900">
                      {title}
                    </h1>
                  ) : null}
                  {subtitle ? (
                    <p className="mt-2 max-w-3xl text-lg text-slate-600">
                      {subtitle}
                    </p>
                  ) : null}
                </div>
                {action}
              </div>
            )}
            <div className="max-w-[1280px]">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
