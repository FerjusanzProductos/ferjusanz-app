// WhatsApp automático de Ferjusanz (función de Supabase «whatsapp»). Fase 1: Harvey PROPONE, la oficina envía.
//
// 1) Meta (WhatsApp Cloud API) llama aquí cuando un cliente escribe:
//    - GET  = comprobación del webhook (hub.verify_token = secreto WHATSAPP_VERIFY_TOKEN).
//    - POST con cabecera X-Hub-Signature-256 = mensajes nuevos (firmados con WHATSAPP_APP_SECRET).
//    Se guardan en whatsapp_mensajes y Harvey prepara una respuesta (no la envía).
// 2) La app (oficina/admin con sesión) llama con POST { accion: "enviar", telefono, texto }
//    para mandar la respuesta revisada por WhatsApp.
//
// Secretos de Supabase: WHATSAPP_TOKEN, WHATSAPP_PHONE_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET,
// ANTHROPIC_API_KEY (ya existe) y opcional HARVEY_MODEL / WHATSAPP_API_VERSION.
// Se publica SIN comprobar JWT (Meta no lo tiene): la seguridad la ponen la firma de Meta y la sesión de la app.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
const env = (k: string) => Deno.env.get(k) || "";
const MODELO = env("HARVEY_MODEL") || "claude-opus-5-5";
const VERSION = env("WHATSAPP_API_VERSION") || "v23.0";
// deno-lint-ignore no-explicit-any
type SB = any;
const admin = (): SB => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));
const ultimos9 = (t: unknown) => String(t ?? "").replace(/\D/g, "").slice(-9);

const SISTEMA = `Eres el ayudante de la oficina de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., mayoristas de patatas, frutas, verduras y huevos en Mercamadrid (Madrid). Empresa familiar con tres generaciones, reparto en el local del cliente y trato directo.
Contacto: Tels 91 763 21 86 · Móviles 609 100 690 – 616 439 157 – 609 567 354 · Carare, 2 – 28033 Madrid.

Un cliente nos ha escrito por WhatsApp. Escribe la RESPUESTA que la oficina le mandaría. La oficina la revisa antes de enviarla.
Reglas:
- Solo hablas de Ferjusanz: pedidos, género, repartos, albaranes y facturas. Si preguntan otra cosa, contesta con amabilidad que por aquí atendemos sus pedidos.
- Español de España, de «usted», cercano y breve (2 a 5 líneas), sin Markdown (como mucho *negritas* de WhatsApp). Sin firmar como Harvey ni como IA.
- Si hace un pedido: repíteselo claro (producto, cantidad y unidad) y di que se lo confirmamos enseguida. Usa lo que suele llevar solo para entender lo que pide («lo de siempre»).
- NUNCA des precios, descuentos, plazos de pago ni prometas disponibilidad u horas de reparto: di que se lo confirma la oficina.
- Si es una queja: pide disculpas, pide detalles (producto, día, foto) y di que lo miramos hoy mismo.
- Si no entiendes el mensaje (audio, foto, algo confuso), pide con amabilidad que lo repita por escrito o di que le llamamos.
Después de la respuesta, en una línea aparte que empiece por «NOTA:», explica en pocas palabras a la oficina qué pide el cliente y qué hay que comprobar (si no hace falta, no pongas NOTA).`;

async function verificarFirma(cuerpo: string, firma: string) {
  const secreto = env("WHATSAPP_APP_SECRET");
  if (!secreto || !firma.startsWith("sha256=")) return false;
  const k = await crypto.subtle.importKey("raw", new TextEncoder().encode(secreto), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC", k, new TextEncoder().encode(cuerpo)));
  const hex = [...mac].map(b => b.toString(16).padStart(2, "0")).join("");
  const dada = firma.slice(7);
  if (hex.length !== dada.length) return false;
  let dif = 0; for (let i = 0; i < hex.length; i++) dif |= hex.charCodeAt(i) ^ dada.charCodeAt(i);
  return dif === 0;
}

async function buscarCliente(sb: SB, telefono: string) {
  const t = ultimos9(telefono); if (t.length < 9) return null;
  for (let desde = 0; desde < 20000; desde += 1000) {
    const { data } = await sb.from("clientes").select("id,codigo,nombre,nombre_comercial,telefono,activo").not("telefono", "is", null).range(desde, desde + 999);
    const c = (data || []).find((x: any) => String(x.telefono).split(/[\/,;]| y /).some((p: string) => ultimos9(p) === t));
    if (c) return c;
    if (!data || data.length < 1000) break;
  }
  return null;
}

async function loDeSiempre(sb: SB, clienteId: string) {
  const desde = new Date(Date.now() - 90 * 86400000).toISOString().slice(0, 10);
  const { data: peds } = await sb.from("pedidos").select("id").eq("cliente_id", clienteId).gte("fecha_entrega", desde).limit(40);
  const ids = (peds || []).map((p: any) => p.id); if (!ids.length) return "";
  const { data: lin } = await sb.from("lineas_pedido").select("producto_id,cantidad_pedida,unidad_pedida").in("pedido_id", ids).limit(1500);
  const cuenta: Record<string, { n: number; c: number; u: string }> = {};
  for (const l of lin || []) { const k = l.producto_id; if (!k) continue; cuenta[k] ??= { n: 0, c: 0, u: l.unidad_pedida || "" }; cuenta[k].n++; cuenta[k].c += Number(l.cantidad_pedida || 0); }
  const top = Object.entries(cuenta).sort((a, b) => b[1].n - a[1].n).slice(0, 15);
  if (!top.length) return "";
  const { data: prods } = await sb.from("productos").select("id,nombre").in("id", top.map(([k]) => k));
  const nom: Record<string, string> = {}; for (const p of prods || []) nom[p.id] = p.nombre;
  return top.map(([k, v]) => `- ${nom[k] || "?"}: ${v.n} veces, unos ${Math.round(v.c / v.n * 10) / 10} ${v.u} cada vez`).join("\n");
}

// Harvey prepara la respuesta a la conversación de ese teléfono y la deja en el último mensaje recibido.
async function proponer(sb: SB, telefono: string) {
  const key = env("ANTHROPIC_API_KEY"); if (!key) return;
  const { data: hist } = await sb.from("whatsapp_mensajes").select("id,direccion,texto,tipo,cliente_id,nombre_contacto,created_at")
    .eq("telefono", telefono).order("created_at", { ascending: false }).limit(12);
  const conv = (hist || []).reverse();
  const ultimo = [...conv].reverse().find((m: any) => m.direccion === "entra"); if (!ultimo) return;
  let quien = `Nombre en WhatsApp: ${ultimo.nombre_contacto || "(sin nombre)"}. No está en nuestra lista de clientes (puede ser un cliente con otro teléfono o alguien nuevo).`;
  if (ultimo.cliente_id) {
    const { data: c } = await sb.from("clientes").select("codigo,nombre,nombre_comercial").eq("id", ultimo.cliente_id).maybeSingle();
    const siempre = await loDeSiempre(sb, ultimo.cliente_id);
    quien = `Cliente: ${c?.nombre_comercial || c?.nombre} (código ${c?.codigo}).` + (siempre ? `\nLo que suele pedir (últimos 90 días):\n${siempre}` : "");
  }
  const msgs: Anthropic.MessageParam[] = [];
  for (const m of conv) {
    const role = m.direccion === "entra" ? "user" : "assistant";
    const texto = m.tipo === "text" ? String(m.texto || "") : `[El cliente ha mandado un ${m.tipo}${m.texto ? ": " + m.texto : ""}]`;
    if (!texto.trim() || (!msgs.length && role === "assistant")) continue;
    const ult = msgs[msgs.length - 1];
    if (ult && ult.role === role) ult.content = ult.content + "\n" + texto; else msgs.push({ role, content: texto });
  }
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return;
  const hoy = new Date().toLocaleString("es-ES", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
  try {
    const r: any = await new Anthropic({ apiKey: key }).messages.create({
      model: MODELO, max_tokens: 1500, output_config: { effort: "low" },
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }, { type: "text", text: `Ahora es ${hoy}.\n${quien}` }],
      messages: msgs,
    } as any);
    const texto = (r.content || []).filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
    if (texto) await sb.from("whatsapp_mensajes").update({ propuesta: texto.slice(0, 4000), estado: "propuesto" }).eq("id", ultimo.id).eq("estado", "nuevo");
  } catch (e) {
    await sb.from("whatsapp_mensajes").update({ error: "Harvey no pudo preparar la respuesta: " + String((e as Error)?.message || e).slice(0, 300) }).eq("id", ultimo.id);
  }
}

async function recibir(req: Request) {
  const cuerpo = await req.text();
  if (!await verificarFirma(cuerpo, req.headers.get("X-Hub-Signature-256") || "")) return new Response("firma no válida", { status: 401 });
  let datos: any; try { datos = JSON.parse(cuerpo); } catch { return new Response("ok"); }
  const sb = admin();
  const telefonos = new Set<string>();
  for (const e of datos?.entry || []) for (const ch of e?.changes || []) {
    const v = ch?.value || {};
    if (env("WHATSAPP_PHONE_ID") && v?.metadata?.phone_number_id && v.metadata.phone_number_id !== env("WHATSAPP_PHONE_ID")) continue;
    const nombres: Record<string, string> = {}; for (const c of v.contacts || []) nombres[c.wa_id] = c?.profile?.name || "";
    for (const m of v.messages || []) {
      const tel = String(m.from || ""); if (!tel) continue;
      const texto = m.type === "text" ? m.text?.body : m.type === "button" ? m.button?.text : m.type === "interactive" ? (m.interactive?.button_reply?.title || m.interactive?.list_reply?.title) : (m[m.type]?.caption || null);
      const cli = await buscarCliente(sb, tel);
      const { error } = await sb.from("whatsapp_mensajes").insert({ telefono: tel, nombre_contacto: nombres[tel] || null, cliente_id: cli?.id || null, direccion: "entra",
        texto: texto ? String(texto).slice(0, 4000) : null, tipo: ["button", "interactive"].includes(m.type) ? "text" : m.type || "text", wa_id: m.id || null });
      if (!error) telefonos.add(tel); // si es un duplicado (Meta reintenta), no se vuelve a proponer
    }
    // Estados de los mensajes enviados (entregado, leído, fallido): solo se apuntan los fallos.
    for (const s of v.statuses || []) if (s.status === "failed") await sb.from("whatsapp_mensajes").update({ estado: "error", error: String(s.errors?.[0]?.title || "WhatsApp no lo entregó").slice(0, 300) }).eq("wa_id", s.id);
  }
  // Responder a Meta al momento y preparar las propuestas después.
  const tarea = Promise.all([...telefonos].map(t => proponer(sb, t)));
  // deno-lint-ignore no-explicit-any
  const er = (globalThis as any).EdgeRuntime; if (er?.waitUntil) er.waitUntil(tarea); else await tarea;
  return new Response("ok");
}

async function enviar(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const usr = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: auth } } });
  const { data: u } = await usr.auth.getUser();
  if (!u?.user) return json({ error: "Inicia sesión en la app" }, 401);
  const { data: perfil } = await usr.from("perfiles").select("rol,activo").eq("id", u.user.id).maybeSingle();
  if (!perfil || perfil.activo === false || !["oficina", "admin"].includes(perfil.rol)) return json({ error: "Solo la oficina puede enviar WhatsApp" }, 403);
  let b: any; try { b = await req.json(); } catch { return json({ error: "Petición no válida" }, 400); }
  if (b?.accion === "estado") return json({ configurado: !!(env("WHATSAPP_TOKEN") && env("WHATSAPP_PHONE_ID") && env("WHATSAPP_APP_SECRET") && env("WHATSAPP_VERIFY_TOKEN")) });
  if (b?.accion !== "enviar") return json({ error: "Acción desconocida" }, 400);
  const telefono = String(b.telefono || "").replace(/\D/g, ""), texto = String(b.texto || "").trim().slice(0, 4000);
  if (telefono.length < 9 || !texto) return json({ error: "Falta el teléfono o el texto" }, 400);
  if (!env("WHATSAPP_TOKEN") || !env("WHATSAPP_PHONE_ID")) return json({ error: "Falta configurar WhatsApp en Supabase (WHATSAPP_TOKEN y WHATSAPP_PHONE_ID)" }, 500);
  const sb = admin();
  // WhatsApp solo deja escribir libremente en las 24 horas siguientes al último mensaje del cliente.
  const { data: ult } = await sb.from("whatsapp_mensajes").select("created_at,cliente_id").eq("telefono", telefono).eq("direccion", "entra").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (!ult || Date.now() - Date.parse(ult.created_at) > 24 * 3600 * 1000) return json({ error: "Han pasado más de 24 horas desde su último mensaje: WhatsApp no deja contestar así. Llámale o escríbele desde el móvil." }, 400);
  const r = await fetch(`https://graph.facebook.com/${VERSION}/${env("WHATSAPP_PHONE_ID")}/messages`, {
    method: "POST", headers: { Authorization: `Bearer ${env("WHATSAPP_TOKEN")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: telefono, type: "text", text: { body: texto, preview_url: false } }),
  });
  const res: any = await r.json().catch(() => ({}));
  if (!r.ok) return json({ error: "WhatsApp no lo ha aceptado: " + String(res?.error?.message || r.status).slice(0, 300) }, 502);
  await sb.from("whatsapp_mensajes").insert({ telefono, cliente_id: ult.cliente_id, direccion: "sale", texto, wa_id: res?.messages?.[0]?.id || null, estado: "enviado", enviado_por: u.user.id });
  await sb.from("whatsapp_mensajes").update({ estado: "contestado" }).eq("telefono", telefono).eq("direccion", "entra").in("estado", ["nuevo", "propuesto"]);
  return json({ ok: true });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method === "GET") {
    const q = new URL(req.url).searchParams;
    const v = env("WHATSAPP_VERIFY_TOKEN");
    if (v && q.get("hub.mode") === "subscribe" && q.get("hub.verify_token") === v) return new Response(q.get("hub.challenge") || "", { status: 200 });
    return new Response("no", { status: 403 });
  }
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    return req.headers.get("X-Hub-Signature-256") ? await recibir(req) : await enviar(req);
  } catch (e) {
    return json({ error: "Error: " + String((e as Error)?.message || e).slice(0, 300) }, 500);
  }
});
