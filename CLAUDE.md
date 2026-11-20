# FERJUSANZ — instrucciones permanentes para Claude

Proyecto: app de **FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.** (mayorista de fruta, verdura, patatas, huevos, setas, champiñones y legumbres en Mercamadrid).
Dueño y quien decide: **Fernando Sanz**.

## Cómo hablar con Fernando
- **Quién es quién** (Fernando, 18/11/2026): quien escribe en el chat es **Fernando Sanz hijo, «Tito»**. «Fernando» o «Fer» en las hojas de caja, Golden u otros papeles es **Fernando Sanz padre**, salvo que ponga «Tito» o «hijo». No decirle «tú» a lo que hizo el padre.
- En español, paso a paso, sin tecnicismos: **no es programador** y trabaja desde el **móvil** (Android, Chrome).
- Respuestas cortas. Cuando haya que elegir, dar una recomendación clara.
- **Nunca** pedir contraseñas, tokens ni claves por el chat. Si hace falta una, usar el formulario seguro de credenciales.

## Todo desde el móvil (instrucción permanente de Fernando, 13/11/2026)
Fernando trabaja **solo desde su Samsung** (Android, Chrome). Su ordenador tiene Windows 7 y **no quiere depender de él**. Cuando algo no se pueda hacer desde la app de Claude:
1. Dar el **enlace directo** a la página exacta donde hacerlo desde Chrome.
2. Decir si hace falta activar **«Sitio para ordenador»** en Chrome (menú ⋮ arriba a la derecha → «Sitio para ordenador»).
3. Explicar **paso a paso** dónde pulsar y qué hacer, de forma sencilla.
4. Para permisos, herramientas, integraciones o entrar en GitLab, Cloudflare, Supabase o Claude Code: **buscar primero cómo hacerlo desde el navegador del móvil** (o hacerlo Claude con las herramientas del entorno).
5. **No pedirle usar un ordenador** sin haber comprobado antes las alternativas desde Android.
6. Si no hay forma desde Chrome, decirlo claro y proponer otra alternativa que funcione en el Samsung.
7. **No inventar enlaces** ni decir que algo se aprueba desde Chrome sin haberlo comprobado (si no se ha podido comprobar, decirlo).
8. **Permisos bloqueados en el móvil** (Fernando, 16/11/2026): antes de pedir un permiso o una clave, comprobar si se puede hacer solo (p. ej. Gemini ya tiene la clave puesta: `generativelanguage.googleapis.com` con `x-goog-api-key: proxy-injected`; vale para resumir vídeos de YouTube). Si aun así hay que pedirlo y en el móvil sale «Esta solicitud no se puede aprobar desde tu teléfono», poner siempre el enlace https://claude.ai/code para abrir la sesión en Chrome y aprobarlo desde ahí.
9. Siguen las medidas de seguridad: nada destructivo sin su autorización expresa. Publicar y el SQL, ver «Autorización permanente».

## Antes de tocar nada (en este orden)
1. `docs/ESTADO_ACTUAL.md`: versión publicada, ramas y cómo se publica.
2. `docs/REGLAS_INTERNAS.md`: reglas de productos, IVA y albaranes. **Obligatorias.**
3. `docs/PENDIENTES.md`: qué está pedido y qué no.
4. Según la tarea: `docs/FUNCIONALIDADES.md`, `docs/OPERATIVA.md`, `docs/HISTORIAL.md` y `supabase/functions/harvey/LEEME.md`.

## Dónde está todo
- **Mapa de Claude en la empresa** (una carpeta por área, con qué hace Claude en cada una): `claude/LEEME.md`. Textos para empezar chats: `claude/08-textos-para-empezar-chats/`.
- **Repositorio maestro: GitLab** `https://gitlab.com/ferjusanz-productos/ferjusanz-app.git` (rama `main`).
- **GitHub** `FerjusanzProductos/ferjusanz-app` es **solo copia de seguridad**: después de cada cambio en GitLab `main`, enviar lo mismo a GitHub `main`. Nunca trabajar al revés.
- App: `public/` (sobre todo `public/index.html`). Publicación: `src/worker.js` y `wrangler.jsonc` (Cloudflare).
- Base de datos: Supabase, proyecto `hvydnjaswdexttogsyen`. Cambios en `supabase/migrations/` y funciones en `supabase/functions/`.

## Autorización permanente (Fernando, 13/11/2026: «Te autorizo todo, así que no me preguntes» · «Pues sí. Como siempre»)
- **No preguntar** para publicar en la app normal ni para lanzar el SQL en la base real o de pruebas: se hace sin esperar a «Autorizo publicar» ni a «Autorizo». Antes, siempre: probarlo en PRUEBAS y comprobarlo uno mismo (`scripts/claude-entra.mjs`). Después, contárselo en corto (qué se publicó, versión y SQL lanzado).
- **Siguen necesitando que Fernando lo diga expresamente** (lo irreversible o lo que habla en nombre de la empresa): borrar datos reales, cambiar precios, tocar facturas o cobros ya hechos, cambiar permisos de usuarios, enviar algo de verdad a Hacienda, firmar la declaración responsable (nunca Claude) y mandar mensajes a clientes.
- Las reglas 3, 6 y 7 de abajo quedan así.

## Reglas de trabajo (no saltarse)
1. **Una tarea por sesión.**
2. Cambios **primero en la app de PRUEBAS** (naranja, Worker `ferjusanz-pruebas`). Enseñárselo a Fernando.
3. Publicar en la app normal (Worker `ferjusanz-productos`) después de probar en PRUEBAS, sin preguntar (autorización permanente, arriba).
4. Cada publicación: subir la versión en `public/sw.js` (`ferjusanz-vNNN`), con número **distinto** del de pruebas.
5. La app está en pruebas: **no crear pedidos ni datos reales para probar**; usar el **Modo prácticas**.
   **Todavía NO se usa de verdad** (el trabajo real sigue en Golden Soft): los pedidos, previstos y cobros de la app son de prueba. No sacar conclusiones ni mensajes a clientes de esos datos. Lo real: historial de Golden (`golden_*`), clientes, productos, contactos (prospectos) y facturas de proveedores.
6. Nada de borrar datos, cambiar precios o tocar facturas, cobros o permisos sin confirmación expresa.
7. Antes de cambiar la base de datos, enseñar el SQL y explicar qué hace.
   Los cambios de Supabase ya no piden botón «Aprobar» (permitidos en `.claude/settings.json` para poder hacerlo desde el móvil). Con la autorización permanente se lanza sin esperar; decir en el resumen qué SQL se lanzó y qué hace (salvo lo de la lista de «Siguen necesitando»).
   **Cómo lanzarlo (Fernando, 13/11/2026: «siempre usa esos caminos»)**: NO con `apply_migration`/`execute_sql` del conector Supabase para escribir (piden un «Aprobar» que no le llega al móvil y caducan). Usar la API de Supabase, que tiene la clave puesta por el entorno:
   `curl -sS -X POST https://api.supabase.com/v1/projects/<ref>/database/query -H "Authorization: Bearer proxy-injected" -H "Content-Type: application/json" --data @consulta.json` (con `{"query": "<SQL>"}`). Real `hvydnjaswdexttogsyen`, pruebas `pbeuxbwbpmlanbhhnpgy`. Después, comprobar con otra consulta que ha quedado bien. Ni pedirle a Fernando que lo pegue.
8. **Al terminar cada tarea**: actualizar `docs/HISTORIAL.md` (qué se hizo y por qué), `docs/PENDIENTES.md` y, si cambia la versión, `docs/ESTADO_ACTUAL.md`.
   **Pendientes fijados (Fernando, 14/11/2026: «Cada vez que hagamos algo, quítalo»)**: `docs/PENDIENTES.md` solo lleva lo que **falta**. Lo terminado se **borra** de ahí (no se tacha) y va a HISTORIAL; lo nuevo que pida se añade. Después: `node scripts/pendientes-html.mjs` y publicar `docs/pendientes.html` con el Artifact en la página fijada de Fernando, pasando `url: https://claude.ai/artifact/5nRfWBHbCCBR6EBRJRxwND` (leerla antes con `action: "read"`; no crear otra). Las reglas nuevas de productos o negocio van en `docs/REGLAS_INTERNAS.md`.
   **Página fijada «Comercial Ferjusanz»** (Fernando, 17/11/2026): https://claude.ai/artifact/WomsAtCVCe1cqaQCwqd9Wh. La actualizan solas las tareas «Comercial del día» y «Plan comercial de la semana» (`NODE_USE_ENV_PROXY=1 node scripts/comercial-html.mjs` y publicar `docs/comercial.html` en esa URL, leyéndola antes; no crear otra).
   **Página fijada «Panel Ferjusanz»** (Fernando, 18/11/2026): https://claude.ai/artifact/4k7wxTzvttkdBF6xU7AWak. Solo datos reales. Es el panel de toda la empresa; el comercial es «Comercial Ferjusanz». Las dos las refresca cada día la tarea «Paneles Ferjusanz (diario)» (`NODE_USE_ENV_PROXY=1 node scripts/panel-html.mjs` y publicar `docs/panel.html` en esa URL, leyéndola antes; no crear otra).
   **Otras dos páginas fijadas que se mantienen igual** (Fernando, 15/11/2026): «Plan Google y redes» (`docs/PLAN_MARKETING.md`) y «Reunión con Jorge» (`docs/PREGUNTAS_JORGE.md`). Cuando cambie algo de marketing o de Jorge, actualizarlas siguiendo «Cómo se mantiene» al final de `docs/PLAN_MARKETING.md` (también las tarjetas «solo para Fernando» de la app).
9. Guardar en GitLab y copiar a GitHub. Nunca dejar trabajo sin guardar.

## Comprobar los cambios tú mismo (Fernando, 13/11/2026: «quiero que siempre puedas entrar en la aplicación»)
Después de subir algo a PRUEBAS, **entra tú y compruébalo** antes de pedirle nada a Fernando:
`NODE_USE_ENV_PROXY=1 node --no-warnings scripts/claude-entra.mjs [usuario@pruebas.invalid] [captura.png]`
- Entra en la app naranja con un usuario de pruebas (por defecto `fernando@pruebas.invalid`, admin) sin contraseñas: pide a Supabase un enlace de un solo uso. Solo funciona con la base de PRUEBAS.
- Para hacer clic y recorrer pantallas, copia el script y sigue con Playwright desde la misma página. Mira la captura antes de decir que funciona.
- Ya está permitido en el entorno: las dos apps (`*.workers.dev`), `cdn.jsdelivr.net` y la llave de Supabase que abre **las dos bases** (real y pruebas). La API de Supabase ya vale también para la base de pruebas.

## Publicar (cuando esté autorizado)
`CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=<ver ESTADO_ACTUAL> npx -y wrangler@4 deploy`
Después, comprobar la versión publicada (ver `docs/ESTADO_ACTUAL.md`).

## Herramientas de Claude Code del proyecto
Ver la skill `kit-ferjusanz` (`.claude/skills/kit-ferjusanz/SKILL.md`): ponytail, agent-skills, graphify, security-audit, /watch y los conectores playwright, firecrawl, perplexity y posthog.
