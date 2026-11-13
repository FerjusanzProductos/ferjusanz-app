# Web pública de Ferjusanz (nueva)

Copia mejorada de www.ferjusanz-frutas-verduras.es (la de Creativate), sin WordPress.
- **Pruebas**: https://ferjusanz-web.fernandosanzalba.workers.dev (Worker `ferjusanz-web`). Oculta para Google.
- Mismas direcciones de página, títulos y descripciones que la web antigua, para no perder posiciones en Google.

## Archivos
- `paginas.json`: textos de cada página, copiados de la web antigua (con `copiar-web-antigua.cjs`). **Aquí se cambian los textos.**
- `construir.cjs`: diseño (cabecera, menú, pie, botones) y genera `public/` y `archivos.generado.js`.
- `public/estilo.css`: colores y aspecto. `public/wp-content/`: fotos (mismas rutas que la web antigua).
- `worker.js`: sirve la web. `PRUEBAS = true` → no la ve Google.

## Publicar
```
cd web && node construir.cjs && CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx -y wrangler@4 deploy
```
Comprobar en local (el entorno no abre `ferjusanz-web…`): `npx -y wrangler@4 dev --port 8799` y abrir http://127.0.0.1:8799.

## El día que tengamos el dominio
1. `PRUEBAS = false` en `worker.js` y publicar.
2. En Cloudflare, añadir el dominio y apuntar `www` a este Worker (y la app a `app.`). Antes, preparar el correo del dominio si hay buzones.
3. Google Search Console: dar de alta y enviar `sitemap.xml`. Añadir Google Tag Manager si se sigue usando.
