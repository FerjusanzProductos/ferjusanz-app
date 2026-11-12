# 06 · Herramientas de Claude Code

## Para qué sirve
Las «extensiones» que usa Claude para trabajar mejor en este proyecto. Se cargan solas en cada sesión.
Explicación completa: la skill **kit-ferjusanz** (`.claude/skills/kit-ferjusanz/SKILL.md`).

| Herramienta | Tipo | Para qué la usa Claude |
|---|---|---|
| ponytail | plugin | Escribir el mínimo código posible y reutilizar lo que ya hay |
| agent-skills | plugin | Trabajos grandes: plan → hacer → comprobar → revisar |
| watch | plugin | Ver vídeos (TikTok, YouTube, Instagram) que mandas |
| graphify | skill | Orientarse en `index.html` (más de 1 MB) |
| security-audit | skill | Revisar la seguridad antes de publicar cosas sensibles |
| kit-ferjusanz | skill | Elegir herramienta e instalar lo nuevo que veas en redes |
| playwright | conector | Abrir la app, pulsar botones y hacer capturas para probar |
| firecrawl | conector | Leer páginas web (p. ej. la web de la empresa) |
| perplexity | conector | Investigar en internet con fuentes |
| posthog | conector | Estadísticas de uso de la app |
| context7 | conector | Documentación al día de las librerías |
| Supabase, Cloudflare, GitLab, Google Drive | conectados en el entorno | Base de datos, publicación, guardar el código, archivos |

Configuración: `.claude/settings.json` (plugins) y `.mcp.json` (conectores).

## Estado (11/11/2026)
- 🟡 Faltan las claves de `GEMINI_API_KEY`, `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY` y `POSTHOG_API_KEY` (se ponen en los secretos del entorno, **nunca** en el chat).
- ⚠️ En esta sesión no conectaron **perplexity**, **posthog** ni **context7**.
- Añadidos el 12/11/2026 (vídeo «5 skills para Claude Code»): **superpowers** (método de trabajo) e **impeccable** (diseño de pantallas).
- Descartados: Claude-Mem en el proyecto (guarda todo, con estadísticas activadas; solo en el ordenador si se pide), Composio (acceso a cuentas por un tercero) y OmniRoute en el proyecto (solo guía para el ordenador).

## Tareas que hace Claude aquí
- Elegir la herramienta adecuada para cada trabajo.
- Instalar lo que veas en redes: buscar el original, revisar que sea seguro y añadirlo al kit.
- Comprobar el kit (`/kit-ferjusanz check`) y decirte qué clave falta.
