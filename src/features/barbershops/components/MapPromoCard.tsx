const MapPromoCard = (): JSX.Element => {
  return (
    <div className="flex flex-col justify-between gap-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-500 p-6 text-white sm:flex-row sm:items-center">
      <div className="flex flex-col gap-3">
        <h3 className="text-2xl font-extrabold">Encontre no mapa</h3>
        <p className="max-w-xs text-sm text-blue-100">
          Explore as melhores barbearias perto da sua localização atual em São
          Paulo.
        </p>
        <button
          type="button"
          className="mt-1 w-fit rounded-lg bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-blue-600 transition-transform hover:scale-105"
        >
          Abrir mapa
        </button>
      </div>

      <div className="h-40 w-full max-w-xs overflow-hidden rounded-xl bg-blue-900/40 sm:h-36">
        <img
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=600&q=80"
          alt="Mapa ilustrativo de São Paulo"
          className="h-full w-full object-cover opacity-90"
        />
      </div>
    </div>
  );
};

export default MapPromoCard;