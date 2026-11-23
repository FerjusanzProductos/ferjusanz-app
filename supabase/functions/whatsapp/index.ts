// 💬 Asistente de WhatsApp de Ferjusanz (función de Supabase «whatsapp»), conectado a 360dialog (22/11/2026).
// MODO SILENCIOSO: no contesta ni envía nada a nadie. Solo lee los mensajes que llegan al 609 100 690
// (WhatsApp Business del padre, en «Coexistence») y apunta los PEDIDOS como propuesta en whatsapp_pedidos.
// - Cliente conocido (su teléfono está en «clientes»): se guarda el mensaje y, si es pedido, la propuesta.
// - Reenviado desde un número de la casa (Tito): es el pedido de un cliente; el cliente sale del texto.
// - Desconocido: solo si el TEXTO es claramente un pedido. Audios y fotos de desconocidos se ignoran (familia).
// - Grupos, ecos de lo que manda el padre (smb_message_echoes), estados e historial: se ignoran.
// Nada se guarda de los mensajes personales.
//
// 360dialog no firma como Meta: al dar de alta el webhook se pone la cabecera secreta
// «x-ferjusanz-secreto» y aquí se comprueba. Se publica SIN comprobar JWT (--no-verify-jwt).
// Secretos: WHATSAPP_WEBHOOK_SECRET (obligatorio), D360_API_KEY (para bajar audios y fotos),
// ANTHROPIC_API_KEY o GEMINI_API_KEY (leer el pedido; el audio solo lo transcribe Gemini).
// Opcionales: WHATSAPP_CASA (móviles de la casa, separados por comas), HARVEY_MODEL, GEMINI_MODEL, D360_BASE.
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k) || "";
const D360 = env("D360_BASE") || "https://waba-v2.360dialog.io";
const CASA = (env("WHATSAPP_CASA") || "609567354,616439157,609100690,917632186").split(",").map((t) => t.replace(/\D/g, "").slice(-9)).filter(Boolean);
const ultimos9 = (t: unknown) => String(t ?? "").replace(/\D/g, "").slice(-9);
const admin = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
type SB = ReturnType<typeof admin>;

// ---------- Búsqueda tolerante de clientes (la misma que Harvey v2) ----------
const VACIAS = new Set(["el", "la", "los", "las", "de", "del", "y", "e", "en", "a", "sl", "sa", "slu", "s", "l", "cb", "sc", "rest", "restaurante", "bar", "cafeteria", "cafe", "meson", "asador", "taberna", "cerveceria", "hotel", "colegio", "residencia", "grupo", "hosteleria", "distrib", "comercial"]);
const norm = (t: unknown) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, " ").trim();
const tokens = (t: unknown) => norm(t).split(" ").filter((w) => w && !VACIAS.has(w));
function lev(a: string, b: string) {
  if (a === b) return 0; const m = a.length, n = b.length; if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
function simPalabra(q: string, c: string) {
  if (q === c) return 1;
  const c2 = c.replace(/\d+$/, "");
  if (c2 && c2 !== c && q === c2) return 0.97;
  if (q.length >= 3 && c.startsWith(q)) return 0.75 + 0.2 * (q.length / c.length);
  if (c.length >= 4 && q.startsWith(c)) return 0.8;
  const d = Math.min(lev(q, c), c2 ? lev(q, c2) + 0.5 : 99), l = Math.max(q.length, c.length);
  const r = 1 - d / l; return q.length <= 3 ? (d === 0 ? 1 : 0) : r;
}
// deno-lint-ignore no-explicit-any
function puntuar(q: string, c: any) {
  const qn = norm(q), cod = norm(c.codigo);
  if (!qn) return 0;
  if (qn === cod) return 1;
  const textos = [c.nombre_comercial, c.nombre, ...(c.alias || [])].filter(Boolean);
  let mejor = 0;
  for (const t of textos) {
    const tn = norm(t); if (tn === qn) return 0.98;
    let base = tn.includes(qn) && qn.length >= 4 ? 0.9 : 0;
    const qt = tokens(q), ct = tokens(t);
    if (qt.length && ct.length) base = Math.max(base, qt.reduce((s, w) => s + Math.max(...ct.map((x) => simPalabra(w, x))), 0) / qt.length * 0.95);
    mejor = Math.max(mejor, base);
  }
  if (cod && qn.replace(/ /g, "").length >= 3 && cod.startsWith(qn.replace(/ /g, ""))) mejor = Math.max(mejor, 0.85);
  if (cod && cod.length >= 3 && qn.split(" ").includes(cod)) mejor = Math.max(mejor, 0.92);
  return mejor;
}
// deno-lint-ignore no-explicit-any
let CLIENTES: any[] | null = null;
async function clientes(sb: SB) {
  if (CLIENTES) return CLIENTES;
  const todos = [];
  for (let desde = 0; desde < 20000; desde += 1000) {
    const { data, error } = await sb.from("clientes").select("id,codigo,nombre,nombre_comercial,alias,telefono,activo").range(desde, desde + 999);
    if (error) throw error;
    todos.push(...(data || [])); if ((data || []).length < 1000) break;
  }
  return (CLIENTES = todos);
}
async function clientePorTelefono(sb: SB, tel: string) {
  const t = ultimos9(tel);
  if (t.length < 9) return null;
  return (await clientes(sb)).find((c) => String(c.telefono || "").split(/[\/,;]| y /).some((p) => ultimos9(p) === t)) || null;
}
// Devuelve el cliente si la coincidencia es clara; si no, null y las posibles para la nota.
async function clientePorNombre(sb: SB, texto: string) {
  if (!norm(texto)) return { cliente: null, posibles: [] as string[] };
  const res = (await clientes(sb)).map((c) => ({ c, p: puntuar(texto, c) * (c.activo === false ? 0.85 : 1) })).filter((x) => x.p >= 0.55).sort((x, y) => y.p - x.p).slice(0, 4);
  const clara = res.length > 0 && res[0].p >= 0.9 && (res.length === 1 || res[0].p - res[1].p >= 0.12);
  return { cliente: clara ? res[0].c : null, posibles: res.map((x) => `${x.c.nombre_comercial || x.c.nombre} (${x.c.codigo})`) };
}

// ---------- Productos (para que la IA devuelva el producto_id) ----------
let PRODUCTOS: { id: string; nombre: string; unidad_venta: string; alias: string[] | null }[] | null = null;
async function productos(sb: SB) {
  if (PRODUCTOS) return PRODUCTOS;
  const { data, error } = await sb.from("productos").select("id,nombre,unidad_venta,alias").eq("activo", true).order("nombre").limit(2000);
  if (error) throw error;
  return (PRODUCTOS = data || []);
}
// Desconocidos: antes de mandar nada a la IA, el texto tiene que nombrar un producto y llevar una cantidad.
// shortcut: comparación por palabras sueltas; si se cuelan o se pierden pedidos, cambiar por la búsqueda tolerante.
async function pareceProducto(sb: SB, texto: string) {
  const palabras = new Set(norm(texto).split(" ").map((w) => w.replace(/(es|s)$/, "")));
  if (!/\d|\b(una?|dos|tres|cuatro|cinco|seis|diez|media|medio|docena)\b/i.test(texto)) return false;
  return (await productos(sb)).some((p) => [p.nombre, ...(p.alias || [])].some((n) => tokens(n).some((w) => w.length >= 4 && palabras.has(w.replace(/(es|s)$/, "")))));
}

// ---------- Medios (audio y foto) desde 360dialog ----------
async function bajarMedio(id: string) {
  const key = env("D360_API_KEY");
  if (!key || !id) return null;
  const r = await fetch(`${D360}/${encodeURIComponent(id)}`, { headers: { "D360-API-KEY": key } });
  if (!r.ok) throw new Error(`360dialog no da el archivo (${r.status})`);
  const m = await r.json();
  const url = String(m.url || "").replace(/^https:\/\/lookaside\.fbsbx\.com/, D360);
  if (!url.startsWith(D360)) throw new Error("dirección del archivo inesperada");
  const f = await fetch(url, { headers: { "D360-API-KEY": key } });
  if (!f.ok) throw new Error(`no se pudo bajar el archivo (${f.status})`);
  const bytes = new Uint8Array(await f.arrayBuffer());
  if (bytes.length > 15e6) throw new Error("archivo demasiado grande");
  let bin = ""; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { mime: String(m.mime_type || f.headers.get("content-type") || "").split(";")[0], data: btoa(bin) };
}

// ---------- La IA lee el mensaje y devuelve el pedido ----------
const INSTRUCCIONES = `Lees mensajes de WhatsApp que llegan a FERJUSANZ, mayorista de frutas, verduras, patatas, huevos, setas y legumbres en Mercamadrid. NO contestas a nadie: solo apuntas pedidos para que la oficina los revise.
Devuelve SOLO un JSON así:
{"es_pedido": true|false, "cliente": "nombre del cliente si el mensaje lo dice, si no null", "fecha_entrega": "AAAA-MM-DD o null", "lineas": [{"producto_id": "id de la lista o null", "producto": "como lo dice el cliente", "cantidad": número o null, "unidad": "kg|caja|pieza|manojo|saco|docena|bandeja|… o null"}], "transcripcion": "si hay audio o foto, lo que dice o lo que pone, tal cual; si no, null", "nota": "dudas para la oficina en pocas palabras, o null"}
Reglas:
- es_pedido = true solo si pide género (aunque sea «lo de siempre» o una sola cosa). Saludos, charlas, fotos de familia, preguntas de precio o quejas: false (pon la duda en la nota si es de un cliente).
- No inventes cantidades ni productos. Si algo no está claro, cantidad null y explícalo en la nota.
- producto_id: elige de la lista solo si es claramente ese producto; si dudas, null.
- «mañana», «el lunes»…: calcula la fecha a partir de hoy. Si no dice fecha, null.`;

type Parte = { texto?: string; medio?: { mime: string; data: string } };
// deno-lint-ignore no-explicit-any
function sacarJSON(t: string): any {
  const i = t.indexOf("{"), j = t.lastIndexOf("}");
  if (i < 0 || j < i) throw new Error("la IA no devolvió el pedido");
  return JSON.parse(t.slice(i, j + 1));
}
async function conGemini(partes: Parte[]) {
  const cuerpo = JSON.stringify({ contents: [{ role: "user", parts: partes.map((p) => p.medio ? { inline_data: { mime_type: p.medio.mime, data: p.medio.data } } : { text: p.texto }) }], generationConfig: { responseMimeType: "application/json", temperature: 0 } });
  let fallo = "";
  // Gemini a veces dice «mucha demanda»: se reintenta y, si sigue, se prueba otro modelo.
  for (const modelo of [env("GEMINI_MODEL") || "gemini-flash-latest", "gemini-flash-lite-latest"]) for (let i = 0; i < 2; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, { method: "POST", headers: { "x-goog-api-key": env("GEMINI_API_KEY"), "Content-Type": "application/json" }, body: cuerpo });
    const d = await r.json().catch(() => ({}));
    if (r.ok) return sacarJSON((d.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join(""));
    fallo = "Gemini: " + String(d?.error?.message || r.status).slice(0, 200);
    if (![429, 500, 503].includes(r.status)) throw new Error(fallo);
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  throw new Error(fallo);
}
async function conClaude(partes: Parte[]) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model: env("HARVEY_MODEL") || "claude-opus-5-5", max_tokens: 2000,
      messages: [{ role: "user", content: partes.map((p) => p.medio ? { type: "image", source: { type: "base64", media_type: p.medio.mime, data: p.medio.data } } : { type: "text", text: p.texto }) }] }),
  });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Claude: " + String(d?.error?.message || r.status).slice(0, 200));
  return sacarJSON((d.content || []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join(""));
}
// Fotos y texto: Claude si está su clave (si no, Gemini). Audios: Gemini (Claude no oye).
async function interpretar(sb: SB, contexto: string, texto: string | null, medio: Parte["medio"] | null) {
  const lista = (await productos(sb)).map((p) => `${p.id}|${p.nombre}|${p.unidad_venta || ""}`).join("\n");
  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "2-digit", day: "2-digit", timeZone: "Europe/Madrid" });
  const partes: Parte[] = [{ texto: `${INSTRUCCIONES}\n\nHoy es ${hoy}.\nProductos (id|nombre|unidad):\n${lista}\n\n${contexto}\nMensaje: ${texto || "(sin texto)"}` }];
  if (medio) partes.push({ medio });
  const audio = medio && !medio.mime.startsWith("image/");
  if (audio ? env("GEMINI_API_KEY") : env("ANTHROPIC_API_KEY")) return audio ? conGemini(partes) : conClaude(partes);
  if (env("GEMINI_API_KEY")) return conGemini(partes);
  return null; // sin clave de IA: se apunta tal cual, sin leer
}

// ---------- Un mensaje ----------
// deno-lint-ignore no-explicit-any
async function procesar(sb: SB, m: any, nombre: string) {
  const tel = String(m.from || "");
  if (!tel || m.group_id || /@g\.us|-/.test(tel)) return "grupo";
  const casa = CASA.includes(ultimos9(tel));
  const reenviado = !!(m.context?.forwarded || m.context?.frequently_forwarded);
  const texto: string | null = m.type === "text" ? m.text?.body : m.type === "button" ? m.button?.text : m.type === "interactive" ? (m.interactive?.button_reply?.title || m.interactive?.list_reply?.title) : (m[m.type]?.caption || null);
  const tipo = ["audio", "voice", "image"].includes(m.type) ? (m.type === "voice" ? "audio" : m.type) : "text";
  if (!["text", "button", "interactive", "audio", "voice", "image"].includes(m.type)) return "tipo ignorado";

  if (casa && !reenviado) {
    // Nota de Tito justo después de reenviar («es de Donde Valentín»): completa la última propuesta suya.
    if (!texto) return "casa";
    const { data: ult } = await sb.from("whatsapp_pedidos").select("id,cliente_id,nota").eq("telefono", tel).eq("estado", "nuevo").gte("created_at", new Date(Date.now() - 15 * 60000).toISOString()).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (!ult) return "casa";
    const cambios: Record<string, unknown> = { nota: [ult.nota, "Nota de la casa: " + texto].filter(Boolean).join("\n").slice(0, 2000) };
    if (!ult.cliente_id) { const r = await clientePorNombre(sb, texto); if (r.cliente) { cambios.cliente_id = r.cliente.id; cambios.cliente_texto = texto.slice(0, 200); } }
    await sb.from("whatsapp_pedidos").update(cambios).eq("id", ult.id);
    return "nota";
  }
  const cli = casa ? null : await clientePorTelefono(sb, tel);
  if (!cli && !casa) {
    // Desconocido (familia, amigos o cliente con otro móvil): solo texto que parezca pedido; si no, ni se guarda.
    if (tipo !== "text" || !texto || !(await pareceProducto(sb, texto))) return "personal";
  }
  // Si ya está (360dialog reintenta), no se repite.
  const { data: ya } = await sb.from("whatsapp_pedidos").select("id").eq("wa_id", m.id).maybeSingle();
  if (ya) return "repetido";

  let medio = null, error: string | null = null;
  if (tipo !== "text") { try { medio = await bajarMedio(m[m.type]?.id); } catch (e) { error = String((e as Error).message || e); } if (!medio && !error) error = "Falta la clave de 360dialog para bajar " + (tipo === "audio" ? "el audio" : "la foto"); }
  const contexto = casa ? "Este mensaje lo ha REENVIADO alguien de la casa: es el pedido de un cliente. El nombre del cliente puede venir en el texto."
    : cli ? `Lo manda el cliente ${cli.nombre_comercial || cli.nombre} (código ${cli.codigo}).` : `Lo manda un número que no está en nuestra lista de clientes (nombre en WhatsApp: ${nombre || "sin nombre"}).`;
  // deno-lint-ignore no-explicit-any
  let ia: any = null;
  try { ia = await interpretar(sb, contexto, texto, medio); } catch (e) { error = [error, String((e as Error).message || e)].filter(Boolean).join(" · "); }
  if (!ia && !error && !env("ANTHROPIC_API_KEY") && !env("GEMINI_API_KEY")) error = "Falta la clave de la IA";
  if (ia && !ia.es_pedido && !casa) {
    if (!cli) return "personal";
    // Cliente que escribe algo que no es pedido: se guarda el mensaje (sin propuesta).
    await sb.from("whatsapp_mensajes").insert({ telefono: tel, nombre_contacto: nombre || null, cliente_id: cli.id, direccion: "entra", texto: (texto || ia.transcripcion || null)?.slice(0, 4000), tipo, wa_id: m.id });
    return "mensaje de cliente";
  }

  let cliente = cli, nota = ia?.nota || null;
  const cliTexto = ia?.cliente ? String(ia.cliente).slice(0, 200) : null;
  if (!cliente && cliTexto) {
    const r = await clientePorNombre(sb, cliTexto);
    cliente = r.cliente;
    if (!cliente) nota = [nota, r.posibles.length ? "¿Qué cliente es? Posibles: " + r.posibles.join(", ") : `No encuentro el cliente «${cliTexto}»`].filter(Boolean).join("\n");
  }
  const ids = new Set((await productos(sb)).map((p) => p.id));
  // deno-lint-ignore no-explicit-any
  const lineas = (Array.isArray(ia?.lineas) ? ia.lineas : []).slice(0, 80).map((l: any) => ({
    producto_id: ids.has(l?.producto_id) ? l.producto_id : null, producto: String(l?.producto || "").slice(0, 120),
    cantidad: Number.isFinite(Number(l?.cantidad)) && l?.cantidad !== null ? Number(l.cantidad) : null, unidad: l?.unidad ? String(l.unidad).slice(0, 30) : null,
  }));
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(String(ia?.fecha_entrega || "")) ? ia.fecha_entrega : null;
  await sb.from("whatsapp_mensajes").insert({ telefono: tel, nombre_contacto: nombre || null, cliente_id: cliente?.id || null, direccion: "entra", texto: (texto || ia?.transcripcion || null)?.slice(0, 4000), tipo, wa_id: m.id });
  const { error: e2 } = await sb.from("whatsapp_pedidos").insert({
    wa_id: m.id, telefono: tel, nombre_contacto: nombre || null, reenviado: casa, cliente_id: cliente?.id || null, cliente_texto: cliTexto,
    fecha_entrega: fecha, lineas, tipo, texto_original: texto ? texto.slice(0, 4000) : null, transcripcion: ia?.transcripcion ? String(ia.transcripcion).slice(0, 4000) : null,
    nota: nota ? String(nota).slice(0, 2000) : (ia ? null : "Sin leer: mira el mensaje original."), error: error ? error.slice(0, 500) : null,
  });
  if (e2 && !/duplicate/i.test(e2.message)) throw e2;
  return "pedido";
}

function iguales(a: string, b: string) {
  if (!a || a.length !== b.length) return false;
  let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("no", { status: 405 });
  const secreto = env("WHATSAPP_WEBHOOK_SECRET");
  if (!secreto || !iguales(req.headers.get("x-ferjusanz-secreto") || "", secreto)) return new Response("no", { status: 401 });
  // deno-lint-ignore no-explicit-any
  let datos: any;
  try { datos = await req.json(); } catch { return new Response("ok"); }
  const sb = admin();
  const resultados: string[] = [];
  const tarea = (async () => {
    for (const e of datos?.entry || []) for (const ch of e?.changes || []) {
      if (ch?.field && ch.field !== "messages") { resultados.push("ignorado: " + ch.field); continue; } // ecos, historial, estados de la app
      const v = ch?.value || {};
      const nombres: Record<string, string> = {};
      for (const c of v.contacts || []) nombres[c.wa_id] = c?.profile?.name || "";
      for (const m of v.messages || []) {
        try { resultados.push(await procesar(sb, m, nombres[m.from] || "")); } catch (err) { console.error("whatsapp", m?.id, err); resultados.push("error"); }
      }
    }
  })();
  // Contestar a 360dialog al momento y seguir trabajando después (si no, reintenta). En pruebas se puede esperar.
  // deno-lint-ignore no-explicit-any
  const er = (globalThis as any).EdgeRuntime;
  if (er?.waitUntil && req.headers.get("x-esperar") !== "1") { er.waitUntil(tarea); return new Response("ok"); }
  await tarea;
  return new Response(JSON.stringify(resultados), { headers: { "Content-Type": "application/json" } });
});
