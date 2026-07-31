import { CalendarDays, Store, LayoutGrid, List } from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "@/features/admin/components/AdminLayout";

const items = [
  [
    "09:00",
    "Lucas Moura",
    "Corte Degrade + Barba",
    "CONFIRMADO",
    "45 min",
    "Ricardo S.",
  ],
  ["10:15", "Marcelo Vieira", "Corte Classico", "FINALIZADO", "", "Thiago B."],
  [
    "11:30",
    "Bruno Costa",
    "Coloracao Global",
    "PENDENTE",
    "90 min",
    "Ricardo S.",
  ],
];

const BranchSchedulePage = (): JSX.Element => (
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

    <div className="mt-8 space-y-4">
      {items.map((item, index) => (
        <div
          key={item[1]}
          className={`rounded-3xl bg-white p-5 shadow-sm ${
            index === 2
              ? "border-l-4 border-[#d35400]"
              : index === 0
                ? "border-l-4 border-[#0b4bd8]"
                : "opacity-75"
          }`}
        >
          <div className="grid grid-cols-[120px_1fr_auto] items-center gap-4">
            <div className="text-2xl font-black text-slate-900">{item[0]}</div>
            <div>
              <div className="flex items-center gap-2">
                <div className="text-xl font-bold text-slate-900">
                  {item[1]}
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                <div className="text-slate-500">{item[2]}</div>
              </div>
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#eef2ff] px-3 py-1 text-xs font-bold text-[#0b4bd8]">
                {item[3]}
              </div>
              <span className="ml-3 text-sm text-slate-500">
                {item[4] ? `${item[4]} • ${item[5]}` : item[5]}
              </span>
            </div>
            <div className="rounded-full bg-[#f4f6ff] px-3 py-2 text-[#0b4bd8]">
              <div className="h-4 w-4 rounded-sm border border-[#0b4bd8]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </AdminLayout>
);

export default BranchSchedulePage;
