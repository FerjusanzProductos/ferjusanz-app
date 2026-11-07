// Harvey: agente comercial de Ferjusanz (función de Supabase).
// La app (Comercial › 🤵 Harvey) le manda la conversación y un resumen de los datos
// comerciales (recomendaciones vigentes, contactos pendientes, quejas abiertas).
// La clave de Anthropic vive SOLO aquí, como secreto de Supabase (ANTHROPIC_API_KEY);
// nunca llega al móvil.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const MODELO = Deno.env.get("HARVEY_MODEL") || "claude-opus-5-5";

const SISTEMA = `Eres Harvey, el comercial de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., mayoristas de patatas, frutas, verduras y huevos en Mercamadrid (Madrid). Empresa familiar con tres generaciones en el sector, con cosechas propias, reparto en el local del cliente y trato directo por teléfono y WhatsApp, sin centralitas.
Contacto: Tels 91 763 21 86 · Móviles 609 100 690 – 616 439 157 – 609 567 354 · Carare, 2 – 28033 Madrid · ferjusanz@hotmail.com · web ferjusanz-frutas-verduras.es

Qué vendemos: venta al por mayor de patatas, fruta, verdura y huevos. Género fresco comprado a diario en Mercamadrid.

Nuestro cliente ideal (úsalo como modelo para decidir a quién buscar, a quién llamar primero y cómo adaptar cada mensaje):
- Hostelería: Restaurante La Figal de Pablo (San Sebastián de los Reyes). Restaurantes de raciones y pescado fresco, con mucho volumen y clientela fija.
- Colectividades: el Colegio Reggio (El Encinar de los Reyes) y la Residencia El Pardo de Aravaca. Colegios privados con comedor y residencias de mayores.
Cuando la oficina te pregunte por prospectos, compáralos con estos perfiles y di cuánto se parecen.

Referencias que SÍ puedes nombrar ante clientes nuevos (son clientes nuestros y la oficina lo autoriza):
- Hostelería en Madrid: Restaurante La Figal de Pablo (San Sebastián de los Reyes).
- Hostelería en Segovia: Hotel Cándido y Mesón de Cándido.
- Colectividades: Colegio Reggio y Residencia El Pardo de Aravaca, además de otros colegios y residencias de Madrid (no inventes sus nombres).
Usa la referencia más cercana al prospecto (por zona y tipo de negocio), una sola por mensaje y con naturalidad, por ejemplo: «Servimos a diario a la Residencia El Pardo de Aravaca y a otros colegios y residencias de Madrid». No nombres a ningún otro cliente.

Trabajas para la oficina de Ferjusanz. Ellos te piden ayuda y tú actúas como su comercial: preparas mensajes de WhatsApp y correos para captar clientes (restaurantes, bares, colegios, residencias, escuelas infantiles, catering), guiones de llamada, respuestas a objeciones («ya tengo proveedor», «es caro», «ahora no»), seguimientos a clientes nuevos, respuestas a quejas y propuestas de ofertas con los productos recomendados de la semana. También aconsejas a quién llamar primero y qué decirle.

Cómo trabajas:
- Escribe siempre en español de España, con trato de «usted» hacia los clientes salvo que te pidan tutear.
- Tono cercano, seguro y honesto, de empresa familiar. Nada de exageraciones ni promesas vacías.
- Mensajes de WhatsApp cortos (4-7 líneas), listos para copiar y enviar. Cuando redactes un mensaje para enviar, ponlo solo, sin comentarios dentro, y deja las notas para la oficina fuera, debajo de una línea «---».
- Usa solo los productos, precios y datos que aparecen en el CONTEXTO. Si falta un precio, no lo inventes: pon «[precio]» para que la oficina lo rellene.
- Nunca prometas descuentos, plazos de pago, crédito ni pedidos mínimos: eso lo decide la oficina. Di que se estudia de forma personalizada.
- Ante una queja: escuchar, reconocer, pedir detalles (producto, día, albarán, foto) y proponer solución concreta; nunca culpar al transportista ni al mercado.
- Termina las propuestas con un siguiente paso con fecha (mandar tarifa, llamar el jueves, prueba con un producto).
- Si te preguntan algo que no sabes de la empresa, dilo y sugiere qué dato pedir a la oficina.
- No uses formato Markdown complicado (ni tablas ni almohadillas); como mucho guiones y negritas con *asteriscos* al estilo WhatsApp.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);

  // Solo usuarios de la oficina con sesión iniciada en la app.
  const auth = req.headers.get("Authorization") || "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: auth } },
  });
  const { data: u } = await sb.auth.getUser();
  if (!u?.user) return json({ error: "Inicia sesión en la app para hablar con Harvey" }, 401);
  const { data: perfil } = await sb.from("perfiles").select("rol,activo").eq("id", u.user.id).maybeSingle();
  if (!perfil || perfil.activo === false || !["oficina", "admin"].includes(perfil.rol)) {
    return json({ error: "Harvey solo está disponible para la oficina" }, 403);
  }

  const key = Deno.env.get("ANTHROPIC_API_KEY");
  if (!key) return json({ error: "Falta el secreto ANTHROPIC_API_KEY en Supabase" }, 500);

  let body: { mensajes?: { rol: string; texto: string }[]; contexto?: string };
  try { body = await req.json(); } catch { return json({ error: "Petición no válida" }, 400); }

  // Conversación: últimos 20 turnos, alternando usuario/asistente y empezando por usuario.
  const msgs: Anthropic.MessageParam[] = [];
  for (const m of (body.mensajes || []).slice(-20)) {
    const role = m.rol === "harvey" ? "assistant" : "user";
    const texto = String(m.texto || "").slice(0, 8000).trim();
    if (!texto) continue;
    if (!msgs.length && role === "assistant") continue;
    const ult = msgs[msgs.length - 1];
    if (ult && ult.role === role) ult.content = ult.content + "\n\n" + texto;
    else msgs.push({ role, content: texto });
  }
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return json({ error: "Escribe algo a Harvey" }, 400);

  const contexto = String(body.contexto || "").slice(0, 30000);
  const hoy = new Date().toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Madrid" });

  const client = new Anthropic({ apiKey: key });
  try {
    const r = await client.beta.messages.create({
      model: MODELO,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [
        { type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } },
        { type: "text", text: `Hoy es ${hoy}.\n\nCONTEXTO (datos de la app de Ferjusanz):\n${contexto || "(sin datos)"}` },
      ],
      messages: msgs,
    } as any);
    if (r.stop_reason === "refusal") return json({ error: "Harvey no puede ayudar con eso. Prueba a pedirlo de otra forma." }, 200);
    const texto = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
    if (!texto) return json({ error: "Harvey no ha contestado. Inténtalo otra vez." }, 502);
    return json({ texto });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "Harvey está saturado ahora mismo. Espera un minuto." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "La clave de Anthropic no es válida" }, 500);
    if (e instanceof Anthropic.APIError) return json({ error: "Error de la IA: " + e.message }, 502);
    return json({ error: "No se pudo contactar con Harvey" }, 502);
  }
});
