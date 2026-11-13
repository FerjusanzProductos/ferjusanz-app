# Estado actual de FERJUSANZ
_Última revisión: 13/11/2026 (normal v280, pruebas v283). Actualizar en cada publicación._

Leyenda: ✅ comprobado por Claude · 📝 sacado de documentos o del historial · ⚠️ por confirmar

## Versiones
| App | Dirección | Versión | Origen |
|---|---|---|---|
| **Normal** (la que usa el equipo) | https://ferjusanz-productos.fernandosanzalba.workers.dev | **v280** ✅ (13/11/2026, «Autorizo publicar»: menú más limpio (sin «Facturas» de compra, «Precios de compra» ni «Compra para hoy») y «📊 Resumen y correo», el código de pruebas v278, **sin** el banco; v276: **💵 Caja (efectivo)** e informe de caja para Jorge (tablas creadas en la base real); v271: botón **«📧 Enviar a Jorge por correo»** con los informes adjuntos y aviso por WhatsApp; v268: **listados de VENTAS y COMPRAS para Jorge** con el tipo de IVA comprobado en cada fila (fase 4); v265: **«🧾 NIF e IVA» activado** en Compras, fase 3 de facturación; antes v264 con los arreglos «permission denied» y código/lote en la factura. El botón de facturas emitidas (fase 2) sigue **sin salir** en la normal) | GitLab `main` |
| **Pruebas** (cabecera naranja) | https://ferjusanz-pruebas.fernandosanzalba.workers.dev | **v283** ✅ (13/11/2026: banco avisa si se elige un PDF, una foto o un informe de la app; v281: banco con un ajuste de nombres; v279: **facturación fase 6, banco** (Norma 43 / Excel), Más → «🏦 Banco · PRUEBAS» e informe en «Informes para Jorge»; SQL ya en la base de pruebas; v278: menú más limpio (sin «Facturas» de compra, «Precios de compra» ni «Compra para hoy») y «📊 Resumen y correo»; v277: mismo código que la normal v276; v275: caja con el mes por flechas (sin meses futuros) y sin el «null»; v274: caja con botones más claros para añadir el justificante; v273: **facturación fase 5, caja (efectivo)**, Más → «💵 Caja (efectivo) · PRUEBAS» e informe en «Informes para Jorge»; SQL ya en la base de pruebas; v272: mismo código que la normal v271; v270: botón **«📧 Enviar a Jorge por correo»** con los informes adjuntos y aviso por WhatsApp; v269: mismo código que la normal v268; v267: **facturación fase 4**, listados de VENTAS y COMPRAS para Jorge en «Informes para Jorge» (Excel, PDF y CSV, mensual o trimestral); v266: mismo código que la normal v265; v263: **facturación fase 3**, Compras → «🧾 NIF e IVA» de las facturas de proveedores; v262, 12/11/2026: facturas con código de producto y lote/origen; v261: arreglo de la sesión antigua de la base real que daba «permission denied»; antes v259: normal v257 + **facturación fase 2**: «🧾 Facturas (desde la app) · PRUEBAS», serie «PRUEBA», SIN VALOR FISCAL; usa su base de PRUEBAS aparte `ferjusanz-pruebas`) | GitLab `main` |
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
| `harvey-fase1` | Antigua rama de pruebas: ✔️ todo ya en main (v194) | se puede borrar |
| `precios-facturas` | Pantalla Precios / facturas | ✔️ ya en main (v190), se puede borrar |
| `memoria-golden` | «Lo de siempre» con Golden | ✔️ ya en main (v194), se puede borrar |
| `memoria-permanente` | Estos documentos | pendiente de juntar |
| `ayuda3-normal`, `ayuda2-normal`, `ayuda-normal`, `arreglo-iphone`, `guia-y-tarifas`, `previstos`, `configurar-cloudflare` | Ya incluidas en main o en harvey-fase1 | se pueden borrar |

## Cómo está hecha (arquitectura)
- **App web instalable (PWA)**: un único `public/index.html` muy grande, más `sw.js` (funciona sin conexión), `manifest.webmanifest`, `guia.html` y `ejemplos.html`.
- **Cloudflare Workers**: `src/worker.js` sirve los archivos de `public/` (`wrangler.jsonc`). Cuenta de Cloudflare `9a4f085c6f3a0c2671fa344c288b3e46` (es un identificador, no una clave).
- **Supabase** (`hvydnjaswdexttogsyen`): base de datos, inicio de sesión, archivos (fotos, PDF, audios) y funciones.
  - Funciones activas ✅: `harvey-v2` (Harvey de la app normal), `harvey-v2-pruebas` (Harvey de la app de pruebas), `harvey` (antigua, sin uso), `harvey2`, `ayuda-ia`, `albaranes-correo`, `informes-jorge` (manda a Jorge los informes por correo), `recibir-factura`, `copia-archivo`.
  - Las funciones con IA usan la API de Anthropic (secreto `ANTHROPIC_API_KEY` en Supabase; modelo en `HARVEY_MODEL`).
- **GitLab CI** (`.gitlab-ci.yml`): copia nocturna de la base de datos (90 días) y publicación manual. ✅ Programación «Copia diaria» activa (todos los días a las 3:00, hora de Madrid, rama main); comprobado el 12/11/2026 con capturas de Fernando: 4 copias (9 a 12/11), todas bien. Desde el 12/11 la copia lleva también Harvey, tareas automáticas y archivos (estos, con la variable `SUPABASE_SECRET_KEY`), y el trabajo `prueba_recuperacion` la recupera cada noche en una base desechable y compara tabla a tabla. ⚠️ Falta ver la primera en verde.
- **Roles en la app** 📝: admin, oficina, secretaria, comercial, compras, preparador, repartidor y dirección.

## Seguridad y copias
- Copia de la base de datos: GitLab CI (`scripts/copia-supabase.sh`): `public`, `harvey`, usuarios, tareas automáticas y archivos de Storage (si existe `SUPABASE_SECRET_KEY`).
- Prueba de recuperación: GitLab CI, cada noche (`scripts/prueba-recuperacion.sh`). **Cómo recuperar de verdad**: descargar la copia (GitLab › Build › Artifacts), `pg_restore --no-owner --no-privileges -d <base nueva> ferjusanz-AAAA-MM-DD-datos.dump`, luego usuarios (`-usuarios.dump`), tareas (`-tareas.sql`) y subir los archivos (`-archivos.tar.gz`) a sus carpetas de Storage. Antes de recuperar sobre la base real, siempre con «sí» de Fernando.
- Claves: solo en los secretos de Supabase, en las variables de GitLab CI y en el entorno de Claude. **Nunca** en el código ni en los documentos.

## Situación técnica conocida
- `public/index.html` ocupa más de 1 MB; usar graphify o búsquedas para orientarse.
- Desde la v248 de pruebas, la app naranja usa **su propia base de datos** (`ferjusanz-pruebas`); la normal, la real. Usuarios de prueba: `…@pruebas.invalid`.
  - Separación en marcha (`docs/PLAN_SEPARAR_PRUEBAS.md`): proyecto `ferjusanz-pruebas` (`pbeuxbwbpmlanbhhnpgy`) creado el 12/11/2026 con la estructura y los datos maestros copiados y 5 usuarios de prueba; lo usa la app naranja desde la v248 (12/11/2026). Estructura completa de la base: `supabase/esquema_completo.sql`.
  - **Facturas emitidas (fase 2)**: tablas y funciones `sif_*` (`supabase/migrations/20261113a_facturas_emitidas.sql`) **solo en la base de pruebas** (pegado por Fernando en el SQL Editor, 12/11/2026). En la base real **no existen**; cuando se creen, quedan bloqueadas (`sif_config.emision_real_activa = false`) hasta la declaración responsable firmada.
  - **Resumen de correo**: tabla `resumen_correo` (`20261115a_resumen_correo.sql`). ✔️ En la real (13/11/2026, por la API). ❌ No en pruebas (la API no tiene permiso en ese proyecto).
  - **Banco (fase 6)**: tablas `banco_subidas`, `banco_movimientos` y `banco_cambios` (`20261115b_banco_norma43.sql`). ✔️ En pruebas (13/11/2026, pegado por Fernando). En la real NO está. Pantalla solo en la app naranja (v279).
  - **Caja (fase 5)**: tablas `caja_movimientos` y `caja_cambios` (`20261114a_caja_efectivo.sql`). ✔️ En pruebas (13/11/2026, pegado por Fernando). ✔️ En la real (13/11/2026, por la API de Supabase). Publicada en las dos apps (v276/v277).
  - **Facturas recibidas (fase 3)**: columnas nuevas en `proveedores` y `facturas_recibidas`, tabla `facturas_recibidas_iva` y vistas `v_facturas_recibidas_control` y `v_libro_compras` (`20261113b_…`) en las **dos bases** (pruebas el 13/11/2026; real el 13/11/2026, pegado por Fernando en el SQL Editor), con `anadir_factura_recibida` (`20261113c_…`).
  - **Arranque real previsto en 7-10 días desde el 12/11/2026** (todo menos facturas, que siguen en Golden hasta el 1/1/2027). Ese día: Supabase Pro para la base real y borrar los datos de prueba. Ver `docs/PENDIENTES.md`.
