import { ReactNode } from "react";
import { Bell, Settings, Compass, Scissors, User } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
}

const tabs = [
  { label: "Explorar", icon: Compass, active: true },
  { label: "Agenda", icon: Scissors, active: false },
  { label: "Perfil", icon: User, active: false },
];

const AppLayout = ({ children }: AppLayoutProps): JSX.Element => {
  return (
    <div className="flex min-h-screen w-full flex-col bg-slate-50">
      <header className="flex w-full items-center justify-between border-b border-slate-100 bg-white px-6 py-4 lg:px-12">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Scissors className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
            BarberOS
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            <a href="/" className="text-blue-600">Início</a>
            <a href="/filiais" className="transition-colors hover:text-slate-900">Filiais</a>
            <a href="/servicos" className="transition-colors hover:text-slate-900">Serviços</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button type="button" aria-label="Notificações" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
          </button>
          <button type="button" aria-label="Configurações" className="rounded-full p-2 text-slate-500 hover:bg-slate-100">
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800">
            <img src="https://i.pravatar.cc/72?img=12" alt="Avatar do usuário" className="h-full w-full object-cover" />
          </div>
        </div>
      </header>

      <main className="w-full flex-1">{children}</main>

      {/* Bottom tab bar - visível em telas menores */}
      <nav className="sticky bottom-0 z-40 flex w-full items-center justify-around border-t border-slate-100 bg-white py-3 md:hidden">
        {tabs.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1 text-xs font-semibold ${
              active ? "bg-blue-50 text-blue-600" : "text-slate-400"
            }`}
          >
            <Icon className="h-5 w-5" />
            {label.toUpperCase()}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;