// Sirve la app Ferjusanz (archivos de public/) desde un Worker de Cloudflare.
import indexHtml from "../public/index.html";
import guiaHtml from "../public/guia.html";
import swJs from "../public/sw.js";
import manifest from "../public/manifest.webmanifest";
import icon192 from "../public/icon-192.png";
import icon512 from "../public/icon-512.png";
import paso1 from "../public/guia-img/paso1.jpg";
import paso2 from "../public/guia-img/paso2.jpg";
import paso3 from "../public/guia-img/paso3.jpg";
import paso4 from "../public/guia-img/paso4.jpg";

const HTML = "text/html; charset=utf-8";
const ARCHIVOS = {
  "/": [indexHtml, HTML],
  "/index.html": [indexHtml, HTML],
  "/guia.html": [guiaHtml, HTML],
  "/sw.js": [swJs, "application/javascript; charset=utf-8"],
  "/manifest.webmanifest": [manifest, "application/manifest+json; charset=utf-8"],
  "/icon-192.png": [icon192, "image/png"],
  "/icon-512.png": [icon512, "image/png"],
  "/guia-img/paso1.jpg": [paso1, "image/jpeg"],
  "/guia-img/paso2.jpg": [paso2, "image/jpeg"],
  "/guia-img/paso3.jpg": [paso3, "image/jpeg"],
  "/guia-img/paso4.jpg": [paso4, "image/jpeg"],
};

export default {
  async fetch(request) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Método no permitido", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const ruta = new URL(request.url).pathname;
    const archivo = ARCHIVOS[ruta];
    if (!archivo) return new Response("No encontrado", { status: 404 });
    const [contenido, tipo] = archivo;
    const imagen = tipo.startsWith("image/");
    const headers = {
      "Content-Type": tipo,
      // La app y el service worker se revisan siempre para que las actualizaciones lleguen enseguida.
      "Cache-Control": imagen ? "public, max-age=86400" : "no-cache",
      "X-Content-Type-Options": "nosniff",
    };
    return new Response(request.method === "HEAD" ? null : contenido, { headers });
  },
};
