import { ArrowRight, Filter, Search } from "lucide-react";
import AdminLayout from "@/features/admin/components/AdminLayout";

const clients = [
  ["Alexandre Silva", "+55 11 99999-1234", "12 Out 2023", "24"],
  ["Carlos Mendes", "+55 21 98888-5678", "05 Nov 2023", "8"],
  ["Rafael Moraes", "+55 31 97777-9012", "Hoje", "42"],
];

const ClientsPage = (): JSX.Element => (
  <AdminLayout
    title="Clientes"
    subtitle="Gerenciamento e historico de frequencia."
    action={<button className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white">+ Novo Agendamento</button>}
  >
    <div className="mb-6 flex gap-3 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-[#eef2ff] px-4 py-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input className="w-full bg-transparent outline-none placeholder:text-slate-400" placeholder="Buscar cliente..." />
      </div>
      <button className="rounded-2xl bg-[#eef2ff] px-5 py-3 text-slate-600">
        <Filter className="mr-2 inline h-4 w-4" />
        Filtros
      </button>
    </div>

    <div className="space-y-4">
      {clients.map((client) => (
        <div
          key={client[0]}
          className="grid grid-cols-[1fr_auto_auto_56px] items-center gap-4 rounded-3xl bg-white p-5 shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dce6ff] font-bold text-[#0b4bd8]">
              {client[0]
                .split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)}
            </div>
            <div>
              <div className="font-bold text-slate-900">{client[0]}</div>
              <div className="text-sm text-slate-500">{client[1]}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Ultima visita</div>
            <div className="mt-1 font-medium">{client[2]}</div>
          </div>
          <div className="text-right">
            <div className="text-xs uppercase tracking-[0.16em] text-slate-400">Total visitas</div>
            <div className="text-2xl font-black text-slate-900">{client[3]}</div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f4f6ff] text-[#0b4bd8]">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      ))}
    </div>
  </AdminLayout>
);

export default ClientsPage;
