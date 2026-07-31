import { useEffect, useState } from "react";
import { CalendarDays, Store, LayoutGrid, List } from "lucide-react";
import { Link } from "react-router-dom";
import api, { normalizeApiError } from "@/services/api";
import AdminLayout from "@/features/admin/components/AdminLayout";

interface AppointmentItem {
  id: number;
  appointment_date: string;
  status: string;
  user?: { name?: string };
  barber?: { bio?: string };
  service?: { name?: string };
  branch?: { name?: string };
}

const BranchSchedulePage = (): JSX.Element => {
  const [items, setItems] = useState<AppointmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadAppointments = async (): Promise<void> => {
      try {
        const response = await api.get<{ items: AppointmentItem[] }>(
          "/appointment?page=1&pageSize=20",
        );
        setItems(response.data.items ?? []);
      } catch (error) {
        setErrorMessage(normalizeApiError(error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAppointments();
  }, []);

  return (
    <AdminLayout
      title="Agenda da Filial"
      subtitle="Gerencie os agendamentos, horarios e status dos servicos para a filial selecionada."
      action={
        <Link
          to="/dashboard/agendamentos/novo"
          className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white"
        >
          + Novo Agendamento
        </Link>
      }
    >
      {errorMessage ? (
        <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="rounded-3xl bg-[#eef2ff] p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
            <Store className="h-4 w-4" />
            Unidade Jardins
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 font-semibold text-slate-700">
            <CalendarDays className="h-4 w-4" />
            Hoje, 24 de Outubro
          </div>
          <div className="ml-auto hidden items-center gap-2 rounded-2xl bg-white p-1 md:flex">
            <button className="rounded-xl bg-[#eef2ff] px-3 py-2 text-[#0b4bd8]">
              <List className="h-4 w-4" />
            </button>
            <button className="rounded-xl px-3 py-2 text-slate-500">
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 rounded-3xl bg-white p-5 text-slate-600 shadow-sm">
          Carregando agenda...
        </div>
      ) : null}

      <div className="mt-8 space-y-4">
        {items.map((item, index) => {
          const appointmentTime = new Date(
            item.appointment_date,
          ).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              className={`rounded-3xl bg-white p-5 shadow-sm ${
                index === 0
                  ? "border-l-4 border-[#0b4bd8]"
                  : item.status === "cancelado"
                    ? "border-l-4 border-[#d35400]"
                    : "opacity-75"
              }`}
            >
              <div className="grid grid-cols-[120px_1fr_auto] items-center gap-4">
                <div className="text-2xl font-black text-slate-900">
                  {appointmentTime}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-slate-900">
                      {item.user?.name ?? "Cliente sem nome"}
                    </div>
                    <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                    <div className="text-slate-500">
                      {item.service?.name ?? "Serviço"}
                    </div>
                  </div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-bold text-[#0b4bd8]">
                    {item.status.toUpperCase()}
                  </div>
                  <span className="ml-3 text-sm text-slate-500">
                    {item.branch?.name ?? "Filial"} •{" "}
                    {item.barber?.bio ?? "Barbeiro"}
                  </span>
                </div>
                <div className="rounded-full bg-[#f4f6ff] px-3 py-2 text-[#0b4bd8]">
                  <div className="h-4 w-4 rounded-sm border border-[#0b4bd8]" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default BranchSchedulePage;
