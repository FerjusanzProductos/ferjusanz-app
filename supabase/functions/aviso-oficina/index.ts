// Aviso a la oficina (Tito, 28/11/2026: «las respuestas me las puedes mirar tú y ponerlo también en Jarvis, incluso en notificación»).
// La llama la tarea programada «Respuestas de correos a posibles clientes» cuando alguien contesta a un correo comercial.
// Desplegada SIN comprobar JWT: se protege con la cabecera x-jarvis-cron = jarvis_ajustes.cron_secreto (el mismo de la reunión de las 7).
// Cuerpo: { titulo, texto, ir? }. Hace tres cosas (si una falla, sigue con las otras):
//  1) notificación al móvil de admin y oficina que activaron «🔔 Avisos» (como los pedidos de WhatsApp),
//  2) mensaje de Jarvis por Telegram a los chats conectados,
//  3) lo deja en la conversación de Jarvis de cada chat, para que lo sepa si luego le preguntan.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const env = (k: string) => Deno.env.get(k) || "";
const admin = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false } });
const ajuste = async (clave: string) => (await admin.from("jarvis_ajustes").select("valor").eq("clave", clave).maybeSingle()).data?.valor;

async function alMovil(titulo: string, texto: string, ir: string) {
  const pub = env("VAPID_PUBLIC"), priv = env("VAPID_PRIVATE");
  if (!pub || !priv) return 0;
  webpush.setVapidDetails(env("VAPID_SUBJECT") || "mailto:ferjusanzfacturas@gmail.com", pub, priv);
  const { data: subs } = await admin.from("push_suscripciones").select("id,endpoint,p256dh,auth,usuario_id");
  if (!subs?.length) return 0;
  const { data: perf } = await admin.from("perfiles").select("id,rol,activo").in("id", [...new Set(subs.map((x) => x.usuario_id))]);
  const ok = new Set((perf ?? []).filter((x) => x.activo !== false && ["admin", "oficina"].includes(x.rol)).map((x) => x.id));
  const carga = JSON.stringify({ titulo, cuerpo: texto.slice(0, 160), tag: "aviso-" + Date.now(), ir });
  let n = 0;
  for (const x of subs.filter((y) => ok.has(y.usuario_id))) {
    try { await webpush.sendNotification({ endpoint: x.endpoint, keys: { p256dh: x.p256dh, auth: x.auth } }, carga, { TTL: 86400 }); n++; }
    // deno-lint-ignore no-explicit-any
    catch (e: any) { if (e?.statusCode === 404 || e?.statusCode === 410) await admin.from("push_suscripciones").delete().eq("id", x.id); }
  }
  return n;
}

async function aJarvis(titulo: string, texto: string) {
  const tok = await ajuste("telegram_token");
  const { data: chats } = await admin.from("jarvis_telegram").select("chat_id");
  let n = 0;
  for (const c of chats ?? []) {
    const msg = `${titulo}\n\n${texto}`;
    if (tok) {
      const r = await fetch(`https://api.telegram.org/bot${tok}/sendMessage`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: c.chat_id, text: msg.slice(0, 4000) }) }).catch(() => null);
      if (r?.ok) n++;
    }
    await admin.from("jarvis_mensajes").insert({ chat_id: c.chat_id, rol: "harvey", texto: msg.slice(0, 4000) });
  }
  return n;
}

Deno.serve(async (req) => {
  const sec = await ajuste("cron_secreto");
  if (!sec || req.headers.get("x-jarvis-cron") !== sec) return new Response("no", { status: 401 });
  const b = await req.json().catch(() => ({}));
  const titulo = String(b.titulo || "").trim().slice(0, 80), texto = String(b.texto || "").trim().slice(0, 3500);
  if (!titulo || !texto) return new Response(JSON.stringify({ error: "faltan titulo y texto" }), { status: 400 });
  const movil = await alMovil(titulo, texto, String(b.ir || "")).catch((e) => { console.error("móvil", e); return -1; });
  const telegram = await aJarvis(titulo, texto).catch((e) => { console.error("jarvis", e); return -1; });
  return new Response(JSON.stringify({ movil, telegram }), { headers: { "Content-Type": "application/json" } });
});
