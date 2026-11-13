# Tarea automática: web viva (cada 2 días)

Pedido por Fernando el 13/11/2026: «que esté activa, que le pongas fotos cada 2 o 3 días, un artículo también».
Una tarea programada abre una sesión nueva cada 2 días y sigue estos pasos **sin preguntar** (autorización de Fernando).
Solo toca la web (`web/`). **Nunca**: la app, la base de datos (solo leer), precios, mensajes a clientes ni redes sociales.

## 0. Preparar
- `git fetch https://gitlab.com/ferjusanz-productos/ferjusanz-app.git main && git checkout -B main FETCH_HEAD` (GitLab es el maestro).
- Leer `web/LEEME.md` (datos de la empresa que se pueden decir) y `web/DIARIO.md` (lo publicado antes, para no repetir).

## 1. Fotos nuevas de Fernando (carpeta de Drive)
- Carpeta **«Fotos web Ferjusanz»**, id `1Tw_KfgeWrbSAZjgQ9BE6jVfq-AkW7V27` (conector Google Drive):
  `search_files` con `parentId = '1Tw_KfgeWrbSAZjgQ9BE6jVfq-AkW7V27' and mimeType contains 'image/'`.
- Las que no estén ya en `web/novedades.json` (campo `driveId`), como mucho 3 por vez, de la más antigua a la más nueva:
  `download_file_content` → guardar en el scratchpad → **mirar la foto** (Read) → título corto y una frase **solo con lo que se ve** (producto, cajas, camión, campo…).
  No inventar origen, precio ni cantidades.
- **No publicar** (y apuntarlo en el diario) si sale una cara reconocible, una matrícula, un albarán, un nombre de cliente o algo que no sea del negocio.
- `node web/anadir.cjs novedad <archivo> "<título>" "<frase>" <driveId>` (la comprime, quita el GPS y la sube al almacén de Cloudflare).

## 2. Si no hay fotos nuevas
Una novedad de temporada con una foto que ya esté en la web (`web/public/wp-content/uploads/…` o `/fotos/…`) que no salga en las 10 últimas novedades:
`node web/anadir.cjs novedad /wp-content/uploads/AAAA/MM/foto.jpg "Temporada de …" "<frase>"`.
Solo productos **activos** del catálogo (leer, nunca escribir):
`SELECT nombre FROM productos WHERE activo` en la base real `hvydnjaswdexttogsyen` por la API de Supabase (ver `CLAUDE.md`).

## 3. Un artículo nuevo para el blog
- Tema: el siguiente de **`docs/PLAN_CONTENIDOS_WEB.md`** que no esté ya publicado (`grep '"h1"' web/paginas.json` y `web/DIARIO.md`). Cuando se acaben: temporada del mes, ideas para restaurantes, colectividades, fruterías, conservación y mermas, variedades, cuarta gama, huevos. Los temas con ⚠️ (normas, leyes): leer antes la fuente oficial (BOE, Comunidad de Madrid, AESAN) y enlazarla; si no se puede comprobar, saltar al siguiente.
- Para clientes profesionales de Madrid (hostelería, colectividades, fruterías). Español de España, tuteo, 500–800 palabras, `<h2>` por apartados, listas, nada de relleno.
- Palabras que busca la gente (p. ej. «proveedor de fruta para restaurantes en Madrid») en el título, la descripción (≤ 160 letras) y un `<h2>`, de forma natural.
- **Nada inventado**: ni precios, ni cifras, ni clientes, ni premios; de salud, solo lo general y sabido. De Ferjusanz, solo lo de `web/LEEME.md`.
- Último párrafo: invitar a pedir precio por WhatsApp.
- Foto: una nueva de Drive si la hay (la mejor), si no una de la web que pegue con el tema.
- Guardar como JSON en el scratchpad y `node web/anadir.cjs articulo <archivo.json>`.

## 4. Publicar y comprobar
1. `cd web && node construir.cjs`
2. Probar en local: `npx -y wrangler@4 dev --port 8799 --ip 127.0.0.1` (en segundo plano) y `curl --noproxy '*'` a la portada, a `/novedades/` y al artículo nuevo: los tres con 200.
3. `CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx -y wrangler@4 deploy` (desde `web/`).
4. Añadir una línea a `web/DIARIO.md`: fecha · novedades (título y foto) · artículo (dirección) · fotos de Drive que no se publicaron y por qué.
5. `git add web && git commit -m "Web: novedades y artículo del DD/MM"` y subir a **GitLab main y GitHub main** (`git push https://gitlab.com/ferjusanz-productos/ferjusanz-app.git HEAD:main` y `git push origin HEAD:main`).

## 5. Al terminar
Resumen de 3 líneas: qué se publicó, la dirección del artículo y si quedan fotos sin publicar.
Si algo falla (Cloudflare, Drive, GitLab), no reintentar más de 2 veces: dejarlo escrito en `web/DIARIO.md` y en el resumen.
