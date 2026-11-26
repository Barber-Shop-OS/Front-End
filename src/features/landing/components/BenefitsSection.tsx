import { useLayoutEffect, useRef, useState } from "react";
import { BellRing, CalendarCheck, MapPin, Smartphone, type LucideIcon } from "lucide-react";

import { photos, videos } from "@/features/landing/media";
import { gsap, MOTION_OK, ScrollTrigger } from "@/features/landing/motion/gsap";

interface Benefit {
  icon: LucideIcon;
  title: string;
  description: string;
}

const benefits: Benefit[] = [
  {
    icon: MapPin,
    title: "Encontre perto de você",
    description: "Busque barbearias e profissionais da sua região, com endereço, serviços e preços.",
  },
  {
    icon: CalendarCheck,
    title: "Horários livres em tempo real",
    description: "Veja a agenda de cada barbeiro e escolha o horário que encaixa na sua rotina.",
  },
  {
    icon: Smartphone,
    title: "Confirmação na hora",
    description: "Agende pelo celular, sem ligar nem mandar mensagem, e receba a confirmação na hora.",
  },
  {
    icon: BellRing,
    title: "Lembretes antes do corte",
    description: "Receba lembretes automáticos e remarque ou cancele quando precisar.",
  },
];

/**
 * "Vídeo controlado pelo scroll": o palco fica fixo por 400vh, o vídeo do
 * celular avança quadro a quadro conforme a rolagem e os benefícios trocam
 * a cada 25% do caminho. Fotos ao fundo andam em velocidades diferentes.
 */
const BenefitsSection = (): JSX.Element => {
  const root = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const video = videoRef.current;
        let target = 0;
        let frame = 0;

        // Busca suave do quadro (evita pedir seek a cada pixel rolado).
        const seek = () => {
          frame = 0;
          if (video && video.duration && Math.abs(video.currentTime - target) > 0.01) {
            video.currentTime = target;
          }
        };

        ScrollTrigger.create({
          trigger: root.current,
          start: "top 60px",
          end: "bottom bottom",
          onUpdate: (self) => {
            if (video?.duration) target = self.progress * (video.duration - 0.05);
            if (!frame) frame = requestAnimationFrame(seek);
            setActive(Math.min(benefits.length - 1, Math.floor(self.progress * benefits.length)));
            gsap.set("[data-progress]", { scaleY: self.progress });
          },
        });

        gsap.to("[data-phone]", {
          rotate: -4,
          y: -40,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 60px", end: "bottom bottom", scrub: true },
        });

        gsap.utils.toArray<HTMLElement>("[data-par]").forEach((el) => {
          const speed = Number(el.dataset.par);
          gsap.fromTo(
            el,
            { yPercent: 40 * speed },
            {
              yPercent: -60 * speed,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        gsap.from("[data-ghost]", {
          xPercent: 30,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });

        return () => {
          if (frame) cancelAnimationFrame(frame);
        };
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="experiencia"
      className="relative h-[400vh] w-full bg-neutral-950 text-white motion-reduce:h-auto"
    >
      <div className="sticky top-[60px] flex h-[calc(100svh-60px)] items-center overflow-hidden motion-reduce:relative motion-reduce:h-auto motion-reduce:py-24">
        {/* Palavra fantasma ao fundo */}
        <p
          data-ghost
          aria-hidden
          className="pointer-events-none absolute -left-[5vw] top-1/2 -translate-y-1/2 whitespace-nowrap font-display text-[28vw] uppercase leading-none text-white/[0.04]"
        >
          No detalhe
        </p>

        {/* Fotos com paralaxe */}
        <img data-par="1.2" src={photos.tesouraBarba} alt="" className="absolute right-[4%] top-[8%] hidden w-[14vw] max-w-[220px] rounded-2xl opacity-60 lg:block motion-reduce:!hidden" />
        <img data-par="0.6" src={photos.kitFerramentas} alt="" className="absolute bottom-[6%] left-[44%] hidden w-[16vw] max-w-[240px] rounded-2xl opacity-40 lg:block motion-reduce:!hidden" />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-5 px-6 lg:gap-10 lg:grid-cols-[1fr_auto_1fr] lg:px-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary-300">A experiência BarberOS</span>
            <h2 className="mt-3 font-display text-4xl uppercase leading-[0.95] md:text-7xl">
              Do celular para a cadeira
            </h2>

            <div className="mt-5 flex gap-6 lg:mt-10">
              {/* Barra de progresso */}
              <div className="relative w-px bg-white/15 motion-reduce:hidden">
                <span data-progress className="absolute inset-0 origin-top scale-y-0 bg-primary-500" />
              </div>

              <ol className="flex flex-col gap-2 lg:gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  const isActive = index === active;
                  return (
                    <li
                      key={benefit.title}
                      className={`flex gap-4 transition-all duration-500 motion-reduce:opacity-100 ${
                        isActive ? "translate-x-2 opacity-100" : "opacity-30"
                      }`}
                    >
                      <span
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-500 ${
                          isActive ? "bg-primary-500" : "bg-white/10"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-bold">{benefit.title}</h3>
                        <p
                          className={`max-w-sm overflow-hidden text-sm text-white/70 transition-all duration-500 motion-reduce:max-h-40 ${
                            isActive ? "max-h-24" : "max-h-0 lg:max-h-24"
                          }`}
                        >
                          {benefit.description}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Celular com o vídeo controlado pelo scroll */}
          <div data-phone className="mx-auto h-[36vh] max-w-[80vw] lg:h-[min(72vh,640px)] aspect-[9/19]">
            <div className="relative h-full w-full overflow-hidden rounded-[2.75rem] border-[10px] border-neutral-800 bg-black shadow-[0_40px_120px_rgba(37,99,235,0.35)]">
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                src={videos.scrubMaquina.src}
                poster={videos.scrubMaquina.poster}
                muted
                playsInline
                preload="auto"
                aria-hidden
              />
              <div className="absolute left-1/2 top-2 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
              <div className="absolute inset-x-2 bottom-3 rounded-xl bg-white/90 p-2 lg:inset-x-3 lg:bottom-4 lg:rounded-2xl lg:p-3 text-slate-900 shadow-lg backdrop-blur">
                <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">Próximo horário</p>
                <p className="text-xs font-bold lg:text-sm">Degradê + barba · 14:30</p>
              </div>
            </div>
          </div>

          <p className="hidden text-right font-display text-[9rem] leading-none text-white/10 lg:block" aria-hidden>
            0{active + 1}
          </p>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
