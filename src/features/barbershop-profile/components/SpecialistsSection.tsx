export interface Specialist {
  id: string;
  name: string;
  specialty: string;
  avatar: string;
}

interface SpecialistsSectionProps {
  specialists: Specialist[];
  onSelectSpecialist?: (specialistId: string) => void;
}

const SpecialistsSection = ({
  specialists,
  onSelectSpecialist,
}: SpecialistsSectionProps): JSX.Element => {
  return (
    <section className="px-6 pb-16 pt-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Nossos Especialistas
        </h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {specialists.map((specialist) => (
            <button
              key={specialist.id}
              type="button"
              onClick={() => onSelectSpecialist?.(specialist.id)}
              className="flex flex-col items-center gap-3 rounded-2xl bg-slate-50 p-6 text-center transition-colors hover:bg-slate-100"
            >
              <div className="h-20 w-20 overflow-hidden rounded-full">
                <img
                  src={specialist.avatar}
                  alt={specialist.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {specialist.name}
                </p>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {specialist.specialty}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SpecialistsSection;