# Tarea automática: web viva (cada día)

Tarea programada `trig_01AXKhyzZyg7sMDufq37Ahuw` (**cada día** a las 11:43, hora de Madrid, desde el 27/11/2026 por Tito: «uno cada día… como lo valore Google mejor»; antes, cada 2 días). ⚠️ Se creó **sin el conector de Google Drive** (la organización no deja guardarlo en la tarea): si Drive no está, se salta el paso 1. Para que lea la carpeta, Fernando tendría que crearla desde claude.ai → Rutinas con Google Drive; mientras, sus fotos se publican cuando las manda en una conversación con Claude.

Pedido por Fernando el 13/11/2026: «que esté activa, que le pongas fotos cada 2 o 3 días, un artículo también».
Una tarea programada abre una sesión nueva cada día y sigue estos pasos **sin preguntar** (autorización de Fernando).
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
- **Editar cada foto antes** (Fernando, 17/11/2026: «que se pueda comprobar el tamaño, que se note que no es trampa, pero también unos filtros… que elijas bien el recorte»). En la web salen **cuadradas**: recortar tú en cuadrado, con el producto llenando la foto y **algo que dé la escala** (borde de la caja, mano, bolígrafo). Fuera del recorte: piezas feas o sucias, paja o papeles encima del género, zapatos, etiquetas de palé/proveedor, matrículas y caras. Retoque **suave**, sin cambiar el color real:
  `convert original.jpg -auto-orient -crop <ANCHOxALTO+X+Y> +repage -resize 1000x1000 -modulate 102,110 -sigmoidal-contrast 2x50% -unsharp 0x0.8 -strip -quality 82 foto.jpg`
  **Sin zoom** (Tito, 21/11 y 24/11/2026: «ese zoom las ha matado… la berza que se vea como la coliflor»): recorte **abierto**, que se vea el **producto entero** (la caja entera, el manojo entero con la mano), como la coliflor del 17/11 (`fotos/2026/11/novedad-2026-11-17-coliflor-v2.jpg`). Nunca un primer plano de hojas o piezas sueltas. Si para eso entra una etiqueta o una caja de otra marca, **difuminarla** (`-region WxH+X+Y -blur 0x7 +region`) en vez de cerrar el recorte. **Pero si se ve algo mal** (pieza manchada, podrida, fea o sucia), **recortarla fuera siempre** (Tito, 25/11/2026: «recórtalo siempre que algo se vea mal»), aunque la foto quede algo más cerrada; mejor dejar a la vista una esquina de la caja para el tamaño.
  **Nada de hielo a la vista** (Tito, 26/11/2026: el cliente puede pensar que paga el peso del hielo): recortarlo fuera o no publicar la foto.
  Probar 2-3 recortes, mirarlos juntos (`montage a.jpg b.jpg -tile 3x1 -geometry 400x400+4+4 h.png`) y quedarse con el mejor. Si no hay recorte limpio, publicarla igual y apuntarlo en el diario (o pedir otra foto).
- Título con **variedad y calibre** si se saben (los dice Fernando o se leen en la caja) y una frase de 1-2 líneas: qué es + para qué le sirve a una cocina. Sin precios ni cifras inventadas.
- `node web/anadir.cjs novedad <archivo> "<título>" "<frase>" <driveId>` (la comprime, quita el GPS y la sube al almacén de Cloudflare).

## 2. Si no hay fotos nuevas
Una novedad de temporada con una foto que ya esté en la web (`web/public/wp-content/uploads/…` o `/fotos/…`) que no salga en las 10 últimas novedades:
`node web/anadir.cjs novedad /wp-content/uploads/AAAA/MM/foto.jpg "Temporada de …" "<frase>"`.
Solo productos **activos** del catálogo (leer, nunca escribir):
`SELECT nombre FROM productos WHERE activo` en la base real `hvydnjaswdexttogsyen` por la API de Supabase (ver `CLAUDE.md`).

## 3. Un artículo nuevo para «Guías»
**La cola, después de la tanda S** (desde el 27/11/2026; ver arriba) (Fernando, 16/11/2026: «pon varios artículos así y cada dos días sube uno»; desde el 27/11, uno al día): si hay archivos `.json` en `web/cola/`, **no escribas uno nuevo**: publica el primero por orden de nombre (`ls web/cola/*.json | head -1`) con `node web/anadir.cjs articulo web/cola/<archivo>.json` (desde la raíz del repositorio: la foto es `web/cola/portada-….jpg`), y después `git rm` de ese `.json` y de su foto de `web/cola/`. Desde el 23/11/2026 (Tito: «que estemos líderes») la cola lleva 7 artículos de temas del plan, ya revisados (foto ya publicada en `/fotos/…`, el JSON la usa tal cual). Solo si la cola está vacía, sigue con lo de abajo.

La sección se llama **«Guías»** (Fernando, 15/11/2026: que no se llame «blog»; las últimas salen en la portada). La dirección sigue siendo `/blog/…` para no perder lo que Google ya tiene: no cambiarla.
**Posicionamiento (lo primero)**: cada artículo apunta a **una búsqueda concreta** de un cliente de negocio con lugar («proveedor de patata pelada para restaurantes en Madrid», «fruta para comedor escolar Madrid»…), que no tenga ya otro artículo nuestro. Esa búsqueda va en el título (al principio), en la dirección (`slug`, corta), en la descripción, en el primer párrafo y en un `<h2>`. Dentro del texto, **2 o 3 enlaces** a nuestras páginas de producto o de sector que pegan (`/productos/…`, `/proveedor-de-frutas-y-verduras-para-…`) y 1 a otra guía. Apuntar la búsqueda elegida en `web/DIARIO.md` para no repetirla.
- **Antes que nada, incluso antes de la cola, la tanda S** (Tito, 27/11/2026, sacada de Search Console: «priorizar… los de Search Console antes que esos»): la siguiente «S» que no esté hecha **en el orden que pone `docs/PLAN_MARKETING.md`** (punto 3, «Orden»), con el mismo formato que la P. Las que dicen «mejorar» se hacen reescribiendo esa página en `web/paginas.json` (misma dirección, sin quitar lo que ya posiciona). En la S1, cambiar también la redirección del PDF viejo en `web/redirecciones.json`. Cuando se acaben las S, la cola `web/cola/` y luego la P. En la S6 (colegios) y la S7 (residencias), aprovechar lo que sirva de `web/cola/03-…` y `07-…` sin repetir el mismo tema dos veces.
- **Después la tanda P** (Tito, 26/11/2026): la siguiente pregunta «P» de `docs/PLAN_MARKETING.md` (punto 3) que no esté publicada. Título con la pregunta tal como la buscaría el cliente; un `<h2>` con la pregunta y la respuesta corta en el primer párrafo; luego el detalle. Después de publicarla, en `web/paginas.json`, en la guía `/blog/preguntas-proveedor-fruta-verdura-madrid-restaurantes-colegios/`, añadir al final de la respuesta de esa pregunta (o de la más parecida) « Más en <a href="/blog/…/">…</a>.». Para que Google lo lea como preguntas, las respuestas cortas van en `<h3>¿…?</h3><p>…</p>` (salen solas como FAQ). Cuando se acaben las P, seguir como abajo.
- Tema: el siguiente de la tabla del punto 3 de **`docs/PLAN_MARKETING.md`** (orden fijado el 15/11/2026, público: colegios, residencias, restaurantes y colectividades) que no esté ya publicado (`grep '"h1"' web/paginas.json` y `web/DIARIO.md`). Cuando se acaben: temporada del mes, ideas para restaurantes, colectividades, fruterías, conservación y mermas, variedades, cuarta gama, huevos. Los temas con ⚠️ (normas, leyes): leer antes la fuente oficial (BOE, Comunidad de Madrid, AESAN) y enlazarla; si no se puede comprobar, saltar al siguiente.
- Para clientes profesionales de Madrid (hostelería, colectividades, fruterías). Español de España, tuteo, 600–1.000 palabras, `<h2>` por apartados.
- **Que Google lo valore y que sirva de verdad** (Fernando, 14/11/2026: «que cuenten cosas que nadie cuente y no se note la IA»). Modelo: los artículos del calendario de temporada y de huevos (14/11/2026).
  - Antes de escribir, buscar en Google qué cuentan los 5 primeros resultados del tema y **aportar al menos 2 cosas que ellos no digan** y que le sirvan a una cocina (cuánto pedir, cuándo, cómo guardarlo, qué se estropea, qué cambia en el coste). Si no hay nada nuevo que contar, cambiar de tema.
  - Lo que cuenta Fernando en `web/LO_QUE_CUENTA_FERNANDO.md` va **primero**: es lo que nadie más tiene.
  - Cada consejo, con su **porqué** y su **para qué** en la cocina («pídelo firme si no lo usas en dos días, porque sigue madurando»).
  - **Escribir como habla alguien del mercado**, no como un folleto. Prohibido: «En el mundo de…», «descubre», «no cabe duda», «sin lugar a dudas», «es fundamental», «en definitiva», «en este artículo te contamos», «te lo explicamos de forma sencilla», «¡…!» de anuncio, preguntas retóricas en cadena y finales que resumen todo.
  - **Revisor automático** (Tito, 27/11/2026): `anadir.cjs articulo` pasa el texto por `web/revisar-texto.cjs` y **no deja publicar** si encuentra coletillas de relleno, la raya «—», el contraste «no es X, es Y», exclamaciones de anuncio, más listas que párrafos, demasiada negrita o frases todas del mismo largo. Se puede probar antes: `node web/revisar-texto.cjs <articulo.json>`. Si falla, reescribir (no tocar el revisor para que pase).
  - **Lo que hace que se note que es de verdad** (y lo es): cada artículo lleva al menos **una cosa propia de Ferjusanz**: una foto nuestra de Drive, algo que cuenta Tito o Fernando (`web/LO_QUE_CUENTA_FERNANDO.md`) o un detalle del día a día del puesto (a qué hora se carga, cómo se comprueba el género, p. ej. partir patatas para ver cómo salen por dentro). Nunca inventar anécdotas, clientes, opiniones ni firmas de personas.
  - Sobre todo párrafos; listas solo cuando de verdad son una lista. Poca negrita (como mucho una por párrafo). Frases de distinto largo.
  - Que el título diga lo que el lector va a ganar, no solo el tema («…y cuándo pedirla madura»).
  - Releer el texto entero antes de publicar y quitar todo lo que suene a relleno o a cosa que diría cualquiera.
- **Tema del blog**: el tema sale de la dirección (`slug`). Que lleve una palabra de su tema (`colegio`/`residencia`/`comedor`, `hosteleria`/`restaurante`, `temporada`, `beneficios`/`dieta`) o irá a «Producto y conservación» (lista `TEMAS` en `web/construir.cjs`).
- Palabras que busca la gente (p. ej. «proveedor de fruta para restaurantes en Madrid») en el título, la descripción (≤ 160 letras) y un `<h2>`, de forma natural.
- **Nada inventado**: ni precios, ni cifras, ni clientes, ni premios; de salud, solo lo general y sabido. De Ferjusanz, solo lo de `web/LEEME.md`.
- Último párrafo: invitar a pedir precio por WhatsApp.
- Foto: una nueva de Drive si la hay (la mejor), si no una de la web que pegue con el tema.
- Guardar como JSON en el scratchpad y `node web/anadir.cjs articulo <archivo.json>`.

Nota (26/11/2026): al publicar, la guía nueva sale sola en la ficha de Google (Zapier lee `/feed.xml`). No hay que hacer nada más.

## 4. Publicar y comprobar
1. `cd web && node construir.cjs`
2. Probar en local: `npx -y wrangler@4 dev --port 8799 --ip 127.0.0.1` (en segundo plano) y `curl --noproxy '*'` a la portada, a `/novedades/` y al artículo nuevo: los tres con 200.
3. `CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx -y wrangler@4 deploy` (desde `web/`).
4. Añadir una línea a `web/DIARIO.md`: fecha · novedades (título y foto) · artículo (dirección) · fotos de Drive que no se publicaron y por qué.
5. `git add web && git commit -m "Web: novedades y artículo del DD/MM"` y subir a **GitLab main y GitHub main** (`git push https://gitlab.com/ferjusanz-productos/ferjusanz-app.git HEAD:main` y `git push origin HEAD:main`).

## 5. Al terminar
Resumen de 3 líneas: qué se publicó, la dirección del artículo y si quedan fotos sin publicar.
Si algo falla (Cloudflare, Drive, GitLab), no reintentar más de 2 veces: dejarlo escrito en `web/DIARIO.md` y en el resumen.
