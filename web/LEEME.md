# Web pública de Ferjusanz

Web de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., sin WordPress, en Cloudflare (Worker `ferjusanz-web`).
- **Ahora (pruebas, oculta a Google)**: https://ferjusanz-web.fernandosanzalba.workers.dev
- Mismas direcciones de página, títulos y descripciones que la web antigua de Creativate (www.ferjusanz-frutas-verduras.es) para no perder Google, más páginas nuevas (huevos, hostelería, novedades, legales).

## Datos que se pueden decir (comprobados con Fernando, 13/11/2026)
- FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · NIF B87446670 · C/ Carare, 2 · 28033 Madrid · ferjusanz@hotmail.com · 91 763 21 86.
- WhatsApp y «Llamar» en la web: **el 609 100 690** (el del padre, conectado a 360dialog; Tito, 23/11/2026). El 609 567 354 de Tito solo sale en la tarjeta del QR (`/tarjeta/`). Horario: lunes a viernes, de 4:30 a 14:00, y sábados, de 4:30 a 13:00 (igual que la ficha de Google, Tito 26/11/2026).
- **No prometer cambios ni devoluciones** («si algo llega mal, se lo cambiamos»): Tito dijo que no (26/11/2026).
- **No decir «60 años en Mercamadrid»** (Tito, 26/11/2026: hace 60 años no se iba a Mercamadrid): «más de 60 años de experiencia» y «décadas en Mercamadrid».
- Empresa familiar, **tercera generación**, **más de 60 años** (Fernando, 16/11/2026; antes ponía 40) en el sector («alegrando la vida / la mesa a mucha gente»).
- Fruta, verdura, hortaliza, patatas (también peladas y cortadas), cebollas y ajos, setas, legumbres, hierbas y **huevos** (gallina y codorniz). Más de 200 productos activos.
- La familia **empezó con patatas, cebollas y ajos** (Tito, 27/11/2026).
- Clientes: hostelería, colectividades (colegios, residencias, comedores), fruterías. Género fresco cada día.
- **NO hay cosecha propia** (Fernando, 15/11/2026): decir «agricultores de confianza» y Mercamadrid. Agricultura ecológica: «colaboramos con productores ecológicos siempre que tienen producto disponible». Reparto con camiones y furgonetas refrigerados (sí, confirmado).
- Confirmado por Fernando (15/11/2026): más de 200 productos, reparto en Segovia, sin pedido mínimo, pedidos hasta la tarde anterior, exportación posible, pago al contado o con factura.
- Frase de Fernando (15/11/2026): «seleccionamos nuestros productos minuciosamente y pensamos en que nos sentamos a la mesa de ese restaurante a disfrutar del menú; vamos de la mano con nuestros clientes».
- **No** se publican precios: siempre «pide precio por WhatsApp». **Excepción: las ofertas de la semana** (Fernando, 17/11/2026: «con precio»), en la portada, con «+ 4 % de IVA» (el IVA se suma al final sobre el total: 100 € → 104 €).

## Archivos
- La sección de artículos se llama **«Guías»** (15/11/2026) aunque la dirección siga siendo `/blog/`; las últimas salen en la portada.
- `paginas.json`: textos de cada página (los de la web antigua y los artículos nuevos). **Aquí se cambian los textos.**
- `redirecciones.json`: artículos viejos juntados en otro (no se generan; el Worker los manda al nuevo con 301).
- `ofertas.json`: **ofertas de la semana** (fechas, nota de IVA y lista producto · precio · unidad). Sale en la portada (sección «Ofertas de la semana») entre las cifras y la última guía. Si `items` está vacío, la sección no sale. Debajo, en pequeño: «Precios por caja entera · consultar formato» (Tito, 26/11/2026). Las mismas ofertas van en la app: Comercial › ⭐ Recomendaciones (tabla `recomendaciones`, base real y pruebas).
- **Buscador** (26/11/2026): barra en la cabecera → `/buscar/` (función `paginaBuscar` en `construir.cjs`; busca en productos, cortes de patata pelada, páginas y menú). **Cortes de patata pelada**: lista `CORTES` en `construir.cjs` (bloque «Patata pelada en todos los cortes», siempre «Precio a consultar»).
- **Calcule su tarifa** (`/calcular-tarifa/`, Tito 26/11/2026): mismo formulario que la tarjeta (`formTarifa()` en `construir.cjs`; el Worker pone los productos y guarda con `web_primer_pedido`). Enlazada en el menú del móvil, bajo las ofertas y en Contacto.
- **Reseñas** (26/11/2026): `/resena/` → «Escribir una reseña» de la ficha de Google (en `worker.js`). Franja `bandaResena()` en portada, guías y páginas de productos; enlace en el menú del móvil y en el pie.
- `novedades.json`: fotos y avisos del almacén (página `/novedades/` y portada).
- `construir.cjs`: diseño, catálogo (`FAMILIAS`), preguntas frecuentes, páginas nuevas y legales; genera `public/` y `archivos.generado.js`.
- **Vídeos en Novedades** (16/11/2026): en `novedades.json`, `"video": "/fotos/AAAA/MM/x.mp4"` y `"foto"` con su portada (.jpg). Los dos se suben al KV como las fotos (copia en `fotos/`). MP4 ligero (720 px, ver `redes/videos/LEEME.md`).
- `anadir.cjs`: añade una novedad o un artículo (lo usa la tarea automática).
- `public/estilo.css`: colores y aspecto. `public/fuentes/`: letra Inter (servida desde la propia web). Estilo «Amanecer en órbita» (20/11/2026, elegido por Tito): fondo azul noche con estrellas (CSS, sin animación), resplandor naranja de amanecer en la portada (el sol del logo), botones con degradado de fuego (`--sol-1/2/3`), cifras en dorado, tarjetas de cristal oscuro, logo claro (`logo-oscuro.png`). Revisado con Hallmark (`node .claude/skills/hallmark/scripts/sloplint.mjs web/public/index.html web/public/estilo.css --genre atmospheric`). Antes: «Claro» estilo Apple (20/11) y «Sobrio de mercado» (14/11).
- `public/wp-content/`: fotos de la web antigua (mismas rutas). `fotos/`: copia de las fotos nuevas, que se sirven desde el almacén KV de Cloudflare `ferjusanz-web-fotos` en `/fotos/…` (así el Worker no crece).
- `worker.js`: sirve la web; pasa el formulario de `/contacto/` a la función `web-contacto` de Supabase (correo a ferjusanz@hotmail.com y, además, lo apunta en Contactos/prospectos con fuente «Formulario de la web») y manda el dominio sin `www` a `www`. `PRUEBAS` = la dirección acaba en `.workers.dev` → esa copia no la ve Google; en el dominio sí.
- `TAREA_AUTOMATICA.md`: lo que hace la tarea programada (2 veces al día). `DIARIO.md`: lo que ha publicado.
- `copiar-web-antigua.cjs`: cómo se copiaron los textos de la web antigua (no hace falta volver a usarlo).

## Fotos de Fernando
Desde el móvil, en Google Drive, carpeta **«Fotos web Ferjusanz»** (compartida con su cuenta). La tarea automática las publica en «Novedades» y en los artículos.

## Publicar
```
cd web && node construir.cjs && CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx -y wrangler@4 deploy
```
Comprobar en local (el entorno no abre `ferjusanz-web…`): `npx -y wrangler@4 dev --port 8799` y abrir http://127.0.0.1:8799.
Cloudflare no deja subir «assets» por el proxy del entorno (401): por eso los archivos van dentro del Worker.

## El día que tengamos el dominio
1. `PRUEBAS = false` en `worker.js` y publicar.
2. En Cloudflare, añadir el dominio y apuntar `www` a este Worker (y la app a `app.`). Antes, preparar el correo del dominio si hay buzones.
3. Google Search Console: dar de alta y enviar `sitemap.xml`. Ficha de Google (Perfil de Empresa) con la web nueva.
4. Si se quiere medir visitas: añadir la herramienta y actualizar la política de cookies (hoy dice que no hay cookies).
