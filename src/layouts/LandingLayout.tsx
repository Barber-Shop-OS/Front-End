import { ReactNode } from "react";
import { Scissors } from "lucide-react";
import { Link } from "react-router-dom";

interface LandingLayoutProps {
  children: ReactNode;
}

const LandingLayout = ({ children }: LandingLayoutProps): JSX.Element => {
  return (
    <div className="min-h-screen w-full bg-white">
      <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-slate-100 bg-white/90 px-6 py-4 backdrop-blur lg:px-12">
        <Link
          to="/"
          className="flex items-center gap-2 text-lg font-extrabold text-slate-900"
        >
          <Scissors className="h-5 w-5 text-blue-600" strokeWidth={2.5} />
          BarberOS
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-500 md:flex">
          <a
            href="#beneficios"
            className="transition-colors hover:text-slate-900"
          >
            Benefícios
          </a>
          <a href="#planos" className="transition-colors hover:text-slate-900">
            Planos
          </a>
          <a
            href="#depoimentos"
            className="transition-colors hover:text-slate-900"
          >
            Depoimentos
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden text-sm font-semibold text-slate-600 transition-colors hover:text-slate-900 sm:block"
          >
            Entrar
          </Link>
          <Link
            to="/signup"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Teste grátis
          </Link>
        </div>
      </header>

      <main className="w-full">{children}</main>
    </div>
  );
};

export default LandingLayout;
