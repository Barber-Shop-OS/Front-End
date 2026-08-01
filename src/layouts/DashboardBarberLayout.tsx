import type { PropsWithChildren } from "react";
import { Calendar, LayoutDashboard, LogOut, Scissors, Settings, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { TopBar } from "@/components/navigation/TopBar";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Agendamentos", icon: Calendar, to: "/agendamentos" },
  { label: "Clientes", icon: Users, to: "/clientes" },
  { label: "Rendimentos", icon: TrendingUp, to: "/rendimentos" },
];

const DashboardBarberLayout = ({
  children,
}: PropsWithChildren): JSX.Element => {
  return (
    <WorkspaceShell
      sidebar={
        <aside className="hidden w-64 flex-col justify-between bg-indigo-50 px-4 py-8 lg:flex">
          <div>
            <div className="mb-10 flex items-center gap-2 px-4">
              <Scissors className="h-5 w-5 text-blue-700" strokeWidth={2.5} />
              <span className="text-lg font-black uppercase leading-7 text-blue-700">
                BarberOS
              </span>
            </div>
            <SidebarNav
              items={navItems}
              inactiveClassName="text-slate-500 hover:bg-white/70"
              activeClassName="bg-white text-blue-700 shadow-sm"
              iconActiveClassName="text-blue-700"
              iconInactiveClassName="text-slate-500"
              labelActiveClassName="font-bold text-blue-700"
              labelInactiveClassName="font-medium text-slate-500"
              itemClassName="flex w-52 items-center gap-3 rounded-r-none rounded-l-xl px-4 py-3 text-sm transition"
            />
          </div>

          <div className="space-y-2 border-t border-slate-200 pt-6">
            <Link
              to="/configuracoes"
              className="flex items-center gap-3 rounded-r-none rounded-l-xl px-4 py-3 text-sm text-slate-600 hover:bg-white/70"
            >
              <Settings className="h-4 w-4" />
              Configurações
            </Link>
            <Link
              to="/logout"
              className="flex items-center gap-3 rounded-r-none rounded-l-xl px-4 py-3 text-sm text-slate-600 hover:bg-white/70"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Link>
          </div>
        </aside>
      }
      topbar={<TopBar label="Dashboard" />}
      contentClassName="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-10 py-8 pt-12"
    >
      {children}
    </WorkspaceShell>
  );
};

export default DashboardBarberLayout;

