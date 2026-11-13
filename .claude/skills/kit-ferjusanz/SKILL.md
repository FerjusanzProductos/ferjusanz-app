---
name: kit-ferjusanz
description: Kit de herramientas de Ferjusanz para Claude Code. Úsala al empezar cualquier tarea en este proyecto, cuando haya que elegir herramienta (plugins, conectores MCP, skills), cuando el usuario pida instalar un plugin/skill/conector visto en redes, ver un vídeo, auditar seguridad, investigar en la web, automatizar el navegador o consultar analítica. También para comprobar que el kit está bien instalado (/kit-ferjusanz check).
---

# Kit Ferjusanz

Este proyecto trae un kit fijo de plugins, skills y conectores. Aplícalo SIEMPRE:
antes de resolver una tarea, elige la herramienta del kit que encaje (tabla de abajo)
en lugar de improvisar.

## 1. Qué hay instalado y cuándo usarlo

| Herramienta | Tipo | Dónde está | Úsala cuando… |
|---|---|---|---|
| **ponytail** | plugin | `ponytail@ponytail` (DietrichGebert/ponytail) | Siempre activo: escribir el mínimo código, reutilizar lo existente, stdlib y APIs nativas antes que dependencias. `/ponytail` cambia el modo. |
| **agent-skills** | plugin | `agent-skills@addy-agent-skills` (addyosmani/agent-skills) | Ciclo completo: spec → plan → build → verify → review → ship. Para features nuevas, refactors grandes y revisiones. |
| **graphify** | skill | `.claude/skills/graphify` | Preguntas de arquitectura o "dónde está X" en un código grande (`index.html` pesa >1 MB). `/graphify .` genera `graphify-out/`; si existe, consúltalo antes de hacer grep. |
| **security-audit** | skill | `.claude/skills/security-audit` (cloudflare/security-audit-skill) | "Audita la seguridad", antes de publicar, al tocar Supabase/RLS, auth, pagos o datos de clientes. |
| **watch** | plugin | `watch@claude-video` (bradautomates/claude-video) | Ver un vídeo (YouTube, TikTok, Instagram, local): `/watch <url> pregunta`. Con `GEMINI_API_KEY`, Gemini ve el vídeo entero. |
| **codex** | plugin | `codex@openai-codex` (openai/codex-plugin-cc) | Segunda opinión de Codex (OpenAI): `/codex:review` (revisión), `/codex:adversarial-review` (pone a prueba el diseño), `/codex:rescue` (le delega una tarea). Requiere cuenta de ChatGPT (vale la gratuita) o clave de OpenAI y Node 18+; la primera vez `/codex:setup` y `!codex login`. |
| **superpowers** | plugin | `superpowers@superpowers-marketplace` (obra/superpowers) | Método de trabajo: lluvia de ideas, plan, TDD, depuración sistemática, verificar antes de dar algo por hecho. Se solapa con agent-skills: usa la que encaje, sin duplicar pasos. |
| **impeccable** | plugin | `impeccable@impeccable` (pbakaus/impeccable) | Diseño de pantallas: `/impeccable audit`, `critique`, `polish`… al tocar el aspecto de `public/index.html`. Respeta los colores y estilo actuales de la app (móvil, botones grandes). |
| **shorts** | skill | `.claude/skills/shorts` (AgriciDaniel/claude-shorts, adaptada a la nube) | Sacar clips cortos verticales con subtítulos de un vídeo largo (YouTube/archivo) para TikTok, Reels o Shorts. Primero `bash .claude/skills/shorts/preparar-nube.sh`. |
| **taste** | plugin | `taste-skill@taste-skill` (Leonxlnx/taste-skill) | Diseño de **webs de empresa** de nivel profesional (fotos reales, una sección por pantalla, revisión en navegador). Para la web nueva de Ferjusanz (`docs/PLAN_WEB.md`); para pantallas de la app, mejor impeccable. Necesita Node 22+ y Chromium. |
| **playwright** | MCP | `.mcp.json` | Abrir la app, hacer clic, capturas, probar flujos (PWA, `sw.js`, `manifest`). |
| **firecrawl** | MCP | `.mcp.json` | Scraping/extracción de webs concretas, crawl de un sitio, convertir páginas a markdown. |
| **perplexity** | MCP | `.mcp.json` | Investigación con respuestas citadas, preguntas de actualidad, comparar opciones. |
| **posthog** | MCP | `.mcp.json` | Métricas de producto: eventos, embudos, insights, feature flags. |
| **context7** | MCP | `.mcp.json` (sin clave) | Documentación al día de librerías (Supabase, Cloudflare Workers, Playwright…) antes de escribir código con ellas. |

Reglas de elección rápidas:
- Código con una librería externa → context7 (documentación actual, no de memoria).
- **Composio** (visto en redes, 11/11/2026): NO instalado. Da a la IA acceso a muchas cuentas (Gmail, Drive…) a través de un tercero; ya tenemos Gmail/Drive/Supabase conectados directamente. Solo si Fernando lo pide para algo concreto.
- **Claude-Mem** (thedotmack/claude-mem, visto en redes, 12/11/2026): NO instalado en el proyecto. Guarda todo lo que hace Claude (también datos de clientes que salgan en pantalla) en el ordenador, con un programa en segundo plano y estadísticas de uso activadas por defecto; en la nube se pierde al cerrar la sesión. La memoria del proyecto ya son `CLAUDE.md` y `docs/`. Solo en el ordenador de Fernando si lo pide (`npx claude-mem telemetry disable`).
- **Vídeo «6 skills de Claude que necesitas probar»** (Migue Baena IA, 12/11/2026): superpowers (ya activo) y claude-mem (no, ver arriba). **/review** y **/ultrareview** vienen de serie en Claude Code: usar `/review` (o la skill `code-review`) antes de pedir «Autorizo publicar» un cambio grande; `/ultrareview` es de pago aparte y solo para cambios muy delicados (cobros, permisos). **skill-creator** ya está disponible: usarlo cuando Fernando quiera convertir una forma de trabajar en skill. **GSD** (get-shit-done) NO: hace lo mismo que agent-skills/superpowers y se pisarían. **context-mode** NO por ahora: ahorra memoria de la conversación pero mete un programa propio que intercepta todas las herramientas; revisar solo si las sesiones se quedan cortas de memoria con `index.html`.
- **Small Business** (plugin oficial de **Anthropic**, Anthropic Directory, repo anthropics/knowledge-work-plugins; reel de @el_hipster en Instagram, 13/11/2026): NO instalado en el proyecto. 44 habilidades para pequeñas empresas (facturas de proveedores `ap-processor`, reclamar cobros `invoice-chase`, caja `cash-flow-snapshot`, recuperar clientes `reactivate`, prospectos `lead-finder`/`call-list`, `monday-brief`, inventario `restock`…). Pide tu aprobación en todo lo que toca dinero o clientes. Casi todos sus conectores son de EE. UU. (QuickBooks, Gusto, Stripe…), que Ferjusanz no usa. Es seguro de probar en la app de Claude (Code → Personalización → Plugins → «small business» → Agregar), pero no conectar cuentas nuevas. Muchas cosas ya las hacen la app, Harvey, `/resumen-correo` y el Seguimiento diario; lo útil sería **reactivate** (clientes que dejaron de comprar, con el historial de Golden) y **lead-finder** (prospectos), solo para preparar listas o borradores que Fernando revisa.
- **find-skills** (vercel-labs/skills, vídeo de @xabatzz en TikTok, 12/11/2026): NO instalado. Busca skills en el catálogo público skills.sh y las instala (`npx skills add …`). Claude ya busca, revisa y apunta aquí cada herramienta que se ve en redes, y Claude Code trae su propio buscador de skills. Instala skills de cualquier autor, que pueden ejecutar programas: en este proyecto, cada skill se revisa antes (sección 3). En el ordenador de Fernando, solo para curiosear, y eligiendo solo skills muy descargadas y de autores conocidos.
- **OpenReply** (diwenne/openreply, vídeo de @mago.jp en TikTok, 12/11/2026): NO instalado. Alternativa gratis a ManyChat: responde por mensaje privado de Instagram a quien comenta una palabra clave. Los clientes de Ferjusanz piden por WhatsApp y teléfono, no por Instagram. Necesita servidor propio siempre encendido (PostgreSQL, Redis) y una app de Meta revisada, o un proveedor de pago (Zernio). Revisar solo si la empresa empieza a captar clientes con vídeos en Instagram. Usar el repo original, no las copias.
- **«Agente que trabaja a las 8am»** (@adrianalvareztech en TikTok, 12/11/2026): son las **tareas programadas** de Claude Code (en la nube; en el ordenador, `/schedule`). YA lo usamos: «Seguimiento diario Ferjusanz» (7:03, ver `docs/HISTORIAL.md`) y `harvey_tarifas_diarias`. Para una nueva: Fernando la pide en el chat con hora y qué debe hacer; siempre «solo leer y avisar», nunca enviar ni cambiar datos sola.
- **«Claude 24/7: WhatsApp, correo, competencia y Excel»** (@pablo.maxmaxdata en TikTok, 12/11/2026): nada que instalar; son funciones de Claude (tareas programadas, conectores y Cowork en el ordenador). Para Ferjusanz: **responder WhatsApp solo, NO** (Fernando revisa y envía cada mensaje; Harvey ya prepara borradores); correo y Excel, sí cuando Fernando lo pida, como tarea programada de «solo leer y avisar».
- **Agent Reach** (Panniantong/Agent-Reach, visto en redes, 11/11/2026): NO instalado en el repo. Programa que lee YouTube, Reddit, X, Instagram, Facebook, LinkedIn… (solo lectura). Probado en la nube: se instala, pero la red del entorno bloquea YouTube/Reddit/web y las redes con login necesitan el Chrome de un ordenador. Instalar en el ordenador: `uv tool install https://github.com/Panniantong/Agent-Reach/releases/latest/download/agent-reach.zip && agent-reach setup` (NUNCA desde PyPI). Usar una cuenta secundaria para las redes con login.
- Web: dato puntual → perplexity; leer/extraer una página o sitio → firecrawl; interactuar con una web/app → playwright.
- Código: entender estructura → graphify; implementar → agent-skills + ponytail; antes de mergear algo sensible → security-audit.
- Vídeo o reel → watch.

## 2. Claves (nunca en el repo ni en el chat)

| Variable | Para | Dónde se saca |
|---|---|---|
| `GEMINI_API_KEY` | watch (motor Gemini) y graphify (opcional) | https://aistudio.google.com/apikey |
| `FIRECRAWL_API_KEY` | firecrawl | https://firecrawl.dev → API keys |
| `PERPLEXITY_API_KEY` | perplexity | https://www.perplexity.ai/settings/api |
| `POSTHOG_API_KEY` | posthog (personal API key, scope MCP) | PostHog → Settings → Personal API keys |
| `POSTHOG_MCP_URL` | solo si tu proyecto PostHog es de la UE: `https://mcp-eu.posthog.com/mcp` | — |

- **En tu ordenador**: exporta las variables en tu shell (`~/.zshrc` / `~/.bashrc`) o en `~/.claude/settings.json` → `"env": {...}`. watch también lee `~/.config/watch/.env` (`GEMINI_API_KEY=...`).
- **En Claude Code en la nube**: guárdalas como secretos del entorno (Settings del entorno), no como variables en texto plano.
- Alternativa sin claves para Firecrawl y PostHog: conectarlos como conectores en claude.ai (Settings → Connectors), con OAuth.
- Nunca imprimas una clave, ni la pongas en un comando, ni la subas a git.

## 3. Cómo instalar algo nuevo que veas en redes (lo aprendido)

1. **Identifica el repo real** en GitHub (`usuario/repo`). Desconfía de forks y copias: elige el repo con más estrellas/actividad y el autor que cita la documentación.
2. **Mira qué es**:
   - Tiene `.claude-plugin/marketplace.json` → es un **plugin**. El nombre del marketplace es el campo `name` de ese JSON y el plugin, cada `plugins[].name`.
   - Tiene `SKILL.md` → es una **skill**: cópiala a `.claude/skills/<nombre>/` (proyecto) o `~/.claude/skills/<nombre>/` (todos tus proyectos), con su LICENSE.
   - Es un servidor MCP → va en `.mcp.json` (proyecto) o con `claude mcp add --scope user` (global).
   - Es un servicio/proxy (p. ej. OmniRoute) → no es un plugin; evalúalo aparte.
3. **Instalar a mano (una vez, en tu ordenador)**:
   ```
   /plugin marketplace add usuario/repo
   /plugin install plugin@marketplace
   ```
   Si no aparece `/plugin`, actualiza antes: `claude update`.
4. **Que se aplique siempre en este proyecto**: añade el marketplace a `extraKnownMarketplaces` y el plugin a `enabledPlugins` en `.claude/settings.json`, y súbelo a git. Cualquier sesión (local o nube) lo carga sola.
5. **Que se aplique en todos tus proyectos**: lo mismo, pero en `~/.claude/settings.json`.
6. **Revisa antes de instalar**: lee el README y los hooks (`hooks/`, `hooks.json`) — los plugins pueden ejecutar código en cada sesión. Nada de herramientas que pidan tus credenciales de Claude o prometan "tokens gratis".

## 4. Comprobar el kit (`/kit-ferjusanz check`)

Si el usuario pide comprobar el kit, haz esto y responde con una tabla ✅/❌:
1. `/plugin` → que `ponytail`, `agent-skills`, `watch`, `codex`, `superpowers`, `impeccable` y `taste-skill` estén instalados y activos.
2. `/mcp` → que `playwright`, `firecrawl`, `perplexity` y `posthog` estén conectados. Si uno falla por clave, di cuál falta (sección 2), sin pedir que la pegue en el chat.
3. Que existan `.claude/skills/graphify/SKILL.md` y `.claude/skills/security-audit/SKILL.md`.
4. Para watch: `python3 "<dir de la skill watch>/scripts/setup.py" --check --json` y mira `engine` y `gemini_key_present`.

## 5. Notas

- **OmniRoute**: ver sección 6. Nunca pongas `ANTHROPIC_BASE_URL` en el `settings.json` del repo: rompería Claude Code en la nube y en cualquier equipo sin OmniRoute.
- graphify instala su CLI (`graphifyy` en PyPI) la primera vez que se usa; añade `graphify-out/` al `.gitignore` si no quieres subir el grafo.
- watch necesita `python3`; el motor local además `ffmpeg` y `yt-dlp`. Con Gemini, los vídeos se envían a Google.

## 6. OmniRoute (solo en tu ordenador)

[diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) es un servidor local (puerto 20128) que reparte las peticiones de Claude Code, Codex, Cursor… entre muchos proveedores de IA con fallback automático y compresión de tokens. No es un plugin: tiene que estar ejecutándose en tu máquina, así que no funciona en sesiones de Claude Code en la nube.

**Instalar y arrancar** (terminal de tu ordenador, Node 20+):
```bash
npm install -g omniroute
omniroute            # abre el dashboard en http://localhost:20128
```
En el dashboard conecta al menos un proveedor (tu cuenta o API key) y copia tu clave de OmniRoute en Dashboard → Endpoints.

**Usarlo con Claude Code**, de menor a mayor impacto:
1. Solo sus herramientas, sin desviar el tráfico (recomendado):
   `claude mcp add --scope user --transport http omniroute http://localhost:20128/api/mcp/stream`
2. Lanzar Claude Code a través de OmniRoute solo cuando quieras: `omniroute run claude --model <proveedor/modelo>`.
   El `claude` normal sigue yendo directo a Anthropic.

**Precauciones**:
- Todo lo que envíes (código, claves que aparezcan en el código) pasa por OmniRoute y por el proveedor que elija. No lo uses con datos de clientes ni secretos de Supabase.
- Usa solo cuentas y claves propias, respetando los términos de cada proveedor. Desconfía de "tokens gratis" de cuentas ajenas.
- No actives sus funciones de intercepción TLS/MITM ni instales su certificado raíz.
- Revisa antes sus avisos de seguridad: https://github.com/diegosouzapw/OmniRoute/security
- Si algo falla, desinstala con `npm uninstall -g omniroute`; tu Claude Code no queda modificado.
