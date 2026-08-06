import { Link } from "react-router-dom";
import { Store, ToggleLeft, ToggleRight, UserRound } from "lucide-react";

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
      <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder={placeholder} />
    </div>
  </label>
);

const NewBarberPage = (): JSX.Element => (
  <AdminLayout
    title="Novo Barbeiro"
    subtitle="Adicione um novo talento à equipe."
    action={
      <Link
        to="/dashboard/barbeiros"
        className="rounded-xl bg-[#eef2ff] px-5 py-3 font-semibold text-[#0b4bd8]"
      >
        Voltar
      </Link>
    }
  >
    <div className="mx-auto max-w-2xl rounded-3xl bg-white p-6 shadow-sm">
      <div className="grid gap-4">
        <Field label="Nome completo" placeholder="Ex: Thiago Silva" icon={<UserRound className="h-4 w-4" />} />
        <Field label="Filial atribuida" placeholder="Selecione a unidade" icon={<Store className="h-4 w-4" />} />
      </div>
      <div className="mt-6">
        <div className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
          Status inicial
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <button className="rounded-2xl border-2 border-[#0b4bd8] bg-[#f7f8fe] px-4 py-4 font-bold text-[#0b4bd8]">
            <ToggleRight className="mr-2 inline h-4 w-4" /> Ativo
          </button>
          <button className="rounded-2xl bg-[#f7f8fe] px-4 py-4 font-medium text-slate-500">
            <ToggleLeft className="mr-2 inline h-4 w-4" /> Inativo
          </button>
        </div>
      </div>
      <div className="mt-8 flex justify-end gap-4">
        <button className="rounded-2xl bg-[#eef2ff] px-6 py-4 font-bold text-slate-700">
          Cancelar
        </button>
        <button className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white">
          Salvar
        </button>
      </div>
    </div>
  </AdminLayout>
);

export default NewBarberPage;
