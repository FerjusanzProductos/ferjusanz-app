// Sirve la web pública de Ferjusanz (archivos de web/public/, listados en archivos.generado.js).
import ARCHIVOS from "./archivos.generado.js";
import REDIRECCIONES from "./redirecciones.json";

// Mientras sea la web de PRUEBAS, que Google no la guarde. Poner a false al pasar al dominio.
const PRUEBAS = true;

// Formulario de contacto: el Worker lo pasa a la función de Supabase que manda el correo a la empresa.
const FUNCION_CONTACTO = "https://hvydnjaswdexttogsyen.supabase.co/functions/v1/web-contacto";
const DOMINIO_SIN_WWW = "ferjusanz-frutas-verduras.es";

const REDIRIGIR = [
  [/^\/(blog\/page|author|category)\//, "/blog/"],
  [/^\/servicios-de-distribucion-y-exportacion\/entrega-a-domicilio-frutas-y-verduras-por-covid19\/?$/, "/"],
];

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // Siempre con www (el día del traslado, el dominio sin www también apunta aquí).
    if (url.hostname === DOMINIO_SIN_WWW) return Response.redirect("https://www." + DOMINIO_SIN_WWW + url.pathname + url.search, 301);
    let ruta = decodeURI(url.pathname);
    if (ruta === "/enviar-contacto") return enviarContacto(request, url, env);
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
    const headers = { "content-type": archivo[1], "cache-control": ruta.startsWith("/wp-content/") || ruta.startsWith("/fuentes/") ? "public, max-age=2592000" : archivo[1].startsWith("text/html") ? "no-cache" : "public, max-age=300" };
    if (PRUEBAS) headers["x-robots-tag"] = "noindex, nofollow";
    // Cabeceras básicas de seguridad.
    Object.assign(headers, { "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "x-frame-options": "SAMEORIGIN", "strict-transport-security": "max-age=31536000", "permissions-policy": "camera=(), microphone=(), geolocation=()" });
    return new Response(archivo[0], { status: ARCHIVOS[ruta] ? 200 : 404, headers });
  },
};

// Recibe el formulario de /contacto/, lo manda a la función que envía el correo y vuelve a /contacto/ con el resultado.
async function enviarContacto(request, url, env) {
  const volver = (q) => Response.redirect(url.origin + "/contacto/?" + q + "#formulario", 303);
  console.log("contacto", request.method, request.headers.get("origin"));
  if (request.method !== "POST") return volver("");
  // Solo desde la propia web (si el navegador no manda el origen, se deja pasar: la función valida igual).
  const origen = request.headers.get("origin");
  if (origen && origen !== "null" && origen !== url.origin) return new Response("Origen no permitido", { status: 403 });
  try {
    const datos = Object.fromEntries(await request.formData());
    const r = await fetch(env.FUNCION_CONTACTO || FUNCION_CONTACTO, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(datos) });
    const j = await r.json().catch(() => ({}));
    console.log("contacto respuesta", r.status, JSON.stringify(j));
    return volver(j.ok ? "enviado=1" : "error=" + encodeURIComponent(j.error || "envio"));
  } catch (e) {
    console.log("contacto fallo", String(e));
    return volver("error=envio");
  }
}
