import { MapPin, Star } from "lucide-react";

interface BranchHeroProps {
  badge: string;
  name: string;
  address: string;
  rating: number;
  reviewsCount: number;
  coverImage: string;
}

const BranchHero = ({
  badge,
  name,
  address,
  rating,
  reviewsCount,
  coverImage,
}: BranchHeroProps): JSX.Element => {
  return (
    <div className="relative h-96 w-full overflow-hidden rounded-3xl">
      <img
        src={coverImage}
        alt={`Ambiente da unidade ${name}`}
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <div className="absolute bottom-0 left-0 flex flex-col gap-2 p-8 text-white">
        <span className="text-xs font-bold uppercase tracking-widest text-white/80">
          {badge}
        </span>
        <h1 className="text-5xl font-extrabold">{name}</h1>
        <div className="flex items-center gap-4 text-sm text-white/90">
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {address}
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            {rating.toFixed(1)} ({reviewsCount.toLocaleString("pt-BR")} avaliações)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BranchHero;