import { CalendarDays, Clock3, Scissors, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import AdminLayout from "@/features/admin/components/AdminLayout";

const Field = ({
  label,
  placeholder,
  icon,
}: {
  label: string;
  placeholder: string;
  icon?: JSX.Element;
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
      />
    </div>
  </label>
);

const NewAppointmentPage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleSave = (): void => {
    navigate("/dashboard/agenda-da-filial");
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
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Filial"
              icon={<Store className="h-4 w-4" />}
              placeholder="Unidade Jardins"
            />
            <Field
              label="Data"
              icon={<CalendarDays className="h-4 w-4" />}
              placeholder="24 de Outubro"
            />
            <Field
              label="Horario"
              icon={<Clock3 className="h-4 w-4" />}
              placeholder="09:00"
            />
            <Field
              label="Servico"
              icon={<Scissors className="h-4 w-4" />}
              placeholder="Corte Degrade + Barba"
            />
            <Field label="Cliente" placeholder="Nome do cliente" />
            <Field label="Barbeiro" placeholder="Selecionar barbeiro" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white"
            >
              Salvar agendamento
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
