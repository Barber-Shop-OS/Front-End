import BarbershopCard, { Barbershop } from "@/features/barbershops/components/BarbershopCard";
import MapPromoCard from "@/features/barbershops/components/MapPromoCard";

const results: Barbershop[] = [
  {
    id: "1",
    name: "The Razor House",
    neighborhood: "Jardins",
    distanceKm: 0.8,
    rating: 4.9,
    badge: "PRÓXIMO",
    image:
      "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    name: "Blade & Coal",
    neighborhood: "Pinheiros",
    distanceKm: 1.4,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    name: "Stark Premium",
    neighborhood: "Vila Olímpia",
    distanceKm: 2.1,
    rating: 5.0,
    badge: "DESTAQUE",
    image:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    name: "Antiga Barbearia",
    neighborhood: "Moema",
    distanceKm: 3.5,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=800&q=80",
  },
];

const ResultsGrid = (): JSX.Element => {
  return (
    <section className="px-6 py-8 lg:px-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">São Paulo</h2>
          <p className="text-sm text-slate-500">
            {results.length * 32} barbearias encontradas
          </p>
        </div>
        <a href="/mapa" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Ver no mapa
        </a>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {results.map((shop) => (
          <BarbershopCard key={shop.id} barbershop={shop} />
        ))}

        {/* Card do mapa ocupa o espaço restante, alinhado ao grid */}
        <div className="sm:col-span-2 xl:col-span-2">
          <MapPromoCard />
        </div>
      </div>
    </section>
  );
};

export default ResultsGrid;