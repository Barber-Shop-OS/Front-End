import { Link, useNavigate } from "react-router-dom";
import { MapPin, Store, Users, Scissors } from "lucide-react";

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

const NewBranchPage = (): JSX.Element => {
  const navigate = useNavigate();

  const handleSave = (): void => {
    navigate("/dashboard/filiais");
  };

  return (
    <AdminLayout
      title="Nova Filial"
      subtitle="Cadastre uma nova unidade na rede."
      action={
        <Link
          to="/dashboard/filiais"
          className="rounded-xl bg-[#eef2ff] px-5 py-3 font-semibold text-[#0b4bd8]"
        >
          Voltar para filiais
        </Link>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nome da filial"
              icon={<Store className="h-4 w-4" />}
              placeholder="BarberOS - Moema"
            />
            <Field
              label="Cidade"
              icon={<MapPin className="h-4 w-4" />}
              placeholder="Sao Paulo"
            />
            <Field label="Estado" placeholder="SP" />
            <Field
              label="Capacidade"
              icon={<Users className="h-4 w-4" />}
              placeholder="8 cadeiras"
            />
            <Field
              label="Barbeiros"
              icon={<Scissors className="h-4 w-4" />}
              placeholder="12 barbeiros"
            />
            <Field label="Status" placeholder="Ativa" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white"
            >
              Salvar filial
            </button>
            <Link
              to="/dashboard/filiais"
              className="rounded-2xl bg-[#eef2ff] px-6 py-4 text-center font-bold text-slate-700"
            >
              Cancelar
            </Link>
          </div>
        </section>
        <aside className="rounded-3xl bg-[#eef2ff] p-6">
          <div className="text-sm font-bold uppercase tracking-[0.18em] text-[#0b4bd8]">
            Checklist
          </div>
          <div className="mt-4 space-y-3 text-slate-700">
            <div>Endereço e contato</div>
            <div>Capacidade operacional</div>
            <div>Horários de funcionamento</div>
          </div>
        </aside>
      </div>
    </AdminLayout>
  );
};
export default NewBranchPage;
