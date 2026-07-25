import { Search } from "lucide-react";

const LandingHero = (): JSX.Element => {
  return (
    <section className="w-full bg-white px-6 py-16 lg:px-12 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        {/* Texto e busca */}
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold leading-[1.05] text-slate-900 lg:text-6xl">
            Agende seu corte
            <br />
            <span className="text-blue-600">em segundos</span>
          </h1>

          <p className="max-w-md text-base text-slate-500">
            A BarberOS conecta você aos melhores profissionais da cidade com a
            precisão que seu estilo exige.
          </p>

          <form className="flex w-full max-w-lg items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex flex-1 items-center gap-2 px-3">
              <Search className="h-5 w-5 shrink-0 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por barbearia ou localização..."
                className="w-full bg-transparent py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Agendar agora
            </button>
          </form>
        </div>

        {/* Grid de imagens */}
        <div className="grid grid-cols-2 gap-4">
          <div className="row-span-2 overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80"
              alt="Barbeiro cortando cabelo com máquina"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="overflow-hidden rounded-3xl">
            <img
              src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80"
              alt="Interior de barbearia com cadeiras"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-end rounded-3xl bg-blue-600 p-6 text-white">
            <span className="text-3xl font-extrabold">Diversos</span>
            <span className="text-xs font-medium uppercase tracking-wide text-blue-100">
              Agendamentos diários
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;