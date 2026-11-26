import { useEffect, useRef } from "react";

interface LazyVideoProps {
  src: string;
  poster: string;
  className?: string;
  /** Rótulo para leitores de tela; vídeos decorativos ficam ocultos. */
  label?: string;
}

/**
 * Vídeo em loop, mudo, que só toca enquanto está visível (economiza CPU e
 * bateria). Sem movimento reduzido, fica parado no pôster.
 */
const LazyVideo = ({ src, poster, className = "", label }: LazyVideoProps): JSX.Element => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.15 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
};

export default LazyVideo;
