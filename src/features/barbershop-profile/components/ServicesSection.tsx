import { Clock, Plus, Wallet } from "lucide-react";

export interface Service {
  id: string;
  name: string;
  durationMinutes: number;
  priceInReais: number;
}

interface ServicesSectionProps {
  services: Service[];
  onAddService?: (serviceId: string) => void;
}

const ServicesSection = ({
  services,
  onAddService,
}: ServicesSectionProps): JSX.Element => {
  return (
    <section className="px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-slate-900">Serviços</h2>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100"
            >
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {service.name}
                </h3>
                <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {service.durationMinutes} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="h-4 w-4" />
                    R$ {service.priceInReais}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onAddService?.(service.id)}
                aria-label={`Adicionar serviço ${service.name}`}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;