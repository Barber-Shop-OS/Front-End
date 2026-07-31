import { Search, MoreVertical } from "lucide-react";
import AdminLayout from "@/features/admin/components/AdminLayout";

const barbers = [
  ["Marcos Silva", "Especialista em Fade", "Ativo", "1.245", "Hoje, 14:30"],
  ["Roberto Almeida", "Barboterapia Classica", "Ativo", "3.890", "Ontem, 18:45"],
  ["Diego Costa", "Cortes Modernos", "Inativo", "412", "12/08/2023"],
  ["Lucas Mendes", "Colorimetria", "Ativo", "876", "Hoje, 09:15"],
];

const BarbersManagementPage = (): JSX.Element => (
  <AdminLayout
    title="Barbeiros da Filial"
    subtitle="Unidade Centro"
    action={<button className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white">+ Adicionar barbeiro</button>}
  >
    <div className="mb-6 flex justify-end">
      <div className="flex w-full max-w-md items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
        <Search className="h-5 w-5 text-slate-400" />
        <input className="w-full outline-none placeholder:text-slate-400" placeholder="Buscar barbeiro..." />
      </div>
    </div>

    <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
      <div className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.8fr] border-b border-slate-100 px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
        <div>Nome</div>
        <div></div>
        <div>Status</div>
        <div>Total de atendimentos</div>
        <div className="text-right">Ultimo atendimento</div>
      </div>

      <div className="divide-y divide-slate-100">
        {barbers.map((barber) => (
          <div key={barber[0]} className="grid grid-cols-[1.4fr_0.9fr_0.8fr_0.8fr_0.8fr] items-center px-6 py-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dce6ff] text-sm font-black text-[#0b4bd8]">
                {barber[0]
                  .split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <div className="font-semibold text-slate-900">{barber[0]}</div>
                <div className="text-sm text-slate-500">{barber[1]}</div>
              </div>
            </div>
            <div />
            <div>
              <span className="rounded-full bg-[#dbe2ff] px-3 py-1 text-xs font-bold text-[#0b4bd8]">
                {barber[2]}
              </span>
            </div>
            <div className="text-center">{barber[3]}</div>
            <div className="flex items-center justify-end gap-4 text-slate-500">
              <div>{barber[4]}</div>
              <MoreVertical className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminLayout>
);

export default BarbersManagementPage;
