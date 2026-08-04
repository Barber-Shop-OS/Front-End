import { ReactNode } from "react";
import {
  Bell,
  Settings,
  Compass,
  Scissors,
  CalendarDays,
  User,
} from "lucide-react";
import { Link, NavLink } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const tabs = [
  { label: "Explorar", icon: Compass, to: "/filiais" },
  { label: "Agenda", icon: CalendarDays, to: "/agendar" },
  { label: "Perfil", icon: User, to: "/signup" },
];

const AppLayout = ({ children }: AppLayoutProps): JSX.Element => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
<header className="flex w-full items-center justify-between border-b border-slate-100 bg-white px-6 py-4 lg:px-12">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Scissors className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
            BarberOS
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${isActive ? "text-blue-600" : ""}`
              }
            >
              Início
            </NavLink>
            <NavLink
              to="/filiais"
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${isActive ? "text-blue-600" : ""}`
              }
            >
              Filiais
            </NavLink>
            <NavLink
              to="/assinatura"
              className={({ isActive }) =>
                `transition-colors hover:text-slate-900 ${isActive ? "text-blue-600" : ""}`
              }
            >
              Planos
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Notificações" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Configurações" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Settings className="h-5 w-5" />
          </button>
          <Link
            to="/login"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="w-full flex-1">{children}</main>

{/* Bottom tab bar - visível em telas menores */}
      <nav className="sticky bottom-0 z-40 flex w-full items-center justify-around border-t border-slate-100 bg-white py-3 md:hidden">
        {tabs.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-4 py-1 text-xs font-semibold ${
                isActive ? "bg-blue-50 text-blue-600" : "text-slate-400"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label.toUpperCase()}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;