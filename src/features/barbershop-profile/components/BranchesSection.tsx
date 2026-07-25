import { ArrowRight, Building2 } from "lucide-react";

export interface Branch {
  id: string;
  name: string;
  street: string;
  cityState: string;
}

interface BranchesSectionProps {
  branches: Branch[];
  onSelectBranch?: (branchId: string) => void;
}

const BranchesSection = ({
  branches,
  onSelectBranch,
}: BranchesSectionProps): JSX.Element => {
  return (
    <section className="px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-3xl font-extrabold text-slate-900">Nossas Filiais</h2>
        <p className="mt-1 text-slate-500">
          Encontre o BarberOS mais próximo de você.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {branches.map((branch, index) => (
            <div
              key={branch.id}
              className={`flex flex-col gap-4 rounded-2xl p-6 ${
                index === 0
                  ? "bg-white shadow-sm ring-1 ring-slate-100"
                  : "bg-slate-50"
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{branch.name}</h3>
                <p className="mt-1 text-sm text-slate-500">{branch.street}</p>
                <p className="text-sm text-slate-500">{branch.cityState}</p>
              </div>

              <button
                type="button"
                onClick={() => onSelectBranch?.(branch.id)}
                className="flex w-fit items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Ver no mapa
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BranchesSection;