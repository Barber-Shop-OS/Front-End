import { useLayoutEffect, useRef, useState } from "react";
import { BellRing, CalendarCheck, Clock } from "lucide-react";
import { Link } from "react-router-dom";

import HeroSearch from "@/features/landing/components/HeroSearch";

import { photos, videos } from "@/features/landing/media";
import { gsap, MOTION_OK } from "@/features/landing/motion/gsap";

const BIG_WORDS = ["BARBER", "OS"];

/** Fotos flutuantes em volta da janela de vídeo: posição + profundidade (paralaxe). */
const FLOATING = [
  { src: photos.navalhaNuca, cls: "left-[4%] top-[14%] w-[18vw] max-w-[260px] rotate-[-8deg]", depth: 1.4 },
  { src: photos.degrade, cls: "right-[5%] top-[10%] w-[15vw] max-w-[220px] rotate-[7deg]", depth: 0.9 },
  { src: photos.cadeiraCouro, cls: "left-[10%] bottom-[8%] w-[14vw] max-w-[200px] rotate-[5deg]", depth: 1.1 },
  { src: photos.maquinaLateral, cls: "right-[9%] bottom-[12%] w-[19vw] max-w-[280px] rotate-[-6deg]", depth: 1.6 },
  { src: photos.espumaBarba, cls: "left-[42%] top-[3%] w-[10vw] max-w-[150px] rotate-[3deg]", depth: 0.7 },
];

const STATS = [
  { icon: Clock, value: "Tempo real", label: "agenda das barbearias ao vivo" },
  { icon: CalendarCheck, value: "Na hora", label: "confirmação do agendamento" },
  { icon: BellRing, value: "Lembretes", label: "automáticos antes do corte" },
];

/**
 * Hero com palco fixo (sticky) de 400vh:
 * 1. letras gigantes "BARBER OS" sobre uma janela de vídeo, cercadas de fotos;
 * 2. ao rolar, as letras explodem, as fotos voam (paralaxe) e o vídeo toma a tela;
 * 3. a mensagem e os botões sobem por máscara e os números entram;
 * 4. o palco encolhe e escurece enquanto a próxima seção sobe.
 */
const LandingHero = (): JSX.Element => {
  const root = useRef<HTMLElement>(null);
  // Com movimento reduzido o vídeo de fundo fica parado no pôster.
  const [reduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();

      mm.add(MOTION_OK, () => {
        const chars = gsap.utils.toArray<HTMLElement>("[data-char]");
        const floating = gsap.utils.toArray<HTMLElement>("[data-float]");

        // Estado inicial: janela de vídeo pequena no centro, conteúdo escondido.
        gsap.set("[data-frame]", { clipPath: "inset(30% 33% 30% 33% round 28px)" });
        gsap.set("[data-video]", { scale: 1.35 });
        gsap.set("[data-shade]", { opacity: 0 });
        gsap.set("[data-line]", { yPercent: 115 });
        gsap.set("[data-fade]", { autoAlpha: 0, y: 30 });
        gsap.set("[data-stat]", { autoAlpha: 0, scale: 0.6, y: 60 });

        // Entrada ao carregar a página.
        gsap
          .timeline({ defaults: { ease: "expo.out" } })
          .from("[data-frame]", { clipPath: "inset(50% 50% 50% 50% round 28px)", duration: 1.6 })
          .from(chars, { yPercent: 120, rotate: 8, duration: 1.2, stagger: 0.06 }, 0.15)
          .from(floating, { autoAlpha: 0, scale: 0.7, y: 80, duration: 1.4, stagger: 0.08 }, 0.4)
          .from("[data-hint]", { autoAlpha: 0, y: 20, duration: 0.8 }, 1);

        // Linha do tempo ligada ao scroll (palco fixo).
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: root.current, start: "top 60px", end: "bottom bottom", scrub: 1 },
        });

        tl.to("[data-hint]", { autoAlpha: 0, duration: 0.05 }, 0)
          .to("[data-frame]", { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 0.35, ease: "power2.inOut" }, 0)
          .to("[data-video]", { scale: 1, duration: 0.35 }, 0)
          .to(
            chars,
            {
              x: () => gsap.utils.random(-70, 70) + "vw",
              y: () => gsap.utils.random(-60, 60) + "vh",
              rotate: () => gsap.utils.random(-120, 120),
              scale: () => gsap.utils.random(0.4, 2.2),
              autoAlpha: 0,
              duration: 0.3,
              stagger: 0.012,
              ease: "power2.in",
            },
            0.02,
          );

        floating.forEach((el) => {
          const depth = Number(el.dataset.depth ?? 1);
          tl.to(el, { y: -110 * depth + "vh", rotate: gsap.utils.random(-25, 25), scale: 1 + depth * 0.25, duration: 0.4 }, 0);
        });

        tl.to("[data-shade]", { opacity: 1, duration: 0.15 }, 0.3)
          .to("[data-line]", { yPercent: 0, duration: 0.15, stagger: 0.04, ease: "power3.out" }, 0.36)
          .to("[data-fade]", { autoAlpha: 1, y: 0, duration: 0.12, stagger: 0.04 }, 0.46)
          .to("[data-stat]", { autoAlpha: 1, scale: 1, y: 0, duration: 0.12, stagger: 0.05, ease: "back.out(2)" }, 0.56)
          .to("[data-stage]", { scale: 0.88, borderRadius: 48, filter: "brightness(0.45)", duration: 0.18, ease: "power1.in" }, 0.82);

        // Fotos acompanham o mouse com profundidades diferentes.
        const movers = floating.map((el) => ({
          depth: Number(el.dataset.depth ?? 1),
          x: gsap.quickTo(el, "xPercent", { duration: 0.8, ease: "power3" }),
          y: gsap.quickTo(el, "yPercent", { duration: 0.8, ease: "power3" }),
        }));
        const onMove = (event: PointerEvent) => {
          const nx = event.clientX / window.innerWidth - 0.5;
          const ny = event.clientY / window.innerHeight - 0.5;
          movers.forEach((m) => {
            m.x(nx * 30 * m.depth);
            m.y(ny * 30 * m.depth);
          });
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
      });
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative h-[400vh] w-full bg-black text-white motion-reduce:h-[calc(100svh-60px)]">
      <div data-stage className="sticky top-[60px] h-[calc(100svh-60px)] overflow-hidden will-change-transform">
        {/* Janela de vídeo que vira tela cheia */}
        <div data-frame className="absolute inset-0 will-change-[clip-path]">
          <video
            data-video
            className="h-full w-full object-cover"
            src={videos.heroNeon.src}
            poster={videos.heroNeon.poster}
            autoPlay={!reduced}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <div
            data-shade
            className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30"
          />
        </div>

        {/* Letras gigantes (decorativas) */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center font-display leading-[0.82] tracking-tight mix-blend-difference motion-reduce:hidden"
        >
          {BIG_WORDS.map((word) => (
            <div key={word} className="flex overflow-hidden text-[22vw] md:text-[17vw]">
              {word.split("").map((char, index) => (
                <span key={`${word}-${index}`} data-char className="inline-block will-change-transform">
                  {char}
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* Fotos flutuantes */}
        {FLOATING.map((item) => (
          <div
            key={item.src}
            data-float
            data-depth={item.depth}
            className={`pointer-events-none absolute hidden overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10 md:block motion-reduce:!hidden ${item.cls}`}
          >
            <img src={item.src} alt="" className="aspect-[4/5] h-full w-full object-cover" loading="eager" />
          </div>
        ))}

        {/* Mensagem principal */}
        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-14 pt-28 lg:px-16 lg:pb-20">
          <div className="max-w-5xl md:max-w-[58vw]">
            <span
              data-fade
              className="inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] backdrop-blur"
            >
              Agendamento online de barbearias
            </span>

            <h1 className="mt-6 font-display text-[13vw] uppercase leading-[0.9] md:text-[6vw]">
              <span className="-my-[0.12em] block overflow-hidden py-[0.12em]">
                <span data-line className="block">Agende seu corte</span>
              </span>
              <span className="-my-[0.12em] block overflow-hidden py-[0.12em]">
                <span data-line className="block text-primary-300">em segundos</span>
              </span>
            </h1>

            <p data-fade className="mt-6 max-w-xl text-base text-white/75 md:text-lg">
              A BarberOS conecta você aos melhores profissionais da cidade com a
              precisão que seu estilo exige.
            </p>

            <div data-fade className="mt-8 flex flex-col gap-4">
              <HeroSearch />
              <Link to="/para-barbearias" className="text-sm font-semibold text-white/80 underline-offset-4 hover:text-white hover:underline">
                Tem uma barbearia? Conheça o BarberOS para barbearias →
              </Link>
            </div>
          </div>

          <div className="mt-10 grid max-w-3xl grid-cols-3 gap-3 md:absolute md:bottom-20 md:right-16 md:mt-0 md:w-[min(30vw,22rem)] md:grid-cols-1">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div
                key={label}
                data-stat
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md"
              >
                <Icon className="hidden h-6 w-6 shrink-0 text-primary-300 sm:block" />
                <div>
                  <p className="font-display text-xl uppercase md:text-2xl">{value}</p>
                  <p className="text-[11px] text-white/70 md:text-xs">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Indicador de rolagem */}
        <div
          data-hint
          className="pointer-events-none absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-white/70 motion-reduce:hidden"
        >
          Role
          <span className="h-10 w-px animate-pulse bg-white/60" />
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
