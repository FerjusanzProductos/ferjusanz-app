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

async function atender(token: string, msg: any) {
  const chat = msg.chat.id as number, texto = String(msg.text || "").trim();
  if (!texto) return decir(token, chat, "De momento solo entiendo mensajes de texto.");
  const cod = texto.match(/^\/start\s+([0-9a-f]{32})$/);
  if (cod) {
    const a = await ajuste("codigo:" + cod[1]);
    if (!a || Date.now() - new Date(a.actualizado).getTime() > 15 * 60e3) return decir(token, chat, "Ese código no vale o ha caducado. Pulsa otra vez «📲 Conectar mi Telegram» en la app (🏢 Oficina).");
    await admin.from("jarvis_ajustes").delete().eq("clave", "codigo:" + cod[1]);
    await admin.from("jarvis_mensajes").delete().eq("chat_id", chat);
    await admin.from("jarvis_telegram").upsert({ chat_id: chat, perfil_id: a.valor, nombre: [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") });
    return decir(token, chat, "✅ Conectado. Soy Jarvis, de Ferjusanz. Pregúntame «¿cómo vamos?» o lo que necesites.\n\nAviso: lo que me escribas y los datos de la empresa que consulte pasan por un servicio de IA externo (Anthropic). Nunca mando nada a clientes; para cambiar datos te pido «sí». /nuevo empieza una conversación nueva.");
  }
  const { data: v } = await admin.from("jarvis_telegram").select("perfil_id").eq("chat_id", chat).maybeSingle();
  if (!v) return decir(token, chat, "Este chat no está conectado. En la app: 🏢 Oficina › Telegram › «📲 Conectar mi Telegram».");
  if (texto === "/nuevo") { await admin.from("jarvis_mensajes").delete().eq("chat_id", chat); return decir(token, chat, "Conversación nueva. ¿En qué te ayudo?"); }

  await tg(token, "sendChatAction", { chat_id: chat, action: "typing" });
  const { data: hist } = await admin.from("jarvis_mensajes").select("rol,texto").eq("chat_id", chat).order("id", { ascending: false }).limit(19);
  const mensajes = [...(hist || []).reverse(), { rol: "yo", texto }];
  let respuesta: string;
  try {
    const jwt = await sesionDe(v.perfil_id);
    const yo = createClient(URL_SB, ANON, { global: { headers: { Authorization: "Bearer " + jwt } }, auth: { persistSession: false } });
    const est = await yo.rpc("oficina_estado");
    const contexto = "Canal: Telegram (texto plano, sin botones; para confirmar, la persona contesta «sí»).\nESTADO DE LA OFICINA (datos reales): " + JSON.stringify(est.data ?? est.error?.message);
    const r = await fetch(`${URL_SB}/functions/v1/${CEREBRO}`, { method: "POST",
      headers: { Authorization: "Bearer " + jwt, apikey: ANON, "Content-Type": "application/json" }, body: JSON.stringify({ mensajes, contexto }) });
    const d = await r.json().catch(() => ({}));
    respuesta = d.texto || "⚠️ " + (d.error || "Jarvis no ha contestado. Prueba otra vez.");
    if (d.texto) await admin.from("jarvis_mensajes").insert([{ chat_id: chat, rol: "yo", texto }, { chat_id: chat, rol: "harvey", texto: d.texto }]);
  } catch (e) {
    respuesta = "⚠️ No he podido entrar en la app: " + String((e as Error)?.message || e);
  }
  await decir(token, chat, limpiar(respuesta));
}

Deno.serve(async (req) => {
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
  await admin.from("jarvis_ajustes").upsert({ clave: "telegram_secreto", valor: secreto, actualizado: new Date().toISOString() });
  const w = await tg(tok.valor, "setWebhook", { url: `${URL_SB}/functions/v1/jarvis-telegram`, secret_token: secreto, allowed_updates: ["message"], drop_pending_updates: true });
  if (!w.ok) return json({ error: "Telegram no ha aceptado la conexión: " + (w.description || "") }, 502);
  return json({ ok: true, bot: yoBot.result.username });
});
