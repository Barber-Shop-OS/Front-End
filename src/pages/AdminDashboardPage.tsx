import {
  CalendarDays,
  CircleDollarSign,
  Users,
  Plus,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
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
        <Link
          to="/dashboard/agendamentos/novo"
          className="rounded-xl bg-[#0b4bd8] px-5 py-3 font-semibold text-white shadow-lg shadow-blue-600/20"
        >
          + Novo Agendamento
        </Link>
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
          <Link
            to="/dashboard/barbeiros/novo"
            className="mb-3 flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 font-semibold text-[#0b4bd8]"
          >
            <span>Adicionar barbeiro</span>
            <Plus className="h-4 w-4" />
          </Link>
          <Link
            to="/dashboard/servicos"
            className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-3 font-semibold text-[#0b4bd8]"
          >
            <span>Criar servico</span>
            <Plus className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <SectionCard
          title="Receita Semanal"
          action={
            <button className="text-sm font-semibold text-[#0b4bd8]">
              Ver Relatorio Completo
            </button>
          }
        >
          <div className="rounded-3xl bg-[#fbfcff] p-6 ring-1 ring-slate-100">
            <svg viewBox="0 0 900 420" className="h-80 w-full">
              <defs>
                <linearGradient
                  id="revenueLine"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#d9e2ff" />
                  <stop offset="100%" stopColor="#0b4bd8" />
                </linearGradient>
              </defs>

              {[80, 150, 220, 290, 360].map((y) => (
                <line
                  key={y}
                  x1="60"
                  y1={y}
                  x2="860"
                  y2={y}
                  stroke="#eef2fb"
                  strokeWidth="2"
                />
              ))}

              {[
                [58, "5k"],
                [148, "4k"],
                [238, "3k"],
                [328, "2k"],
                [408, "1k"],
                [454, "0"],
              ].map(([y, label]) => (
                <text
                  key={String(label)}
                  x="24"
                  y={Number(y)}
                  className="fill-slate-500"
                  style={{ fontSize: "14px", fontWeight: 500 }}
                >
                  {label}
                </text>
              ))}

              <path
                d="M60 320 C 140 305, 180 270, 240 255 S 360 230, 430 200 S 540 210, 600 170 S 720 120, 860 95"
                fill="none"
                stroke="url(#revenueLine)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M60 320 C 140 305, 180 270, 240 255 S 360 230, 430 200 S 540 210, 600 170 S 720 120, 860 95 L 860 380 L 60 380 Z"
                fill="url(#revenueLine)"
                opacity="0.08"
              />

              {[
                [60, 320],
                [240, 255],
                [430, 200],
                [600, 170],
                [860, 95],
              ].map(([x, y]) => (
                <g key={`${x}-${y}`}>
                  <circle cx={x} cy={y} r="7" fill="#0b4bd8" />
                  <circle cx={x} cy={y} r="14" fill="#0b4bd8" opacity="0.08" />
                </g>
              ))}

              {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(
                (day, index) => (
                  <text
                    key={day}
                    x={100 + index * 120}
                    y="395"
                    textAnchor="middle"
                    className={
                      index === 3 ? "fill-[#0b4bd8]" : "fill-slate-500"
                    }
                    style={{
                      fontSize: "14px",
                      fontWeight: index === 3 ? 700 : 500,
                    }}
                  >
                    {day}
                  </text>
                ),
              )}
            </svg>
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
                  <div className="font-semibold text-slate-900">
                    {item.name}
                  </div>
                  <div className="text-sm text-slate-500">{item.service}</div>
                </div>
                <div
                  className={`h-9 w-9 rounded-full ${index === 1 ? "bg-slate-300" : "bg-slate-200"}`}
                />
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
            <h3 className="text-3xl font-black text-[#0b4bd8]">
              Espaco para mais um?
            </h3>
            <p className="mt-2 max-w-xl text-lg text-slate-600">
              Mantenha sua agenda sempre cheia com um novo agendamento e
              monitore tudo em tempo real.
            </p>
            <Link
              to="/dashboard/agendamentos/novo"
              className="mt-6 inline-flex rounded-2xl bg-[#0b4bd8] px-6 py-3 font-bold text-white"
            >
              Novo agendamento
            </Link>
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
