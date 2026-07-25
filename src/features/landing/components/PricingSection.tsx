import { Check } from "lucide-react";

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "R$ 49",
    period: "/mês",
    description: "Pra quem está começando a organizar a barbearia.",
    features: [
      "1 barbeiro",
      "Agenda online",
      "Lembretes automáticos",
      "Suporte por e-mail",
    ],
  },
  {
    name: "Pro",
    price: "R$ 99",
    period: "/mês",
    description: "O mais escolhido por barbearias em crescimento.",
    features: [
      "Até 5 barbeiros",
      "Agenda online",
      "Relatórios financeiros",
      "App pro cliente final",
      "Suporte prioritário",
    ],
    highlighted: true,
  },
  {
    name: "Business",
    price: "R$ 179",
    period: "/mês",
    description: "Pra redes com mais de uma unidade.",
    features: [
      "Barbeiros ilimitados",
      "Múltiplas filiais",
      "Relatórios avançados",
      "Gerente de conta dedicado",
    ],
  },
];

const PricingSection = (): JSX.Element => {
  return (
    <section className="w-full bg-white px-6 py-20 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-xl text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Planos
          </span>
          <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
            Um plano pra cada tamanho de barbearia
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col gap-6 rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-slate-50 text-slate-900 ring-1 ring-slate-100"
              }`}
            >
              <div>
                <h3 className="text-lg font-bold">{plan.name}</h3>
                <p
                  className={`mt-1 text-sm ${
                    plan.highlighted ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              <div className="flex items-end gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span
                  className={`pb-1 text-sm ${
                    plan.highlighted ? "text-blue-100" : "text-slate-500"
                  }`}
                >
                  {plan.period}
                </span>
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check
                      className={`h-4 w-4 shrink-0 ${
                        plan.highlighted ? "text-white" : "text-blue-600"
                      }`}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className={`mt-auto rounded-xl py-3 text-sm font-semibold transition-colors ${
                  plan.highlighted
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Começar agora
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;