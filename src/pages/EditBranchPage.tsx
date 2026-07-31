import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Store, Users, Scissors } from "lucide-react";

import AdminLayout from "@/features/admin/components/AdminLayout";

const Field = ({
  label,
  defaultValue,
  icon,
}: {
  label: string;
  defaultValue: string;
  icon?: JSX.Element;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </span>
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100">
      {icon}
      <input
        className="w-full bg-transparent outline-none"
        defaultValue={defaultValue}
      />
    </div>
  </label>
);

const EditBranchPage = (): JSX.Element => {
  const { branchId } = useParams();
  const navigate = useNavigate();

  const handleSave = (): void => {
    navigate("/dashboard/filiais");
  };

  const handleDelete = (): void => {
    if (window.confirm("Deseja excluir esta filial?")) {
      navigate("/dashboard/filiais");
    }
  };

  return (
    <AdminLayout
      title="Editar Filial"
      subtitle={`Atualize os dados da filial ${branchId ?? ""}.`}
      action={
        <Link
          to="/dashboard/filiais"
          className="rounded-xl bg-[#eef2ff] px-5 py-3 font-semibold text-[#0b4bd8]"
        >
          Voltar
        </Link>
      }
    >
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Nome da filial"
            icon={<Store className="h-4 w-4" />}
            defaultValue="BarberOS - Matriz"
          />
          <Field
            label="Cidade"
            icon={<MapPin className="h-4 w-4" />}
            defaultValue="Sao Paulo"
          />
          <Field label="Estado" defaultValue="SP" />
          <Field
            label="Capacidade"
            icon={<Users className="h-4 w-4" />}
            defaultValue="8 cadeiras"
          />
          <Field
            label="Barbeiros"
            icon={<Scissors className="h-4 w-4" />}
            defaultValue="12 barbeiros"
          />
          <Field label="Status" defaultValue="Ativa" />
        </div>
        <div className="mt-6 flex gap-4">
          <button
            type="button"
            onClick={handleSave}
            className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white"
          >
            Salvar alterações
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-2xl bg-red-50 px-6 py-4 font-bold text-red-600"
          >
            Excluir filial
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EditBranchPage;
