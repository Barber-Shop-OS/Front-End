import { useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Store } from 'lucide-react';

import shop1 from '@/assets/figma/landing/shop-1.png';
import shop2 from '@/assets/figma/landing/shop-2.png';
import shop3 from '@/assets/figma/landing/shop-3.png';
import { ButtonLink, ErrorState } from '@/components/ui';
import { gsap, MOTION_OK } from '@/features/landing/motion/gsap';
import { useSearchBranchesQuery } from '@/features/public/api';
import { SectionHeading, ShopCard, ShopCardSkeleton } from '@/features/public/components';
import { bookingPath, shortLocation } from '@/features/public/utils';

const FEATURED_PHOTOS = [shop1, shop2, shop3];

/** Barbearias em destaque (busca pública real), com scroll reveal dos cartões. */
const FeaturedShops = () => {
  const root = useRef<HTMLElement>(null);
  const { data, isLoading, error, refetch } = useSearchBranchesQuery({ page: 1, pageSize: 3 });
  const items = data?.items.slice(0, 3) ?? [];

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.from('[data-reveal]', {
          y: 100,
          autoAlpha: 0,
          rotate: (i: number) => (i - 1) * 4,
          duration: 1.2,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%' },
        });
      });
    }, root);
    return () => ctx.revert();
  }, [isLoading, items.length]);

  return (
    <section ref={root} className="flex min-h-[calc(100svh-60px)] w-full items-center bg-surface-low px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="featured-title">
      <div className="mx-auto flex w-full max-w-[1232px] flex-col gap-10 sm:gap-12">
        <div data-reveal>
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
        </div>
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
              <div key={branch.id} data-reveal>
                <ShopCard
                  className="rounded-3xl shadow-none transition-transform duration-300 hover:-translate-y-2"
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
              </div>
            ))}
          </div>
        ) : (
          <div data-reveal className="flex flex-col items-center gap-4 rounded-3xl bg-white px-6 py-12 text-center">
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

export default FeaturedShops;
