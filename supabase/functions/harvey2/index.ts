// Harvey 2 (fase 1, PRUEBAS): asistente comercial con datos reales de ventas.
// - LEE clientes, pedidos, historial (Golden), tarifas y recomendaciones. Nunca los modifica.
// - ESCRIBE solo en la zona aislada «harvey» (preferencias, contactos, borradores y registro).
// - No envía nada a nadie: prepara mensajes y borradores que una persona revisa.
import Anthropic from "npm:@anthropic-ai/sdk";
import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "npm:postgres@3.4.5";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 3 });
const MODELO = Deno.env.get("HARVEY_MODEL") || "claude-sonnet-5-5";

const hoyMadrid = () => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Madrid" }).format(new Date());
const sumaDias = (iso: string, n: number) => { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const fechaValida = (s: unknown) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
const DIAS = ["", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
const isoDow = (iso: string) => { const d = new Date(iso + "T12:00:00Z").getUTCDay(); return d === 0 ? 7 : d; };
const fechaES = (iso: string) => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "";

/** Primer móvil español que aparezca en un texto (devuelve 34XXXXXXXXX) */
function movil(...textos: (string | null | undefined)[]): string | null {
  for (const t of textos) {
    const m = String(t || "").match(/(?:\+?34[\s.-]?)?([67](?:[\s.-]?\d){8})(?!\d)/);
    if (m) return "34" + m[1].replace(/\D/g, "");
  }
  return null;
}

async function usuario(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
  const { data } = await sb.auth.getUser();
  if (!data?.user) return { error: "Inicia sesión en la app para usar Harvey", status: 401 };
  const [p] = await sql`select rol, activo, nombre from public.perfiles where id = ${data.user.id}`;
  if (!p || p.activo === false || !["oficina", "admin"].includes(p.rol)) return { error: "Harvey solo está disponible para la oficina", status: 403 };
  return { id: data.user.id as string, nombre: (p.nombre as string) || "" };
}

async function registrar(usuarioId: string, accion: string, clienteId: string | null, detalle: unknown) {
  try { await sql`insert into harvey.registro (usuario, accion, cliente_id, detalle) values (${usuarioId}, ${accion}, ${clienteId}, ${sql.json(detalle as any)})`; } catch (_) { /* el registro nunca debe romper la acción */ }
}

/* ---------- Datos de un cliente ---------- */
async function productosHabituales(clienteId: string, limite = 12) {
  return await sql`
    with c as (select codigo from public.clientes where id = ${clienteId}),
    ref as (select max(fecha) r from harvey.entregas where fecha <= current_date)
    select p.id, p.codigo, p.nombre, p.unidad_venta, p.unidad_precio,
           count(distinct e.fecha)::int as veces, round(avg(e.cantidad)::numeric, 1) as cantidad_media, max(e.fecha) as ultima
    from harvey.entregas e join c on e.cliente_codigo = c.codigo join public.productos p on p.codigo = e.producto_codigo, ref
    where e.fecha > ref.r - 120
    group by p.id, p.codigo, p.nombre, p.unidad_venta, p.unidad_precio
    order by veces desc, max(e.fecha) desc limit ${limite}`;
}
async function preciosCliente(clienteId: string, productoIds: string[]) {
  if (!productoIds.length) return new Map<string, number>();
  const filas = await sql`
    select distinct on (producto_id) producto_id, precio from public.tarifas
    where producto_id = any(${productoIds}) and (cliente_id = ${clienteId} or cliente_id is null)
    order by producto_id, (cliente_id is null), desde desc nulls last, created_at desc`;
  return new Map(filas.map((f: any) => [f.producto_id as string, Number(f.precio)]));
}
async function recomendacionesVigentes(fecha: string) {
  return await sql`
    select r.titulo, r.texto, r.precio, r.unidad, p.nombre as producto from public.recomendaciones r left join public.productos p on p.id = r.producto_id
    where r.activa is not false and (r.desde is null or r.desde <= ${fecha}) and (r.hasta is null or r.hasta >= ${fecha})
    order by r.orden nulls last limit 8`;
}

/* ---------- 1. A quién escribir hoy ---------- */
async function aQuienEscribir(fechaPedido: string) {
  const hoy = hoyMadrid(); const dow = isoDow(fechaPedido); const dowHoy = isoDow(hoy);
  const filas = await sql`
    with p as (select ${fechaPedido}::date as fecha, ${dow}::int as dow, (select max(fecha) from harvey.entregas where fecha <= current_date) as ref),
    cli as (select c.* from public.clientes c where c.activo is not false and coalesce(c.nombre_comercial, c.nombre) not ilike '%varios%'),
    con_pedido as (select distinct cliente_id from public.pedidos x, p where x.fecha_entrega = p.fecha and coalesce(x.archivado, false) = false),
    hab as (select distinct on (c.id) c.id, 'habitual' as motivo, coalesce(ph.nombre, 'pedido habitual') || ' (' || ph.tipo || ')' as detalle, 1 as orden, 0::numeric as peso
            from cli c join public.pedidos_habituales ph on ph.cliente_id = c.id and ph.activo, p
            where p.dow = any(ph.dias_semana) and ph.tipo <> 'fijo' and c.id not in (select cliente_id from con_pedido)),
    sp as (select c.id, 'suele_pedir' as motivo, 'pidió ' || count(distinct e.fecha) || ' de los últimos 8 ' || ${DIAS[dow]} as detalle, 2 as orden, count(distinct e.fecha)::numeric as peso
           from cli c join harvey.entregas e on e.cliente_codigo = c.codigo, p
           where e.fecha > p.ref - 56 and extract(isodow from e.fecha) = p.dow and c.id not in (select cliente_id from con_pedido)
           group by c.id having count(distinct e.fecha) >= 4),
    dor as (select c.id, 'sin_pedir' as motivo, 'última entrega el ' || to_char(max(e.fecha), 'DD/MM') || '; antes pedía a menudo (' || count(distinct e.fecha) || ' entregas)' as detalle, 3 as orden, sum(e.importe) as peso
            from cli c join harvey.entregas e on e.cliente_codigo = c.codigo, p
            where e.fecha > p.ref - 160 and c.id not in (select cliente_id from con_pedido)
            group by c.id, p.ref having max(e.fecha) < p.ref - 35 and count(distinct e.fecha) >= 6),
    todos as (select distinct on (id) * from (select * from hab union all select * from sp union all select * from dor) z order by id, orden)
    select t.id, t.motivo, t.detalle, t.orden, t.peso, c.codigo, coalesce(c.nombre_comercial, c.nombre) as nombre, c.telefono, c.localidad,
           pr.whatsapp, coalesce(pr.no_contactar, false) as no_contactar, coalesce(pr.acepta_whatsapp, false) as acepta, pr.dias, pr.max_semana, pr.pausado_hasta,
           (select count(*) from harvey.contactos k where k.cliente_id = t.id and k.fecha > ${hoy}::date - 7)::int as contactos_semana,
           exists(select 1 from harvey.contactos k where k.cliente_id = t.id and k.fecha = ${hoy}::date) as contactado_hoy,
           (select max(fecha) from harvey.entregas e where e.cliente_codigo = c.codigo) as ultima_entrega
    from todos t join public.clientes c on c.id = t.id left join harvey.preferencias pr on pr.cliente_id = t.id
    order by t.orden, t.peso desc`;
  const out: any[] = []; let excluidos = 0;
  for (const f of filas as any[]) {
    if (f.no_contactar || (f.pausado_hasta && String(f.pausado_hasta) >= hoy) || (Array.isArray(f.dias) && f.dias.length && !f.dias.includes(dowHoy)) || (!f.contactado_hoy && f.contactos_semana >= (f.max_semana || 3))) { excluidos++; continue; }
    if (f.motivo === "sin_pedir" && out.filter(x => x.motivo === "sin_pedir").length >= 15) continue;
    out.push({ cliente_id: f.id, codigo: f.codigo, nombre: f.nombre, localidad: f.localidad, motivo: f.motivo, detalle: f.detalle,
      whatsapp: movil(f.whatsapp, f.telefono), telefono: f.telefono, acepta: f.acepta, contactado_hoy: f.contactado_hoy, ultima_entrega: f.ultima_entrega });
  }
  const leads = await sql`
    select p.id, p.nombre, p.tipo, p.localidad, p.telefono, p.estado, p.proximo_contacto, left(p.notas, 160) as notas,
           exists(select 1 from harvey.contactos k where k.prospecto_id = p.id and k.fecha > ${hoy}::date - 3) as reciente
    from public.prospectos p
    where coalesce(p.estado, 'nuevo') not in ('cliente', 'descartado') and (p.proximo_contacto <= ${hoy}::date or (p.proximo_contacto is null and coalesce(p.estado, 'nuevo') = 'nuevo'))
    order by (p.proximo_contacto is null), p.proximo_contacto, (p.notas ilike 'Prioridad A%') desc, p.nombre limit 12`;
  const sinMovil = await sql`
    with ref as (select max(fecha) r from harvey.entregas where fecha <= current_date)
    select c.id, coalesce(c.nombre_comercial, c.nombre) as nombre, c.codigo, c.telefono, pr.whatsapp, round(sum(e.importe)) as importe_90d
    from public.clientes c join harvey.entregas e on e.cliente_codigo = c.codigo left join harvey.preferencias pr on pr.cliente_id = c.id, ref
    where c.activo is not false and e.fecha > ref.r - 90 and coalesce(c.nombre_comercial, c.nombre) not ilike '%varios%'
    group by c.id, c.nombre_comercial, c.nombre, c.codigo, c.telefono, pr.whatsapp order by importe_90d desc limit 60`;
  const [ref] = await sql`select max(fecha) as r from harvey.entregas where fecha <= current_date`;
  return {
    fecha_pedido: fechaPedido, hoy, historial_hasta: ref?.r ?? null, excluidos_por_preferencias: excluidos,
    clientes: out,
    leads: (leads as any[]).filter(l => !l.reciente).map(l => ({ prospecto_id: l.id, nombre: l.nombre, tipo: l.tipo, localidad: l.localidad, telefono: l.telefono, whatsapp: movil(l.telefono), estado: l.estado, proximo_contacto: l.proximo_contacto, notas: l.notas })),
    sin_movil: (sinMovil as any[]).filter(s => !movil(s.whatsapp, s.telefono)).slice(0, 20).map(s => ({ cliente_id: s.id, nombre: s.nombre, codigo: s.codigo, telefono: s.telefono, importe_90d: Number(s.importe_90d) })),
  };
}

/* ---------- IA ---------- */
const client = () => new Anthropic({ apiKey: Deno.env.get("ANTHROPIC_API_KEY")! });
async function llamarIA(system: string, usuarioTexto: string, maxTokens = 1500, formato?: unknown) {
  const req: any = { model: MODELO, max_tokens: maxTokens, betas: ["server-side-fallback-2026-07-01"], fallbacks: "default",
    output_config: { effort: "low", ...(formato ? { format: { type: "json_schema", schema: formato } } : {}) },
    system: [{ type: "text", text: system, cache_control: { type: "ephemeral" } }], messages: [{ role: "user", content: usuarioTexto }] };
  let r: any;
  try { r = await client().beta.messages.create(req); }
  catch (e) {
    if (formato && e instanceof Anthropic.BadRequestError) { delete req.output_config.format; r = await client().beta.messages.create(req); }   // por si el formato estructurado no está disponible
    else throw e;
  }
  if (r.stop_reason === "refusal") throw new Error("La IA no ha podido ayudar con esto");
  return r.content.filter((b: any) => b.type === "text").map((b: any) => b.text).join("\n").trim();
}
const SISTEMA_MSG = `Eres Harvey, el asistente comercial de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., mayorista familiar de patatas, fruta, verdura y huevos en Mercamadrid (Madrid). Preparas mensajes de WhatsApp que una persona de la oficina revisará y enviará con su nombre.
Reglas:
- Escribe el mensaje para el cliente entre una línea que diga exactamente [MENSAJE] y otra que diga exactamente [FIN]. Fuera de esas marcas, como mucho 2 líneas de nota para la oficina.
- Mensaje corto (2-5 líneas), cercano y natural, como lo escribiría alguien del equipo. A clientes habituales, trato cercano en plural («¿necesitáis…?»); a negocios que aún no son clientes, «usted».
- Firma con el nombre de quien escribe si se indica. Nunca te presentes como Harvey ni como una IA.
- Usa SOLO los productos y precios que aparecen en los DATOS. Nunca inventes precios, ofertas, disponibilidad ni condiciones. Si no hay precio, no menciones precio.
- Como mucho una o dos sugerencias de producto, y solo si encajan con lo que el cliente suele comprar o con una recomendación vigente. Nada de insistir ni de varias preguntas: termina con una sola pregunta fácil de contestar.
- Español de España, sin markdown ni emojis en exceso (uno como mucho).`;

async function mensaje(u: { id: string; nombre: string }, b: any) {
  const fecha = fechaValida(b.fecha) || sumaDias(hoyMadrid(), 1); let datos = ""; let clienteId: string | null = null;
  const recs = await recomendacionesVigentes(fecha);
  const txtRecs = (recs as any[]).map(r => `- ${r.titulo}${r.producto ? " (" + r.producto + ")" : ""}${r.precio != null ? ": " + Number(r.precio).toFixed(2).replace(".", ",") + " €/" + (r.unidad || "kg") : ""}${r.texto ? " · " + r.texto : ""}`).join("\n");
  if (b.cliente_id) {
    clienteId = String(b.cliente_id);
    const [c] = await sql`select id, codigo, coalesce(nombre_comercial, nombre) as nombre, localidad from public.clientes where id = ${clienteId}`;
    if (!c) return json({ error: "Cliente no encontrado" }, 404);
    const prods = await productosHabituales(clienteId, 10) as any[];
    const precios = await preciosCliente(clienteId, prods.map(p => p.id));
    datos = `CLIENTE: ${c.nombre}${c.localidad ? " (" + c.localidad + ")" : ""}
MOTIVO DEL CONTACTO: ${b.motivo || "recordar pedido"}${b.detalle ? " — " + b.detalle : ""}
PEDIDO PARA: ${DIAS[isoDow(fecha)]} ${fechaES(fecha)}
LO QUE SUELE COMPRAR (últimos meses):
${prods.map(p => `- ${p.nombre}: ${p.veces} veces, unos ${p.cantidad_media} ${p.unidad_venta || "kg"}${precios.has(p.id) ? ", su precio: " + precios.get(p.id)!.toFixed(2).replace(".", ",") + " €/" + (p.unidad_precio || "kg") : ""}`).join("\n") || "(sin historial)"}
RECOMENDACIONES VIGENTES DE LA SEMANA:
${txtRecs || "(ninguna)"}`;
  } else if (b.prospecto_id) {
    const [p] = await sql`select nombre, tipo, localidad, notas from public.prospectos where id = ${String(b.prospecto_id)}`;
    if (!p) return json({ error: "Contacto no encontrado" }, 404);
    datos = `NEGOCIO QUE AÚN NO ES CLIENTE: ${p.nombre} (${p.tipo || ""}, ${p.localidad || ""})
NOTAS: ${p.notas || ""}
REFERENCIAS QUE SE PUEDEN NOMBRAR (una, la más cercana): Restaurante La Figal de Pablo (San Sebastián de los Reyes); Hotel Cándido y Mesón de Cándido (Segovia); Colegio Reggio y Residencia El Pardo de Aravaca (colectividades).
RECOMENDACIONES VIGENTES:
${txtRecs || "(ninguna)"}
OBJETIVO: primer contacto o seguimiento para presentarnos y ofrecer enviar la tarifa.`;
  } else return json({ error: "Falta el cliente" }, 400);
  const texto = await llamarIA(SISTEMA_MSG, `${datos}\n\nQUIEN ESCRIBE: ${u.nombre || "(nombre de la persona de la oficina)"}\nPrepara el mensaje.`, 900);
  await registrar(u.id, "mensaje_preparado", clienteId, { prospecto_id: b.prospecto_id || null, motivo: b.motivo || null, fecha });
  return json({ texto });
}

async function contactado(u: { id: string }, b: any) {
  const fecha = hoyMadrid(); const tipo = String(b.tipo || "recordatorio").slice(0, 40);
  if (!b.cliente_id && !b.prospecto_id) return json({ error: "Falta el cliente" }, 400);
  const r = await sql`insert into harvey.contactos (cliente_id, prospecto_id, fecha, tipo, mensaje, canal, usuario)
    values (${b.cliente_id || null}, ${b.prospecto_id || null}, ${fecha}, ${tipo}, ${String(b.mensaje || "").slice(0, 2000)}, 'whatsapp_manual', ${u.id})
    on conflict do nothing returning id`;
  await registrar(u.id, r.length ? "contacto_apuntado" : "contacto_duplicado_evitado", b.cliente_id || null, { prospecto_id: b.prospecto_id || null, tipo });
  return json({ ok: true, duplicado: r.length === 0 });
}

/* ---------- 2. Respuesta del cliente → borrador de pedido ---------- */
const ESQUEMA_PEDIDO = {
  type: "object", additionalProperties: false,
  required: ["fecha_entrega", "lineas", "preguntas", "respuesta_cliente"],
  properties: {
    fecha_entrega: { type: ["string", "null"], description: "YYYY-MM-DD si el mensaje la indica o se deduce («mañana»); si no, null" },
    lineas: { type: "array", items: { type: "object", additionalProperties: false, required: ["codigo", "texto_cliente", "cantidad", "unidad", "duda", "alternativas"],
      properties: {
        codigo: { type: ["string", "null"], description: "código del producto del CATÁLOGO; null si no hay ninguno claro" },
        texto_cliente: { type: "string" }, cantidad: { type: ["number", "null"] }, unidad: { type: ["string", "null"], description: "kg, caja, saco, docena, unidad, bolsa, manojo, bandeja…" },
        duda: { type: ["string", "null"], description: "qué no está claro (producto, cantidad o formato); null si está claro" },
        alternativas: { type: "array", items: { type: "string" }, description: "códigos posibles si hay duda" } } } },
    preguntas: { type: "array", items: { type: "string" }, description: "preguntas cortas para aclarar con el cliente" },
    respuesta_cliente: { type: "string", description: "mensaje breve para confirmar al cliente lo apuntado o preguntar lo dudoso, sin precios" },
  },
};
const SISTEMA_PEDIDO = `Interpretas pedidos que los clientes de un mayorista de fruta y verdura envían por WhatsApp. Devuelves SOLO el JSON pedido.
- Relaciona cada producto con un código del CATÁLOGO. Da prioridad a lo que ESTE CLIENTE suele comprar: si dice «tomate» y siempre compra tomate pera, es tomate pera.
- Si hay varias opciones razonables y el historial no lo aclara, pon el código más probable, explica la duda y añade alternativas. Si no existe en el catálogo, codigo = null y explica la duda.
- No inventes cantidades: si no la dice, cantidad = null con duda. Respeta la unidad que dice el cliente (caja, saco, kg, docena…).
- No calcules ni menciones precios.
- La respuesta al cliente: corta, cercana, en plural («apuntamos…»), resumiendo lo entendido y preguntando solo lo dudoso.`;

async function interpretar(u: { id: string }, b: any) {
  const clienteId = String(b.cliente_id || ""); const texto = String(b.texto || "").trim().slice(0, 4000);
  if (!clienteId || !texto) return json({ error: "Elige el cliente y pega su mensaje" }, 400);
  const [c] = await sql`select id, codigo, coalesce(nombre_comercial, nombre) as nombre from public.clientes where id = ${clienteId}`;
  if (!c) return json({ error: "Cliente no encontrado" }, 404);
  const hoy = hoyMadrid();
  const habituales = await productosHabituales(clienteId, 40) as any[];
  const formatos = await sql`select p.codigo, f.formato, f.peso_estimado_kg from public.formatos_cliente f join public.productos p on p.id = f.producto_id where f.cliente_id = ${clienteId}`;
  const catalogo = await sql`select codigo, nombre, unidad_venta from public.productos where activo is not false and coalesce(codigo, '') <> '' order by nombre`;
  const prompt = `HOY: ${hoy} (${DIAS[isoDow(hoy)]})
CLIENTE: ${c.nombre}
LO QUE ESTE CLIENTE SUELE COMPRAR (código | producto | veces | cantidad media):
${habituales.map(p => `${p.codigo} | ${p.nombre} | ${p.veces} | ${p.cantidad_media} ${p.unidad_venta || ""}`).join("\n") || "(sin historial)"}
FORMATOS DE ESTE CLIENTE: ${(formatos as any[]).map(f => `${f.codigo}: ${f.formato}${f.peso_estimado_kg ? " (" + f.peso_estimado_kg + " kg)" : ""}`).join("; ") || "(ninguno)"}
CATÁLOGO (código | producto | unidad):
${(catalogo as any[]).map(p => `${p.codigo} | ${p.nombre} | ${p.unidad_venta || ""}`).join("\n")}

MENSAJE DEL CLIENTE:
${texto}`;
  const salida = await llamarIA(SISTEMA_PEDIDO, prompt, 2500, ESQUEMA_PEDIDO);
  let res: any; try { res = JSON.parse(salida); } catch (_) { const m = salida.match(/\{[\s\S]*\}/); res = m ? JSON.parse(m[0]) : null; }
  if (!res || !Array.isArray(res.lineas)) return json({ error: "No he podido interpretar el mensaje. Prueba a pasarlo a mano." }, 502);
  const codigos = [...new Set(res.lineas.flatMap((l: any) => [l.codigo, ...(l.alternativas || [])]).filter(Boolean))] as string[];
  const prods = codigos.length ? await sql`select id, codigo, nombre, unidad_venta, unidad_precio from public.productos where codigo = any(${codigos})` : [];
  const porCodigo = new Map((prods as any[]).map(p => [p.codigo, p]));
  const precios = await preciosCliente(clienteId, (prods as any[]).map(p => p.id));
  const lineas = res.lineas.map((l: any) => {
    const p = l.codigo ? porCodigo.get(l.codigo) : null;
    return { producto_id: p?.id ?? null, codigo: p?.codigo ?? null, producto: p?.nombre ?? null, texto_cliente: l.texto_cliente, cantidad: l.cantidad, unidad: l.unidad,
      precio: p && precios.has(p.id) ? precios.get(p.id) : null, unidad_precio: p?.unidad_precio ?? null,
      duda: l.duda || (l.codigo && !p ? "El código propuesto no existe en el catálogo" : (!p ? "Producto sin identificar" : null)),
      alternativas: (l.alternativas || []).map((x: string) => porCodigo.get(x)).filter(Boolean).map((x: any) => ({ codigo: x.codigo, producto: x.nombre })) };
  });
  const fecha = fechaValida(res.fecha_entrega) || sumaDias(hoy, 1);
  const [bo] = await sql`insert into harvey.borradores (usuario, cliente_id, fecha_entrega, texto_original, lineas, preguntas)
    values (${u.id}, ${clienteId}, ${fecha}, ${texto}, ${sql.json(lineas)}, ${sql.json(res.preguntas || [])}) returning id`;
  await registrar(u.id, "borrador_creado", clienteId, { borrador: bo.id, lineas: lineas.length, dudas: lineas.filter((l: any) => l.duda).length });
  return json({ borrador_id: bo.id, cliente: { id: c.id, nombre: c.nombre, codigo: c.codigo }, fecha_entrega: fecha, lineas, preguntas: res.preguntas || [], respuesta_cliente: res.respuesta_cliente || "" });
}

async function borradores() {
  const filas = await sql`select b.id, b.created_at, b.fecha_entrega, b.texto_original, b.lineas, b.preguntas, b.estado, b.cliente_id, coalesce(c.nombre_comercial, c.nombre) as cliente, c.codigo
    from harvey.borradores b join public.clientes c on c.id = b.cliente_id where b.estado = 'pendiente' and b.created_at > now() - interval '14 days' order by b.created_at desc limit 50`;
  return json({ borradores: filas });
}
async function borradorEstado(u: { id: string }, b: any) {
  const estado = ["pasado", "descartado", "pendiente"].includes(b.estado) ? b.estado : null; if (!estado || !b.id) return json({ error: "Datos incompletos" }, 400);
  const r = await sql`update harvey.borradores set estado = ${estado}, updated_at = now() where id = ${String(b.id)} returning cliente_id`;
  await registrar(u.id, "borrador_" + estado, r[0]?.cliente_id ?? null, { borrador: b.id });
  return json({ ok: r.length > 0 });
}

/* ---------- 3. Preferencias de contacto ---------- */
async function prefsGet(b: any) {
  const [p] = await sql`select c.id as cliente_id, coalesce(c.nombre_comercial, c.nombre) as nombre, c.telefono, pr.whatsapp, coalesce(pr.no_contactar, false) as no_contactar, coalesce(pr.acepta_whatsapp, false) as acepta_whatsapp,
    pr.dias, pr.hora, coalesce(pr.max_semana, 3) as max_semana, pr.pausado_hasta, pr.notas from public.clientes c left join harvey.preferencias pr on pr.cliente_id = c.id where c.id = ${String(b.cliente_id || "")}`;
  return p ? json({ preferencias: { ...p, whatsapp_detectado: movil(p.whatsapp, p.telefono) } }) : json({ error: "Cliente no encontrado" }, 404);
}
async function prefsSet(u: { id: string }, b: any) {
  const id = String(b.cliente_id || ""); if (!id) return json({ error: "Falta el cliente" }, 400);
  let wa: string | null = null;
  if (b.whatsapp != null && String(b.whatsapp).trim()) { wa = movil(String(b.whatsapp)); if (!wa) return json({ error: "Ese número no parece un móvil español (6xx o 7xx)" }, 400); }
  const dias = Array.isArray(b.dias) ? b.dias.map((x: any) => Number(x)).filter((x: number) => x >= 1 && x <= 7) : null;
  const max = Math.min(7, Math.max(1, Number(b.max_semana) || 3));
  const hora = typeof b.hora === "string" && /^\d{2}:\d{2}$/.test(b.hora) ? b.hora : null;
  await sql`insert into harvey.preferencias (cliente_id, whatsapp, no_contactar, acepta_whatsapp, dias, hora, max_semana, pausado_hasta, notas, updated_at, updated_by)
    values (${id}, ${wa}, ${!!b.no_contactar}, ${!!b.acepta_whatsapp}, ${dias && dias.length ? dias : null}, ${hora}, ${max}, ${fechaValida(b.pausado_hasta)}, ${b.notas ? String(b.notas).slice(0, 500) : null}, now(), ${u.id})
    on conflict (cliente_id) do update set whatsapp = excluded.whatsapp, no_contactar = excluded.no_contactar, acepta_whatsapp = excluded.acepta_whatsapp, dias = excluded.dias, hora = excluded.hora,
      max_semana = excluded.max_semana, pausado_hasta = excluded.pausado_hasta, notas = excluded.notas, updated_at = now(), updated_by = excluded.updated_by`;
  await registrar(u.id, "preferencias_guardadas", id, { no_contactar: !!b.no_contactar, acepta_whatsapp: !!b.acepta_whatsapp, whatsapp: !!wa });
  return json({ ok: true });
}
async function buscarClientes(b: any) {
  const q = String(b.q || "").trim(); if (q.length < 2) return json({ clientes: [] });
  const filas = await sql`select id, codigo, coalesce(nombre_comercial, nombre) as nombre, localidad from public.clientes
    where activo is not false and (nombre ilike ${"%" + q + "%"} or nombre_comercial ilike ${"%" + q + "%"} or codigo ilike ${q + "%"}) order by coalesce(nombre_comercial, nombre) limit 15`;
  return json({ clientes: filas });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Método no permitido" }, 405);
  try {
    const u: any = await usuario(req); if (u.error) return json({ error: u.error }, u.status);
    let b: any = {}; try { b = await req.json(); } catch (_) { return json({ error: "Petición no válida" }, 400); }
    switch (b.accion) {
      case "hoy": return json(await aQuienEscribir(fechaValida(b.fecha) || sumaDias(hoyMadrid(), 1)));
      case "mensaje": return await mensaje(u, b);
      case "contactado": return await contactado(u, b);
      case "interpretar": return await interpretar(u, b);
      case "borradores": return await borradores();
      case "borrador_estado": return await borradorEstado(u, b);
      case "prefs_get": return await prefsGet(b);
      case "prefs_set": return await prefsSet(u, b);
      case "buscar_clientes": return await buscarClientes(b);
      default: return json({ error: "Acción desconocida" }, 400);
    }
  } catch (e) {
    if (e instanceof Anthropic.RateLimitError) return json({ error: "Harvey está saturado ahora mismo. Espera un minuto." }, 429);
    if (e instanceof Anthropic.AuthenticationError) return json({ error: "La clave de Anthropic no es válida" }, 500);
    if (e instanceof Anthropic.APIError) return json({ error: "Error de la IA: " + e.message }, 502);
    console.error(e);
    return json({ error: "Error interno de Harvey: " + ((e as Error)?.message || "desconocido") }, 500);
  }
});
