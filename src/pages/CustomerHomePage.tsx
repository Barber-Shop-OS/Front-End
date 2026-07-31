import { CalendarDays, MapPin, Scissors, Star } from "lucide-react";
import { Link } from "react-router-dom";

import CustomerLayout from "@/layouts/CustomerLayout";

const favorites = [
  {
    name: "Vintage Club",
    description: "Última visita: 12 dias atrás",
    image:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=900&q=80",
    featured: true,
  },
  {
    name: "BarberOS Matriz",
    description: "Próxima reserva em 1 dia",
    image:
      "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "The Cut Station",
    description: "Visitada 8 vezes",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
];

const nearby = [
  {
    name: "Urban Barber Shop",
    distance: "0.8 km • Av. Paulista, 102",
    price: "R$ 65 - 120",
    rating: "4.9",
  },
  {
    name: "The Royal Blade",
    distance: "1.5 km • Rua Oscar Freire, 890",
    price: "R$ 90 - 200",
    rating: "4.7",
  },
];

const CustomerHomePage = (): JSX.Element => {
  return (
    <CustomerLayout>
      <section className="space-y-10">
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="space-y-8">
            <div>
              <p className="text-4xl font-bold tracking-tight text-slate-900">
                Olá, Arthur.
              </p>
              <p className="mt-2 text-lg text-slate-600">
                O que vamos alinhar hoje?
              </p>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    Minhas Próximas Reservas
                  </h2>
                  <p className="text-sm text-slate-500">
                    Acompanhe seus horários agendados
                  </p>
                </div>
                <Link
                  to="/cliente/agendamentos"
                  className="text-sm font-bold uppercase tracking-[0.2em] text-[#0b4bd8]"
                >
                  Ver todas
                </Link>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0b4bd8]">
                    Amanhã, 14:30
                  </p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">
                        Corte Degradê + Barba
                      </h3>
                      <div className="mt-4 flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=200&q=80"
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-semibold">
                            Barbearia Vintage Club
                          </p>
                          <p className="text-sm text-slate-500">
                            Barbeiro: Rodrigo Silva
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#eef3ff] p-3 text-[#0b4bd8]">
                      <Scissors className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <Link
                      to="/cliente/agendamentos/1"
                      className="flex-1 rounded-xl bg-[#0b4bd8] px-4 py-3 text-center font-semibold text-white"
                    >
                      Reagendar
                    </Link>
                    <button
                      type="button"
                      className="rounded-xl bg-[#eef3ff] px-4 py-3 text-[#0b4bd8]"
                    >
                      <MapPin className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-400">
                    24 Nov, 10:00
                  </p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold">Manutenção de Barba</h3>
                      <div className="mt-4 flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80"
                          alt=""
                          className="h-10 w-10 rounded-xl object-cover"
                        />
                        <div>
                          <p className="font-semibold">BarberOS Premium</p>
                          <p className="text-sm text-slate-500">
                            Barbeiro: Carlos Mendes
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-[#eef3ff] p-3 text-slate-400">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <Link
                      to="/cliente/agendamentos"
                      className="block rounded-xl bg-[#eef3ff] px-4 py-3 text-center font-semibold text-slate-700"
                    >
                      Detalhes
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold">Frequentes</h2>
              <div className="mt-5 grid gap-4 xl:grid-cols-3">
                {favorites.map((item) => (
                  <article
                    key={item.name}
                    className="group overflow-hidden rounded-2xl bg-slate-900 text-white shadow-lg"
                  >
                    <div className="relative h-56">
                      <img
                        src={item.image}
                        alt=""
                        className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    </div>
                    <div className="relative -mt-20 p-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <h3 className="text-xl font-bold">{item.name}</h3>
                          <p className="text-sm text-white/70">
                            {item.description}
                          </p>
                        </div>
                        {item.featured && (
                          <span className="rounded-full bg-[#0b4bd8] px-3 py-1 text-xs font-bold uppercase">
                            Favorita
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Próximas de Você</h2>
                  <p className="text-sm text-slate-500">
                    Descubra novos talentos na sua região
                  </p>
                </div>
                <div className="flex gap-2">
                  {["Todas", "Até 2km", "Corte Moderno", "Navalha"].map(
                    (chip, index) => (
                      <button
                        key={chip}
                        type="button"
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                          index === 0
                            ? "bg-[#0b4bd8] text-white"
                            : "bg-white text-slate-500"
                        }`}
                      >
                        {chip}
                      </button>
                    ),
                  )}
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                {nearby.map((shop) => (
                  <article
                    key={shop.name}
                    className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[220px_1fr]"
                  >
                    <div className="h-48 overflow-hidden rounded-2xl md:h-full">
                      <img
                        src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=900&q=80"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-bold">{shop.name}</h3>
                            <p className="mt-2 text-sm text-slate-500">
                              {shop.distance}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 text-sm font-bold text-[#0b4bd8]">
                            <Star className="h-4 w-4 fill-current" />
                            {shop.rating}
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-bold uppercase">
                            Corte
                          </span>
                          <span className="rounded-md bg-[#eef3ff] px-2 py-1 text-xs font-bold uppercase">
                            Barba
                          </span>
                        </div>
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xl font-bold">{shop.price}</span>
                        <Link
                          to="/cliente/agendamentos/1"
                          className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white"
                        >
                          Reservar
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-[#eef3ff] p-5">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#0b4bd8]">
                Nível Bronze
              </p>
              <div className="mt-4 h-2 rounded-full bg-[#dbe4ff]">
                <div className="h-2 w-2/3 rounded-full bg-[#0b4bd8]" />
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Faltam 3 cortes para você se tornar um cliente Silver e ganhar
                benefícios.
              </p>
            </div>

            <div className="rounded-3xl bg-[radial-gradient(circle_at_top_right,_#edf2ff_0%,_#dbe6ff_100%)] p-6">
              <h3 className="text-3xl font-black text-[#0b4bd8]">
                Espaço para mais um?
              </h3>
              <p className="mt-3 max-w-xs text-slate-600">
                Mantenha seu estilo impecável agendando sua próxima visita agora
                mesmo.
              </p>
              <button
                type="button"
                className="mt-6 rounded-xl bg-[#0b4bd8] px-6 py-3 font-bold text-white"
              >
                Novo agendamento
              </button>
            </div>
          </aside>
        </div>
      </section>
    </CustomerLayout>
  );
};

export default CustomerHomePage;
