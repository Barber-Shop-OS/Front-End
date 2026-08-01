import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { selectAuthUser } from "@/features/auth/selectors";
import { useAppSelector } from "@/hooks/redux";
import api, { normalizeApiError } from "@/services/api";
import AdminLayout from "@/features/admin/components/AdminLayout";

const Field = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  placeholder: string;
  icon?: JSX.Element;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </span>
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100">
      {icon}
      <input
        className="w-full bg-transparent outline-none placeholder:text-slate-400"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type={type}
      />
    </div>
  </label>
);

interface BranchOption {
  id: number;
  name: string;
}

interface BarberOption {
  id: number;
  bio?: string;
  branch_id?: number;
}

interface ServiceOption {
  id: number;
  name: string;
}

const NewAppointmentPage = (): JSX.Element => {
  const navigate = useNavigate();
  const authUser = useAppSelector(selectAuthUser);
  const authUserId = authUser?.id;
  const [branches, setBranches] = useState<BranchOption[]>([]);
  const [barbers, setBarbers] = useState<BarberOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [branchId, setBranchId] = useState("1");
  const [barberId, setBarberId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [status, setStatus] = useState("pendente");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadOptions = async (): Promise<void> => {
      try {
        const [branchesResponse, barbersResponse, servicesResponse] =
          await Promise.all([
            api.get<{ items: BranchOption[] }>("/branch?page=1&pageSize=20"),
            api.get<{ items: BarberOption[] }>("/barber?page=1&pageSize=20"),
            api.get<{ items: ServiceOption[] }>("/services?page=1&pageSize=20"),
          ]);

        const branchOptions = branchesResponse.data.items ?? [];
        const barberOptions = barbersResponse.data.items ?? [];
        const serviceOptions = servicesResponse.data.items ?? [];

        setBranches(branchOptions);
        setBarbers(barberOptions);
        setServices(serviceOptions);

        if (branchOptions[0]?.id) {
          setBranchId(String(branchOptions[0].id));
        }

        if (barberOptions[0]?.id) {
          setBarberId(String(barberOptions[0].id));
        }

        if (serviceOptions[0]?.id) {
          setServiceId(String(serviceOptions[0].id));
        }
      } catch (error) {
        setErrorMessage(normalizeApiError(error).message);
      }
    };

    void loadOptions();
  }, []);

  const userId = useMemo(() => {
    const parsed = Number(authUserId ?? 1);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  }, [authUserId]);

  const handleSave = async (): Promise<void> => {
    setErrorMessage(null);

    if (!branchId || !barberId || !serviceId || !appointmentDate) {
      setErrorMessage(
        "Selecione filial, barbeiro, serviço e data para continuar.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/appointment", {
        user_id: userId,
        barber_id: Number(barberId),
        service_id: Number(serviceId),
        branch_id: Number(branchId),
        appointment_date: new Date(appointmentDate).toISOString(),
        status,
      });

      navigate("/dashboard/agenda-da-filial");
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout
      title="Novo Agendamento"
      subtitle="Cadastre um novo horário manualmente na agenda da filial."
      action={
        <Link
          to="/dashboard/agenda-da-filial"
          className="rounded-xl bg-[#eef2ff] px-5 py-3 font-semibold text-[#0b4bd8]"
        >
          Voltar para agenda
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          {errorMessage ? (
            <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Filial
              </span>
              <select
                className="w-full rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100 outline-none"
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
              >
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </label>

            <Field
              label="Data"
              icon={<CalendarDays className="h-4 w-4" />}
              placeholder="24/10/2026 09:00"
              value={appointmentDate}
              onChange={setAppointmentDate}
              type="datetime-local"
            />

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Serviço
              </span>
              <select
                className="w-full rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100 outline-none"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Barbeiro
              </span>
              <select
                className="w-full rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100 outline-none"
                value={barberId}
                onChange={(event) => setBarberId(event.target.value)}
              >
                {barbers.map((barber) => (
                  <option key={barber.id} value={barber.id}>
                    {barber.bio || `Barbeiro #${barber.id}`}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                Status
              </span>
              <select
                className="w-full rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100 outline-none"
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </label>

            <div className="flex items-center gap-3 rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100 text-slate-600">
              <Store className="h-4 w-4" />
              Usuário atual: {authUserId ?? "anonimo"}
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSubmitting}
              className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Salvando..." : "Salvar agendamento"}
            </button>
            <Link
              to="/dashboard/agenda-da-filial"
              className="rounded-2xl bg-[#eef2ff] px-6 py-4 text-center font-bold text-slate-700"
            >
              Cancelar
            </Link>
          </div>
        </section>

        <aside className="rounded-3xl bg-[#eef2ff] p-6">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#0b4bd8]">
            Resumo
          </div>
          <div className="mt-4 space-y-3 text-slate-700">
            <div>Agendamento de 45 minutos</div>
            <div>Confirmação manual ou automática</div>
            <div>Integrado à agenda da filial</div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
};
export default NewAppointmentPage;
