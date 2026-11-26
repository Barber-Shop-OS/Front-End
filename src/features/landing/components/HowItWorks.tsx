import { useLayoutEffect, useRef } from "react";
import { CalendarDays, CircleCheck, Search, type LucideIcon } from "lucide-react";

import LazyVideo from "@/features/landing/components/LazyVideo";
import { photos, videos } from "@/features/landing/media";
import { gsap, MOTION_OK } from "@/features/landing/motion/gsap";

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  media: { kind: "video"; src: string; poster: string } | { kind: "photo"; src: string };
}

const steps: Step[] = [
  {
    number: "01",
    icon: Search,
    title: "Escolha o local",
    description: "Navegue pelas melhores barbearias e profissionais perto de você.",
    media: { kind: "video", ...videos.clienteCadeira },
  },
  {
    number: "02",
    icon: CalendarDays,
    title: "Selecione o horário",
    description: "Visualize a agenda em tempo real e escolha o que melhor se encaixa na sua rotina.",
    media: { kind: "photo", src: photos.barbeiroSecador },
  },
  {
    number: "03",
    icon: CircleCheck,
    title: "Confirme o corte",
    description: "Receba a confirmação instantânea e lembretes automáticos do seu agendamento.",
    media: { kind: "video", ...videos.barbeiroDetalhe },
  },
];

/**
 * Rolagem horizontal controlada: a seção fica presa (pin) e a rolagem
 * vertical move a trilha de painéis para o lado. As mídias dentro de cada
 * painel têm paralaxe própria (containerAnimation).
 */
const HowItWorks = (): JSX.Element => {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const el = track.current;
        if (!el) return;
        const distance = () => el.scrollWidth - window.innerWidth;

        const move = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top 60px",
            end: () => "+=" + distance(),
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => gsap.set("[data-hbar]", { scaleX: self.progress }),
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-hpar]").forEach((media) => {
          gsap.fromTo(
            media,
            { xPercent: -18 },
            {
              xPercent: 18,
              ease: "none",
              scrollTrigger: { trigger: media.parentElement, containerAnimation: move, start: "left right", end: "right left", scrub: true },
            },
          );
        });

        gsap.utils.toArray<HTMLElement>("[data-hnum]").forEach((num) => {
          gsap.from(num, {
            yPercent: 60,
            autoAlpha: 0,
            ease: "power3.out",
            scrollTrigger: { trigger: num, containerAnimation: move, start: "left 85%", end: "left 40%", scrub: true },
          });
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="como-funciona"
      className="relative h-[calc(100svh-60px)] w-full overflow-hidden bg-[#f4f1ea] text-neutral-950 motion-reduce:h-auto motion-reduce:overflow-x-auto"
    >
      <div ref={track} className="flex h-full w-max items-stretch will-change-transform motion-reduce:h-[100svh]">
        {/* Abertura */}
        <div className="flex w-screen shrink-0 flex-col justify-center px-6 lg:w-[60vw] lg:px-16">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary-600">Como funciona</span>
          <h2 className="mt-4 font-display text-[16vw] uppercase leading-[0.85] lg:text-[9vw]">
            Como funciona a plataforma?
          </h2>
          <p className="mt-6 max-w-md text-neutral-600">
            Experiência premium do início ao fim, em apenas três passos simples.
          </p>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.3em] text-neutral-400 motion-reduce:hidden">
            Continue rolando →
          </p>
        </div>

        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <article key={step.number} className="flex w-screen shrink-0 items-center gap-8 px-6 lg:w-[85vw] lg:gap-14 lg:px-12">
              <div className="relative h-[62vh] w-[45%] shrink-0 overflow-hidden rounded-[2rem] lg:h-[78vh] lg:w-[42%]">
                {step.media.kind === "video" ? (
                  <div data-hpar className="absolute inset-y-0 -left-[15%] w-[130%]">
                    <LazyVideo src={step.media.src} poster={step.media.poster} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <img data-hpar src={step.media.src} alt="" className="absolute inset-y-0 -left-[15%] h-full w-[130%] max-w-none object-cover" />
                )}
              </div>
              <div className="relative">
                <span data-hnum aria-hidden className="block font-display text-[30vw] leading-[0.8] text-transparent [-webkit-text-stroke:2px_rgb(10_10_10)] lg:text-[15vw]">
                  {step.number}
                </span>
                <span className="mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 font-display text-4xl uppercase lg:text-6xl">{step.title}</h3>
                <p className="mt-3 max-w-sm text-neutral-600">{step.description}</p>
              </div>
            </article>
          );
        })}

        {/* Mosaico final */}
        <div className="grid w-screen shrink-0 grid-cols-2 grid-rows-2 gap-4 p-6 lg:w-[70vw] lg:p-12">
          <div className="relative row-span-2 overflow-hidden rounded-[2rem]">
            <LazyVideo src={videos.clienteCapa.src} poster={videos.clienteCapa.poster} className="h-full w-full object-cover" />
          </div>
          <img src={photos.navalhaNuca} alt="" className="h-full w-full rounded-[2rem] object-cover" />
          <div className="relative overflow-hidden rounded-[2rem]">
            <LazyVideo src={videos.tesouras.src} poster={videos.tesouras.poster} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>

      {/* Progresso horizontal */}
      <div className="absolute inset-x-6 bottom-6 h-1 overflow-hidden rounded-full bg-neutral-300 lg:inset-x-16 motion-reduce:hidden">
        <span data-hbar className="block h-full origin-left scale-x-0 bg-primary-600" />
      </div>
    </section>
  );
};

export default HowItWorks;
