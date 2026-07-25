import { ReactNode } from "react";
import { Bell, Settings, Scissors } from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
}

const navLinks = [
  { label: "Início", href: "/" },
  { label: "Filiais", href: "/filiais" },
  { label: "Serviços", href: "/servicos" },
];

const MainLayout = ({ children }: MainLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen w-full bg-white">
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur lg:px-12">
        <div className="flex items-center gap-8">
          <a href="/" className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
            <Scissors className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
            BarberOS
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
            {navLinks.map((link, index) => (
              <a
                key={link.href}
                href={link.href}
                className={
                  index === 0
                    ? "text-blue-600"
                    : "transition-colors hover:text-slate-900"
                }
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Notificações"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Bell className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Configurações"
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100"
          >
            <Settings className="h-5 w-5" />
          </button>
          <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-800">
            <img
              src="https://i.pravatar.cc/72?img=12"
              alt="Avatar do usuário"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </header>

      <main className="w-full">{children}</main>
    </div>
  );
};

export default MainLayout;