# Estado actual de FERJUSANZ
_Última revisión: 10/11/2026 (auditoría de Claude). Actualizar en cada publicación._

Leyenda: ✅ comprobado por Claude · 📝 sacado de documentos o del historial · ⚠️ por confirmar

## Versiones
| App | Dirección | Versión | Origen |
|---|---|---|---|
| **Normal** (la que usa el equipo) | https://ferjusanz-productos.fernandosanzalba.workers.dev | **v190** ✅ (publicada el 11/11/2026: pantalla Precios / facturas) | GitLab `main` |
| **Pruebas** (cabecera naranja) | https://ferjusanz-pruebas.fernandosanzalba.workers.dev | **v191** ✅ (11/11/2026: + pantalla Precios / facturas y mora por bandeja) | GitLab `harvey-fase1` |
| Worker `ferjusanz` | antiguo, sin contenido | — | ⚠️ se puede borrar |

La versión es el texto `ferjusanz-vNNN` de `public/sw.js`. Para comprobar la publicada: descargar el Worker desde la API de Cloudflare (`/workers/scripts/<nombre>/content/v2`) y buscar ese texto.

### No confundir: app de PRUEBAS ≠ Modo prácticas
- **App de pruebas** = otra **dirección web** (la de arriba, `ferjusanz-pruebas…`), con cabecera e icono **naranja** y el nombre «Ferjusanz PRUEBAS». Sirve para que Fernando vea un cambio antes de publicarlo. Fernando no la usa a diario: **hay que darle el enlace** cuando haya algo que probar.
- **Modo prácticas** = un modo **dentro de la app normal** (Mi perfil), en **morado**, para practicar sin tocar datos reales.

## Repositorios
- **GitLab (maestro)**: `ferjusanz-productos/ferjusanz-app`, rama `main`. ✅
- **GitHub (copia de seguridad)**: `FerjusanzProductos/ferjusanz-app`. `main` es copia exacta de GitLab desde el 10/11/2026. ✅
  - Ramas de GitLab copiadas como `gitlab/<rama>`.
  - `respaldo-github-antes-espejo`: lo que había en GitHub antes de la copia (subidas antiguas del 29/10 al 06/11 y el kit de Claude).
  - `claude/rc-harvey-3485jo`: copia antigua (v178), ya superada.

### Ramas abiertas en GitLab
| Rama | Qué tiene | Estado |
|---|---|---|
| `harvey-fase1` | Rama de PRUEBAS (v189): todo lo de main + **Informes para Jorge** (v168-169) + Harvey con mensajes de WhatsApp naturales + pantalla Precios / facturas |
| `precios-facturas` | Pantalla Precios / facturas | ✔️ ya en main (v190), se puede borrar | ⚠️ Informes para Jorge sin publicar en la normal |
| `memoria-permanente` | Estos documentos | pendiente de juntar |
| `ayuda3-normal`, `ayuda2-normal`, `ayuda-normal`, `arreglo-iphone`, `guia-y-tarifas`, `previstos`, `configurar-cloudflare` | Ya incluidas en main o en harvey-fase1 | se pueden borrar |

## Cómo está hecha (arquitectura)
- **App web instalable (PWA)**: un único `public/index.html` muy grande, más `sw.js` (funciona sin conexión), `manifest.webmanifest`, `guia.html` y `ejemplos.html`.
- **Cloudflare Workers**: `src/worker.js` sirve los archivos de `public/` (`wrangler.jsonc`). Cuenta de Cloudflare `9a4f085c6f3a0c2671fa344c288b3e46` (es un identificador, no una clave).
- **Supabase** (`hvydnjaswdexttogsyen`): base de datos, inicio de sesión, archivos (fotos, PDF, audios) y funciones.
  - Funciones activas ✅: `harvey`, `harvey2`, `ayuda-ia`, `albaranes-correo`, `recibir-factura`, `copia-archivo`.
  - Las funciones con IA usan la API de Anthropic (secreto `ANTHROPIC_API_KEY` en Supabase; modelo en `HARVEY_MODEL`).
- **GitLab CI** (`.gitlab-ci.yml`): copia nocturna de la base de datos (90 días) y publicación manual. ⚠️ Comprobar que la programación está activa.
- **Roles en la app** 📝: admin, oficina, secretaria, comercial, compras, preparador, repartidor y dirección.

## Seguridad y copias
- Copia de la base de datos: GitLab CI (`scripts/copia-supabase.sh`). Las fotos, PDF y audios de Storage **no** se copian (pendiente).
- Claves: solo en los secretos de Supabase, en las variables de GitLab CI y en el entorno de Claude. **Nunca** en el código ni en los documentos.

## Situación técnica conocida
- `public/index.html` ocupa más de 1 MB; usar graphify o búsquedas para orientarse.
- La app de pruebas y la normal comparten la **misma base de datos**: en pruebas, usar el Modo prácticas.
