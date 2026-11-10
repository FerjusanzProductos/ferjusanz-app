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
| **playwright** | MCP | `.mcp.json` | Abrir la app, hacer clic, capturas, probar flujos (PWA, `sw.js`, `manifest`). |
| **firecrawl** | MCP | `.mcp.json` | Scraping/extracción de webs concretas, crawl de un sitio, convertir páginas a markdown. |
| **perplexity** | MCP | `.mcp.json` | Investigación con respuestas citadas, preguntas de actualidad, comparar opciones. |
| **posthog** | MCP | `.mcp.json` | Métricas de producto: eventos, embudos, insights, feature flags. |

Reglas de elección rápidas:
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
1. `/plugin` → que `ponytail`, `agent-skills` y `watch` estén instalados y activos.
2. `/mcp` → que `playwright`, `firecrawl`, `perplexity` y `posthog` estén conectados. Si uno falla por clave, di cuál falta (sección 2), sin pedir que la pegue en el chat.
3. Que existan `.claude/skills/graphify/SKILL.md` y `.claude/skills/security-audit/SKILL.md`.
4. Para watch: `python3 "<dir de la skill watch>/scripts/setup.py" --check --json` y mira `engine` y `gemini_key_present`.

## 5. Notas

- **OmniRoute** (diegosouzapw/OmniRoute) no está instalado a propósito: es un proxy que redirige el tráfico de Claude Code hacia otros proveedores y maneja tus credenciales. Solo si el usuario lo pide expresamente y tras revisar sus avisos de seguridad; nunca lo actives en `settings.json` (`ANTHROPIC_BASE_URL`).
- graphify instala su CLI (`graphifyy` en PyPI) la primera vez que se usa; añade `graphify-out/` al `.gitignore` si no quieres subir el grafo.
- watch necesita `python3`; el motor local además `ffmpeg` y `yt-dlp`. Con Gemini, los vídeos se envían a Google.
