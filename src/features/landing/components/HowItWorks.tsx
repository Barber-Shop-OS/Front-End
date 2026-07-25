import { CalendarDays, CheckCircle2, Search } from "lucide-react";

interface Step {
  number: string;
  icon: JSX.Element;
  iconBg: string;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: "01",
    icon: <Search className="h-6 w-6 text-blue-600" />,
    iconBg: "bg-blue-100",
    title: "Escolha o local",
    description:
      "Navegue pelas melhores barbearias e profissionais perto de você.",
  },
  {
    number: "02",
    icon: <CalendarDays className="h-6 w-6 text-blue-600" />,
    iconBg: "bg-blue-100",
    title: "Selecione o horário",
    description:
      "Visualize a agenda em tempo real e escolha o que melhor se encaixa na sua rotina.",
  },
  {
    number: "03",
    icon: <CheckCircle2 className="h-6 w-6 text-orange-500" />,
    iconBg: "bg-orange-100",
    title: "Confirme o corte",
    description:
      "Receba a confirmação instantânea e lembretes automáticos do seu agendamento.",
  },
];

const HowItWorks = (): JSX.Element => {
  return (
    <section className="w-full bg-white px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Como funciona a plataforma?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Experiência premium do início ao fim, em apenas três passos simples.
        </p>

        <div className="mt-16 grid gap-12 sm:grid-cols-3">
          {steps.map((step) => (
            <div key={step.number} className="relative flex flex-col items-center">
              <span className="pointer-events-none absolute -top-6 text-6xl font-extrabold text-slate-100">
                {step.number}
              </span>
              <div
                className={`relative z-10 mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${step.iconBg}`}
              >
                {step.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 max-w-xs text-sm text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;