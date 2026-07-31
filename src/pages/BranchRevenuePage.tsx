import { CalendarDays, MoreHorizontal, Scissors, Sparkles, BadgeDollarSign } from "lucide-react";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { SectionCard, StatCard } from "@/features/admin/components/AdminCards";

const revenueItems = [
  ["Corte Degrade + Barba", "com Rafael Silva", "R$ 85,00", "14:30"],
  ["Pigmentacao", "com Lucas Mendes", "R$ 45,00", "14:00"],
  ["Corte Classico", "com Thiago Costa", "R$ 50,00", "13:15"],
  ["Sobrancelha", "com Rafael Silva", "R$ 20,00", "12:45"],
];

const BranchRevenuePage = (): JSX.Element => (
  <AdminLayout
    title="Rendimentos da Filial"
    subtitle="Visao geral do desempenho financeiro."
    action={<div className="rounded-2xl bg-[#eef2ff] px-4 py-3 font-semibold text-slate-700">Filial Centro (Matriz)</div>}
  >
    <div className="grid gap-4 xl:grid-cols-3">
      <StatCard title="Receita de hoje" value="R$ 1.240,00" subtitle="+12% vs ontem" icon={<CalendarDays className="h-5 w-5" />} />
      <StatCard title="Receita da semana" value="R$ 8.450,50" subtitle="+5% vs sem. ant." icon={<Sparkles className="h-5 w-5" />} />
      <StatCard title="Receita do mes" value="R$ 34.200,00" subtitle="Estavel vs mes ant." icon={<BadgeDollarSign className="h-5 w-5" />} accent />
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
      <SectionCard title="Evolucao de Receita" subtitle="Ultimos 7 dias" action={<button className="rounded-2xl bg-[#eef2ff] px-3 py-2 text-slate-500"><MoreHorizontal className="h-4 w-4" /></button>}>
        <div className="rounded-3xl bg-[#fbfcff] p-5 ring-1 ring-slate-100">
          <div className="grid h-96 grid-cols-7 items-end gap-4">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day, index) => (
              <div key={day} className="flex h-full flex-col items-center justify-end gap-3">
                <div
                  className={`w-full rounded-t-2xl ${index === 4 ? "bg-[#0b4bd8]" : "bg-[#dbe2ff]"}`}
                  style={{ height: `${88 + index * 10}px` }}
                />
                <span className={`text-sm font-medium ${index === 4 ? "text-[#0b4bd8]" : "text-slate-500"}`}>
                  {day}
                </span>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Servicos Recentes" action={<button className="text-[#0b4bd8] font-semibold">Ver todos</button>}>
        <div className="space-y-3">
          {revenueItems.map((item, index) => (
            <div key={item[0]} className="flex items-center justify-between rounded-2xl bg-[#f7f8fe] p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-[#dce6ff] p-3 text-[#0b4bd8]">
                  {index % 2 === 0 ? <Scissors className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{item[0]}</div>
                  <div className="text-sm text-slate-500">{item[1]}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{item[2]}</div>
                <div className="text-sm text-slate-500">{item[3]}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  </AdminLayout>
);

export default BranchRevenuePage;
