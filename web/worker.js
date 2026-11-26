// Sirve la web pública de Ferjusanz (archivos de web/public/, listados en archivos.generado.js).
import ARCHIVOS from "./archivos.generado.js";
import REDIRECCIONES from "./redirecciones.json";

// La copia de pruebas (*.workers.dev) no la guarda Google; en el dominio sí (desde el 23/11/2026).

// Formulario de contacto: el Worker lo pasa a la función de Supabase que manda el correo a la empresa.
const FUNCION_CONTACTO = "https://hvydnjaswdexttogsyen.supabase.co/functions/v1/web-contacto";
const DOMINIO_SIN_WWW = "ferjusanz-frutas-verduras.es";

// Contador de visitas propio (sin cookies): cada página vista va a web_visitas de la base real. Clave pública: solo puede añadir.
const VISITAS = "https://hvydnjaswdexttogsyen.supabase.co/rest/v1/rpc/registrar_visita";
const CLAVE_PUBLICA = "sb_publishable_B6ZWPBp54OT62yXU3khygQ_eIm6UnVq";
// Base para el formulario «primer pedido» de la tarjeta: la real; para probar en local, SUPABASE_URL y SUPABASE_CLAVE de la de pruebas.
const BASE_REAL = "https://hvydnjaswdexttogsyen.supabase.co";
// IndexNow: avisa a Bing (de donde saca ChatGPT/Copilot), Yandex y otros de las páginas nuevas o cambiadas, sin Cloudflare ni Bing Webmaster.
// La clave es pública por diseño (se sirve en /<clave>.txt para demostrar que la web es nuestra).
const INDEXNOW_CLAVE = "bdc31633139e3b652bedbffc71e05789";
const ROBOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|node|go-http|facebookexternalhit|whatsapp/i;

function apuntarVisita(request, ruta) {
  if (request.method !== "GET" || ROBOT.test(request.headers.get("user-agent") || "") || request.headers.get("purpose") === "prefetch" || request.headers.get("sec-purpose")) return;
  let origen = null;
  try { const r = new URL(request.headers.get("referer")); if (!/ferjusanz/.test(r.hostname)) origen = r.hostname.replace(/^www\./, ""); } catch {}
  return fetch(VISITAS, { method: "POST", headers: { apikey: CLAVE_PUBLICA, "content-type": "application/json" },
    body: JSON.stringify({ p_ruta: ruta, p_origen: origen, p_pais: request.cf?.country || null, p_movil: /Mobi|Android/i.test(request.headers.get("user-agent") || "") }) })
    .catch(e => console.log("visita fallo", String(e)));
}

const REDIRIGIR = [
  [/^\/(blog\/page|author|category)\//, "/blog/"],
  [/^\/servicios-de-distribucion-y-exportacion\/entrega-a-domicilio-frutas-y-verduras-por-covid19\/?$/, "/"],
];

// Cada mañana (cron en wrangler.jsonc): la primera vez manda todo el sitemap; después, solo lo cambiado en los últimos 3 días.
async function avisarIndexNow(env) {
  const xml = ARCHIVOS["/sitemap.xml"][0];
  const todo = !(await env.FOTOS.get("indexnow-inicial"));
  const desde = new Date(Date.now() - 3 * 864e5).toISOString().slice(0, 10);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>(?:<lastmod>([^<]*)<\/lastmod>)?/g)].filter(m => todo || (m[2] || "") >= desde).map(m => m[1]);
  if (!urls.length) return;
  const r = await fetch("https://api.indexnow.org/indexnow", { method: "POST", headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify({ host: "www." + DOMINIO_SIN_WWW, key: INDEXNOW_CLAVE, keyLocation: `https://www.${DOMINIO_SIN_WWW}/${INDEXNOW_CLAVE}.txt`, urlList: urls }) });
  console.log("indexnow", r.status, urls.length);
  await env.FOTOS.put("indexnow-ultimo", `${new Date().toISOString()} ${r.status} ${urls.length} ${(await r.text()).slice(0, 200)}`);
  if (r.ok && todo) await env.FOTOS.put("indexnow-inicial", new Date().toISOString());
}

export default {
  async scheduled(evento, env, ctx) { ctx.waitUntil(avisarIndexNow(env)); },
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const PRUEBAS = url.hostname.endsWith(".workers.dev");
    // Siempre con www (el día del traslado, el dominio sin www también apunta aquí).
    if (url.hostname === DOMINIO_SIN_WWW) return Response.redirect("https://www." + DOMINIO_SIN_WWW + url.pathname + url.search, 301);
    let ruta = decodeURI(url.pathname);
    if (ruta === "/favicon.ico") return Response.redirect(url.origin + "/marca/icono-32.png", 301); // el móvil lo pide aunque haya <link rel=icon>
    if (ruta === "/enviar-contacto") return enviarContacto(request, url, env);
    if (ruta === "/enviar-primer-pedido") return enviarPrimerPedido(request, url, env);
    // Fotos nuevas (novedades y artículos): en el almacén KV, no dentro del Worker.
    if (ruta.startsWith("/fotos/")) {
      const foto = await env.FOTOS.get(ruta.slice(1), { type: "arrayBuffer", cacheTtl: 86400 });
      if (foto && ruta.endsWith(".mp4")) {
        // El iPhone solo reproduce vídeo si el servidor contesta por trozos (Range → 206).
        const h = { "content-type": "video/mp4", "accept-ranges": "bytes", "cache-control": "public, max-age=2592000, immutable" };
        const m = /^bytes=(\d*)-(\d*)$/.exec(request.headers.get("range") || "");
        if (!m || (!m[1] && !m[2])) return new Response(foto, { headers: h });
        const total = foto.byteLength;
        const ini = m[1] ? +m[1] : Math.max(0, total - +m[2]);
        const fin = m[1] && m[2] ? Math.min(+m[2], total - 1) : total - 1;
        if (ini > fin || ini >= total) return new Response(null, { status: 416, headers: { "content-range": `bytes */${total}` } });
        return new Response(foto.slice(ini, fin + 1), { status: 206, headers: { ...h, "content-range": `bytes ${ini}-${fin}/${total}` } });
      }
      // El archivo del catálogo de Meta (Tito 23/11/2026) también va en el KV: sin caché larga, para poder rehacerlo.
      if (foto && ruta.endsWith(".csv")) return new Response(foto, { headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "no-cache" } });
      if (foto) return new Response(foto, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=2592000, immutable" } });
    }
    const nueva = REDIRECCIONES[ruta] || REDIRECCIONES[ruta + "/"];
    if (nueva) return Response.redirect(url.origin + nueva, 301);
    for (const [patron, destino] of REDIRIGIR) if (patron.test(ruta)) return Response.redirect(url.origin + destino, 301);
    // Las páginas van siempre con barra al final, como en la web antigua.
    if (!ARCHIVOS[ruta] && ARCHIVOS[ruta + "/"]) return Response.redirect(url.origin + ruta + "/" + url.search, 301);
    if (ruta === "/" + INDEXNOW_CLAVE + ".txt") return new Response(INDEXNOW_CLAVE);
    if (ruta === "/robots.txt" && !PRUEBAS) return new Response("User-agent: *\nAllow: /\nSitemap: https://www.ferjusanz-frutas-verduras.es/sitemap.xml\n");
    const archivo = ARCHIVOS[ruta] || ARCHIVOS["/404.html"];
    const headers = { "content-type": archivo[1], "cache-control": ruta.startsWith("/wp-content/") || ruta.startsWith("/fuentes/") ? "public, max-age=2592000" : archivo[1].startsWith("text/html") ? "no-cache" : "public, max-age=300" };
    if (PRUEBAS) headers["x-robots-tag"] = "noindex, nofollow";
    // Cabeceras básicas de seguridad.
    Object.assign(headers, { "x-content-type-options": "nosniff", "referrer-policy": "strict-origin-when-cross-origin", "x-frame-options": "SAMEORIGIN", "strict-transport-security": "max-age=31536000", "permissions-policy": "camera=(), microphone=(), geolocation=()" });
    if (ARCHIVOS[ruta] && archivo[1].startsWith("text/html")) { const v = apuntarVisita(request, ruta); if (v) ctx.waitUntil(v); }
    if (ruta === "/tarjeta/") { headers["permissions-policy"] = "camera=(), microphone=(self), geolocation=()"; return new Response(await tarjetaConProductos(archivo[0], url, env), { status: 200, headers }); }
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

// ───────── Tarjeta: «Imagine su primer pedido y le calculamos su tarifa» (16/11/2026) ─────────
const rpc = (env, fn, body) => fetch((env.SUPABASE_URL || BASE_REAL) + "/rest/v1/rpc/" + fn, { method: "POST",
  headers: { apikey: env.SUPABASE_CLAVE || CLAVE_PUBLICA, "content-type": "application/json" }, body: JSON.stringify(body || {}) });
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const esc = (t) => String(t ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Pone en la tarjeta los productos de la tarifa (sin precios) y el contacto del enlace personal (?p=).
// shortcut: pide la lista a la base en cada visita (pocas visitas); si crecen, guardarla 10 min con caches.default.
async function tarjetaConProductos(html, url, env) {
  let filas = "";
  try {
    const r = await rpc(env, "primer_pedido_productos");
    const lista = r.ok ? await r.json() : [];
    // Por familias (desplegables) para que no sea una lista eterna; el buscador abre las que coinciden.
    const fila = (x) => `<div class="pp-fila"><label class="pp-usa"><input type="checkbox" name="u_${esc(x.id)}" value="1"><span>${esc(x.nombre)}</span></label><input name="c_${esc(x.id)}" type="text" inputmode="decimal" maxlength="8" pattern="[0-9]{1,5}([.,][0-9]{1,2})?" title="Solo números, por ejemplo 2 o 2,5" placeholder="¿cuánto?" aria-label="${esc(x.nombre)}: cantidad por semana (opcional)"><small>${esc(x.unidad || "")}<em class="pp-cp">mejor<br>calidad-precio</em></small></div>`;
    // Arriba, los típicos de hostelería (dest); el resto, plegado por familias y con el buscador, para no saturar.
    const dest = lista.filter((x) => x.dest != null).sort((a, b) => a.dest - b.dest), resto = lista.filter((x) => x.dest == null);
    const familias = [];
    for (const x of resto) { const f = familias.find((g) => g[0] === x.familia); if (f) f[1].push(x); else familias.push([x.familia, [x]]); }
    if (lista.length) filas = `<p class="pp-cp-nota">✔ Por nuestra experiencia, siempre le ofrecemos la mejor relación calidad-precio para que salga beneficiado.</p><div class="pp-lista">${dest.map(fila).join("")}</div>` +
      `<input id="pp-buscar" type="search" placeholder="¿Usa algo más? Búsquelo aquí…" aria-label="Buscar otro producto">` +
      `<details id="pp-todos"><summary>Ver todos los productos (${lista.length})</summary><div class="pp-lista">` +
      familias.map(([f, xs]) => `<details class="pp-familia"><summary>${esc(f)} <small>(${xs.length})</small></summary>${xs.map(fila).join("")}</details>`).join("") + `</div></details>`;
  } catch (e) { console.log("productos fallo", String(e)); }
  const p = url.searchParams.get("p") || "";
  return html.replace("__PP_PRODUCTOS__", filas).replace("__PP_CONTACTO__", UUID.test(p) ? p : "");
}

async function enviarPrimerPedido(request, url, env) {
  const f = request.method === "POST" ? await request.formData().catch(() => null) : null;
  const p = f && UUID.test(f.get("p") || "") ? f.get("p") : "";
  const volver = (q) => Response.redirect(url.origin + "/tarjeta/?" + q + (p ? "&p=" + p : "") + "#primer-pedido", 303);
  if (!f) return volver("");
  const origen = request.headers.get("origin");
  if (origen && origen !== "null" && origen !== url.origin) return new Response("Origen no permitido", { status: 403 });
  const productos = [];
  // Marcado («lo uso») o con cantidad: los dos cuentan; la cantidad es opcional.
  const marcados = new Map();
  for (const [k, v] of f) {
    const id = k.slice(2);
    if (!UUID.test(id)) continue;
    if (k.startsWith("u_")) marcados.set(id, marcados.get(id) || "");
    if (k.startsWith("c_") && String(v).trim()) marcados.set(id, String(v).trim());
  }
  for (const [id, cantidad] of marcados) productos.push({ id, cantidad });
  const t = (k) => String(f.get(k) || "");
  const audio = await subirAudio(f.get("audio"), env);
  try {
    const r = await rpc(env, "web_primer_pedido", { p_negocio: t("negocio"), p_persona: t("persona"), p_tipo: t("tipo"), p_localidad: t("localidad"),
      p_telefono: t("telefono"), p_email: t("email"), p_productos: productos.slice(0, 100), p_otros: t("otros"), p_dias: f.getAll("dia").join(", "),
      p_reunion: [t("reunion"), t("cuando")].filter(Boolean).join(" · "), p_notas: "", p_prospecto: p || null, p_trampa: t("web"), p_audio: audio });
    const j = await r.json().catch(() => ({}));
    console.log("primer pedido", r.status, JSON.stringify(j));
    return volver(j.ok ? "enviado=1" : "error=" + encodeURIComponent(j.error || "envio"));
  } catch (e) {
    console.log("primer pedido fallo", String(e));
    return volver("error=envio");
  }
}

// Audio del posible cliente («cuéntenoslo en un audio»): a la carpeta privada primer-pedido-audios (la clave pública solo puede añadir).
const EXT = { "audio/webm": "webm", "video/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "m4a", "video/mp4": "m4a", "audio/x-m4a": "m4a", "audio/aac": "aac",
  "audio/mpeg": "mp3", "audio/mp3": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/3gpp": "3gp", "audio/amr": "amr" };
async function subirAudio(a, env) {
  if (!a || typeof a === "string" || !a.size || a.size > 10485760) return null;
  const tipo = (a.type || "").split(";")[0].toLowerCase(), ext = EXT[tipo];
  if (!ext) return null;
  const nombre = crypto.randomUUID() + "." + ext;
  try {
    const r = await fetch((env.SUPABASE_URL || BASE_REAL) + "/storage/v1/object/primer-pedido-audios/" + nombre, { method: "POST",
      headers: { apikey: env.SUPABASE_CLAVE || CLAVE_PUBLICA, "content-type": tipo }, body: a.stream() });
    if (!r.ok) { console.log("audio fallo", r.status, await r.text()); return null; }
    return nombre;
  } catch (e) { console.log("audio fallo", String(e)); return null; }
}
