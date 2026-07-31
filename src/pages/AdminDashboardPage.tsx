import { CalendarDays, CircleDollarSign, Users, Plus, ArrowRight } from "lucide-react";
import AdminLayout from "@/features/admin/components/AdminLayout";
import { SectionCard, StatCard } from "@/features/admin/components/AdminCards";

const upcoming = [
  { time: "14h", name: "Carlos Eduardo", service: "Corte Degrade + Barba" },
  { time: "15h", name: "Rafael Oliveira", service: "Corte Classico" },
  { time: "16h", name: "Matheus Costa", service: "Somente Barba" },
];

const AdminDashboardPage = (): JSX.Element => {
  return (
    <AdminLayout
      title="Dashboard"
      subtitle="Visao geral do negocio para hoje, 24 de Outubro."
      action={
        <button className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20">
          + Novo Agendamento
        </button>
      }
    >
      <div className="grid gap-4 xl:grid-cols-[repeat(3,minmax(0,1fr))_260px]">
        <StatCard
          title="Agendamentos hoje"
          value="42"
          subtitle="+12% em relacao a ontem"
          icon={<CalendarDays className="h-5 w-5" />}
        />
        <StatCard
          title="Faturamento hoje"
          value="R$2.450"
          subtitle="+8% em relacao a media"
          icon={<CircleDollarSign className="h-5 w-5" />}
        />
        <StatCard
          title="Clientes atendidos"
          value="28"
          subtitle="atendidos ate agora"
          icon={<Users className="h-5 w-5" />}
        />
        <div className="rounded-3xl bg-[#eef2ff] p-5 shadow-sm">
          <div className="mb-4 text-sm font-bold uppercase tracking-[0.18em] text-[#0b4bd8]">
            Acoes rapidas
          </div>
          <button className="mb-3 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 font-semibold text-[#0b4bd8]">
            <span>Adicionar barbeiro</span>
            <Plus className="h-4 w-4" />
          </button>
          <button className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 font-semibold text-[#0b4bd8]">
            <span>Criar servico</span>
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard
          title="Receita Semanal"
          action={<button className="text-sm font-semibold text-[#0b4bd8]">Ver Relatorio Completo</button>}
        >
          <div className="rounded-3xl bg-[#fbfcff] p-6 ring-1 ring-slate-100">
            <div className="mb-6 flex h-72 items-end justify-between gap-4">
              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((day, index) => (
                <div key={day} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className={`w-full rounded-t-xl ${
                      index === 3 ? "bg-[#0b4bd8]" : "bg-[#dbe2ff]"
                    }`}
                    style={{ height: `${60 + index * 12}px` }}
                  />
                  <span className={`text-sm font-medium ${index === 3 ? "text-[#0b4bd8]" : "text-slate-500"}`}>
                    {day}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          title="Proximos Cortes"
          action={<button className="text-slate-400">...</button>}
        >
          <div className="space-y-3">
            {upcoming.map((item, index) => (
              <div
                key={item.name}
                className="flex items-center justify-between rounded-2xl bg-[#f7f8fe] p-4"
              >
                <div className="rounded-2xl bg-[#dce6ff] px-3 py-4 text-lg font-bold text-[#0b4bd8]">
                  {item.time}
                </div>
                <div className="flex-1 px-4">
                  <div className="font-semibold text-slate-900">{item.name}</div>
                  <div className="text-sm text-slate-500">{item.service}</div>
                </div>
                <div className={`h-9 w-9 rounded-full ${index === 1 ? "bg-slate-300" : "bg-slate-200"}`} />
              </div>
            ))}
          </div>
          <button className="mt-5 flex w-full items-center justify-center gap-2 font-semibold text-[#0b4bd8]">
            Ver agenda completa
            <ArrowRight className="h-4 w-4" />
          </button>
        </SectionCard>
      </div>

      <div className="mt-6 rounded-3xl bg-[linear-gradient(135deg,#edf2ff_0%,#dbe6ff_100%)] p-7 shadow-sm">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <div>
            <h3 className="text-3xl font-black text-[#0b4bd8]">Espaco para mais um?</h3>
            <p className="mt-2 max-w-xl text-lg text-slate-600">
              Mantenha sua agenda sempre cheia com um novo agendamento e monitore tudo em tempo real.
            </p>
            <button className="mt-6 rounded-2xl bg-[#0b4bd8] px-6 py-3 font-bold text-white">
              Novo agendamento
            </button>
          </div>
          <div className="relative h-44 overflow-hidden rounded-3xl bg-white/30">
            <div className="absolute right-6 top-6 h-20 w-20 rounded-full border-8 border-white/30" />
            <div className="absolute bottom-2 right-2 h-28 w-28 rotate-45 border-r-8 border-t-8 border-white/30" />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
