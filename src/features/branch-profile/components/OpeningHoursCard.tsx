export interface OpeningHour {
  label: string;
  hours: string;
  closed?: boolean;
}

interface OpeningHoursCardProps {
  title: string;
  openingHours: OpeningHour[];
  phone: string;
}

const OpeningHoursCard = ({
  title,
  openingHours,
  phone,
}: OpeningHoursCardProps): JSX.Element => {
  return (
    <div className="rounded-2xl bg-slate-50 p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>

      <div className="mt-4 flex flex-col gap-3">
        {openingHours.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-slate-500">{item.label}</span>
            <span
              className={`font-bold ${
                item.closed ? "text-red-500" : "text-blue-600"
              }`}
            >
              {item.hours}
            </span>
          </div>
        ))}
      </div>

      <hr className="my-5 border-slate-200" />

      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
        Contato direto
      </p>
      <p className="mt-1 text-base font-bold text-slate-900">{phone}</p>
    </div>
  );
};

export default OpeningHoursCard;