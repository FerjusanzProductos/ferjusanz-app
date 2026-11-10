// 🆘 Ayuda al momento: cuando alguien del equipo se atasca, responde con pasos sencillos usando SOLO la guía de la app.
// - No lee ni cambia datos de la empresa: recibe la pantalla, el error, lo que escribe la persona y trozos de la guía.
// - Si no lo sabe seguro, o toca precios, borrar, facturas o dinero, dice que avisen a Fernando.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "npm:postgres@3.4.5";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 2 });
const MODELO = Deno.env.get("HARVEY_MODEL") || "claude-sonnet-5-5";

async function usuario(req: Request) {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const { data } = await sb.auth.getUser(); if (!data?.user) return null;
  const [p] = await sql`select nombre, rol, activo from public.perfiles where id = ${data.user.id}`;
  return p && p.activo !== false ? { id: data.user.id, nombre: String(p.nombre || ""), rol: String(p.rol || "") } : null;
}

const SISTEMA = `Eres el ayudante de la app de FERJUSANZ (mayorista de fruta y verdura). Te escribe alguien del equipo que se ha atascado con la app desde su móvil. Muchos son personas mayores o repartidores poco acostumbrados a la tecnología.

CÓMO RESPONDES
- En español de España, de tú, cercano y muy claro. Frases cortas.
- Entre 2 y 5 pasos numerados, cada uno con lo que hay que tocar exactamente («Toca «Guardar», arriba a la derecha»).
- Usa SOLO lo que aparece en la GUÍA y en la LISTA DE APARTADOS que te paso. No inventes botones, pantallas ni funciones. Si no aparece, no lo supongas.
- Ten en cuenta la pantalla en la que está y el último error que le ha salido.

CUÁNDO DECIR QUE AVISE A FERNANDO (avisar_fernando = true)
- Si la guía no explica bien lo que le pasa o no estás seguro.
- Si hay que cambiar precios, borrar algo, tocar facturas, cobros o dinero, o permisos.
- Si el error parece un fallo de la app y no algo que pueda hacer la persona.
En ese caso, en la respuesta dile con calma que pulse «Avisar a Fernando» y, si hay algo seguro que pueda probar antes (por ejemplo, comprobar la conexión), díselo.`;

const ESQUEMA = { type: "object", additionalProperties: false, required: ["respuesta", "avisar_fernando"],
  properties: { respuesta: { type: "string", description: "La respuesta para la persona: 2-5 pasos numerados, en español, de tú." },
    avisar_fernando: { type: "boolean", description: "true si debe avisar a Fernando porque no está claro o es delicado." } } };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const u = await usuario(req); if (!u) return json({ error: "Inicia sesión" }, 401);
    const b = await req.json().catch(() => ({}));
    const nota = String(b.nota || "").trim().slice(0, 600);
    if (nota.length < 3) return json({ error: "Escribe qué te pasa" }, 400);
    const guia = (Array.isArray(b.guia) ? b.guia : []).slice(0, 6).map((g: any) => `### ${String(g.titulo || "").slice(0, 120)}\n${String(g.texto || "").slice(0, 1500)}`).join("\n\n");
    const apartados = (Array.isArray(b.apartados) ? b.apartados : []).slice(0, 80).map((x: any) => "- " + String(x).slice(0, 60)).join("\n");
    const errores = (Array.isArray(b.errores) ? b.errores : []).slice(-3).map((e: any) => "- " + String(e && e.m || e).slice(0, 200)).join("\n");
    const datos = `QUIÉN: ${u.nombre} (${u.rol})
PANTALLA DONDE ESTÁ: ${String(b.titulo || b.vista || "").slice(0, 80)}
ÚLTIMOS ERRORES QUE LE HAN SALIDO:
${errores || "(ninguno)"}
LO QUE LE PASA (escrito por la persona):
${nota}

GUÍA DE LA APP (lo único que puedes usar):
${guia || "(no hay nada en la guía sobre esto)"}

LISTA DE APARTADOS DE LA APP:
${apartados || "(sin lista)"}`;
    const reqIA: any = { model: MODELO, max_tokens: 1500, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
      output_config: { effort: "low", format: { type: "json_schema", schema: ESQUEMA } },
      system: [{ type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: datos }] };
    const cliente = new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
    let r: any;
    try { r = await cliente.beta.messages.create(reqIA); }
    catch (e) { if (e instanceof Anthropic.BadRequestError) { delete reqIA.output_config.format; r = await cliente.beta.messages.create(reqIA); } else throw e; }
    if (r.stop_reason === "refusal") return json({ respuesta: "No puedo ayudarte con esto. Pulsa «Avisar a Fernando».", avisar_fernando: true });
    const texto = r.content.filter((x: any) => x.type === "text").map((x: any) => x.text).join("\n").trim();
    let out: any; try { out = JSON.parse(texto); } catch (_) { const m = texto.match(/\{[\s\S]*\}/); out = m ? JSON.parse(m[0]) : { respuesta: texto, avisar_fernando: false }; }
    return json({ respuesta: String(out.respuesta || "").slice(0, 2000), avisar_fernando: !!out.avisar_fernando });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "Ahora mismo hay mucha gente. Pulsa «Avisar a Fernando»." }, 429);
    if (e instanceof Anthropic.APIError) return json({ error: "No he podido pensar la respuesta. Pulsa «Avisar a Fernando»." }, 502);
    console.error(e); return json({ error: "No he podido ayudarte ahora. Pulsa «Avisar a Fernando»." }, 500);
  }
});
