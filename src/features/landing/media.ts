/**
 * Mídias da landing.
 * Vídeos: Mixkit (licença gratuita Mixkit), reencodados e servidos de /public/media.
 * Fotos: Unsplash (licença Unsplash), servidas pelo CDN do Unsplash.
 */
const unsplash = (id: string, width = 1600): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=75`;

const video = (name: string) => ({ src: `/media/${name}.mp4`, poster: `/media/${name}.jpg` });

export const videos = {
  heroNeon: video("hero-neon"),
  scrubMaquina: video("scrub-maquina"),
  tesouras: video("ferramentas-tesouras"),
  toalha: video("ferramentas-toalha"),
  clienteCadeira: video("cliente-cadeira"),
  clienteCapa: video("cliente-capa"),
  barbeiroDetalhe: video("barbeiro-detalhe"),
};

export const photos = {
  navalhaNuca: unsplash("1599351431202-1e0f0137899a", 900),
  degrade: unsplash("1622286342621-4bd786c2447c", 900),
  kitFerramentas: unsplash("1621605815971-fbc98d665033", 1200),
  barbeiroSecador: unsplash("1605497788044-5a32c7078486", 1200),
  cadeiraCouro: unsplash("1512690459411-b9245aed614b", 900),
  maquinaLateral: unsplash("1593702275687-f8b402bf1fb5", 900),
  salao: unsplash("1503951914875-452162b0f3f1", 2000),
  tesouraBarba: unsplash("1517832606299-7ae9b720a186", 900),
  espumaBarba: unsplash("1532710093739-9470acff878f", 900),
};
