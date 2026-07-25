import { CalendarCheck, TrendingUp } from "lucide-react";

const LandingHero = (): JSX.Element => {
  return (
    <section className="w-full bg-white px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-col gap-6">
          <span className="w-fit rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-blue-600">
            Feito para barbearias
          </span>

          <h1 className="text-5xl font-extrabold leading-[1.05] text-slate-900 lg:text-6xl">
            Gerencie sua barbearia
            <br />
            <span className="text-blue-600">sem complicação</span>
          </h1>

          <p className="max-w-md text-base text-slate-500">
            O BarberOS é o sistema completo pra pequenas barbearias controlarem
            agenda, clientes e financeiro em um só lugar — e ainda oferecerem
            agendamento online pros seus clientes.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="button"
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Teste grátis por 14 dias
            </button>
            <button
              type="button"
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Falar com um consultor
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Sem cartão de crédito. Cancele quando quiser.
          </p>
        </div>

        {/* Preview do produto */}
        <div className="grid grid-cols-2 gap-4">
          <div className="row-span-2 overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
              alt="Dono de barbearia usando sistema de gestão"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-between rounded-3xl bg-slate-900 p-5 text-white">
            <CalendarCheck className="h-6 w-6 text-blue-400" />
            <div>
              <p className="text-2xl font-extrabold">+42%</p>
              <p className="text-xs text-slate-300">agendamentos em 3 meses</p>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-3xl bg-blue-600 p-5 text-white">
            <TrendingUp className="h-6 w-6 text-blue-100" />
            <div>
              <p className="text-2xl font-extrabold">1.200+</p>
              <p className="text-xs text-blue-100">barbearias ativas</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;