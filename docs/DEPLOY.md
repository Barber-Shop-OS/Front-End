# Deploy do front-end

O front é um SPA estático (Vite). Há configuração para dois provedores:

| Provedor | Arquivo | Cabeçalhos de segurança | Fallback de rotas |
|---|---|---|---|
| Cloudflare Workers (produção recomendada) | `wrangler.json` | `dist/_headers`, gerado no build por `build/securityHeaders.ts` com a origem exata da API | `not_found_handling: single-page-application` |
| Vercel (ambiente de teste) | `vercel.json` | estáticos no `vercel.json` (`connect-src` aceita qualquer `https:`, porque a origem da API só é conhecida no build) | `rewrites` para `/index.html` |

Ao mudar a CSP em `build/securityHeaders.ts`, replique no `vercel.json`.

## Variáveis de build

| Variável | Obrigatória | Observação |
|---|---|---|
| `VITE_API_BASE_URL` | sim | origem da API, ex. `https://barberos-api.up.railway.app` |
| `VITE_IMAGES_ORIGIN` | não | bucket de imagens quando não é `https:` |
| `VITE_GA_MEASUREMENT_ID` | não | GA4 (carrega só após consentimento) |

## Vercel

1. O app da Vercel precisa estar instalado na organização Barber-Shop-OS no GitHub.
2. Importar `Barber-Shop-OS/Front-End`, framework Vite, build `npm run build`, saída `dist`.
3. Definir `VITE_API_BASE_URL` em Production e Preview.

## Cloudflare

```bash
VITE_API_BASE_URL=https://SUA-API npm run build
```

```bash
npm run deploy
```

Depois do deploy, coloque a URL do front em `CORS_ORIGINS` e `APP_URL` na API.
