import { useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, MapPin, Slash, Store, Trash2 } from "lucide-react";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { SectionCard } from "@/features/admin/components/AdminCards";

const initialBranches = [
  {
    slug: "matriz",
    name: "BarberOS - Matriz",
    status: "ATIVA",
    address: "Av. Paulista, 1000 - Bela Vista",
    city: "Sao Paulo, SP - 01310-100",
    chairs: "8 Cadeiras",
    barbers: "12 Barbeiros",
    active: true,
  },
  {
    slug: "faria-lima",
    name: "BarberOS - Faria Lima",
    status: "ATIVA",
    address: "Av. Brig. Faria Lima, 2000 - Pinheiros",
    city: "Sao Paulo, SP - 01451-000",
    chairs: "5 Cadeiras",
    barbers: "7 Barbeiros",
    active: true,
  },
  {
    slug: "jardins",
    name: "BarberOS - Jardins",
    status: "INATIVA",
    address: "Rua Oscar Freire, 500 - Cerqueira Cesar",
    city: "Sao Paulo, SP - 01426-000",
    chairs: "0 Cadeiras (Em reforma)",
    barbers: "",
    active: false,
  },
];

const BranchesManagementPage = (): JSX.Element => {
  const [branches, setBranches] = useState(initialBranches);

  const handleDeleteBranch = (branchName: string): void => {
    setBranches((currentBranches) =>
      currentBranches.filter((branch) => branch.name !== branchName),
    );
  };

  return (
    <AdminLayout
      title="Filiais"
      subtitle="Gerencie as unidades da sua rede, enderecos e status de operacao."
      action={
        <Link
          to="/dashboard/filiais/nova"
          className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white"
        >
          + Nova filial
        </Link>
      }
    >
      <div className="grid gap-4 xl:grid-cols-2">
        {branches.map((branch) => (
          <SectionCard
            key={branch.name}
            title={branch.name}
            action={
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  branch.active
                    ? "bg-[#dbe2ff] text-[#0b4bd8]"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {branch.status}
              </span>
            }
          >
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-3 text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <div>{branch.address}</div>
                    <div>{branch.city}</div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="rounded-full bg-[#f4f6ff] px-3 py-1">
                    {branch.chairs}
                  </span>
                  {branch.barbers ? (
                    <span className="rounded-full bg-[#f4f6ff] px-3 py-1">
                      {branch.barbers}
                    </span>
                  ) : null}
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 border-l border-slate-100 pl-5 text-slate-500">
                <Link
                  to={`/dashboard/filiais/${branch.slug}/editar`}
                  className="transition hover:text-[#0b4bd8]"
                  aria-label={`Editar ${branch.name}`}
                  title="Editar filial"
                >
                  <Edit3 className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => handleDeleteBranch(branch.name)}
                  className="transition hover:text-red-600"
                  aria-label={`Excluir ${branch.name}`}
                  title="Excluir filial"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </AdminLayout>
  );
};

export default BranchesManagementPage;
