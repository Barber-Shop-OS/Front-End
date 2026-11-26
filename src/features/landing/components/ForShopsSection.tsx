import { useLayoutEffect, useRef } from "react";
import { CalendarDays, LineChart, MessageCircleHeart, Smartphone } from "lucide-react";

import { ButtonLink } from "@/components/ui";
import { photos } from "@/features/landing/media";
import { gsap, MOTION_OK } from "@/features/landing/motion/gsap";

const FEATURES = [
  { icon: CalendarDays, title: "Agenda inteligente", text: "Horários, barbeiros e cadeiras em tempo real, sem conflitos." },
  { icon: Smartphone, title: "Agendamento online", text: "Seus clientes marcam pelo celular, 24 horas por dia." },
  { icon: LineChart, title: "Financeiro simplificado", text: "Faturamento, comissões e relatórios automáticos." },
  { icon: MessageCircleHeart, title: "Fidelização", text: "Lembretes automáticos e histórico de cada cliente." },
];

/** Chamada para donos de barbearia, com paralaxe em camadas (fundo lento, fotos rápidas, título de lado). */
const ForShopsSection = (): JSX.Element => {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const scrub = { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true };
        gsap.fromTo("[data-bg]", { yPercent: -12, scale: 1.15 }, { yPercent: 12, scale: 1, ease: "none", scrollTrigger: scrub });
        gsap.fromTo("[data-title]", { xPercent: 15 }, { xPercent: -25, ease: "none", scrollTrigger: scrub });
        gsap.utils.toArray<HTMLElement>("[data-layer]").forEach((el) => {
          const speed = Number(el.dataset.layer);
          gsap.fromTo(el, { y: 300 * speed }, { y: -300 * speed, ease: "none", scrollTrigger: scrub });
        });
        gsap.from("[data-card]", {
          y: 120,
          rotateX: -35,
          autoAlpha: 0,
          stagger: 0.12,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-cards]", start: "top 80%" },
        });
      });
    }, root);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative flex min-h-[calc(100svh-60px)] w-full items-center overflow-hidden bg-black py-24 text-white">
      <img data-bg src={photos.salao} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black/40 to-black" />

      <img data-layer="0.8" src={photos.espumaBarba} alt="" className="absolute left-[3%] top-[18%] hidden w-[13vw] max-w-[200px] rotate-[-6deg] rounded-2xl shadow-2xl lg:block motion-reduce:!hidden" />
      <img data-layer="1.3" src={photos.degrade} alt="" className="absolute bottom-[10%] right-[4%] hidden w-[12vw] max-w-[190px] rotate-[8deg] rounded-2xl shadow-2xl lg:block motion-reduce:!hidden" />

      <div className="relative w-full">
        <p data-title aria-hidden className="whitespace-nowrap font-display text-[18vw] uppercase leading-none text-white/10">
          Para barbearias · Para barbearias
        </p>

        <div className="mx-auto -mt-[8vw] max-w-6xl px-6 lg:px-12">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-primary-300">Tem uma barbearia?</span>
          <h2 className="mt-3 max-w-2xl font-display text-5xl uppercase leading-[0.95] md:text-6xl">
            Gerencie sua barbearia sem complicação
          </h2>

          <div data-cards className="mt-12 grid gap-5 [perspective:1200px] sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <div key={title} data-card className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-500">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="text-sm text-white/75">{text}</p>
              </div>
            ))}
          </div>

          <ButtonLink to="/para-barbearias" variant="white" size="lg" className="mt-10">
            Conhecer o BarberOS para barbearias
          </ButtonLink>
        </div>
      </div>
    </section>
  );
};

export default ForShopsSection;
