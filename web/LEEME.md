# Web pública de Ferjusanz

Web de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., sin WordPress, en Cloudflare (Worker `ferjusanz-web`).
- **Ahora (pruebas, oculta a Google)**: https://ferjusanz-web.fernandosanzalba.workers.dev
- Mismas direcciones de página, títulos y descripciones que la web antigua de Creativate (www.ferjusanz-frutas-verduras.es) para no perder Google, más páginas nuevas (huevos, hostelería, novedades, legales).

## Datos que se pueden decir (comprobados con Fernando, 13/11/2026)
- FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · NIF B87446670 · C/ Carare, 2 · 28033 Madrid · ferjusanz@hotmail.com · 91 763 21 86.
- WhatsApp: 609 100 690 (el de siempre) y 609 567 354 (Fernando). Horario: lunes a viernes, de 8:00 a 18:00.
- Empresa familiar, **tercera generación**, **más de 40 años** en el sector («alegrando la vida / la mesa a mucha gente»).
- Fruta, verdura, hortaliza, patatas (también peladas y cortadas), cebollas y ajos, setas, legumbres, hierbas y **huevos** (gallina y codorniz). Más de 200 productos activos.
- Clientes: hostelería, colectividades (colegios, residencias, comedores), fruterías. Género fresco cada día.
- **Cosecha propia** y agricultores de confianza; resto elegido en Mercamadrid. Reparto con camiones y furgonetas refrigerados.
- **No** se publican precios: siempre «pide precio por WhatsApp».

## Archivos
- `paginas.json`: textos de cada página (los de la web antigua y los artículos nuevos). **Aquí se cambian los textos.**
- `redirecciones.json`: artículos viejos juntados en otro (no se generan; el Worker los manda al nuevo con 301).
- `novedades.json`: fotos y avisos del almacén (página `/novedades/` y portada).
- `construir.cjs`: diseño, catálogo (`FAMILIAS`), preguntas frecuentes, páginas nuevas y legales; genera `public/` y `archivos.generado.js`.
- `anadir.cjs`: añade una novedad o un artículo (lo usa la tarea automática).
- `public/estilo.css`: colores y aspecto. `public/fuentes/`: letras (Barlow Condensed para títulos y Barlow para texto, servidas desde la propia web). Estilo «Sobrio de mercado» (14/11/2026): papel blanco roto, tinta casi negra, solo granate, esquinas rectas, sin sombras, líneas finas, casi sin movimiento.
- `public/wp-content/`: fotos de la web antigua (mismas rutas). `fotos/`: copia de las fotos nuevas, que se sirven desde el almacén KV de Cloudflare `ferjusanz-web-fotos` en `/fotos/…` (así el Worker no crece).
- `worker.js`: sirve la web. `PRUEBAS = true` → no la ve Google.
- `TAREA_AUTOMATICA.md`: lo que hace la tarea programada cada 2 días. `DIARIO.md`: lo que ha publicado.
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
