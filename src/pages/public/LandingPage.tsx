// Figma 1:252 "Landing Page": hero com busca + bento de fotos, barbearias em destaque (busca pública real),
// "Como funciona" em 3 passos e CTA final. Mobile-first; o bento vira faixa de fotos no celular.
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, CalendarDays, CircleCheck, Search, Store } from 'lucide-react';

import heroBarber from '@/assets/figma/landing/hero-barber.png';
import heroShop from '@/assets/figma/landing/hero-shop.png';
import shop1 from '@/assets/figma/landing/shop-1.png';
import shop2 from '@/assets/figma/landing/shop-2.png';
import shop3 from '@/assets/figma/landing/shop-3.png';
import { ButtonLink, ErrorState, buttonClass } from '@/components/ui';
import { useSearchBranchesQuery } from '@/features/public/api';
import { SectionHeading, ShopCard, ShopCardSkeleton } from '@/features/public/components';
import { bookingPath, shortLocation } from '@/features/public/utils';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/utils/cn';

const FEATURED_PHOTOS = [shop1, shop2, shop3];

const STEPS = [
  { number: '01', title: 'Escolha o local', text: 'Navegue pelas melhores barbearias e profissionais perto de você.', icon: Search, tone: 'bg-primary-100 text-primary-600', tilt: 'rotate-3' },
  { number: '02', title: 'Selecione o horário', text: 'Visualize a agenda em tempo real e escolha o que melhor se encaixa na sua rotina.', icon: CalendarDays, tone: 'bg-primary-100 text-primary-600', tilt: '-rotate-3' },
  { number: '03', title: 'Confirme o corte', text: 'Receba a confirmação instantânea e lembretes automáticos do seu agendamento.', icon: CircleCheck, tone: 'bg-tertiary-fixed text-tertiary', tilt: 'rotate-3' },
];

const HeroSearch = () => {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    navigate(q ? `/filiais?q=${encodeURIComponent(q)}` : '/filiais');
  };
  return (
    <form onSubmit={onSubmit} role="search" className="flex w-full max-w-xl flex-col gap-2 rounded-lg bg-white p-2 shadow-hero sm:flex-row sm:items-center">
      <label className="flex min-w-0 flex-1 items-center">
        <Search className="ml-3 h-[18px] w-[18px] shrink-0 text-ink-subtle" aria-hidden="true" />
        <span className="sr-only">Buscar por barbearia ou localização</span>
        <input
          type="search"
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Buscar por barbearia ou localização..."
          className="h-11 w-full min-w-0 bg-transparent px-3 text-base text-ink placeholder:text-ink-subtle focus:outline-none"
          maxLength={100}
        />
      </label>
      <button type="submit" className={buttonClass('primary', 'lg', 'shrink-0')}>
        Agendar agora
      </button>
    </form>
  );
};

const FeaturedShops = () => {
  const { data, isLoading, error, refetch } = useSearchBranchesQuery({ page: 1, pageSize: 3 });
  const items = data?.items.slice(0, 3) ?? [];

  return (
    <section className="bg-surface-low px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="featured-title">
      <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-10 sm:gap-12">
        <SectionHeading
            titleId="featured-title"
            eyebrow="Seleção BarberOS"
            title="Barbearias em destaque"
            action={
              <Link to="/filiais" className="inline-flex items-center gap-2 self-start text-base font-semibold text-primary-600 hover:underline sm:self-auto">
                Ver todas <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            }
          />
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8" role="status" aria-label="Carregando barbearias">
            {FEATURED_PHOTOS.map((photo) => (
              <ShopCardSkeleton key={photo} />
            ))}
          </div>
        ) : error ? (
          <ErrorState error={error} title="Não foi possível carregar as barbearias" onRetry={refetch} />
        ) : items.length ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((branch, index) => (
              <ShopCard
                key={branch.id}
                className="rounded-3xl shadow-none"
                to={`/b/${branch.barbershop.slug}/${branch.id}`}
                name={branch.barbershop.name}
                subtitle={branch.name !== branch.barbershop.name ? branch.name : null}
                location={shortLocation(branch.address)}
                cover={FEATURED_PHOTOS[index % FEATURED_PHOTOS.length]}
                logo={branch.barbershop.logo_url}
                actions={
                  <ButtonLink to={bookingPath(branch.barbershop.slug, { branchId: branch.id })} variant="secondary" size="lg" block>
                    Agendar agora
                  </ButtonLink>
                }
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-12 text-center">
            <Store className="h-10 w-10 text-primary-600" aria-hidden="true" />
            <p className="text-xl font-semibold text-ink">As primeiras barbearias estão chegando</p>
            <p className="max-w-md text-sm text-ink-variant">Tem uma barbearia? Cadastre-se e apareça aqui para clientes da sua região.</p>
            <ButtonLink to="/para-barbearias">Conhecer o BarberOS para barbearias</ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
};

const LandingPage = () => {
  usePageTitle('BarberOS — Agende seu corte em segundos', 'Encontre barbearias perto de você e agende online em segundos com o BarberOS.');

  return (
    <div className="flex flex-col items-center pb-16 sm:pb-32">
      {/* Hero */}
      <section className="mx-auto grid w-full max-w-[1280px] items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-12 lg:py-24">
        <div className="flex flex-col gap-6 sm:gap-8">
          <h1 className="text-[40px] font-bold leading-[44px] tracking-[-0.05em] text-ink sm:text-6xl sm:leading-[64px] xl:text-[72px] xl:leading-[72px]">
            Agende seu corte <span className="block text-primary-600">em segundos</span>
          </h1>
          <p className="max-w-[512px] text-lg leading-7 text-ink-variant sm:text-xl">
            A BarberOS conecta você aos melhores profissionais da cidade com a precisão que seu estilo exige.
          </p>
          <HeroSearch />
        </div>
        <div className="grid h-[320px] grid-cols-2 gap-3 sm:h-[420px] sm:gap-4 lg:h-[500px]">
          <div className="overflow-hidden rounded-3xl bg-surface-container">
            <img src={heroBarber} alt="Barbeiro finalizando um corte com máquina" className="h-full w-full object-cover" />
          </div>
          <div className="grid grid-rows-2 gap-3 sm:gap-4">
            <div className="overflow-hidden rounded-3xl bg-surface-high">
              <img src={heroShop} alt="Interior de uma barbearia com cadeiras clássicas" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-end rounded-3xl bg-primary-600 p-4 text-white sm:p-6">
              <p className="text-2xl leading-8 sm:text-4xl sm:leading-10">Diversos</p>
              <p className="text-[11px] uppercase leading-5 tracking-label opacity-80 sm:text-sm">Agendamentos diários</p>
            </div>
          </div>
        </div>
      </section>

      <div className="w-full">
        <FeaturedShops />
      </div>

      {/* Como funciona */}
      <section className="mx-auto flex w-full max-w-[1280px] flex-col gap-14 px-4 pb-20 pt-16 sm:gap-20 sm:px-6 sm:pb-36 sm:pt-24" aria-labelledby="how-title">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 id="how-title" className="text-[28px] font-bold leading-9 tracking-[-0.05em] text-ink sm:text-4xl sm:leading-10">
            Como funciona a plataforma?
          </h2>
          <p className="max-w-md text-base text-ink-variant">Experiência premium do início ao fim, em apenas três passos simples.</p>
        </div>
        <ol className="grid gap-14 md:grid-cols-3 md:gap-8 lg:gap-16">
          {STEPS.map(({ number, title, text, icon: Icon, tone, tilt }) => (
            <li key={number} className="relative flex flex-col items-center text-center">
              <span className="absolute -top-3.5 left-0 select-none text-6xl leading-[60px] text-surface-high md:-left-4" aria-hidden="true">
                {number}
              </span>
              <div className={cn('relative mb-8 flex h-20 w-20 items-center justify-center rounded-3xl', tone, tilt)}>
                <Icon className="h-7 w-7" aria-hidden="true" />
              </div>
              <h3 className="mb-4 text-xl font-semibold leading-7 text-ink">{title}</h3>
              <p className="max-w-xs text-sm leading-[22.75px] text-ink-variant">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA final */}
      <section className="w-full px-4 sm:px-6">
        <div className="relative mx-auto w-full max-w-[1232px] overflow-hidden rounded-[32px] bg-primary-600 px-6 py-14 sm:p-24">
          <div className="pointer-events-none absolute -right-32 -top-32 h-64 w-64 rounded-xl bg-white/10 blur-[32px]" aria-hidden="true" />
          <div className="pointer-events-none absolute -bottom-48 -left-48 h-96 w-96 rounded-xl bg-primary-400/20 blur-[32px]" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-8 text-center">
            <h2 className="text-4xl font-bold leading-[44px] tracking-[-0.05em] text-white sm:text-6xl sm:leading-[60px]">Pronto para transformar seu visual?</h2>
            <ButtonLink to="/filiais" variant="white" className="h-auto px-12 py-5 text-lg">
              Agendar agora
            </ButtonLink>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
