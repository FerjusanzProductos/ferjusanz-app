// Jarvis por Telegram (Tito, 28/11/2026). Desplegada como «jarvis-telegram» (sin comprobar JWT: la llama Telegram).
// - La app (admin) la llama con {accion:"conectar"}: con el token guardado en jarvis_ajustes registra el webhook en Telegram.
// - Telegram le manda cada mensaje. Solo contesta a chats vinculados con «/start CÓDIGO» (código de la app, 15 min).
//   Para contestar entra COMO esa persona (enlace de un solo uso, como scripts/claude-entra.mjs): Jarvis ve y hace
//   exactamente lo que esa persona puede en la app, con la misma confirmación «sí, hazlo».
import { createClient } from "npm:@supabase/supabase-js@2";

const URL_SB = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;
const admin = createClient(URL_SB, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
// La de pruebas llama a «jarvis-pruebas»; la normal, a «jarvis».
const CEREBRO = /pbeuxbwbpmlanbhhnpgy/.test(URL_SB) ? "jarvis-pruebas" : "jarvis";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const ajuste = async (clave: string) => (await admin.from("jarvis_ajustes").select("valor,actualizado").eq("clave", clave).maybeSingle()).data;
const tg = async (token: string, metodo: string, cuerpo: unknown) =>
  (await fetch(`https://api.telegram.org/bot${token}/${metodo}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(cuerpo) })).json();
const decir = async (token: string, chat: number, texto: string) => {
  for (let i = 0; i < texto.length; i += 4000) await tg(token, "sendMessage", { chat_id: chat, text: texto.slice(i, i + 4000) });
};
// Las marcas de la app no pintan nada en Telegram.
const limpiar = (t: string) => t
  .replace(/\[MENSAJE[^\]]*\]\s*/gi, "✉️ Mensaje para enviar:\n").replace(/\s*\[FIN\]/gi, "")
  .replace(/\[OFERTA\s+id=[^\]]+\]/gi, "📄 (La oferta está en la app, en Comercial › Listas.)")
  .replace(/\s*\[CONFIRMAR\]\s*/gi, "\n\n👉 Contesta «sí» para hacerlo o «no» para dejarlo.");

// Sesión de la persona vinculada, sin contraseña: enlace de un solo uso que se canjea aquí mismo.
async function sesionDe(perfil: string) {
  const { data: u } = await admin.auth.admin.getUserById(perfil);
  if (!u?.user?.email) throw new Error("usuario sin correo");
  const { data: l, error } = await admin.auth.admin.generateLink({ type: "magiclink", email: u.user.email });
  if (error) throw error;
  const sb = createClient(URL_SB, ANON, { auth: { persistSession: false } });
  const { data: s, error: e2 } = await sb.auth.verifyOtp({ type: "magiclink", token_hash: l.properties.hashed_token });
  if (e2 || !s.session) throw e2 || new Error("sin sesión");
  return s.session.access_token;
}

// Notas de voz (Tito, 28/11/2026): Telegram da el audio y Gemini (cuota gratis: el ligero primero, un 429 no se reintenta) lo pasa a texto.
async function oirAudio(token: string, a: { file_id: string; mime_type?: string; file_size?: number }) {
  const KEY = Deno.env.get("GEMINI_API_KEY");
  if (!KEY) throw new Error("no tengo con qué escuchar audios; escríbemelo");
  if ((a.file_size || 0) > 15e6) throw new Error("el audio es demasiado largo; mándalo más corto");
  const f = await tg(token, "getFile", { file_id: a.file_id });
  if (!f.ok) throw new Error("Telegram no me da el audio");
  const bin = new Uint8Array(await (await fetch(`https://api.telegram.org/file/bot${token}/${f.result.file_path}`)).arrayBuffer());
  let b = ""; for (let i = 0; i < bin.length; i += 32768) b += String.fromCharCode(...bin.subarray(i, i + 32768));
  const cuerpo = JSON.stringify({ contents: [{ role: "user", parts: [{ text: "Transcribe literalmente este audio en español de España. Devuelve solo lo que se dice, sin comentarios. Si no se entiende nada o solo es ruido o música, devuelve vacío." }, { inline_data: { mime_type: a.mime_type || "audio/ogg", data: btoa(b) } }] }], generationConfig: { temperature: 0 } });
  let fallo = "";
  for (const modelo of ["gemini-flash-lite-latest", "gemini-flash-latest"]) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, { method: "POST", headers: { "x-goog-api-key": KEY, "Content-Type": "application/json" }, body: cuerpo, signal: AbortSignal.timeout(50000) }).catch(e => new Response(JSON.stringify({ error: { message: String(e?.message || e) } }), { status: 503 }));
    const d = await r.json().catch(() => ({}));
    if (r.ok) return (d.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("").trim();
    fallo = String(d?.error?.message || r.status).slice(0, 120);
  }
  throw new Error("no he podido escuchar el audio (" + fallo + ")");
}
// Cobros y pagos de Golden solo para quien tiene permiso (como en la app, veCobros): si no, ni las cifras ni el resumen de la reunión.
const DINERO = ["cobros", "pagos"];
async function veCobros(yo: any, perfil: string) {
  const [a, b] = await Promise.all([yo.from("ver_cobros").select("user_id").eq("user_id", perfil).maybeSingle(), yo.from("ver_margenes").select("user_id").eq("user_id", perfil).maybeSingle()]);
  return !!(a.data || b.data);
}

async function atender(token: string, msg: any) {
  const chat = msg.chat.id as number, audio = msg.voice || msg.audio;
  let texto = String(msg.text || "").trim();
  if (!texto && !audio) return decir(token, chat, "Entiendo mensajes de texto y notas de voz.");
  const cod = texto.match(/^\/start\s+([0-9a-f]{32})$/);
  if (cod) {
    const a = await ajuste("codigo:" + cod[1]);
    if (!a || Date.now() - new Date(a.actualizado).getTime() > 15 * 60e3) return decir(token, chat, "Ese código no vale o ha caducado. Pulsa otra vez «📲 Conectar mi Telegram» en la app (🏢 Oficina).");
    await admin.from("jarvis_ajustes").delete().eq("clave", "codigo:" + cod[1]);
    await admin.from("jarvis_mensajes").delete().eq("chat_id", chat);
    await admin.from("jarvis_telegram").upsert({ chat_id: chat, perfil_id: a.valor, nombre: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") });
    return decir(token, chat, "✅ Conectado. Soy Jarvis, de Ferjusanz. Pregúntame «¿cómo vamos?» o lo que necesites.\n\nAviso: lo que me escribas y los datos de la empresa que consulte pasan por un servicio de IA externo (Anthropic); las notas de voz las pasa a texto Google (Gemini). Nunca mando nada a clientes; para cambiar datos te pido «sí». /nuevo empieza una conversación nueva.");
  }
  const { data: v } = await admin.from("jarvis_telegram").select("perfil_id").eq("chat_id", chat).maybeSingle();
  if (!v) return decir(token, chat, "Este chat no está conectado. En la app: 🏢 Oficina › Telegram › «📲 Conectar mi Telegram».");
  if (texto === "/nuevo") { await admin.from("jarvis_mensajes").delete().eq("chat_id", chat); return decir(token, chat, "Conversación nueva. ¿En qué te ayudo?"); }

  // «Escribiendo…» dura 5 segundos en Telegram: se repite mientras Jarvis piensa.
  await tg(token, "sendChatAction", { chat_id: chat, action: "typing" });
  const escribiendo = setInterval(() => tg(token, "sendChatAction", { chat_id: chat, action: "typing" }).catch(() => {}), 4500);
  try {
  if (audio) {
    try { texto = await oirAudio(token, audio); } catch (e) { return decir(token, chat, "⚠️ " + String((e as Error)?.message || e)); }
    if (!texto) return decir(token, chat, "🎙️ No he entendido el audio. Prueba otra vez, más cerca del móvil, o escríbemelo.");
    await decir(token, chat, "🎙️ He entendido: «" + texto + "»");
  }
  const { data: hist } = await admin.from("jarvis_mensajes").select("rol,texto").eq("chat_id", chat).order("id", { ascending: false }).limit(19);
  const mensajes = [...(hist || []).reverse(), { rol: "yo", texto }];
  let respuesta: string;
  try {
    const jwt = await sesionDe(v.perfil_id);
    const yo = createClient(URL_SB, ANON, { global: { headers: { Authorization: "Bearer " + jwt } }, auth: { persistSession: false } });
    const [est, reu] = await Promise.all([yo.rpc("oficina_estado"), yo.rpc("oficina_ultima_reunion")]);
    let acta = reu.data, estado = est.data;
    if (!(await veCobros(yo, v.perfil_id))) {
      if (estado && typeof estado === "object") estado = Object.fromEntries(Object.entries(estado).filter(([k]) => !DINERO.includes(k)));
      if (acta) acta = { ...acta, resumen: "", filas: (acta.filas || []).filter((f: any) => { const d = String(f.dep || "").toLowerCase(); return DEPS.some(n => !/^(cobros|pagos)$/i.test(n) && d.startsWith(n.toLowerCase().slice(0, 5))); }) };   // como la app: solo departamentos conocidos y no de dinero
    }
    const contexto = "Canal: Telegram (texto plano, sin botones; para confirmar, la persona contesta «sí»).\nESTADO DE LA OFICINA (datos reales): " + JSON.stringify(estado ?? est.error?.message)
      + (acta ? "\nÚLTIMA REUNIÓN DE PRIORIDADES (" + acta.creado + "): " + JSON.stringify(acta) : "");
    const r = await fetch(`${URL_SB}/functions/v1/${CEREBRO}`, { method: "POST",
      headers: { Authorization: "Bearer " + jwt, apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ mensajes, contexto }) });
    const d = await r.json().catch(() => ({}));
    respuesta = d.texto || "⚠️ " + (d.error || "Jarvis no ha contestado. Prueba otra vez.");
    if (d.texto) await admin.from("jarvis_mensajes").insert([{ chat_id: chat, rol: "yo", texto }, { chat_id: chat, rol: "harvey", texto: d.texto }]);
  } catch (e) {
    respuesta = "⚠️ No he podido entrar en la app: " + String((e as Error)?.message || e);
  }
  await decir(token, chat, limpiar(respuesta));
  } finally { clearInterval(escribiendo); }
}

// 📋 Reunión de las 7:00 (Tito, 28/11/2026). La lanza pg_cron (job «jarvis_reunion_7») con el secreto «cron_secreto».
// Mismo encargo y mismo formato que el botón «🗣️ Reunir a los departamentos» de la app (OF_REUNION / ofLeerActa en public/index.html).
const DEPS = ["Ventas", "Cobros", "Pagos", "Comercial", "Facturas prov.", "Clientes", "Informes", "Datos Golden"];
const REUNION = "REUNIÓN DE DEPARTAMENTOS. Tomas nota de la reunión (eres una herramienta de apoyo, no una persona del equipo): cada departamento (" + DEPS.join(", ") + ") dice sus prioridades (de 1 a 3 cada uno) para hoy y esta semana, sacadas del ESTADO DE LA OFICINA y de lo que consultes (deudas, contactos pendientes, quejas, ventas, clientes). Nada inventado: si un departamento no tiene datos, su prioridad es conseguirlos. Los pedidos, ventas y deudas que guarda la app son todavía de PRUEBA: no los uses ni los comentes; el dinero sale del ESTADO (Golden). Prioridades concretas, con cifras y nombres cuando los haya.\nContesta SOLO con líneas así, una por prioridad y sin nada más:\n[PRIO] Departamento | Prioridad (una frase) | alta o media o baja | Quién (Tito, su padre, Carmen, la oficina o Claude) | Para cuándo (hoy, esta semana o este mes)\nY al final una línea: [RESUMEN] las 3 cosas más importantes de toda la empresa, en una frase para leer en voz alta.";
function leerActa(t: string) {
  const URG: Record<string, number> = { alta: 0, media: 1, baja: 2 }, filas: any[] = [];
  for (const l of t.split("\n")) {
    const m = l.match(/\[PRIO\]\s*(.+)/i); if (!m) continue;
    const c = m[1].split("|").map(x => x.replace(/\*/g, "").trim()); if (c.length < 2 || !c[1]) continue;
    const u = (c[2] || "").toLowerCase();
    filas.push({ dep: c[0], prioridad: c[1], urgencia: /alta/.test(u) ? "alta" : /baja/.test(u) ? "baja" : "media", quien: c[3] || "", cuando: c[4] || "" });
  }
  const r = t.match(/\[RESUMEN\]\s*([^\n]+)/i);
  return { filas: filas.sort((a, b) => URG[a.urgencia] - URG[b.urgencia]), resumen: r ? r[1].replace(/\*/g, "").trim() : "" };
}
async function reunionDeLas7() {
  const quien = (await ajuste("reunion_perfil"))?.valor;
  if (!quien) throw new Error("falta reunion_perfil en jarvis_ajustes");
  const jwt = await sesionDe(quien);
  const yo = createClient(URL_SB, ANON, { global: { headers: { Authorization: "Bearer " + jwt } }, auth: { persistSession: false } });
  const est = await yo.rpc("oficina_estado");
  const r = await fetch(`${URL_SB}/functions/v1/${CEREBRO}`, { method: "POST", headers: { Authorization: "Bearer " + jwt, apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ mensajes: [{ rol: "yo", texto: REUNION }], contexto: "Canal: reunión automática de las 7:00.\nESTADO DE LA OFICINA (datos reales): " + JSON.stringify(est.data ?? est.error?.message) }) });
  const d = await r.json().catch(() => ({}));
  const acta = leerActa(String(d.texto || ""));
  if (!acta.filas.length) throw new Error("la reunión no ha dado prioridades: " + (d.error || String(d.texto || "").slice(0, 200)));
  const g = await yo.from("oficina_reuniones").insert({ filas: acta.filas, resumen: acta.resumen, autor: quien });
  if (g.error) throw g.error;
  // Si Tito tiene Telegram conectado, le llega el acta.
  const tok = (await ajuste("telegram_token"))?.valor;
  const { data: chats } = await admin.from("jarvis_telegram").select("chat_id").eq("perfil_id", quien);
  if (tok && chats?.length) {
    const ic: Record<string, string> = { alta: "🔴", media: "🟠", baja: "⚪" };
    const txt = "📋 Reunión de las 7:00 · prioridades de hoy\n\n" + (acta.resumen ? "🗒️ " + acta.resumen + "\n\n" : "")
      + acta.filas.map(f => `${ic[f.urgencia]} ${f.dep}: ${f.prioridad}${f.quien || f.cuando ? ` (${[f.quien, f.cuando].filter(Boolean).join(", ")})` : ""}`).join("\n")
      + "\n\nLa tabla completa, en la app: 🏢 Oficina.";
    for (const c of chats) await decir(tok, c.chat_id, txt);
  }
  console.log("reunión de las 7 guardada:", acta.filas.length, "prioridades");
}

Deno.serve(async (req) => {
  // 0) pg_cron: a las 5 y a las 6 UTC; solo se reúne cuando en Madrid son las 7 (vale en invierno y en verano).
  const cron = req.headers.get("x-jarvis-cron");
  if (cron !== null) {
    const sec = await ajuste("cron_secreto");
    if (!sec || cron !== sec.valor) return new Response("no", { status: 401 });
    const hora = Number(new Date().toLocaleString("en-GB", { timeZone: "Europe/Madrid", hour: "2-digit", hour12: false }));
    const forzar = new URL(req.url).searchParams.get("forzar") === "1";
    if (hora !== 7 && !forzar) return new Response("no es la hora (" + hora + ")");
    // ?esperar=1: para probarla a mano y ver cómo ha ido.
    if (new URL(req.url).searchParams.get("esperar") === "1") {
      try { await reunionDeLas7(); return new Response("hecha"); } catch (e) { return new Response("fallo: " + ((e as Error)?.message || e), { status: 500 }); }
    }
    (globalThis as any).EdgeRuntime.waitUntil(reunionDeLas7().catch(e => console.error("reunión de las 7:", e?.message || e)));
    return new Response("reunión en marcha");
  }

  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  const tok = await ajuste("telegram_token");

  // 1) Mensaje de Telegram: lo firma con el secreto que le dimos al conectar.
  const firma = req.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (firma !== null) {
    const sec = await ajuste("telegram_secreto");
    if (!tok || !sec || firma !== sec.valor) return new Response("no", { status: 401 });
    const upd = await req.json().catch(() => null);
    const msg = upd?.message;
    // Telegram repite el aviso si tardamos: se contesta ya y se trabaja después.
    if (msg?.chat?.type === "private") (globalThis as any).EdgeRuntime.waitUntil(atender(tok.valor, msg).catch(e => console.error(e)));
    return new Response("ok");
  }

  // 2) La app: «bot» (nombre del bot, oficina) y «conectar» (solo admin).
  const sb = createClient(URL_SB, ANON, { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return json({ error: "Inicia sesión en la app" }, 401);
  const { data: p } = await sb.from("perfiles").select("rol,activo").eq("id", u.user.id).maybeSingle();
  if (!p || p.activo === false || !["oficina", "admin"].includes(p.rol)) return json({ error: "Jarvis es solo para la oficina" }, 403);
  const { accion } = await req.json().catch(() => ({}));
  if (!tok) return json(accion === "bot" ? { bot: null } : { error: "Primero pega el token de BotFather" }, accion === "bot" ? 200 : 400);
  const yoBot = await tg(tok.valor, "getMe", {});
  if (accion === "bot") return json({ bot: yoBot.ok ? yoBot.result.username : null });
  if (p.rol !== "admin") return json({ error: "Solo un administrador puede conectar Telegram" }, 403);
  if (!yoBot.ok) return json({ error: "Telegram no acepta ese token. Cópialo otra vez de BotFather." }, 400);
  const secreto = crypto.randomUUID().replace(/-/g, "");
  // Primero Telegram y luego guardar el secreto: si Telegram dice que no (p. ej. dos pulsaciones seguidas), queda el anterior, que sigue valiendo.
  const w = await tg(tok.valor, "setWebhook", { url: `${URL_SB}/functions/v1/jarvis-telegram`, secret_token: secreto, allowed_updates: ["message"], drop_pending_updates: true });
  if (!w.ok) return json({ error: /too many/i.test(w.description || "") ? "Ya estaba conectándose: espera un momento, no hace falta pulsar otra vez." : "Telegram no ha aceptado la conexión: " + (w.description || "") }, 502);
  await admin.from("jarvis_ajustes").upsert({ clave: "telegram_secreto", valor: secreto, actualizado: new Date().toISOString() });
  return json({ ok: true, bot: yoBot.result.username });
});
