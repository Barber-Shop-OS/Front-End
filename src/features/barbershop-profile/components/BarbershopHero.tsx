import { ArrowRight } from "lucide-react";

interface BarbershopHeroProps {
  name: string;
  tagline: string;
  coverImage: string;
  onBookNow?: () => void;
}

const BarbershopHero = ({
  name,
  tagline,
  coverImage,
  onBookNow,
}: BarbershopHeroProps): JSX.Element => {
  return (
    <section className="px-6 py-12 lg:px-12 lg:py-16">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
        <div className="flex flex-col gap-6">
          <h1 className="text-5xl font-extrabold leading-[1.05] text-slate-900">
            {name}
          </h1>
          <p className="max-w-md text-base text-slate-500">{tagline}</p>

          <button
            type="button"
            onClick={onBookNow}
            className="flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Agendar Agora
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden rounded-3xl">
          <img
            src={coverImage}
            alt={`Ambiente da barbearia ${name}`}
            className="h-72 w-full object-cover lg:h-96"
          />
        </div>
      </div>
    </section>
  );
};

export default BarbershopHero;