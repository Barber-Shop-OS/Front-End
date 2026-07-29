import DashboardBarberLayout from "@/layouts/DashboardBarberLayout";
import { useAppSelector } from "@/hooks/redux";

const appointments = [
  {
    time: "14:30",
    client: "Carlos Almeida",
    service: "Corte Clássico & Barba",
    status: "Pendente" as const,
    concluded: false,
    opacity: false,
  },
  {
    time: "15:15",
    client: "Marcelo Souza",
    service: "Acabamento",
    status: "Pendente" as const,
    concluded: false,
    opacity: false,
  },
  {
    time: "13:00",
    client: "Roberto Dias",
    service: "Corte Máquina",
    status: "Concluído" as const,
    concluded: true,
    opacity: true,
  },
];

const StatusBadge = ({
  status,
  concluded,
}: {
  status: string;
  concluded: boolean;
}): JSX.Element => (
  <div className="inline-flex flex-col items-start justify-start rounded-xl bg-indigo-100 px-3 py-1">
    <span
      className={`text-xs font-medium leading-4 ${
        concluded ? "text-sky-950" : "text-gray-900"
      }`}
    >
      {status}
    </span>
  </div>
);

const AppointmentCard = ({
  time,
  client,
  service,
  status,
  concluded,
  opacity,
}: {
  time: string;
  client: string;
  service: string;
  status: "Pendente" | "Concluído";
  concluded: boolean;
  opacity: boolean;
}): JSX.Element => (
  <div
    className={`inline-flex w-full items-center justify-between rounded-lg bg-white p-5 ${
      opacity ? "opacity-75" : ""
    }`}
  >
    <div className="flex items-center justify-start">
      <div
        className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${
          concluded ? "bg-indigo-100" : "bg-violet-100"
        }`}
      >
        <span className="text-center text-lg font-bold leading-7 text-blue-700">
          {time}
        </span>
      </div>

      <div className="flex flex-col items-start justify-start pl-5">
        <div className="flex flex-col items-start justify-start">
          <div className="flex flex-col items-start justify-start self-stretch">
            <span className="text-base font-bold leading-6 text-gray-900">
              {client}
            </span>
          </div>
          <div className="flex flex-col items-start justify-start self-stretch">
            <span className="text-sm font-normal leading-5 text-gray-700">
              {service}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-start gap-3">
      <StatusBadge status={status} concluded={concluded} />
      <div className="flex flex-col items-center justify-center opacity-0">
        <div className="flex items-start justify-center">
          <div className="h-4 w-1 bg-gray-500" />
        </div>
      </div>
    </div>
  </div>
);

const StatCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle: string;
}): JSX.Element => (
  <div className="inline-flex flex-1 flex-col items-start justify-start gap-2 self-stretch rounded-lg bg-white p-6">
    <div className="inline-flex w-full items-start justify-between self-stretch">
      <span className="text-sm font-medium uppercase leading-5 text-gray-700">
        {title}
      </span>
      <div className="h-5 w-4 bg-blue-700" />
    </div>

    <div className="flex flex-col items-start justify-start self-stretch pt-2">
      <span className="text-4xl font-bold leading-10 text-gray-900">
        {value}
      </span>
    </div>

    <div className="flex flex-col items-start justify-start self-stretch">
      <span className="text-sm font-normal leading-5 text-gray-700">
        {subtitle}
      </span>
    </div>
  </div>
);

const ConcludedVsPendingCard = (): JSX.Element => (
  <div className="inline-flex flex-1 flex-col items-start justify-start gap-4 self-stretch rounded-lg bg-white px-6 pt-6 pb-7">
    <div className="inline-flex w-full items-start justify-between self-stretch">
      <span className="text-sm font-medium uppercase leading-5 text-gray-700">
        CONCLUÍDOS VS PENDENTES
      </span>
      <div className="size-4 bg-blue-700" />
    </div>

    <div className="relative h-10 w-full self-stretch">
      <span className="absolute left-0 top-0 text-4xl font-bold leading-10 text-gray-900">
        8
      </span>
      <div className="absolute left-[22.72px] top-[13px] inline-flex flex-col items-start justify-start pl-2">
        <span className="text-lg font-medium leading-7 text-gray-700">/ 6</span>
      </div>
    </div>

    <div className="inline-flex h-2 w-full items-start justify-start self-stretch overflow-hidden rounded-xl bg-indigo-100">
      <div className="w-36 self-stretch bg-blue-700" />
      <div className="w-28 self-stretch bg-indigo-100" />
    </div>
  </div>
);

const DashboardBarberPage = (): JSX.Element => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <DashboardBarberLayout>
      {/* Stats Row */}
      <div className="inline-flex w-full items-start justify-start gap-4 self-stretch">
        <StatCard
          title="AGENDAMENTOS HOJE"
          value="14"
          subtitle="+2 em relação a ontem"
        />

        <StatCard
          title="RECEITA HOJE"
          value="R$ 850"
          subtitle="+15% em relação a média diária"
        />

        <ConcludedVsPendingCard />
      </div>

      {/* Bottom Section: Appointments + Quick Actions */}
      <div className="inline-flex w-full items-start justify-start gap-8 self-stretch">
        {/* Próximos Agendamentos */}
        <div className="flex flex-1 flex-col items-start justify-start gap-6">
          <div className="inline-flex w-full items-end justify-between self-stretch">
            <div className="flex flex-col items-start justify-start">
              <h2 className="text-2xl font-bold leading-8 text-gray-900">
                Próximos Agendamentos
              </h2>
            </div>
            <div className="flex flex-col items-start justify-start">
              <button
                type="button"
                className="text-sm font-medium leading-5 text-blue-700"
              >
                Ver todos
              </button>
            </div>
          </div>

          <div className="flex w-full flex-col items-start justify-start gap-4">
            {appointments.map((appointment) => (
              <AppointmentCard key={appointment.time} {...appointment} />
            ))}
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="flex w-80 flex-col items-start justify-start gap-6">
          <div className="flex flex-col items-start justify-start self-stretch opacity-0">
            <h2 className="text-2xl font-bold leading-8 text-gray-900">
              Ações Rápidas
            </h2>
          </div>

          <div className="flex flex-col items-start justify-start gap-4 self-stretch rounded-lg bg-indigo-50 p-6">
            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-700 to-blue-600 px-4 py-3"
            >
              <div className="flex flex-col items-center justify-start">
                <div className="h-2 w-2 bg-white" />
              </div>
              <span className="text-center text-base font-medium leading-6 text-white">
                Novo agendamento
              </span>
            </button>

            <button
              type="button"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-300 px-4 py-3"
            >
              <div className="flex flex-col items-center justify-start">
                <div className="h-3 w-3 bg-indigo-900" />
              </div>
              <span className="text-center text-base font-medium leading-6 text-indigo-900">
                Bloquear horário
              </span>
            </button>
          </div>
        </div>
      </div>
    </DashboardBarberLayout>
  );
};

export default DashboardBarberPage;
