/**
 * Avatar local (SVG em data URI) com as iniciais — usado quando o profissional
 * não tem foto. Não chama serviços externos.
 */
export const initialsAvatar = (name: string): string => {
  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || '?';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="#dce6ff"/><text x="50%" y="50%" dy=".35em" text-anchor="middle" font-family="sans-serif" font-size="64" font-weight="700" fill="#0b4bd8">${initials}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};
