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
- Harvey es solo tu nombre interno. Nunca te presentes como Harvey ante clientes: los mensajes y guiones los dice o firma la persona de la oficina que te habla (usa su nombre del CONTEXTO o pon «[tu nombre]»).
- Escribe siempre en español de España, con trato de «usted» hacia los clientes salvo que te pidan tutear.
- Tono cercano, seguro y honesto, de empresa familiar. Nada de exageraciones ni promesas vacías.
- Mensajes de WhatsApp cortos (4-7 líneas), listos para copiar y enviar.
- MUY IMPORTANTE: cada mensaje que el cliente vaya a recibir (WhatsApp, correo o frase de llamada) escríbelo entre una línea que diga exactamente [MENSAJE] y otra que diga exactamente [FIN]. Dentro va solo el texto para el cliente, sin títulos ni comentarios. Las explicaciones y notas para la oficina van siempre fuera de esas marcas. Si preparas varios mensajes, cada uno con sus propias marcas.
- Usa solo los productos, precios y datos que aparecen en el CONTEXTO. Si falta un precio, no lo inventes: pon «[precio]» para que la oficina lo rellene.
- Nunca prometas descuentos, plazos de pago, crédito ni pedidos mínimos: eso lo decide la oficina. Di que se estudia de forma personalizada.
- Ante una queja: escuchar, reconocer, pedir detalles (producto, día, albarán, foto) y proponer solución concreta; nunca culpar al transportista ni al mercado.
- Termina las propuestas con un siguiente paso con fecha (mandar tarifa, llamar el jueves, prueba con un producto).
- Si te preguntan algo que no sabes de la empresa, dilo y sugiere qué dato pedir a la oficina.
- No uses formato Markdown complicado (ni tablas ni almohadillas); como mucho guiones y negritas con *asteriscos* al estilo WhatsApp.

Consultas a la base de datos (herramientas de SOLO LECTURA):
- Puedes consultar clientes, deudas, pedidos e importes, ventas por fechas, contactos pendientes (prospectos) y quejas abiertas. Úsalas cuando la pregunta necesite datos concretos y no estén ya en el CONTEXTO. Puedes hacer varias consultas seguidas.
- Las cifras que des (importes, deudas, fechas) deben salir de esas consultas; si no lo encuentras, dilo. Los importes van con IVA y en euros, con coma decimal.
- No puedes enviar mensajes, ni crear, cambiar o borrar nada. Si te piden apuntar algo (un contacto, un «volver a llamar», un cobro…), prepara el texto y di qué tiene que apuntar la oficina y en qué pantalla de la app.
- Por privacidad, las consultas no traen teléfonos ni correos: solo si los hay. Remite a la ficha de la app para verlos.
- Antes de un recordatorio de pago, comprueba la deuda con la herramienta. Tono siempre educado, sin amenazas, y recuerda que la oficina decide cuándo enviarlo.`;

// ===================== Herramientas de solo lectura =====================
// Se ejecutan con la sesión de quien pregunta (sus mismos permisos en Supabase): solo SELECT.
const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: "buscar_clientes",
    description: "Busca clientes de Ferjusanz por nombre, nombre comercial, código o localidad. Devuelve id, código, nombre, localidad, forma de pago, si está activo y si tiene teléfono/correo (sin mostrarlos). Úsala para conseguir el cliente_id antes de mirar sus pedidos o deudas.",
    input_schema: { type: "object", properties: {
      texto: { type: "string", description: "Parte del nombre, código o localidad. Vacío = clientes más recientes." },
      limite: { type: "integer", description: "Máximo de resultados (por defecto 15, máximo 50)." },
    }, required: ["texto"] },
  },
  {
    name: "deudas",
    description: "Deudas pendientes de cobro (albaranes entregados con importe pendiente). Sin cliente_id: resumen por cliente ordenado de mayor a menor deuda, con el albarán más antiguo. Con cliente_id: lista de sus albaranes pendientes.",
    input_schema: { type: "object", properties: {
      cliente_id: { type: "string", description: "Opcional. id del cliente (de buscar_clientes)." },
      dias_minimo: { type: "integer", description: "Opcional. Solo albaranes con al menos estos días de antigüedad." },
    } },
  },
  {
    name: "pedidos_cliente",
    description: "Historial de un cliente: últimos pedidos con fecha, estado, albarán, total, cobrado y pendiente, y los productos que más pide en ese periodo.",
    input_schema: { type: "object", properties: {
      cliente_id: { type: "string", description: "id del cliente (de buscar_clientes)." },
      dias: { type: "integer", description: "Cuántos días hacia atrás (por defecto 90, máximo 730)." },
    }, required: ["cliente_id"] },
  },
  {
    name: "ventas",
    description: "Resumen de ventas entre dos fechas (con IVA): total, número de pedidos, total por día y los 15 clientes que más han comprado.",
    input_schema: { type: "object", properties: {
      desde: { type: "string", description: "Fecha inicial AAAA-MM-DD." },
      hasta: { type: "string", description: "Fecha final AAAA-MM-DD (incluida)." },
    }, required: ["desde", "hasta"] },
  },
  {
    name: "prospectos",
    description: "Contactos comerciales (posibles clientes): nombre, tipo, localidad, estado, notas, próxima fecha de contacto, web y si tienen teléfono/correo. Filtra por texto, estado o solo los que toca contactar hasta hoy.",
    input_schema: { type: "object", properties: {
      texto: { type: "string", description: "Opcional. Parte del nombre, tipo o localidad." },
      estado: { type: "string", description: "Opcional. Estado exacto tal como se guarda en la app." },
      pendientes_hoy: { type: "boolean", description: "Opcional. true = solo los que tienen próximo contacto hoy o antes." },
    } },
  },
  {
    name: "quejas_abiertas",
    description: "Incidencias/quejas sin resolver: fecha, tipo, cliente, producto, cantidad y nota.",
    input_schema: { type: "object", properties: {
      cliente_id: { type: "string", description: "Opcional. Solo las de este cliente." },
    } },
  },
];

// deno-lint-ignore no-explicit-any
type SB = any;
const hoyISO = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Madrid" });
const r2 = (n: unknown) => Math.round(Number(n || 0) * 100) / 100;
const limpia = (t: unknown) => String(t ?? "").replace(/[%,()*]/g, " ").trim().slice(0, 60);
const esUUID = (t: unknown) => /^[0-9a-f-]{36}$/i.test(String(t || ""));
const fechaOk = (t: unknown) => /^\d{4}-\d{2}-\d{2}$/.test(String(t || ""));
function chk<T>(r: { data: T | null; error: { message: string } | null }): T {
  if (r.error) throw new Error(r.error.message);
  return (r.data ?? []) as T;
}
async function nombresClientes(sb: SB, ids: string[]) {
  const m: Record<string, string> = {};
  const unicos = [...new Set(ids.filter(Boolean))].slice(0, 200);
  if (!unicos.length) return m;
  const d = chk(await sb.from("clientes").select("id,nombre,nombre_comercial").in("id", unicos)) as any[];
  for (const c of d) m[c.id] = c.nombre_comercial || c.nombre;
  return m;
}

async function ejecutar(sb: SB, nombre: string, a: any): Promise<unknown> {
  switch (nombre) {
    case "buscar_clientes": {
      const t = limpia(a.texto), lim = Math.min(Math.max(Number(a.limite) || 15, 1), 50);
      let q = sb.from("clientes").select("id,codigo,nombre,nombre_comercial,localidad,forma_pago,dias_pago,activo,telefono,email,notas");
      if (t) q = q.or(`nombre.ilike.%${t}%,nombre_comercial.ilike.%${t}%,codigo.ilike.%${t}%,localidad.ilike.%${t}%`);
      const d = chk(await q.order("created_at", { ascending: false }).limit(lim)) as any[];
      return d.map(c => ({ id: c.id, codigo: c.codigo, nombre: c.nombre_comercial || c.nombre, razon_social: c.nombre, localidad: c.localidad,
        forma_pago: c.forma_pago, dias_pago: c.dias_pago, activo: c.activo, tiene_telefono: !!c.telefono, tiene_email: !!c.email, notas: String(c.notas || "").slice(0, 200) }));
    }
    case "deudas": {
      let q = sb.from("v_pedidos_importe").select("pedido_id,cliente_id,cliente_nombre,fecha_entrega,serie,numero_albaran,total,cobrado,pendiente,forma_pago")
        .eq("estado", "terminado").gt("pendiente", 0.009);
      if (esUUID(a.cliente_id)) q = q.eq("cliente_id", a.cliente_id);
      if (Number(a.dias_minimo) > 0) { const f = new Date(Date.now() - Number(a.dias_minimo) * 86400000); q = q.lte("fecha_entrega", f.toISOString().slice(0, 10)); }
      const d = chk(await q.order("fecha_entrega", { ascending: true }).limit(3000)) as any[];
      const hoy = Date.parse(hoyISO());
      const dias = (f: string) => Math.round((hoy - Date.parse(f)) / 86400000);
      if (esUUID(a.cliente_id)) return { total_pendiente: r2(d.reduce((s, x) => s + Number(x.pendiente), 0)),
        albaranes: d.map(x => ({ fecha: x.fecha_entrega, dias: dias(x.fecha_entrega), albaran: [x.serie, x.numero_albaran].filter(Boolean).join("-") || null, total: r2(x.total), cobrado: r2(x.cobrado), pendiente: r2(x.pendiente) })) };
      const g: Record<string, any> = {};
      for (const x of d) { const k = x.cliente_id; g[k] ??= { cliente_id: k, cliente: x.cliente_nombre, forma_pago: x.forma_pago, pendiente: 0, albaranes: 0, mas_antiguo: x.fecha_entrega }; g[k].pendiente += Number(x.pendiente); g[k].albaranes++; }
      const lista = Object.values(g).map(c => ({ ...c, pendiente: r2(c.pendiente), dias_mas_antiguo: dias(c.mas_antiguo) })).sort((x, y) => y.pendiente - x.pendiente);
      return { total_pendiente: r2(lista.reduce((s, c) => s + c.pendiente, 0)), clientes_con_deuda: lista.length, clientes: lista.slice(0, 40) };
    }
    case "pedidos_cliente": {
      if (!esUUID(a.cliente_id)) return { error: "Falta un cliente_id válido: búscalo antes con buscar_clientes." };
      const dias = Math.min(Math.max(Number(a.dias) || 90, 1), 730);
      const desde = new Date(Date.now() - dias * 86400000).toISOString().slice(0, 10);
      const peds = chk(await sb.from("v_pedidos_importe").select("pedido_id,fecha_entrega,estado,serie,numero_albaran,total,cobrado,pendiente")
        .eq("cliente_id", a.cliente_id).gte("fecha_entrega", desde).order("fecha_entrega", { ascending: false }).limit(60)) as any[];
      const ids = peds.map(p => p.pedido_id);
      const prods: Record<string, { veces: number; cantidad: number; unidad: string }> = {};
      if (ids.length) {
        const lin = chk(await sb.from("lineas_pedido").select("producto_id,cantidad_pedida,unidad_pedida").in("pedido_id", ids.slice(0, 60)).limit(2000)) as any[];
        const pids = [...new Set(lin.map(l => l.producto_id).filter(Boolean))];
        const nom: Record<string, string> = {};
        if (pids.length) for (const p of chk(await sb.from("productos").select("id,nombre").in("id", pids.slice(0, 300))) as any[]) nom[p.id] = p.nombre;
        for (const l of lin) { const n = nom[l.producto_id] || "?"; prods[n] ??= { veces: 0, cantidad: 0, unidad: l.unidad_pedida || "" }; prods[n].veces++; prods[n].cantidad += Number(l.cantidad_pedida || 0); }
      }
      return { desde, pedidos: peds.map(p => ({ fecha: p.fecha_entrega, estado: p.estado, albaran: [p.serie, p.numero_albaran].filter(Boolean).join("-") || null, total: r2(p.total), cobrado: r2(p.cobrado), pendiente: r2(p.pendiente) })),
        productos_mas_pedidos: Object.entries(prods).sort((x, y) => y[1].veces - x[1].veces).slice(0, 20).map(([n, v]) => ({ producto: n, veces: v.veces, cantidad: r2(v.cantidad), unidad: v.unidad })) };
    }
    case "ventas": {
      if (!fechaOk(a.desde) || !fechaOk(a.hasta)) return { error: "Las fechas deben ser AAAA-MM-DD." };
      const d = chk(await sb.from("v_pedidos_importe").select("cliente_id,cliente_nombre,fecha_entrega,estado,total")
        .gte("fecha_entrega", a.desde).lte("fecha_entrega", a.hasta).neq("estado", "anulado").limit(5000)) as any[];
      const dia: Record<string, number> = {}, cli: Record<string, { cliente: string; total: number; pedidos: number }> = {};
      for (const x of d) { dia[x.fecha_entrega] = (dia[x.fecha_entrega] || 0) + Number(x.total); cli[x.cliente_id] ??= { cliente: x.cliente_nombre, total: 0, pedidos: 0 }; cli[x.cliente_id].total += Number(x.total); cli[x.cliente_id].pedidos++; }
      return { desde: a.desde, hasta: a.hasta, pedidos: d.length, total: r2(d.reduce((s, x) => s + Number(x.total), 0)),
        por_dia: Object.entries(dia).sort().map(([f, t]) => ({ fecha: f, total: r2(t) })),
        mejores_clientes: Object.values(cli).sort((x, y) => y.total - x.total).slice(0, 15).map(c => ({ ...c, total: r2(c.total) })) };
    }
    case "prospectos": {
      let q = sb.from("prospectos").select("id,nombre,tipo,localidad,direccion,estado,notas,proximo_contacto,web,fuente,telefono,email,created_at");
      const t = limpia(a.texto);
      if (t) q = q.or(`nombre.ilike.%${t}%,tipo.ilike.%${t}%,localidad.ilike.%${t}%`);
      if (a.estado) q = q.eq("estado", String(a.estado));
      if (a.pendientes_hoy) q = q.lte("proximo_contacto", hoyISO());
      const d = chk(await q.order("proximo_contacto", { ascending: true, nullsFirst: false }).limit(80)) as any[];
      return d.map(p => ({ id: p.id, nombre: p.nombre, tipo: p.tipo, localidad: p.localidad, direccion: p.direccion, estado: p.estado, notas: String(p.notas || "").slice(0, 300),
        proximo_contacto: p.proximo_contacto, web: p.web, fuente: p.fuente, tiene_telefono: !!p.telefono, tiene_email: !!p.email }));
    }
    case "quejas_abiertas": {
      let q = sb.from("incidencias").select("created_at,tipo,cliente_id,producto_id,cantidad,nota,con_foto").eq("resuelta", false).or("archivado.is.null,archivado.eq.false");
      if (esUUID(a.cliente_id)) q = q.eq("cliente_id", a.cliente_id);
      const d = chk(await q.order("created_at", { ascending: false }).limit(60)) as any[];
      const cn = await nombresClientes(sb, d.map(x => x.cliente_id));
      const pids = [...new Set(d.map(x => x.producto_id).filter(Boolean))];
      const pn: Record<string, string> = {};
      if (pids.length) for (const p of chk(await sb.from("productos").select("id,nombre").in("id", pids)) as any[]) pn[p.id] = p.nombre;
      return d.map(x => ({ fecha: String(x.created_at).slice(0, 10), tipo: x.tipo, cliente: cn[x.cliente_id] || null, producto: pn[x.producto_id] || null, cantidad: x.cantidad, nota: x.nota, con_foto: x.con_foto }));
    }
  }
  return { error: "Herramienta desconocida: " + nombre };
}

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
  const consultas: string[] = [];
  try {
    const conv: any[] = msgs;
    let r: any;
    // Bucle: Harvey puede pedir varias consultas seguidas (máximo 6 rondas) antes de contestar.
    for (let ronda = 0; ronda < 6; ronda++) {
      r = await client.beta.messages.create({
        model: MODELO,
        max_tokens: 6000,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
        output_config: { effort: "low" },
        tools: HERRAMIENTAS,
        system: [
          { type: "text", text: SISTEMA, cache_control: { type: "ephemeral" } },
          { type: "text", text: `Hoy es ${hoy}.\n\nCONTEXTO (datos de la app de Ferjusanz):\n${contexto || "(sin datos)"}`, cache_control: { type: "ephemeral" } },
        ],
        messages: conv,
      } as any);
      if (r.stop_reason === "refusal") return json({ error: "Harvey no puede ayudar con eso. Prueba a pedirlo de otra forma." }, 200);
      if (r.stop_reason !== "tool_use") break;
      conv.push({ role: "assistant", content: r.content });
      const usos = r.content.filter((b: any) => b.type === "tool_use");
      const resultados = await Promise.all(usos.map(async (b: any) => {
        consultas.push(b.name);
        try {
          const out = JSON.stringify(await ejecutar(sb, b.name, b.input || {}));
          return { type: "tool_result", tool_use_id: b.id, content: out.length > 15000 ? out.slice(0, 15000) + " …(recortado)" : out };
        } catch (e) {
          return { type: "tool_result", tool_use_id: b.id, content: "Error al consultar: " + String((e as Error)?.message || e), is_error: true };
        }
      }));
      conv.push({ role: "user", content: resultados });
    }
    const texto = r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
    if (!texto) return json({ error: r.stop_reason === "tool_use" ? "Harvey ha necesitado demasiadas consultas. Pregunta algo más concreto." : "Harvey no ha contestado. Inténtalo otra vez." }, 502);
    return json({ texto, consultas });
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "Harvey está saturado ahora mismo. Espera un minuto." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "La clave de Anthropic no es válida" }, 500);
    if (e instanceof Anthropic.APIError) return json({ error: "Error de la IA: " + e.message }, 502);
    return json({ error: "No se pudo contactar con Harvey" }, 502);
  }
});
