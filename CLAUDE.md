# FERJUSANZ — instrucciones permanentes para Claude

Proyecto: app de **FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.** (mayorista de fruta, verdura, patatas y huevos en Mercamadrid).
Dueño y quien decide: **Fernando Sanz**.

## Cómo hablar con Fernando
- En español, paso a paso, sin tecnicismos: **no es programador** y trabaja desde el **móvil** (Android, Chrome).
- Respuestas cortas. Cuando haya que elegir, dar una recomendación clara.
- **Nunca** pedir contraseñas, tokens ni claves por el chat. Si hace falta una, usar el formulario seguro de credenciales.

## Antes de tocar nada (en este orden)
1. `docs/ESTADO_ACTUAL.md`: versión publicada, ramas y cómo se publica.
2. `docs/REGLAS_INTERNAS.md`: reglas de productos, IVA y albaranes. **Obligatorias.**
3. `docs/PENDIENTES.md`: qué está pedido y qué no.
4. Según la tarea: `docs/FUNCIONALIDADES.md`, `docs/OPERATIVA.md`, `docs/HISTORIAL.md` y `supabase/functions/harvey/LEEME.md`.

## Dónde está todo
- **Repositorio maestro: GitLab** `https://gitlab.com/ferjusanz-productos/ferjusanz-app.git` (rama `main`).
- **GitHub** `FerjusanzProductos/ferjusanz-app` es **solo copia de seguridad**: después de cada cambio en GitLab `main`, enviar lo mismo a GitHub `main`. Nunca trabajar al revés.
- App: `public/` (sobre todo `public/index.html`). Publicación: `src/worker.js` y `wrangler.jsonc` (Cloudflare).
- Base de datos: Supabase, proyecto `hvydnjaswdexttogsyen`. Cambios en `supabase/migrations/` y funciones en `supabase/functions/`.

## Reglas de trabajo (no saltarse)
1. **Una tarea por sesión.**
2. Cambios **primero en la app de PRUEBAS** (naranja, Worker `ferjusanz-pruebas`). Enseñárselo a Fernando.
3. Publicar en la app normal (Worker `ferjusanz-productos`) **solo** cuando Fernando escriba «Autorizo publicar».
4. Cada publicación: subir la versión en `public/sw.js` (`ferjusanz-vNNN`), con número **distinto** del de pruebas.
5. La app está en pruebas: **no crear pedidos ni datos reales para probar**; usar el **Modo prácticas**.
6. Nada de borrar datos, cambiar precios o tocar facturas, cobros o permisos sin confirmación expresa.
7. Antes de cambiar la base de datos, enseñar el SQL y explicar qué hace.
8. **Al terminar cada tarea**: actualizar `docs/HISTORIAL.md` (qué se hizo y por qué), `docs/PENDIENTES.md` y, si cambia la versión, `docs/ESTADO_ACTUAL.md`. Las reglas nuevas de productos o negocio van en `docs/REGLAS_INTERNAS.md`.
9. Guardar en GitLab y copiar a GitHub. Nunca dejar trabajo sin guardar.

## Publicar (cuando esté autorizado)
`CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=<ver ESTADO_ACTUAL> npx -y wrangler@4 deploy`
Después, comprobar la versión publicada (ver `docs/ESTADO_ACTUAL.md`).

## Herramientas de Claude Code del proyecto
Ver la skill `kit-ferjusanz` (`.claude/skills/kit-ferjusanz/SKILL.md`): ponytail, agent-skills, graphify, security-audit, /watch y los conectores playwright, firecrawl, perplexity y posthog.
