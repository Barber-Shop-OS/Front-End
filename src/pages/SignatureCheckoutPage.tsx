import { Check, Shield, BarChart3, QrCode, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const plans = [
  {
    tier: "Essencial",
    name: "Básico",
    price: "R$97",
    period: "/mês",
    description: "Ideal para barbeiros autônomos que buscam profissionalizar a agenda.",
    features: ["Agenda Digital Inteligente", "Cadastro de até 500 Clientes", "Relatório de Vendas Simples"],
    muted: "Sem gestão de filiais",
    cta: "Começar Agora",
  },
  {
    tier: "Performance",
    name: "Profissional",
    price: "R$187",
    period: "/mês",
    description: "Para barbearias em crescimento que precisam gerenciar múltiplos talentos.",
    features: ["Tudo do Básico", "Multi-Barbeiros (Até 10)", "Gestão de Comissões", "Financeiro Avançado (DRE)", "Lembretes SMS e WhatsApp"],
    cta: "Assinar Profissional",
    featured: true,
  },
  {
    tier: "Soberania",
    name: "Elite",
    price: "R$397",
    period: "/mês",
    description: "O controle total para redes de franquias e barbearias de alto padrão.",
    features: ["Tudo do Profissional", "Gestão de Multi-Filiais", "Consultoria de Negócios Inclusa", "Customização White Label"],
    cta: "Falar com Consultor",
  },
];

const SignatureCheckoutPage = (): JSX.Element => {
  return (
    <div className="min-h-screen bg-[#f7f8fe] text-slate-900">
      <header className="flex h-16 items-center justify-between px-6 lg:px-8">
        <a href="/" className="text-xl font-semibold text-[#0b4bd8]">BarberOS</a>
        <nav className="hidden items-center gap-12 text-sm font-medium text-slate-400 md:flex">
          <a href="#funcionalidades" className="hover:text-slate-900">Funcionalidades</a>
          <a href="#planos" className="text-[#0b4bd8] hover:text-slate-900">Planos</a>
          <a href="#depoimentos" className="hover:text-slate-900">Depoimentos</a>
        </nav>
        <div className="flex items-center gap-4">
          <Bell className="h-5 w-5 text-slate-500" />
          <Link to="/cliente" className="rounded-xl bg-[#0b4bd8] px-4 py-2.5 text-sm font-semibold text-white">
            Área do Cliente
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-4 pb-16 pt-4 lg:px-0">
        <section className="text-center">
          <h1 className="mx-auto max-w-4xl text-4xl font-black leading-[0.95] tracking-tight text-slate-900 md:text-7xl">
            A Maestria da Barbearia
            <span className="block text-[#0b4bd8]">Elevada ao Digital.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-500">
            Escalabilidade, precisão financeira e gestão impecável de barbeiros. Escolha o plano que transformará sua barbearia em um império de estilo.
          </p>
        </section>

        <section id="planos" className="mt-10 grid gap-4 lg:grid-cols-[1fr_1.05fr_1fr]">
          {plans.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-2xl p-7 shadow-[0_18px_45px_rgba(15,23,42,0.06)] ${
                plan.featured ? "border border-[#0b4bd8] bg-white" : "bg-[#eef2ff]"
              }`}
            >
              {plan.featured ? (
                <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0b4bd8] px-4 py-1 text-xs font-bold uppercase tracking-[0.18em] text-white">
                  Mais procurado
                </div>
              ) : null}
              <div className="text-xs font-bold uppercase tracking-[0.25em] text-[#0b4bd8]">{plan.tier}</div>
              <h2 className="mt-2 text-2xl font-medium text-slate-700">{plan.name}</h2>
              <div className="mt-6 flex items-end gap-1">
                <div className="text-6xl font-black tracking-tight text-slate-900">{plan.price}</div>
                <span className="pb-3 text-base text-slate-500">{plan.period}</span>
              </div>
              <p className="mt-6 max-w-sm text-base leading-7 text-slate-500">{plan.description}</p>

              <ul className="mt-8 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-slate-700">
                    <Check className="h-5 w-5 rounded-full bg-[#0b4bd8] p-1 text-white" />
                    <span className="font-semibold">{feature}</span>
                  </li>
                ))}
                {"muted" in plan ? (
                  <li className="flex items-center gap-3 text-slate-400">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300">
                      <span className="h-3.5 w-0.5 rotate-45 bg-slate-400" />
                    </span>
                    <span>{plan.muted}</span>
                  </li>
                ) : null}
              </ul>

              <button
                type="button"
                className={`mt-10 w-full rounded-xl px-6 py-4 text-base font-bold transition ${
                  plan.featured ? "bg-[#0b4bd8] text-white shadow-lg shadow-blue-600/25" : "bg-[#dbe2ff] text-[#0b4bd8]"
                }`}
              >
                {plan.cta}
              </button>
            </article>
          ))}
        </section>

        <section id="funcionalidades" className="mt-20 text-center">
          <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#0b4bd8]">Diferenciais</div>
          <h2 className="mt-3 text-4xl font-medium text-slate-800">Por que escolher o BarberOS?</h2>

          <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_1fr_1fr]">
            <article className="group relative overflow-hidden rounded-2xl bg-slate-900 text-left text-white shadow-[0_18px_45px_rgba(15,23,42,0.15)]">
              <img
                src="https://images.unsplash.com/photo-1622288432450-277d0fef6d1e?auto=format&fit=crop&w=1200&q=80"
                alt="Barbearia"
                className="h-full min-h-[420px] w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
              <div className="absolute bottom-0 p-6">
                <h3 className="text-2xl font-medium">Visão 360° do Seu Negócio</h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-white/75">
                  Gerencie faturamento, estoque e performance de barbeiros em um único painel editorial.
                </p>
              </div>
            </article>

            <article className="rounded-2xl bg-[#0b4bd8] p-6 text-left text-white shadow-[0_18px_45px_rgba(11,75,216,0.22)]">
              <BarChart3 className="h-7 w-7" />
              <div className="mt-auto pt-36">
                <h3 className="text-xl font-medium">Dashboards Preditivos</h3>
                <p className="mt-2 text-sm leading-6 text-white/80">
                  Antecipe as baixas de movimento com inteligência de dados.
                </p>
              </div>
            </article>

            <article className="rounded-2xl bg-[#dce6ff] p-6 text-left text-slate-700 shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
              <QrCode className="h-7 w-7 text-[#0b4bd8]" />
              <div className="mt-auto pt-36">
                <h3 className="text-xl font-medium text-slate-800">Agendamento via QR</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Facilite a reserva direta da poltrona do cliente.
                </p>
              </div>
            </article>
          </div>

          <div className="mt-4 rounded-2xl bg-[#a9baff] p-6 text-left shadow-[0_18px_45px_rgba(15,23,42,0.06)]">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/30 p-4 text-[#0b4bd8]">
                <Shield className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-2xl font-medium text-slate-700">Dados Blindados</h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  Sua carteira de clientes e dados financeiros protegidos por criptografia de nível bancário.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-20 rounded-2xl bg-[#0b4bd8] px-6 py-12 text-center text-white shadow-[0_18px_45px_rgba(11,75,216,0.25)]">
          <h2 className="text-4xl font-black">Pronto para cortar a ineficiência?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/80">
            Junte-se a mais de 1.200 barbearias que já escalaram seus resultados com a precisão do BarberOS.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button className="rounded-xl bg-white px-6 py-3 font-bold text-[#0b4bd8]">
              Começar Teste Grátis de 14 Dias
            </button>
            <button className="rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white">
              Falar com Consultor
            </button>
          </div>
          <div className="mt-5 text-xs uppercase tracking-[0.25em] text-white/45">
            Sem cartão de crédito necessário para o teste.
          </div>
        </section>

        <footer className="py-16 text-center text-sm text-slate-400">
          <div>© 2024 BARBEROS. A ARTE DA PRECISÃO DIGITAL.</div>
          <div className="mt-4 flex flex-wrap justify-center gap-8 uppercase tracking-[0.18em]">
            <a href="/">Sobre</a>
            <a href="/">Termos de Uso</a>
            <a href="/">Privacidade</a>
            <a href="/">Suporte</a>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default SignatureCheckoutPage;
