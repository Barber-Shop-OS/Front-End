export interface Artisan {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface ArtisansListProps {
  artisans: Artisan[];
  quote?: string;
  onSelectArtisan?: (artisanId: string) => void;
}

const ArtisansList = ({
  artisans,
  quote,
  onSelectArtisan,
}: ArtisansListProps): JSX.Element => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-extrabold text-slate-900">Artesãos</h2>

      <div className="flex flex-col gap-3">
        {artisans.map((artisan) => (
          <button
            key={artisan.id}
            type="button"
            onClick={() => onSelectArtisan?.(artisan.id)}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 text-left transition-colors hover:bg-slate-100"
          >
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl">
              <img
                src={artisan.avatar}
                alt={artisan.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900">{artisan.name}</p>
              <p className="text-xs text-slate-500">{artisan.role}</p>
            </div>
          </button>
        ))}
      </div>

      {quote && (
        <blockquote className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm italic text-slate-500">
          "{quote}"
        </blockquote>
      )}
    </div>
  );
};

export default ArtisansList;