// 📸🎤 «Leer con IA» de «Escribir pedido»: pasa a texto un pedido en FOTO (también escrito a mano) o en AUDIO
// (nota de voz de WhatsApp). Solo devuelve el texto; la app lo interpreta y la persona lo revisa. No guarda nada.
// Modo «texto» (24/11/2026): con {texto} devuelve las líneas del pedido ya emparejadas con el catálogo, para las
// líneas que la app no reconoce sola. Secretos: GEMINI_API_KEY (fotos y audios). Si no está, las fotos van con ANTHROPIC_API_KEY (Claude no oye audios).
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (k: string) => Deno.env.get(k) || "";
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const INSTRUCCIONES = `Eres de FERJUSANZ, mayorista de frutas, verduras, patatas, huevos, setas y legumbres en Mercamadrid.
Te paso un pedido de un cliente (foto de una lista, a veces escrita a mano, o una nota de voz). Escríbelo como TEXTO para meterlo en el programa:
- Primera línea, si se sabe: «Pedido para <cliente>, para <día>.». El cliente es quien habla o escribe si se presenta («soy el del bar Florencio» → «Pedido para bar Florencio») o el que nombre la lista. Pon solo lo que se sepa; si no se sabe ni cliente ni día, no pongas esa línea.
- Después, una línea por producto: «<cantidad> <unidad> <producto>», p. ej. «3 kg tomate pera», «2 cajas calabacín», «1 saco patata». Si añade algo («bien maduro»), ponlo al final de la línea.
- No inventes nada. Lo que no se entienda, márcalo con [?] (p. ej. «[?] kg pimiento»).
- Saludos y charla fuera. Si no hay ningún pedido, escribe solo: SIN PEDIDO.
Devuelve SOLO ese texto.`;

const EMPAREJAR = `Eres de FERJUSANZ, mayorista de frutas, verduras, patatas, huevos, setas y legumbres en Mercamadrid.
Te paso el mensaje de un pedido de un cliente y nuestro CATÁLOGO (id|nombre|unidad de venta|otros nombres).
Devuelve SOLO un JSON: {"lineas":[{"texto":"el trozo del mensaje tal cual","producto_id":"id del catálogo o null","cantidad":número o null,"unidad":"kg|caja|saco|pieza|manojo|bandeja|bolsa|docena|bote o null"}]}
- Una línea por cada producto pedido, en el orden del mensaje. Saludos, fechas y charla fuera.
- Habla como en una frutería: «champis» = champiñón, «fresas» = fresón, «patatas» sin más = la patata de uso general, «medio kilo» = 0,5 kg.
- producto_id: el del catálogo que de verdad sea; si dudas entre varios, el más normal para hostelería; si no está, null. No inventes ids.
- No inventes cantidades: si no la dice, null.`;

async function conGemini(mime: string, data: string, texto?: string) {
  const cuerpo = JSON.stringify(texto
    ? { contents: [{ role: "user", parts: [{ text: texto }] }], generationConfig: { temperature: 0, responseMimeType: "application/json" } }
    : { contents: [{ role: "user", parts: [{ text: INSTRUCCIONES }, { inline_data: { mime_type: mime, data } }] }], generationConfig: { temperature: 0 } });
  let fallo = "";
  // Gemini a veces dice «mucha demanda»: se reintenta y, si sigue, se prueba otro modelo.
  // Texto: primero el modelo ligero (responde en 1-2 s; el grande va saturado y tarda hasta un minuto).
  const modelos = texto ? ["gemini-flash-lite-latest", env("GEMINI_MODEL") || "gemini-flash-latest"] : [env("GEMINI_MODEL") || "gemini-flash-latest", "gemini-flash-lite-latest"];
  for (const modelo of modelos) for (let i = 0; i < 2; i++) {
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent`, { method: "POST", headers: { "x-goog-api-key": env("GEMINI_API_KEY"), "Content-Type": "application/json" }, body: cuerpo, signal: AbortSignal.timeout(50000) }).catch((e) => new Response(JSON.stringify({ error: { message: String(e?.message || e) } }), { status: 503 }));
    const d = await r.json().catch(() => ({}));
    if (r.ok) return (d.candidates?.[0]?.content?.parts || []).map((p: { text?: string }) => p.text || "").join("").trim();
    fallo = "Gemini: " + String(d?.error?.message || r.status).slice(0, 200);
    if (![429, 500, 503].includes(r.status)) throw new Error(fallo);
    await new Promise((ok) => setTimeout(ok, 1500));
  }
  throw new Error(fallo);
}
async function conClaude(mime: string, data: string) {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", signal: AbortSignal.timeout(60000),
    headers: { "x-api-key": env("ANTHROPIC_API_KEY"), "anthropic-version": "2023-06-01", "Content-Type": "application/json" },
    body: JSON.stringify({ model: env("HARVEY_MODEL") || "claude-opus-5-5", max_tokens: 1500, messages: [{ role: "user", content: [{ type: "image", source: { type: "base64", media_type: mime, data } }, { type: "text", text: INSTRUCCIONES }] }] }) });
  const d = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Claude: " + String(d?.error?.message || r.status).slice(0, 200));
  return (d.content || []).filter((b: { type: string }) => b.type === "text").map((b: { text: string }) => b.text).join("").trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "no" }, 405);
  const sb = createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return json({ error: "Tienes que entrar en la app" }, 401);
  // deno-lint-ignore no-explicit-any
  let b: any; try { b = await req.json(); } catch { return json({ error: "Petición mal hecha" }, 400); }
  if (typeof b?.texto === "string") {
    const msg = b.texto.slice(0, 6000).trim();
    if (!msg) return json({ error: "Falta el texto" }, 400);
    if (!env("GEMINI_API_KEY")) return json({ error: "Falta la clave de Gemini" }, 503);
    const { data: prods, error } = await sb.from("productos").select("id,nombre,unidad_venta,alias").eq("activo", true).order("nombre").limit(2000);
    if (error) return json({ error: error.message }, 500);
    const cat = (prods || []).map((p) => [p.id, p.nombre, p.unidad_venta || "", (p.alias || []).join(", ")].join("|")).join("\n");
    try {
      const t = await conGemini("", "", `${EMPAREJAR}\n\nCATÁLOGO:\n${cat}\n\nMENSAJE:\n${msg}`);
      const i = t.indexOf("{"), j = t.lastIndexOf("}"); const r = JSON.parse(t.slice(i, j + 1));
      const ids = new Set((prods || []).map((p) => p.id));
      // deno-lint-ignore no-explicit-any
      const lineas = (Array.isArray(r?.lineas) ? r.lineas : []).slice(0, 80).map((l: any) => ({ texto: String(l?.texto || "").slice(0, 200), producto_id: ids.has(l?.producto_id) ? l.producto_id : null, cantidad: Number.isFinite(Number(l?.cantidad)) && l?.cantidad !== null ? Number(l.cantidad) : null, unidad: l?.unidad ? String(l.unidad).slice(0, 20) : null }));
      return json({ lineas });
    } catch (e) { return json({ error: String((e as Error).message || e) }, 502); }
  }
  const data = String(b?.imagen || b?.archivo || "");
  let mime = String(b?.tipo || "").split(";")[0].toLowerCase();
  if (mime === "audio/opus" || mime === "audio/x-opus") mime = "audio/ogg"; // notas de voz de WhatsApp
  if (!data || !/^(image\/(jpeg|png|webp)|audio\/[a-z0-9.+-]+)$/.test(mime)) return json({ error: "Manda una foto o un audio" }, 400);
  if (data.length > 20e6) return json({ error: "El archivo es demasiado grande (máximo unos 15 MB)" }, 413);
  const audio = mime.startsWith("audio/");
  try {
    if (env("GEMINI_API_KEY")) return json({ texto: await conGemini(mime, data) });
    if (!audio && env("ANTHROPIC_API_KEY")) return json({ texto: await conClaude(mime, data) });
    return json({ error: audio ? "Falta la clave de Gemini para oír audios" : "Falta la clave de la IA" }, 503);
  } catch (e) { return json({ error: String((e as Error).message || e) }, 502); }
});
