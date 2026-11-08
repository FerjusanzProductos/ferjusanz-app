# Ferjusanz app

- `public/`: la app (lo que ven los usuarios).
- `src/worker.js` + `wrangler.jsonc`: publicación en Cloudflare (Worker `ferjusanz-productos`).
- `supabase/functions/harvey/`: función de Supabase del agente comercial Harvey.

Dirección: https://ferjusanz-productos.fernandosanzalba.workers.dev

Publicar (desde la sesión de Claude con las credenciales guardadas):
`CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx wrangler deploy`
