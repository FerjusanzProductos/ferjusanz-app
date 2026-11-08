# Ferjusanz app

- `public/`: la app (lo que ven los usuarios).
- `src/worker.js` + `wrangler.jsonc`: publicación en Cloudflare (Worker `ferjusanz-productos`).
- `supabase/functions/harvey/`: función de Supabase del agente comercial Harvey.

Dirección: https://ferjusanz-productos.fernandosanzalba.workers.dev

Publicar (desde la sesión de Claude con las credenciales guardadas):
`CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx wrangler deploy`

## Copia de seguridad automática de Supabase (GitLab)
- `.gitlab-ci.yml` + `scripts/copia-supabase.sh`: cada noche GitLab hace una copia de la base de datos y la guarda 90 días (Build › Jobs › `copia_supabase` › Download artifacts).
- Necesita en Settings › CI/CD › Variables: `SUPABASE_DB_URL` (dirección "Session pooler" de Supabase › Connect, con `[YOUR-PASSWORD]` dentro) y `SUPABASE_DB_PASSWORD` (Masked).
- Programación en Build › Pipeline schedules. Los `git push` no lanzan nada.
- Archivos: `…-datos.dump` (para restaurar), `…-datos.sql.gz` (lo mismo en texto), `…-usuarios.dump` (inicios de sesión).
- Recuperar (lo haría Claude o un técnico): `pg_restore --no-owner --clean --if-exists -d "<dirección>" ferjusanz-AAAA-MM-DD-datos.dump`. Los PDF/fotos de Storage NO van en esta copia.
