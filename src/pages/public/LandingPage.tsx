// Landing (Figma 1:252 reimaginada com movimento): hero com palco fixo e vídeo, experiência com vídeo
// controlado pelo scroll, barbearias em destaque (busca pública real), "Como funciona" em rolagem horizontal,
// chamada para donos com paralaxe e CTA final com vídeo. Cada seção ocupa uma tela; com
// prefers-reduced-motion tudo vira layout estático. Mídias em src/features/landing/media.ts.
import { useLayoutEffect, useRef } from 'react';

import BenefitsSection from '@/features/landing/components/BenefitsSection';
import CtaBanner from '@/features/landing/components/CtaBanner';
import FeaturedShops from '@/features/landing/components/FeaturedShops';
import ForShopsSection from '@/features/landing/components/ForShopsSection';
import HowItWorks from '@/features/landing/components/HowItWorks';
import LandingHero from '@/features/landing/components/LandingHero';
import { gsap, MOTION_OK, ScrollTrigger } from '@/features/landing/motion/gsap';
import { useSmoothScroll } from '@/features/landing/motion/useSmoothScroll';
import { usePageTitle } from '@/hooks/usePageTitle';

const LandingPage = () => {
  usePageTitle('BarberOS — Agende seu corte em segundos', 'Encontre barbearias perto de você e agende online em segundos com o BarberOS.');
  useSmoothScroll();
  const bar = useRef<HTMLDivElement>(null);

  // Barra de progresso da página + recálculo das posições quando fotos e vídeos carregam.
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.matchMedia().add(MOTION_OK, () => {
        gsap.to(bar.current, { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
      });
    });
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const timer = window.setTimeout(refresh, 1500);
    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(timer);
      ctx.revert();
    };
  }, []);

  return (
    <div className="flex w-full flex-col overflow-x-clip bg-black">
      <div ref={bar} aria-hidden="true" className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-primary-500" />
      <LandingHero />
      <BenefitsSection />
      <FeaturedShops />
      <HowItWorks />
      <ForShopsSection />
      <CtaBanner />
    </div>
  );
};

export default LandingPage;
