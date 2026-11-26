import { useLayoutEffect, useRef } from "react";
import { Link } from "react-router-dom";

import LazyVideo from "@/features/landing/components/LazyVideo";
import { videos } from "@/features/landing/media";
import { gsap, MOTION_OK } from "@/features/landing/motion/gsap";

const WORDS = "Corte · Barba · Degradê · Navalha · Pigmentação · Sobrancelha · ";

/** Chamada final em tela cheia: vídeo de fundo, faixas de texto ligadas ao scroll e botão que cresce. */
const CtaBanner = (): JSX.Element => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo("[data-row='a']", { xPercent: 0 }, { xPercent: -35, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-row='b']", { xPercent: -35 }, { xPercent: 0, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-cvideo]", { clipPath: "inset(12% 10% 12% 10% round 40px)" }, {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "top top", scrub: true },
        });
        gsap.from("[data-cta]", {
          scale: 0.6,
          autoAlpha: 0,
          duration: 1.2,
          ease: "elastic.out(1, 0.6)",
          scrollTrigger: { trigger: root.current, start: "top 40%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative flex h-[calc(100svh-60px)] w-full flex-col items-center justify-center overflow-hidden bg-black text-white">
      <div data-cvideo className="absolute inset-0">
        <LazyVideo src={videos.tesouras.src} poster={videos.tesouras.poster} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[12%] flex flex-col gap-2 font-display text-[12vw] uppercase leading-none">
        <p data-row="a" className="whitespace-nowrap text-white/15">{WORDS.repeat(3)}</p>
        <p data-row="b" className="whitespace-nowrap text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.35)]">
          {WORDS.repeat(3)}
        </p>
      </div>

      <div data-cta className="relative z-10 mt-[18vh] max-w-3xl px-6 text-center">
        <h2 className="font-display text-5xl uppercase leading-[0.95] md:text-8xl">
          Pronto para transformar seu visual?
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-white/75">
          Encontre uma barbearia perto de você e agende em segundos.
        </p>
        <Link
          to="/filiais"
          className="mt-10 inline-block rounded-full bg-white px-10 py-4 text-sm font-bold text-primary-600 shadow-[0_0_60px_rgba(255,255,255,0.35)] transition-transform hover:scale-110"
        >
          Agendar agora
        </Link>
      </div>
    </section>
  );
};

export default CtaBanner;
