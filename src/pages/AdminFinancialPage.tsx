import AdminLayout from "@/features/admin/components/AdminLayout";
import { StatCard, SectionCard } from "@/features/admin/components/AdminCards";
import { CalendarDays, CircleDollarSign, Wallet } from "lucide-react";

const transactions = [
  ["Rafael Costa", "Corte Fade + Barba", "R$ 85,00", "14:30"],
  ["Lucas Mendes", "Pigmentacao", "R$ 45,00", "13:15"],
  ["Thiago Silva", "Corte Social", "R$ 50,00", "11:00"],
  ["Joao Pedro", "Pomada Modeladora", "R$ 60,00", "09:45"],
];

const AdminFinancialPage = (): JSX.Element => {
  return (
    <AdminLayout
      title="Financeiro"
      subtitle="Visao geral do desempenho e faturamento diario."
      action={
        <div className="flex items-center gap-2 rounded-2xl bg-[#eef2ff] p-1">
          {["Hoje", "Semana", "Mes"].map((item, index) => (
            <button
              key={item}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold ${
                index === 0 ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      }
    >
      <div className="grid gap-4 xl:grid-cols-3">
        <StatCard title="Receita hoje" value="R$ 1.250,00" subtitle="+12% vs. ontem" icon={<CalendarDays className="h-5 w-5" />} />
        <StatCard title="Receita semanal" value="R$ 8.400,00" subtitle="Previsao: R$ 10k" icon={<CircleDollarSign className="h-5 w-5" />} />
        <StatCard title="Receita mensal" value="R$ 32.150,00" subtitle="Novembro" icon={<Wallet className="h-5 w-5" />} accent />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard title="Faturamento da Semana" action={<button className="text-[#0b4bd8] font-semibold">Detalhes</button>}>
          <div className="rounded-3xl bg-[#fbfcff] p-5 ring-1 ring-slate-100">
            <div className="grid h-96 grid-cols-7 items-end gap-4">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day, index) => (
                <div key={day} className="flex h-full flex-col items-center justify-end gap-3">
                  <div
                    className={`w-full rounded-t-2xl ${
                      index === 3 ? "bg-[#0b4bd8]" : "bg-[#dbe2ff]"
                    }`}
                    style={{ height: `${74 + index * 18}px` }}
                  />
                  <span className={`text-sm font-medium ${index === 3 ? "text-[#0b4bd8]" : "text-slate-500"}`}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Transacoes Recentes" action={<button className="text-[#0b4bd8] font-semibold">Ver todos</button>}>
          <div className="space-y-3">
            {transactions.map((item, index) => (
              <div key={item[0]} className="flex items-center justify-between rounded-2xl bg-[#f7f8fe] p-4">
                <div className="rounded-2xl bg-[#dce6ff] px-3 py-3 text-[#0b4bd8]">
                  <ScissorsIcon index={index} />
                </div>
                <div className="flex-1 px-4">
                  <div className="font-semibold text-slate-900">{item[0]}</div>
                  <div className="text-sm text-slate-500">{item[1]}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{item[2]}</div>
                  <div className="text-sm text-slate-500">{item[3]}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-5 w-full text-center font-semibold text-[#0b4bd8]">Ver Todas as Transacoes</button>
        </SectionCard>
      </div>
    </AdminLayout>
  );
};

const ScissorsIcon = ({ index }: { index: number }) => (
  <div className={`h-5 w-5 rounded-full ${index % 2 === 0 ? "bg-[#0b4bd8]" : "bg-[#7c8ef5]"}`} />
);

export default AdminFinancialPage;
