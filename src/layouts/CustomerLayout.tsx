import type { PropsWithChildren } from "react";
import { Link, NavLink } from "react-router-dom";
import { Bell, Home, Menu, Scissors, Settings, User } from "lucide-react";

import userProfile from "@/assets/UserNavbar/user-profile.png";
import { CiSearch } from "react-icons/ci";

const navItems = [
  { label: "Início", to: "/cliente", icon: Home },
  { label: "Meus agendamentos", to: "/cliente/agendamentos", icon: Scissors },
  { label: "Meu perfil", to: "/cliente/perfil", icon: User },
];

const CustomerHeader = (): JSX.Element => (
  <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white/90 px-4 shadow-[0_1px_0_rgba(15,23,42,0.03)] backdrop-blur md:px-6">
    <div className="flex items-center gap-8">
      <Link to="/cliente" className="text-2xl font-black text-[#0b4bd8]">
        BarberOS
      </Link>
      <div className="hidden w-[620px] items-center gap-3 rounded-xl bg-[#f0f3ff] px-4 py-2 text-slate-500 md:flex">
        <CiSearch className="h-4 w-4" />
        <span className="text-sm">Buscar barbearias ou serviços...</span>
      </div>
    </div>

    <div className="flex items-center gap-4">
      <button
        type="button"
        aria-label="Notificações"
        className="text-slate-500"
      >
        <Bell className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Configurações"
        className="text-slate-500"
      >
        <Settings className="h-5 w-5" />
      </button>
      <img
        src={userProfile}
        alt="Avatar do usuário"
        className="h-10 w-10 rounded-xl object-cover ring-2 ring-white"
      />
    </div>
  </header>
);

const CustomerSidebarNav = (): JSX.Element => (
  <aside className="hidden w-64 border-r border-slate-100 bg-white px-4 py-6 xl:block">
    <nav className="space-y-2">
      {navItems.map(({ label, to, icon: Icon }) => (
        <NavLink
          key={label}
          to={to}
          end={to === "/cliente"}
          className={({ isActive }) =>
            `flex items-center gap-3 border-r-4 px-4 py-3 transition-colors ${
              isActive
                ? "border-[#0b4bd8] bg-[#eef3ff] text-[#0b4bd8]"
                : "border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            }`
          }
        >
          <Icon className="h-5 w-5" />
          <span className="font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  </aside>
);

const CustomerBottomNav = (): JSX.Element => (
  <nav className="sticky bottom-0 z-30 grid grid-cols-3 border-t border-slate-100 bg-white/95 px-2 py-3 backdrop-blur xl:hidden">
    {navItems.map(({ label, to, icon: Icon }) => (
      <NavLink
        key={label}
        to={to}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs font-semibold ${
            isActive ? "bg-[#eef3ff] text-[#0b4bd8]" : "text-slate-400"
          }`
        }
      >
        <Icon className="h-5 w-5" />
        <span>{label.toUpperCase()}</span>
      </NavLink>
    ))}
  </nav>
);

const QuickActionsButton = (): JSX.Element => (
  <button
    type="button"
    aria-label="Ações rápidas"
    className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0b4bd8] text-white shadow-lg shadow-blue-600/30 xl:hidden"
  >
    <Menu className="h-6 w-6" />
  </button>
);

const CustomerLayout = ({ children }: PropsWithChildren): JSX.Element => {
  return (
    <div className="min-h-screen bg-[#f6f7fb] text-slate-900">
      <CustomerHeader />

      <div className="mx-auto flex min-h-[calc(100vh-4rem)] gap-0">
        <CustomerSidebarNav />
        <main className="flex-1 px-4 py-6 md:px-6 xl:px-8">{children}</main>
      </div>

      <CustomerBottomNav />
      <QuickActionsButton />
    </div>
  );
};

export default CustomerLayout;
