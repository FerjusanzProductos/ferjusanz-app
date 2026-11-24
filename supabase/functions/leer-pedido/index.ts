// 📸🎤 «Leer con IA» de «Escribir pedido»: pasa a texto un pedido en FOTO (también escrito a mano) o en AUDIO
// (nota de voz de WhatsApp). Solo devuelve el texto; la app lo interpreta y la persona lo revisa. No guarda nada.
// Secretos: GEMINI_API_KEY (fotos y audios). Si no está, las fotos van con ANTHROPIC_API_KEY (Claude no oye audios).
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

async function conGemini(mime: string, data: string) {
  const cuerpo = JSON.stringify({ contents: [{ role: "user", parts: [{ text: INSTRUCCIONES }, { inline_data: { mime_type: mime, data } }] }], generationConfig: { temperature: 0 } });
  let fallo = "";
  // Gemini a veces dice «mucha demanda»: se reintenta y, si sigue, se prueba otro modelo.
  for (const modelo of [env("GEMINI_MODEL") || "gemini-flash-latest", "gemini-flash-lite-latest"]) for (let i = 0; i < 2; i++) {
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
