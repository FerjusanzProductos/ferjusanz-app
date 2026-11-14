// Sirve la web pública de Ferjusanz (archivos de web/public/, listados en archivos.generado.js).
import ARCHIVOS from "./archivos.generado.js";
import REDIRECCIONES from "./redirecciones.json";

// Mientras sea la web de PRUEBAS, que Google no la guarde. Poner a false al pasar al dominio.
const PRUEBAS = true;

const REDIRIGIR = [
  [/^\/(blog\/page|author|category)\//, "/blog/"],
  [/^\/servicios-de-distribucion-y-exportacion\/entrega-a-domicilio-frutas-y-verduras-por-covid19\/?$/, "/"],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let ruta = decodeURI(url.pathname);
    // Fotos nuevas (novedades y artículos): en el almacén KV, no dentro del Worker.
    if (ruta.startsWith("/fotos/")) {
      const foto = await env.FOTOS.get(ruta.slice(1), { type: "arrayBuffer", cacheTtl: 86400 });
      if (foto) return new Response(foto, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=2592000, immutable" } });
    }
    const nueva = REDIRECCIONES[ruta] || REDIRECCIONES[ruta + "/"];
    if (nueva) return Response.redirect(url.origin + nueva, 301);
    for (const [patron, destino] of REDIRIGIR) if (patron.test(ruta)) return Response.redirect(url.origin + destino, 301);
    // Las páginas van siempre con barra al final, como en la web antigua.
    if (!ARCHIVOS[ruta] && ARCHIVOS[ruta + "/"]) return Response.redirect(url.origin + ruta + "/" + url.search, 301);
    if (ruta === "/robots.txt" && !PRUEBAS) return new Response("User-agent: *\nAllow: /\nSitemap: https://www.ferjusanz-frutas-verduras.es/sitemap.xml\n");
    const archivo = ARCHIVOS[ruta] || ARCHIVOS["/404.html"];
    const headers = { "content-type": archivo[1], "cache-control": ruta.startsWith("/wp-content/") || ruta.startsWith("/fuentes/") ? "public, max-age=2592000" : "public, max-age=300" };
    if (PRUEBAS) headers["x-robots-tag"] = "noindex, nofollow";
    return new Response(archivo[0], { status: ARCHIVOS[ruta] ? 200 : 404, headers });
  },
};
