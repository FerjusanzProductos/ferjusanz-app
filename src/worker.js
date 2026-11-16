// Sirve la app Ferjusanz (archivos de public/) desde un Worker de Cloudflare.
import indexHtml from "../public/index.html";
import guiaHtml from "../public/guia.html";
import swJs from "../public/sw.js";
import sifXmlJs from "../public/sif-xml.js";
import manifest from "../public/manifest.webmanifest";
import icon192 from "../public/icon-192.png";
import icon512 from "../public/icon-512.png";
import iconP192 from "../public/icon-pruebas-192.png";
import iconP512 from "../public/icon-pruebas-512.png";
import paso1 from "../public/guia-img/paso1.jpg";
import pres_barlow_condensed_latin_700_normal from "../public/pres/barlow-condensed-latin-700-normal.woff2";
import pres_barlow_latin_400_normal from "../public/pres/barlow-latin-400-normal.woff2";
import pres_barlow_latin_600_normal from "../public/pres/barlow-latin-600-normal.woff2";
import pres_collage from "../public/pres/collage.jpg";
import pres_f_ancha from "../public/pres/f-ancha.jpg";
import pres_f_contacto from "../public/pres/f-contacto.jpg";
import pres_f_portada from "../public/pres/f-portada.jpg";
import pres_f_quienes from "../public/pres/f-quienes.jpg";
import pres_lado1 from "../public/pres/lado1.jpg";
import pres_lado2 from "../public/pres/lado2.jpg";
import pres_lado3 from "../public/pres/lado3.jpg";
import pres_lado4 from "../public/pres/lado4.jpg";
import pres_logo from "../public/pres/logo.png";
import pres_logo_jpg from "../public/pres/logo.jpg";
import pres_logo_oscuro from "../public/pres/logo-oscuro.png";
import pres_etiqueta from "../public/pres/etiqueta.jpg";
import paso2 from "../public/guia-img/paso2.jpg";
import paso3 from "../public/guia-img/paso3.jpg";
import paso4 from "../public/guia-img/paso4.jpg";
import ejemplosHtml from "../public/ejemplos.html";
import nuevosClientesHtml from "../public/nuevos-clientes.html";
import videoSinIva from "../public/guia-img/cobro_sin_iva.mp4";
import ej7_siniva_boton from "../public/guia-img/ej7_siniva_boton.jpg";
import ej8_siniva_calculado from "../public/guia-img/ej8_siniva_calculado.jpg";
import ej9_albaran_descuento from "../public/guia-img/ej9_albaran_descuento.jpg";
import ej10_cobrar from "../public/guia-img/ej10_cobrar.jpg";
import ej11_portal from "../public/guia-img/ej11_portal.jpg";
import ej1_preparar from "../public/guia-img/ej1_preparar.jpg";
import ej2_preparar_bajo from "../public/guia-img/ej2_preparar_bajo.jpg";
import ej3_pedido from "../public/guia-img/ej3_pedido.jpg";
import ej4_semana from "../public/guia-img/ej4_semana.jpg";
import ej5_albaran from "../public/guia-img/ej5_albaran.jpg";
import ej6_calendario from "../public/guia-img/ej6_calendario.jpg";

const HTML = "text/html; charset=utf-8";
/* La versión que muestra la app (APP_VERSION) se toma SIEMPRE de sw.js: así nunca se descuadran
   (antes se quedó en v231 y el aviso «hay una nueva» salía aunque ya estuviera actualizada). */
const VERSION = (/ferjusanz-v\d+/.exec(swJs) || [""])[0];
const indexApp = VERSION ? indexHtml.replace(/const APP_VERSION = 'ferjusanz-v\d+'/, "const APP_VERSION = '" + VERSION + "'") : indexHtml;
const ARCHIVOS = {
  "/": [indexApp, HTML],
  "/index.html": [indexApp, HTML],
  "/guia.html": [guiaHtml, HTML],
  "/sw.js": [swJs, "application/javascript; charset=utf-8"],
  "/sif-xml.js": [sifXmlJs, "application/javascript; charset=utf-8"],
  "/manifest.webmanifest": [manifest, "application/manifest+json; charset=utf-8"],
  "/icon-192.png": [icon192, "image/png"],
  "/icon-512.png": [icon512, "image/png"],
  "/guia-img/paso1.jpg": [paso1, "image/jpeg"],
  "/pres/barlow-condensed-latin-700-normal.woff2": [pres_barlow_condensed_latin_700_normal, "font/woff2"],
  "/pres/barlow-latin-400-normal.woff2": [pres_barlow_latin_400_normal, "font/woff2"],
  "/pres/barlow-latin-600-normal.woff2": [pres_barlow_latin_600_normal, "font/woff2"],
  "/pres/collage.jpg": [pres_collage, "image/jpeg"],
  "/pres/f-ancha.jpg": [pres_f_ancha, "image/jpeg"],
  "/pres/f-contacto.jpg": [pres_f_contacto, "image/jpeg"],
  "/pres/f-portada.jpg": [pres_f_portada, "image/jpeg"],
  "/pres/f-quienes.jpg": [pres_f_quienes, "image/jpeg"],
  "/pres/lado1.jpg": [pres_lado1, "image/jpeg"],
  "/pres/lado2.jpg": [pres_lado2, "image/jpeg"],
  "/pres/lado3.jpg": [pres_lado3, "image/jpeg"],
  "/pres/lado4.jpg": [pres_lado4, "image/jpeg"],
  "/pres/logo.png": [pres_logo, "image/png"],
  "/pres/logo.jpg": [pres_logo_jpg, "image/jpeg"],
  "/pres/logo-oscuro.png": [pres_logo_oscuro, "image/png"],
  "/pres/etiqueta.jpg": [pres_etiqueta, "image/jpeg"],
  "/guia-img/paso2.jpg": [paso2, "image/jpeg"],
  "/guia-img/paso3.jpg": [paso3, "image/jpeg"],
  "/guia-img/paso4.jpg": [paso4, "image/jpeg"],
  "/ejemplos.html": [ejemplosHtml, HTML],
  // Página pública para captar clientes nuevos (anuncios de Facebook/Instagram, QR, web).
  "/nuevos-clientes": [nuevosClientesHtml, HTML],
  "/nuevos-clientes.html": [nuevosClientesHtml, HTML],
  "/guia-img/cobro_sin_iva.mp4": [videoSinIva, "video/mp4"],
  "/guia-img/ej7_siniva_boton.jpg": [ej7_siniva_boton, "image/jpeg"],
  "/guia-img/ej8_siniva_calculado.jpg": [ej8_siniva_calculado, "image/jpeg"],
  "/guia-img/ej9_albaran_descuento.jpg": [ej9_albaran_descuento, "image/jpeg"],
  "/guia-img/ej10_cobrar.jpg": [ej10_cobrar, "image/jpeg"],
  "/guia-img/ej11_portal.jpg": [ej11_portal, "image/jpeg"],
  "/guia-img/ej1_preparar.jpg": [ej1_preparar, "image/jpeg"],
  "/guia-img/ej2_preparar_bajo.jpg": [ej2_preparar_bajo, "image/jpeg"],
  "/guia-img/ej3_pedido.jpg": [ej3_pedido, "image/jpeg"],
  "/guia-img/ej4_semana.jpg": [ej4_semana, "image/jpeg"],
  "/guia-img/ej5_albaran.jpg": [ej5_albaran, "image/jpeg"],
  "/guia-img/ej6_calendario.jpg": [ej6_calendario, "image/jpeg"],
};

/* App de PRUEBAS (dirección con «pruebas»): otro nombre, color e icono para no confundirla con la de trabajar. */
const PRUEBAS = {
  "/manifest.webmanifest": [(() => { const m = JSON.parse(manifest); m.name = "Ferjusanz PRUEBAS"; m.short_name = "PRUEBAS"; m.theme_color = "#ea580c";
    m.icons = [{ src: "icon-pruebas-192.png?v=sol", sizes: "192x192", type: "image/png", purpose: "any" }, { src: "icon-pruebas-512.png?v=sol", sizes: "512x512", type: "image/png", purpose: "any" }]; return JSON.stringify(m, null, 2); })(), "application/manifest+json; charset=utf-8"],
  "/icon-192.png": [iconP192, "image/png"],
  "/icon-512.png": [iconP512, "image/png"],
  "/icon-pruebas-192.png": [iconP192, "image/png"],
  "/icon-pruebas-512.png": [iconP512, "image/png"],
};

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const url = new URL(request.url), ruta = url.pathname.replace(/\/+$/, "") || "/";
    // Tarjeta virtual para posibles clientes (QR y WhatsApp): vive en la web. Al pasar al dominio, cambiar solo esta dirección.
    // ?p= = enlace personal de un contacto (formulario «primer pedido»); se pasa tal cual.
    if (ruta === "/tarjeta") return Response.redirect("https://ferjusanz-web.fernandosanzalba.workers.dev/tarjeta/" + url.search, 302);
    if (ruta === "/web") return Response.redirect("https://ferjusanz-web.fernandosanzalba.workers.dev/", 302);
    const archivo = (url.hostname.includes("pruebas") && PRUEBAS[ruta]) || ARCHIVOS[ruta];
    if (!archivo) return new Response("No encontrado", { status: 404 });
    const [contenido, tipo] = archivo;
    const imagen = tipo.startsWith("image/") || tipo.startsWith("video/");
    const headers = {
      "Content-Type": tipo,
      // La app y el service worker se revisan siempre para que las actualizaciones lleguen enseguida.
      "Cache-Control": imagen ? "public, max-age=86400" : "no-cache",
      "X-Content-Type-Options": "nosniff",
    };
    return new Response(request.method === "HEAD" ? null : contenido, { headers });
  },
};
