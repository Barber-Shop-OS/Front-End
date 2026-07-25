import { CheckCircle2, Settings2, UserPlus } from "lucide-react";

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
    icon: <UserPlus className="h-6 w-6 text-blue-600" />,
    iconBg: "bg-blue-100",
    title: "Crie sua conta",
    description:
      "Cadastre sua barbearia em poucos minutos, sem precisar de cartão de crédito.",
  },
  {
    number: "02",
    icon: <Settings2 className="h-6 w-6 text-blue-600" />,
    iconBg: "bg-blue-100",
    title: "Configure sua agenda",
    description:
      "Adicione barbeiros, serviços e horários de funcionamento da sua barbearia.",
  },
  {
    number: "03",
    icon: <CheckCircle2 className="h-6 w-6 text-orange-500" />,
    iconBg: "bg-orange-100",
    title: "Comece a receber agendamentos",
    description:
      "Seus clientes já podem agendar pelo app, e você acompanha tudo pelo painel.",
  },
];

const HowItWorks = (): JSX.Element => {
  return (
    <section className="w-full bg-white px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-5xl text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">
          Comece a usar em minutos
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-slate-500">
          Sem instalação complicada e sem treinamento longo. Sua barbearia
          pronta pra operar no mesmo dia.
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