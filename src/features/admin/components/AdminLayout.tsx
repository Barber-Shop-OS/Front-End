import type { PropsWithChildren, ReactNode } from "react";
import { CircleDollarSign, ClipboardList, Home, LogOut, Scissors, Settings, Store, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { WorkspaceShell } from "@/components/layout/WorkspaceShell";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { TopBar } from "@/components/navigation/TopBar";

const navItems = [
  { label: "Dashboard", to: "/dashboard", icon: Home },
  { label: "Financeiro", to: "/dashboard/financeiro", icon: CircleDollarSign },
  { label: "Filiais", to: "/dashboard/filiais", icon: Store },
  { label: "Barbeiros", to: "/dashboard/barbeiros", icon: Scissors },
  { label: "Servicos", to: "/dashboard/servicos", icon: ClipboardList },
  { label: "Clientes", to: "/dashboard/clientes", icon: Users },
];

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
    <WorkspaceShell
      sidebar={
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
            to="/dashboard/agendamentos/novo"
            className="mb-6 rounded-xl bg-[#0b4bd8] px-4 py-3 text-center font-semibold text-white shadow-lg shadow-blue-600/20"
          >
            + Novo Agendamento
          </Link>

          <SidebarNav items={navItems} />

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
      }
      topbar={<TopBar label={topLabel ?? title ?? "Dashboard"} />}
      title={title}
      subtitle={subtitle}
      action={action}
    >
      {children}
    </WorkspaceShell>
  );
};

export default AdminLayout;

