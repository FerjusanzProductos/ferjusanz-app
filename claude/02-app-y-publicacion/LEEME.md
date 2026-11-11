# 02 · App y publicación

## Para qué sirve
La app que usa el equipo en el móvil (pedidos, preparar, albaranes, compras, cobros, Harvey…).
Hay **dos direcciones**:

| | Dirección | Color | Para qué |
|---|---|---|---|
| **Normal** | https://ferjusanz-productos.fernandosanzalba.workers.dev | habitual | La del equipo |
| **Pruebas** | https://ferjusanz-pruebas.fernandosanzalba.workers.dev | **naranja** | Que veas un cambio antes de publicarlo |

No confundir con el **Modo prácticas** (morado, dentro de Mi perfil): sirve para practicar sin tocar datos.

## Dónde está
- `public/index.html`: casi toda la app (más de 1 MB). `public/guia.html` y `ejemplos.html`: guías.
- `public/sw.js`: número de versión (`ferjusanz-vNNN`). Se sube en cada publicación.
- `src/worker.js` + `wrangler.jsonc`: publicación en Cloudflare.
- Funcionalidades explicadas en `docs/FUNCIONALIDADES.md`.

## Tareas que hace Claude aquí
1. Programar lo que pidas (respetando `docs/REGLAS_INTERNAS.md`).
2. Probarlo en **Modo prácticas** con el navegador automático (Playwright), sin crear datos reales.
3. Publicarlo en **pruebas** y darte el enlace para que lo mires en el móvil.
4. Cuando escribas «**Autorizo publicar**»: subir la versión y publicar en la **normal**; comprobar que la versión publicada es la buena.
5. Revisiones de diseño y usabilidad en el móvil (lista priorizada, sin cambiar hasta que elijas).
