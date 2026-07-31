import { Clock3, Plus, Pencil } from "lucide-react";
import AdminLayout from "@/features/admin/components/AdminLayout";

const services = [
  ["Corte Classico", "R$ 45,00", "30 min"],
  ["Corte Moderno", "R$ 55,00", "45 min"],
  ["Barba Completa", "R$ 40,00", "30 min"],
  ["Combo (Corte + Barba)", "R$ 80,00", "60 min"],
  ["Pigmentacao de Barba", "R$ 35,00", "20 min"],
];

const ServicesManagementPage = (): JSX.Element => (
  <AdminLayout
    title="Servicos"
    subtitle="Gerencie o portfolio de servicos da barbearia."
    action={<button className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white">+ Novo servico</button>}
  >
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {services.map(([name, price, time]) => (
        <article key={name} className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-xl font-bold text-slate-900">{name}</h3>
            <div className="text-xl font-bold text-[#0b4bd8]">{price}</div>
          </div>
          <div className="mt-14 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Clock3 className="h-4 w-4" />
              {time}
            </div>
            <button className="rounded-2xl bg-[#eef2ff] px-4 py-2 text-sm font-semibold text-[#0b4bd8]">
              <Pencil className="mr-1 inline h-4 w-4" />
              Editar
            </button>
          </div>
        </article>
      ))}

      <button className="rounded-3xl border border-dashed border-slate-200 bg-[#eef2ff] p-8 text-center text-slate-500">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0b4bd8]">
          <Plus className="h-6 w-6" />
        </div>
        <div className="mt-4 text-base font-medium">Adicionar novo servico</div>
      </button>
    </div>
  </AdminLayout>
);

export default ServicesManagementPage;
