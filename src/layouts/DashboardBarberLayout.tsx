import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import {
  LayoutDashboard,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  Scissors,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, active: true, to: "/dashboard" },
  { label: "Agendamentos", icon: Calendar, active: false, to: "/agendamentos" },
  { label: "Clientes", icon: Users, active: false, to: "/clientes" },
  { label: "Rendimentos", icon: TrendingUp, active: false, to: "/rendimentos" },
];

const bottomItems = [
  {
    label: "Configurações",
    icon: Settings,
    active: false,
    to: "/configuracoes",
  },
  { label: "Sair", icon: LogOut, active: false, to: "/logout" },
];

const SidebarNav = ({ items }: { items: typeof navItems }): JSX.Element => (
  <div className="flex flex-1 flex-col items-center gap-2.5 pr-4">
    {items.map(({ label, icon: Icon, active, to }) => (
      <Link
        key={label}
        to={to}
        className={`flex w-52 items-center justify-start rounded-tl-lg rounded-bl-lg px-4 py-3 ${
          active ? "bg-white" : ""
        }`}
      >
        <div className="flex flex-col items-start justify-start">
          <Icon
            className={`h-5 w-5 ${active ? "text-blue-700" : "text-slate-500"}`}
            strokeWidth={active ? 2.5 : 1.5}
          />
        </div>
        <div className="flex flex-col items-start justify-start pl-3">
          <span
            className={`text-base leading-6 ${
              active ? "font-bold text-blue-700" : "font-normal text-slate-500"
            }`}
          >
            {label}
          </span>
        </div>
      </Link>
    ))}
  </div>
);

const BottomNav = ({ items }: { items: typeof bottomItems }): JSX.Element => (
  <div className="flex flex-col items-start justify-start gap-2.5 pl-1.5 pr-5 pt-6 pb-[1.20px]">
    {items.map(({ label, icon: Icon, active, to }) => (
      <Link
        key={label}
        to={to}
        className={`flex w-52 items-center justify-start rounded-tl-lg rounded-bl-lg px-4 py-3 ${
          active ? "bg-white" : ""
        }`}
      >
        <div className="flex flex-col items-start justify-start">
          <Icon
            className={`h-5 w-5 ${active ? "text-blue-700" : "text-slate-500"}`}
            strokeWidth={active ? 2.5 : 1.5}
          />
        </div>
        <div className="flex flex-col items-start justify-start pl-3">
          <span
            className={`text-base leading-6 ${
              active ? "font-bold text-blue-700" : "font-normal text-slate-500"
            }`}
          >
            {label}
          </span>
        </div>
      </Link>
    ))}
  </div>
);

const DashboardBarberLayout = ({
  children,
}: PropsWithChildren): JSX.Element => {
  return (
    <div className="relative flex min-h-screen w-full justify-start bg-slate-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-30 flex h-full w-64 flex-col justify-between bg-indigo-50 pl-4 py-8">
        {/* Logo */}
        <div className="flex flex-col items-start justify-start self-stretch pb-10">
          <div className="flex items-center justify-start gap-2 pl-4 pr-6">
            <Scissors className="h-5 w-5 text-blue-700" strokeWidth={2.5} />
            <span className="self-stretch text-lg font-black uppercase leading-7 text-blue-700">
              BarberOS
            </span>
          </div>
        </div>

        {/* Navigation */}
        <SidebarNav items={navItems} />

        {/* Bottom items */}
        <BottomNav items={bottomItems} />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-start justify-start self-stretch pl-64">
        {/* Top bar */}
        <div className="fixed left-64 right-0 top-0 z-20 flex h-20 items-center justify-between bg-slate-50/80 px-8 backdrop-blur-[6px]">
          <div className="flex flex-col items-start justify-start">
            <h1 className="text-xl font-bold leading-7 text-blue-700">
              Dashboard
            </h1>
          </div>

          <div className="flex items-center justify-start">
            <button
              type="button"
              aria-label="Notificações"
              className="flex flex-col items-center justify-center rounded-sm p-2"
            >
              <Bell className="h-5 w-4 text-slate-500" />
            </button>

            <div className="flex flex-col items-start justify-start pl-4">
              <button
                type="button"
                className="flex items-center justify-start gap-2 rounded-sm p-2"
              >
                <img
                  className="relative h-8 w-8 rounded-xl"
                  src="https://placehold.co/32x32"
                  alt="Avatar do usuário"
                />
                <div className="flex flex-col items-center justify-center">
                  <div className="h-5 w-5 bg-slate-500" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex w-full max-w-[1280px] flex-col items-start justify-start gap-8 px-10 pt-32 pb-10">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardBarberLayout;
