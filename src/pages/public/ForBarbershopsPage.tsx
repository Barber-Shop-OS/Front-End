// /para-barbearias — página de vendas para donos (sem frame no Figma). Segue o estilo da Landing (1:252) e usa
// os cards de plano da "Página de Assinatura" (1:44) como referência; planos e preços reais de GET /plans.
import { ArrowRight, BarChart3, CalendarDays, Check, Globe, MapPinned, Bell, Users } from 'lucide-react';

import heroBarber from '@/assets/figma/landing/hero-barber.png';
import heroShop from '@/assets/figma/landing/hero-shop.png';
import { ButtonLink, ErrorState, Skeleton } from '@/components/ui';
import { SectionHeading } from '@/features/public/components';
import { planFeatureLabel, planLimitLabel, sortPlans } from '@/features/public/utils';
import { useListPlansQuery } from '@/features/workspace/api';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/utils/cn';
import { formatCents } from '@/utils/format';

const TRIAL_DAYS = 14;
/** O trial do back-end libera os recursos do Profissional (Back-End/src/shared/plans.js — TRIAL_PLAN_CODE). */
const TRIAL_PLAN = 'profissional';
const SIGNUP = '/cadastro-barbearia';

const BENEFITS = [
  { icon: Globe, title: 'Página pública e agendamento 24h', text: 'Seus clientes encontram a barbearia, escolhem serviço, barbeiro e horário — sem ligação.' },
  { icon: CalendarDays, title: 'Agenda por barbeiro', text: 'Horários, folgas e bloqueios de cada profissional em tempo real, sem conflito de horário.' },
  { icon: Bell, title: 'Lembretes automáticos', text: 'Confirmações e lembretes por e-mail reduzem as faltas sem esforço da equipe.' },
  { icon: Users, title: 'Clientes e equipe', text: 'Histórico de atendimentos, cadastro de clientes e acesso para barbeiros e atendimento.' },
  { icon: BarChart3, title: 'Financeiro claro', text: 'Pagamentos presenciais, rendimentos por barbeiro e relatórios por período.' },
  { icon: MapPinned, title: 'Pronto para crescer', text: 'Várias filiais com gerentes e um painel consolidado da rede.' },
];

const PlansSection = () => {
  const { data, isLoading, error, refetch } = useListPlansQuery();
  const plans = sortPlans(data ?? []);

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-3" role="status" aria-label="Carregando planos">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-[480px] w-full rounded-3xl" />
        ))}
      </div>
    );
  }
  if (error) return <ErrorState error={error} title="Não foi possível carregar os planos" onRetry={refetch} />;
  if (!plans.length) return <p className="text-center text-ink-variant">Planos indisponíveis no momento.</p>;

  return (
    <ul className="grid items-stretch gap-6 lg:grid-cols-3">
      {plans.map((plan) => {
        const featured = plan.code === TRIAL_PLAN;
        return (
          <li
            key={plan.code}
            className={cn(
              'relative flex flex-col gap-6 rounded-3xl p-6 sm:p-8',
              featured ? 'bg-primary-600 text-white shadow-primary lg:-my-4 lg:py-12' : 'bg-white text-ink shadow-card'
            )}
          >
            {featured ? (
              <span className="self-start rounded-xl bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-label text-white">Incluso no teste grátis</span>
            ) : null}
            <div className="flex flex-col gap-2">
              <h3 className={cn('text-sm font-bold uppercase tracking-label', featured ? 'text-primary-100' : 'text-primary-600')}>{plan.name}</h3>
              <p className="flex items-baseline gap-1">
                <span className="text-4xl font-black tracking-[-0.05em]">{formatCents(plan.price_cents)}</span>
                <span className={cn('text-sm', featured ? 'text-primary-100' : 'text-ink-variant')}>/mês</span>
              </p>
              <p className={cn('text-sm', featured ? 'text-primary-100' : 'text-ink-variant')}>
                {planLimitLabel(plan.limits.branches, 'filial', 'filiais', 'Filiais ilimitadas')} · {planLimitLabel(plan.limits.barbers, 'barbeiro', 'barbeiros', 'Barbeiros ilimitados')}
              </p>
            </div>
            <ul className="flex flex-1 flex-col gap-3 text-sm">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className={cn('mt-0.5 h-4 w-4 shrink-0', featured ? 'text-white' : 'text-primary-600')} aria-hidden="true" />
                  <span>{planFeatureLabel(feature)}</span>
                </li>
              ))}
            </ul>
            <ButtonLink to={`${SIGNUP}?plano=${plan.code}`} variant={featured ? 'white' : 'secondary'} size="lg" block>
              Começar teste grátis
            </ButtonLink>
          </li>
        );
      })}
    </ul>
  );
};

const ForBarbershopsPage = () => {
  usePageTitle('BarberOS para barbearias — agenda online e gestão', `Agenda online, equipe, clientes e financeiro da sua barbearia em um só lugar. Teste grátis por ${TRIAL_DAYS} dias.`);

  return (
    <div className="flex flex-col items-center pb-16 sm:pb-32">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="flex flex-col gap-6 sm:gap-8">
          <p className="text-sm font-bold uppercase tracking-label text-primary-600">Para donos de barbearia</p>
          <h1 className="text-[40px] font-bold leading-[44px] tracking-[-0.05em] text-ink sm:text-6xl sm:leading-[64px]">
            Sua barbearia com a agenda <span className="text-primary-600">sempre cheia</span>
          </h1>
          <p className="max-w-[512px] text-lg leading-7 text-ink-variant sm:text-xl">
            Agendamento online, gestão da equipe, clientes e financeiro em um só lugar. Comece em minutos, sem cartão de crédito.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <ButtonLink to={SIGNUP} size="lg" className="h-14 px-8 shadow-primary">
              Testar grátis por {TRIAL_DAYS} dias <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </ButtonLink>
            <a href="#planos" className="inline-flex h-14 items-center justify-center rounded-lg bg-surface-container px-8 text-base font-semibold text-primary-600 hover:bg-surface-high">
              Ver planos
            </a>
          </div>
        </div>
        <div className="grid h-[320px] grid-cols-2 gap-3 sm:h-[420px] sm:gap-4 lg:h-[480px]">
          <div className="grid grid-rows-2 gap-3 sm:gap-4">
            <div className="flex flex-col justify-end rounded-3xl bg-primary-600 p-4 text-white sm:p-6">
              <p className="text-2xl leading-8 sm:text-4xl sm:leading-10">{TRIAL_DAYS} dias</p>
              <p className="text-[11px] uppercase leading-5 tracking-label opacity-80 sm:text-sm">de teste grátis</p>
            </div>
            <div className="overflow-hidden rounded-3xl bg-surface-high">
              <img src={heroShop} alt="Interior de uma barbearia" className="h-full w-full object-cover" />
            </div>
          </div>
          <div className="overflow-hidden rounded-3xl bg-surface-container">
            <img src={heroBarber} alt="Barbeiro atendendo um cliente" className="h-full w-full object-cover" />
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="w-full bg-surface-low px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="benefits-title">
        <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-10 sm:gap-12">
          <SectionHeading titleId="benefits-title" eyebrow="Tudo em um só lugar" title="Feito para a rotina da barbearia" />
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex flex-col gap-4 rounded-3xl bg-white p-6 sm:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <h3 className="text-xl font-semibold leading-7 text-ink">{title}</h3>
                <p className="text-sm leading-[22.75px] text-ink-variant">{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="mx-auto flex w-full max-w-[1232px] scroll-mt-20 flex-col gap-10 px-4 py-16 sm:gap-16 sm:px-6 sm:py-24" aria-labelledby="plans-title">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 id="plans-title" className="text-[28px] font-bold leading-9 tracking-[-0.05em] text-ink sm:text-4xl sm:leading-10">
            Planos mensais, simples e transparentes
          </h2>
          <p className="max-w-lg text-base text-ink-variant">
            Teste todos os recursos do Profissional por {TRIAL_DAYS} dias. Depois, escolha o plano ideal para o tamanho da sua barbearia.
          </p>
        </div>
        <PlansSection />
      </section>

      {/* CTA final */}
      <section className="w-full px-4 sm:px-6">
        <div className="relative mx-auto w-full max-w-[1232px] overflow-hidden rounded-[32px] bg-primary-600 px-6 py-14 sm:p-24">
          <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-xl bg-white/10 blur-[32px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-48 -left-48 h-96 w-96 rounded-xl bg-primary-400/20 blur-[32px]" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-8 text-center">
            <h2 className="text-4xl font-bold leading-[44px] tracking-[-0.05em] text-white sm:text-6xl sm:leading-[60px]">Pronto para lotar sua agenda?</h2>
            <ButtonLink to={SIGNUP} variant="white" className="h-auto px-12 py-5 text-lg">
              Cadastrar minha barbearia
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ForBarbershopsPage;
