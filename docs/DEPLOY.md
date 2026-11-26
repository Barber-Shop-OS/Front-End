# Deploy do front-end na Cloudflare (ambiente de teste)

O front é um SPA estático servido por **Cloudflare Workers (Static Assets)**, configurado em `wrangler.json`:

- `assets.directory = ./dist` (saída do `vite build`);
- `not_found_handling = single-page-application` (abrir `/login`, `/b/slug` etc. direto no navegador não dá 404);
- `public/_headers` → CSP e cabeçalhos de segurança (FE-40 / SEC-17).

## Variáveis de build

| Variável | Obrigatória | Exemplo |
|---|---|---|
| `VITE_API_BASE_URL` | **sim** (o build falha sem ela) | `https://barberos-api.up.railway.app` |
| `VITE_GOOGLE_AUTH_ENABLED` | não (padrão `false`) | só `true` quando o backend tiver OAuth Google |
| `VITE_GOOGLE_CLIENT_ID` | só com Google ligado | — |

`VITE_USE_MOCK_AUTH` é ignorada no build de produção.

## Opção A — Git conectado (recomendado)

1. Cloudflare Dashboard → **Workers & Pages → Create → Import a repository** → `Barber-Shop-OS/Front-End`.
2. Branch: a branch de teste. **Build command:** `npm run build` · **Deploy command:** `npx wrangler deploy`.
3. Em **Settings → Build → Variables**, crie `VITE_API_BASE_URL` com a URL pública da API.
4. Deploy. A URL fica `https://barberos-web.<sua-conta>.workers.dev`.

## Opção B — pela linha de comando

```bash
npm ci
```

```bash
VITE_API_BASE_URL=https://SUA-API npm run build
```

```bash
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npm run deploy
```

O token precisa da permissão **Workers Scripts: Edit**.

## Depois do deploy

- Na API, coloque a URL do front em `CORS_ORIGINS` e em `APP_URL` (links dos e-mails).
- Quando a API tiver domínio fixo, troque `connect-src 'self' https:` em `public/_headers` pelo domínio exato da API.
