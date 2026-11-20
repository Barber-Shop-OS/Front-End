// Utilitários da página de conta: rótulo legível do dispositivo da sessão e download do JSON da LGPD.

const BROWSERS: [RegExp, string][] = [
  [/Edg\//, 'Edge'],
  [/OPR\/|Opera/, 'Opera'],
  [/SamsungBrowser/, 'Samsung Internet'],
  [/Firefox\//, 'Firefox'],
  [/Chrome\//, 'Chrome'],
  [/Safari\//, 'Safari'],
  [/okhttp|Expo|ReactNative/i, 'App BarberOS'],
];

const SYSTEMS: [RegExp, string][] = [
  [/Android/, 'Android'],
  [/iPhone|iPad|iPod/, 'iOS'],
  [/Windows/, 'Windows'],
  [/Mac OS X|Macintosh/, 'macOS'],
  [/CrOS/, 'ChromeOS'],
  [/Linux/, 'Linux'],
];

/** "Chrome no Windows" a partir do User-Agent (ou "Dispositivo desconhecido"). */
export const describeUserAgent = (userAgent: string | null | undefined): string => {
  if (!userAgent) return 'Dispositivo desconhecido';
  const browser = BROWSERS.find(([pattern]) => pattern.test(userAgent))?.[1];
  const system = SYSTEMS.find(([pattern]) => pattern.test(userAgent))?.[1];
  if (browser && system) return `${browser} no ${system}`;
  return browser || system || 'Dispositivo desconhecido';
};

export const isMobileUserAgent = (userAgent: string | null | undefined): boolean => !!userAgent && /Android|iPhone|iPad|iPod|Mobile/i.test(userAgent);

/** Baixa um objeto como arquivo .json (exportação LGPD). */
export const downloadJson = (data: unknown, filename: string): void => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
