import { SlidersHorizontal, Search } from "lucide-react";

interface FilterChip {
  label: string;
  active?: boolean;
}

const chips: FilterChip[] = [
  { label: "Filtros", active: true },
  { label: "Aberto agora" },
  { label: "Preço: $$" },
  { label: "Corte & Barba" },
];

const SearchFilters = (): JSX.Element => {
  return (
    <div className="flex flex-col gap-4 px-6 pt-6 lg:px-12">
      <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar barbearias em São Paulo..."
          className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        {chips.map((chip) => (
          <button
            key={chip.label}
            type="button"
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              chip.active
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100"
            }`}
          >
            {chip.label === "Filtros" && <SlidersHorizontal className="h-4 w-4" />}
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilters;