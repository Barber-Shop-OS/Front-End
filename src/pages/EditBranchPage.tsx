import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Store, Users, Scissors } from "lucide-react";

import api, { normalizeApiError } from "@/services/api";
import AdminLayout from "@/features/admin/components/AdminLayout";

const Field = ({
  label,
  value,
  icon,
  onChange,
}: {
  label: string;
  value: string;
  icon?: JSX.Element;
  onChange: (value: string) => void;
}) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
      {label}
    </span>
    <div className="flex items-center gap-3 rounded-2xl bg-[#f7f8fe] px-4 py-4 ring-1 ring-slate-100">
      {icon}
      <input
        className="w-full bg-transparent outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  </label>
);

const EditBranchPage = (): JSX.Element => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [complement, setComplement] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadBranch = async (): Promise<void> => {
      if (!branchId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get(`/branch/${branchId}`);
        const branch = response.data;
        setName(branch.name ?? "");
        setCep(branch.address?.cep ?? "");
        setNumber(String(branch.address?.number ?? ""));
        setCity(branch.address?.city ?? "");
        setState(branch.address?.state ?? "");
        setComplement(branch.address?.complement ?? "");
      } catch (error) {
        setErrorMessage(normalizeApiError(error).message);
      } finally {
        setIsLoading(false);
      }
    };

    void loadBranch();
  }, [branchId]);

  const handleSave = async (): Promise<void> => {
    setErrorMessage(null);

    if (!branchId) {
      setErrorMessage("Filial inválida para edição.");
      return;
    }

    try {
      await api.put(`/branch/${branchId}`, {
        name,
        cep,
        number: Number(number),
        city,
        state,
        complement: complement.trim() || undefined,
      });

      navigate("/dashboard/filiais");
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    }
  };

  const handleDelete = async (): Promise<void> => {
    if (!branchId || !window.confirm("Deseja excluir esta filial?")) {
      return;
    }

    try {
      await api.delete(`/branch/${branchId}`);
      navigate("/dashboard/filiais");
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
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
        {errorMessage ? (
          <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="text-slate-600">Carregando filial...</div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Nome da filial"
                icon={<Store className="h-4 w-4" />}
                value={name}
                onChange={setName}
              />
              <Field
                label="CEP"
                icon={<MapPin className="h-4 w-4" />}
                value={cep}
                onChange={setCep}
              />
              <Field
                label="Número"
                icon={<Users className="h-4 w-4" />}
                value={number}
                onChange={setNumber}
              />
              <Field
                label="Cidade"
                icon={<MapPin className="h-4 w-4" />}
                value={city}
                onChange={setCity}
              />
              <Field label="Estado" value={state} onChange={setState} />
              <Field
                label="Complemento"
                icon={<Scissors className="h-4 w-4" />}
                value={complement}
                onChange={setComplement}
              />
            </div>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => void handleSave()}
                className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white"
              >
                Salvar alterações
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                className="rounded-2xl bg-red-50 px-6 py-4 font-bold text-red-600"
              >
                Excluir filial
              </button>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default EditBranchPage;
