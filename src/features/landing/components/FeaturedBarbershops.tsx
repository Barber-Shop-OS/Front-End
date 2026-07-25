import { ArrowRight, MapPin, Star } from "lucide-react";

interface Barbershop {
  name: string;
  location: string;
  rating: number;
  image: string;
}

const barbershops: Barbershop[] = [
  {
    name: "Old School Barber Co.",
    location: "Jardins, São Paulo",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1521490727435-5a1cf3a2af9f?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Corte & Estilo Premium",
    location: "Centro, Curitiba",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Blade Master Studio",
    location: "Savassi, BH",
    rating: 5.0,
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
  },
];

const FeaturedBarbershops = (): JSX.Element => {
  return (
    <section className="w-full bg-slate-50 px-6 py-16 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Seleção Barber OS
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-slate-900">
              Barbearias em destaque
            </h2>
          </div>
          <a
            href="/filiais"
            className="flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver todas
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {barbershops.map((shop) => (
            <article
              key={shop.name}
              className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100"
            >
              <div className="relative h-52 w-full">
                <img
                  src={shop.image}
                  alt={shop.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {shop.rating.toFixed(1)}
                </span>
              </div>

              <div className="p-5">
                <h3 className="text-lg font-bold text-slate-900">{shop.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <MapPin className="h-4 w-4" />
                  {shop.location}
                </p>

                <button
                  type="button"
                  className="mt-4 w-full rounded-xl bg-blue-50 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                >
                  Agendar agora
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedBarbershops;