import { User } from "lucide-react";
import { Link } from "react-router-dom";

import CustomerLayout from "@/layouts/CustomerLayout";
import scissor from "@/assets/AppointmentPage/scissor.png";

const appointments = [
  {
    id: "1",
    badge: "Amanhã",
    title: "Corte Degradê & Barba",
    specialist: 'Ricardo "The Blade" Silva',
    time: "09:30",
    date: "12 de Outubro",
    actionPrimary: "Reagendar",
    actionSecondary: "Cancelar",
    accent: "blue",
  },
  {
    id: "2",
    badge: "",
    title: "Barboterapia Completa",
    specialist: "Marcus Stark",
    time: "16:00",
    date: "20 de Outubro",
    actionPrimary: "Alterar",
    actionSecondary: "Cancelar",
    accent: "soft",
  },
  {
    id: "3",
    badge: "",
    title: "Limpeza de Pele Express",
    specialist: "Ricardo Silva",
    time: "08:00",
    date: "25 de Out",
    actionPrimary: "Ver detalhes do serviço",
    actionSecondary: "",
    accent: "light",
  },
];

const AppointmentsHeader = (): JSX.Element => (
  <div>
    <h1 className="text-4xl font-medium text-slate-900">Meus agendamentos</h1>
    <p className="mt-2 text-lg text-slate-500">
      Gerencie seus horários e serviços agendados.
    </p>
  </div>
);

const AppointmentTabs = (): JSX.Element => (
  <div className="flex gap-8 border-b border-slate-200 text-sm font-bold">
    <button
      type="button"
      className="border-b-4 border-[#0b4bd8] pb-3 text-[#0b4bd8]"
    >
      PRÓXIMOS
    </button>
    <button type="button" className="pb-3 text-slate-400">
      HISTÓRICO
    </button>
  </div>
);

const AppointmentCard = ({
  item,
  index,
}: {
  item: (typeof appointments)[number];
  index: number;
}): JSX.Element => (
  <article
    key={item.id}
    className={`rounded-2xl p-6 shadow-sm ${
      item.accent === "blue"
        ? "bg-white"
        : item.accent === "soft"
          ? "bg-[#eef3ff]"
          : "bg-[#f4f6ff]"
    }`}
  >
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-4">
        <img
          src={`https://images.unsplash.com/photo-${150 + index}-0648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80`}
          alt=""
          className="h-16 w-16 rounded-xl object-cover"
        />
        <div>
          {item.badge && (
            <span className="rounded-full bg-[#d9e1ff] px-3 py-1 text-xs font-bold uppercase tracking-[0.15em] text-slate-700">
              {item.badge}
            </span>
          )}
          <h2 className="mt-2 text-2xl font-bold">{item.title}</h2>
          <p className="mt-1 flex items-center gap-2 text-slate-600">
            <User className="h-4 w-4" />
            {item.specialist}
          </p>
          {item.actionPrimary === "Ver detalhes do serviço" ? (
            <Link
              to={`/cliente/agendamentos/${item.id}`}
              className="mt-3 inline-flex text-lg font-bold text-[#0b4bd8] underline-offset-2 hover:underline"
            >
              {item.actionPrimary}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="text-right">
        <div className="text-4xl font-black text-[#0b4bd8]">{item.time}</div>
        <div className="mt-1 text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
          {item.date}
        </div>
      </div>
    </div>

    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
      {item.actionPrimary !== "Ver detalhes do serviço" ? (
        <Link
          to={`/cliente/agendamentos/${item.id}`}
          className={`flex-1 rounded-xl px-4 py-3 text-center font-bold uppercase tracking-[0.12em] ${
            index === 0 ? "bg-[#0b4bd8] text-white" : "bg-white text-slate-700"
          }`}
        >
          {item.actionPrimary}
        </Link>
      ) : null}
      {item.actionSecondary ? (
        <button
          type="button"
          className="flex-1 rounded-xl bg-[#eef3ff] px-4 py-3 font-bold uppercase tracking-[0.12em] text-slate-600"
        >
          {item.actionSecondary}
        </button>
      ) : null}
    </div>
  </article>
);

const AppointmentPromoCard = (): JSX.Element => (
  <section className="relative overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#eef3ff_0%,#dfe7ff_100%)] p-8 shadow-sm">
    <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
      <div>
        <h2 className="text-3xl font-black text-[#0b4bd8]">
          Espaço para mais um?
        </h2>
        <p className="mt-2 max-w-lg text-lg text-slate-600">
          Mantenha seu estilo impecável agendando sua próxima visita agora
          mesmo.
        </p>
        <button
          type="button"
          className="mt-6 rounded-2xl bg-[#0b4bd8] px-6 py-3 font-bold text-white"
        >
          Novo agendamento
        </button>
      </div>
      <div className="pointer-events-none absolute bottom-0 right-0 hidden text-slate-300 lg:block">
        <img src={scissor} alt="Tesoura" className="h-auto w-32" />
      </div>
    </div>
  </section>
);

const CustomerAppointmentsPage = (): JSX.Element => {
  return (
    <CustomerLayout>
      <div className="space-y-8">
        <AppointmentsHeader />
        <AppointmentTabs />

        <div className="space-y-5">
          {appointments.map((item, index) => (
            <AppointmentCard key={item.id} item={item} index={index} />
          ))}
        </div>

        <AppointmentPromoCard />
      </div>
    </CustomerLayout>
  );
};

export default CustomerAppointmentsPage;
