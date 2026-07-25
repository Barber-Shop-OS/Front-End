import { Clock, LucideIcon } from "lucide-react";

export interface BranchService {
  id: string;
  icon: LucideIcon;
  name: string;
  description: string;
  durationMinutes: number;
  priceInReais: number;
}

interface BranchServicesGridProps {
  services: BranchService[];
  onSelectService?: (serviceId: string) => void;
}

const BranchServicesGrid = ({
  services,
  onSelectService,
}: BranchServicesGridProps): JSX.Element => {
  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <h2 className="text-2xl font-extrabold text-slate-900">Serviços</h2>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService?.(service.id)}
              className="flex flex-col gap-3 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-blue-600" />
                <span className="text-base font-extrabold text-blue-600">
                  R$ {service.priceInReais}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {service.name}
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {service.description}
                </p>
              </div>

              <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                {service.durationMinutes} minutos
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BranchServicesGrid;