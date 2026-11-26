import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "./gsap";

/**
 * Scroll suave (Lenis) sincronizado com o ScrollTrigger do GSAP.
 * Desligado quando o usuário prefere movimento reduzido.
 */
export const useSmoothScroll = (): void => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ duration: 1.15, anchors: { offset: -72 } });
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);
};
