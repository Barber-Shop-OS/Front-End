import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Edit3, MapPin, Store, Trash2 } from "lucide-react";
import api, { normalizeApiError } from "@/services/api";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { SectionCard } from "@/features/admin/components/AdminCards";

interface BranchAddress {
  id: number;
  cep?: string;
  number?: number;
  complement?: string;
  city?: string;
  state?: string;
}

interface BranchRecord {
  id: number;
  name: string;
  barbershop_id: number;
  address_id?: number;
  address?: BranchAddress;
}

const BranchesManagementPage = (): JSX.Element => {
  const [branches, setBranches] = useState<BranchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBranches = async (): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await api.get<{ items: BranchRecord[] }>(
        "/branch?page=1&pageSize=20",
      );
      setBranches(response.data.items ?? []);
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBranches();
  }, []);

  const handleDeleteBranch = async (branchId: number): Promise<void> => {
    if (!window.confirm("Deseja remover esta filial?")) {
      return;
    }

    try {
      await api.delete(`/branch/${branchId}`);
      setBranches((currentBranches) =>
        currentBranches.filter((branch) => branch.id !== branchId),
      );
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    }
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
      {errorMessage ? (
        <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-3xl bg-white p-6 text-slate-600 shadow-sm">
          Carregando filiais...
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {branches.map((branch) => (
          <SectionCard
            key={branch.id}
            title={branch.name}
            action={
              <span className="rounded-full bg-[#dbe2ff] px-3 py-1 text-xs font-bold text-[#0b4bd8]">
                ATIVA
              </span>
            }
          >
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-3 text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-500" />
                  <div>
                    <div>{branch.address?.city ?? "Cidade não informada"}</div>
                    <div>{branch.address?.state ?? "Estado não informado"}</div>
                  </div>
                </div>
                <div className="flex gap-4 text-sm">
                  <span className="rounded-full bg-[#f4f6ff] px-3 py-1">
                    {branch.address?.number ?? "N/A"}
                  </span>
                  <span className="rounded-full bg-[#f4f6ff] px-3 py-1">
                    {branch.address?.cep ?? "CEP não informado"}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 border-l border-slate-100 pl-5 text-slate-500">
                <Link
                  to={`/dashboard/filiais/${branch.id}/editar`}
                  className="transition hover:text-[#0b4bd8]"
                  aria-label={`Editar ${branch.name}`}
                  title="Editar filial"
                >
                  <Edit3 className="h-5 w-5" />
                </Link>
                <button
                  type="button"
                  onClick={() => void handleDeleteBranch(branch.id)}
                  className="transition hover:text-red-600"
                  aria-label={`Excluir ${branch.name}`}
                  title="Excluir filial"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <Store className="h-5 w-5" />
              </div>
            </div>
          </SectionCard>
        ))}
      </div>
    </AdminLayout>
  );
};

export default BranchesManagementPage;
