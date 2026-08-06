import { Star, Users } from "lucide-react";

export interface Barber {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  rating?: number;
  isAnyBarber?: boolean;
}

interface BarberCardProps {
  barber: Barber;
  selected?: boolean;
  onSelect?: (barberId: string) => void;
}

const BarberCard = ({ barber, selected = false, onSelect }: BarberCardProps): JSX.Element => {
  const { id, name, description, avatar, rating, isAnyBarber } = barber;

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 transition-colors ${
        selected ? "ring-2 ring-blue-600" : "ring-slate-100"
      }`}
    >
      <div className="flex items-start justify-between">
        {isAnyBarber ? (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
        ) : (
          <div className="h-14 w-14 overflow-hidden rounded-xl">
            <img src={avatar} alt={name} className="h-full w-full object-cover" />
          </div>
        )}

        {isAnyBarber ? (
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-blue-600">
            Disponível
          </span>
        ) : (
          rating && (
            <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {rating.toFixed(1)}
            </span>
          )
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold text-slate-900">{name}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <button
        type="button"
        onClick={() => onSelect?.(id)}
        className={`mt-auto rounded-xl py-2.5 text-sm font-semibold transition-colors ${
          selected
            ? "bg-blue-600 text-white hover:bg-blue-700"
            : "bg-blue-50 text-blue-700 hover:bg-blue-100"
        }`}
      >
        {selected ? "Selecionado" : "Selecionar"}
      </button>
    </div>
  );
};

export default BarberCard;