import { Heart, MapPin, Star } from "lucide-react";

export interface Barbershop {
  id: string;
  name: string;
  neighborhood: string;
  distanceKm: number;
  rating: number;
  image: string;
  badge?: "PRÓXIMO" | "DESTAQUE";
}

interface BarbershopCardProps {
  barbershop: Barbershop;
}

const BarbershopCard = ({ barbershop }: BarbershopCardProps): JSX.Element => {
  const { name, neighborhood, distanceKm, rating, image, badge } = barbershop;

  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div className="relative h-44 w-full">
        <img src={image} alt={name} className="h-full w-full object-cover" />

        {badge === "DESTAQUE" && (
          <span className="absolute left-3 top-3 rounded-md bg-blue-600 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Destaque
          </span>
        )}

        <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-800 shadow">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {rating.toFixed(1)}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900">{name}</h3>
          {badge === "PRÓXIMO" && (
            <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-bold text-blue-600">
              Próximo
            </span>
          )}
        </div>

        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
          <MapPin className="h-4 w-4" />
          {neighborhood} • {distanceKm.toFixed(1)} km
        </p>

        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Ver serviços
          </button>
          <button
            type="button"
            aria-label="Favoritar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200"
          >
            <Heart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default BarbershopCard;