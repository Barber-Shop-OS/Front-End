import {
  CalendarDays,
  LineChart,
  MessageCircleHeart,
  Smartphone,
} from "lucide-react";

interface Benefit {
  icon: JSX.Element;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: <CalendarDays className="h-6 w-6 text-blue-600" />,
    title: "Agenda inteligente",
    description:
      "Controle horários, barbeiros e cadeiras em tempo real, sem conflitos de agendamento.",
  },
  {
    icon: <Smartphone className="h-6 w-6 text-blue-600" />,
    title: "App pro seu cliente",
    description:
      "Seus clientes agendam pelo celular, sem precisar ligar ou mandar mensagem.",
  },
  {
    icon: <LineChart className="h-6 w-6 text-blue-600" />,
    title: "Financeiro simplificado",
    description:
      "Acompanhe faturamento, comissões dos barbeiros e relatórios de forma automática.",
  },
  {
    icon: <MessageCircleHeart className="h-6 w-6 text-blue-600" />,
    title: "Fidelização de clientes",
    description:
      "Lembretes automáticos e histórico de cortes pra manter seus clientes voltando sempre.",
  },
];

const BenefitsSection = (): JSX.Element => {
  return (
    <section className="w-full bg-slate-50 px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-xl">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Por que BarberOS
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Tudo que sua barbearia precisa, em um só sistema
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                {benefit.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {benefit.title}
              </h3>
              <p className="text-sm text-slate-500">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;