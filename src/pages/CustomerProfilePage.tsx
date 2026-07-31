import { Bell, Mail, MessageSquare, ShieldCheck, Smartphone } from "lucide-react";

import CustomerLayout from "@/layouts/CustomerLayout";
import userProfile from "@/assets/UserNavbar/user-profile.png";

const alerts = [
  {
    title: "Alertas por E-mail",
    description: "Confirmações e recibos de serviços",
    icon: Mail,
    active: true,
  },
  {
    title: "Push Notifications",
    description: "Lembretes em tempo real no app",
    icon: Bell,
    active: true,
  },
  {
    title: "Mensagens SMS",
    description: "Apenas para alertas críticos e urgentes",
    icon: MessageSquare,
    active: false,
  },
];

const notifications = [
  {
    title: "Agendamento Confirmado",
    text: "Seu horário para Corte & Barba com Bruno S. foi confirmado para amanhã às 15:30.",
    time: "Hoje, 09:15",
  },
  {
    title: "Lembrete de Serviço",
    text: "Não esqueça seu agendamento de amanhã. Recomendamos chegar 5 minutos antes.",
    time: "Ontem, 18:00",
  },
  {
    title: "Pagamento Processado",
    text: "Obrigado pela preferência. Seu pagamento de R$ 85,00 foi processado com sucesso.",
    time: "24 Jun, 11:20",
  },
];

const CustomerProfilePage = (): JSX.Element => {
  return (
    <CustomerLayout>
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <section className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-3xl border-4 border-white shadow">
              <img src={userProfile} alt="Ricardo Oliveira" className="h-full w-full object-cover" />
              <button type="button" className="absolute bottom-2 right-2 rounded-full bg-[#0b4bd8] p-2 text-white">
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
            <h1 className="mt-6 text-3xl font-bold">Ricardo Oliveira</h1>
            <p className="mt-2 text-slate-500">ricardo.design@email.com</p>

            <button type="button" className="mt-8 w-full rounded-2xl bg-[#0b4bd8] px-4 py-3 font-semibold text-white">
              Editar Perfil
            </button>
            <button type="button" className="mt-3 w-full rounded-2xl bg-[#eef3ff] px-4 py-3 font-semibold text-[#0b4bd8]">
              Sair da Conta
            </button>
          </section>

          <section className="rounded-2xl bg-[#eef3ff] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-slate-500">Status de fidelidade</p>
              <span className="rounded-full bg-[#d9e1ff] px-3 py-1 text-xs font-bold uppercase text-slate-700">
                Membro Gold
              </span>
            </div>
            <div className="mt-4 h-2 rounded-full bg-[#dce6ff]">
              <div className="h-2 w-[78%] rounded-full bg-[#0b4bd8]" />
            </div>
            <p className="mt-4 text-sm text-slate-600">Você está a 3 cortes de distância de ganhar um serviço completo gratuito.</p>
          </section>

          <section className="rounded-2xl bg-[#eef3ff] p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#0b4bd8]">Nível Bronze</p>
            <div className="mt-4 h-2 rounded-full bg-[#dce6ff]">
              <div className="h-2 w-2/3 rounded-full bg-[#0b4bd8]" />
            </div>
            <p className="mt-4 text-sm text-slate-600">Faltam 3 cortes para você se tornar um cliente Silver e ganhar benefícios.</p>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-3xl font-bold">Configurações de Notificações</h2>
            <p className="mt-2 text-slate-500">Escolha como você deseja ser lembrado dos seus compromissos.</p>

            <div className="mt-6 space-y-4 rounded-2xl bg-white p-2 shadow-sm">
              {alerts.map(({ title, description, icon: Icon, active }, index) => (
                <div key={title} className={`flex items-center justify-between rounded-2xl p-4 ${index % 2 === 0 ? "bg-[#eef3ff]" : "bg-[#f4f6ff]"}`}>
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-[#dce6ff] p-3 text-[#0b4bd8]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{title}</p>
                      <p className="text-sm text-slate-500">{description}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`h-7 w-14 rounded-full border-2 transition ${
                      active ? "border-[#0b4bd8] bg-[#0b4bd8]" : "border-slate-200 bg-slate-200"
                    }`}
                  >
                    <span className={`block h-6 w-6 rounded-full bg-white transition ${active ? "translate-x-7" : "translate-x-0"}`} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-bold">Histórico de Alertas</h2>
                <p className="mt-2 text-slate-500">Suas comunicações recentes.</p>
              </div>
              <button type="button" className="font-bold uppercase tracking-[0.2em] text-[#0b4bd8]">
                Limpar tudo
              </button>
            </div>

            <div className="space-y-4">
              {notifications.map((item, index) => (
                <article key={item.title} className={`rounded-2xl p-5 shadow-sm ${index === 0 ? "bg-white" : index === 1 ? "bg-white" : "bg-white"}`}>
                  <div className="flex items-start gap-4">
                    <div className={`rounded-xl p-3 ${index === 1 ? "bg-[#fff1e6] text-[#ba5a10]" : "bg-[#eef3ff] text-[#0b4bd8]"}`}>
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="font-semibold">{item.title}</h3>
                        <span className="text-xs text-slate-400">{item.time}</span>
                      </div>
                      <p className="mt-1 text-slate-500">{item.text}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfilePage;
