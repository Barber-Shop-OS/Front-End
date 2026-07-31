import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Store, Users } from "lucide-react";

import api, { normalizeApiError } from "@/services/api";
import AdminLayout from "@/features/admin/components/AdminLayout";

const Field = ({
  label,
  placeholder,
  icon,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  icon?: JSX.Element;
  value: string;
  onChange: (value: string) => void;
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
      />
    </div>
  </label>
);

const NewBranchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [cep, setCep] = useState("");
  const [number, setNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [complement, setComplement] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (): Promise<void> => {
    setErrorMessage(null);

    if (
      !name.trim() ||
      !cep.trim() ||
      !number.trim() ||
      !city.trim() ||
      !state.trim()
    ) {
      setErrorMessage(
        "Preencha nome, CEP, número, cidade e estado para salvar a filial.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/branch", {
        name,
        barbershop_id: 1,
        cep,
        number: Number(number),
        city,
        state,
        complement: complement.trim() || undefined,
      });

      navigate("/dashboard/filiais");
    } catch (error) {
      setErrorMessage(normalizeApiError(error).message);
    } finally {
      setIsSubmitting(false);
    }
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
          {errorMessage ? (
            <div className="mb-4 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <Field
              label="Nome da filial"
              icon={<Store className="h-4 w-4" />}
              placeholder="BarberOS - Moema"
              value={name}
              onChange={setName}
            />
            <Field
              label="CEP"
              icon={<MapPin className="h-4 w-4" />}
              placeholder="01001000"
              value={cep}
              onChange={setCep}
            />
            <Field
              label="Número"
              icon={<Store className="h-4 w-4" />}
              placeholder="100"
              value={number}
              onChange={setNumber}
            />
            <Field
              label="Cidade"
              icon={<MapPin className="h-4 w-4" />}
              placeholder="Sao Paulo"
              value={city}
              onChange={setCity}
            />
            <Field
              label="Estado"
              placeholder="SP"
              value={state}
              onChange={setState}
            />
            <Field
              label="Complemento"
              icon={<Users className="h-4 w-4" />}
              placeholder="Sala 2"
              value={complement}
              onChange={setComplement}
            />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={isSubmitting}
              className="rounded-2xl bg-[#0b4bd8] px-6 py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Salvando..." : "Salvar filial"}
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
