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
async function productosHabituales(clienteId: string, limite = 12, dias = 120) {
  return await sql`
    with c as (select codigo from public.clientes where id = ${clienteId}),
    ref as (select max(fecha) r from harvey.entregas where fecha <= current_date)
    select p.id, p.codigo, p.nombre, p.unidad_venta, p.unidad_precio,
           count(distinct e.fecha)::int as veces, round(avg(e.cantidad)::numeric, 1) as cantidad_media, max(e.fecha) as ultima,
           round(avg(e.precio) filter (where e.precio > 0)::numeric, 2) as precio_medio, round(sum(e.cantidad)::numeric) as cantidad_total
    from harvey.entregas e join c on e.cliente_codigo = c.codigo join public.productos p on p.codigo = e.producto_codigo, ref
    where e.fecha > ref.r - ${dias}
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

const MARGEN_OFERTA = 0.25;
/** Ofertas para recuperar un cliente: coste de compra + 0,25 €. Se descarta si la unidad no cuadra o el precio sale raro frente a lo que pagaba. */
async function ofertasRecuperar(prods: any[]) {
  const out: any[] = []; const dudas: string[] = [];
  for (const p of prods) {
    const [c0] = await sql`select precio::float as precio, fecha, fuente, unidad, proveedor, aviso from harvey.coste_compra(${p.id})`; const c: any = c0;
    if (!c) { dudas.push(`${p.nombre}: no hay precio de compra de los últimos 30 días${/patat.*pelad/i.test(p.nombre) ? " de El Parleño" : ""}`); continue; }
    const ud = String(c.unidad || "").toLowerCase().trim(); const udP = String(p.unidad_precio || "kg").toLowerCase().trim();
    if (ud && ud !== udP && !(udP === "kg" && /^(kg|kilo|kilos|k)$/.test(ud))) { dudas.push(`${p.nombre}: el precio de compra va por ${ud} y la venta por ${udP}`); continue; }
    const oferta = Math.round((c.precio + MARGEN_OFERTA) * 100) / 100; const antes = p.precio_medio ? Number(p.precio_medio) : null;
    if (antes && (oferta > antes * 1.6 || oferta < antes * 0.5)) { dudas.push(`${p.nombre}: la oferta (${oferta.toFixed(2)} €) sale muy distinta de lo que pagaba (${antes.toFixed(2)} €); revísalo`); continue; }
    out.push({ producto: p.nombre, codigo: p.codigo, unidad: udP, coste: c.precio, coste_fecha: c.fecha, coste_fuente: c.fuente + (c.proveedor ? " de " + c.proveedor : ""), aviso: c.aviso || null, oferta, precio_antes: antes });
  }
  return { ofertas: out, dudas };
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
            where e.fecha > p.ref - 365 and c.id not in (select cliente_id from con_pedido)
            group by c.id, p.ref having max(e.fecha) < p.ref - 35 and max(e.fecha) > p.ref - 330 and count(distinct e.fecha) >= 6),
    todos as (select distinct on (id) * from (select * from hab union all select * from sp union all select * from dor) z order by id, orden)
    select t.id, t.motivo, t.detalle, t.orden, t.peso, c.codigo, coalesce(c.nombre_comercial, c.nombre) as nombre, c.telefono, c.localidad,
           pr.whatsapp, coalesce(pr.no_contactar, false) as no_contactar, coalesce(pr.acepta_whatsapp, false) as acepta, pr.dias, pr.max_semana, pr.pausado_hasta, to_char(pr.hora, 'HH24:MI') as hora,
           (select count(*) from harvey.contactos k where k.cliente_id = t.id and k.fecha > ${hoy}::date - 7)::int as contactos_semana,
           exists(select 1 from harvey.contactos k where k.cliente_id = t.id and k.fecha = ${hoy}::date) as contactado_hoy,
           (select max(fecha) from harvey.entregas e where e.cliente_codigo = c.codigo) as ultima_entrega
    from todos t join public.clientes c on c.id = t.id left join harvey.preferencias pr on pr.cliente_id = t.id
    order by t.orden, t.peso desc`;
  const out: any[] = []; let excluidos = 0;
  for (const f of filas as any[]) {
    if (f.no_contactar || (f.pausado_hasta && String(f.pausado_hasta) >= hoy) || (Array.isArray(f.dias) && f.dias.length && !f.dias.includes(dowHoy)) || (!f.contactado_hoy && f.contactos_semana >= (f.max_semana || 3))) { excluidos++; continue; }
    if (f.motivo === "sin_pedir" && out.filter(x => x.motivo === "sin_pedir").length >= 30) continue;
    out.push({ cliente_id: f.id, codigo: f.codigo, nombre: f.nombre, localidad: f.localidad, motivo: f.motivo, detalle: f.detalle, hora: f.hora,
      whatsapp: movil(f.whatsapp, f.telefono), telefono: f.telefono, acepta: f.acepta, contactado_hoy: f.contactado_hoy, ultima_entrega: f.ultima_entrega });
  }
  // Lo que compraban los que han dejado de pedir
  const perdidos = out.filter(x => x.motivo === "sin_pedir");
  if (perdidos.length) {
    const comp = await sql`
      with ref as (select max(fecha) r from harvey.entregas where fecha <= current_date)
      select * from (select c.id, p.nombre, count(distinct e.fecha)::int as veces, round(sum(e.cantidad)::numeric) as total, coalesce(p.unidad_venta, 'kg') as ud,
             row_number() over (partition by c.id order by count(distinct e.fecha) desc, sum(e.importe) desc) as n
        from public.clientes c join harvey.entregas e on e.cliente_codigo = c.codigo join public.productos p on p.codigo = e.producto_codigo, ref
        where c.id = any(${perdidos.map(x => x.cliente_id)}) and e.fecha > ref.r - 365 group by c.id, p.nombre, p.unidad_venta) z where n <= 3`;
    for (const x of perdidos) x.compraba = (comp as any[]).filter(r => r.id === x.cliente_id).map(r => `${r.nombre} (${r.veces} veces, ${r.total} ${r.ud})`);
  }
  // Clientes que siguen comprando pero han dejado de pedir un producto que pedían a menudo
  const dejados = await sql`
    with ref as (select max(fecha) r from harvey.entregas where fecha <= current_date),
    act as (select e.cliente_codigo from harvey.entregas e, ref group by e.cliente_codigo, ref.r having max(e.fecha) > ref.r - 21),
    x as (select e.cliente_codigo, e.producto_codigo, count(distinct e.fecha) as veces, max(e.fecha) as ultima, round(sum(e.cantidad)::numeric) as total, sum(e.importe) as importe
          from harvey.entregas e, ref where e.fecha > ref.r - 365 and e.cliente_codigo in (select cliente_codigo from act)
          group by e.cliente_codigo, e.producto_codigo, ref.r having count(distinct e.fecha) >= 6 and max(e.fecha) < ref.r - 45),
    temporada as (select e.producto_codigo from harvey.entregas e, ref where e.fecha > ref.r - 30 group by e.producto_codigo having count(distinct e.fecha) >= 5)
    select c.id, coalesce(c.nombre_comercial, c.nombre) as nombre, c.codigo, c.telefono, c.localidad, p.codigo as producto_codigo, p.nombre as producto, coalesce(p.unidad_venta, 'kg') as ud,
           x.veces::int, x.total, x.ultima, pr.whatsapp, coalesce(pr.no_contactar, false) as no_contactar, to_char(pr.hora, 'HH24:MI') as hora
    from x join public.clientes c on c.codigo = x.cliente_codigo join public.productos p on p.codigo = x.producto_codigo left join harvey.preferencias pr on pr.cliente_id = c.id
    where c.activo is not false and coalesce(c.nombre_comercial, c.nombre) not ilike '%varios%' and x.producto_codigo in (select producto_codigo from temporada)
    order by x.importe desc limit 25`;
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
    where c.activo is not false and e.fecha > ref.r - 365 and coalesce(c.nombre_comercial, c.nombre) not ilike '%varios%'
    group by c.id, c.nombre_comercial, c.nombre, c.codigo, c.telefono, pr.whatsapp order by importe_90d desc limit 400`;
  const conPedido = await sql`select x.id as pedido_id, c.id as cliente_id, coalesce(c.nombre_comercial, c.nombre) as nombre, c.telefono, c.localidad, pr.whatsapp, to_char(pr.hora, 'HH24:MI') as hora,
      (select count(*) from public.lineas_pedido l where l.pedido_id = x.id)::int as lineas,
      exists(select 1 from harvey.contactos k where k.cliente_id = c.id and k.fecha = ${hoy}::date and k.tipo = 'confirmacion') as contactado_hoy
    from public.pedidos x join public.clientes c on c.id = x.cliente_id left join harvey.preferencias pr on pr.cliente_id = c.id
    where x.fecha_entrega = ${fechaPedido}::date and coalesce(x.archivado, false) = false and x.estado <> 'anulado' and coalesce(pr.no_contactar, false) = false and exists(select 1 from public.lineas_pedido l where l.pedido_id = x.id)
    order by 3 limit 80`;
  const [ref] = await sql`select max(fecha) as r from harvey.entregas where fecha <= current_date`;
  return {
    con_pedido: (conPedido as any[]).map(p => ({ pedido_id: p.pedido_id, cliente_id: p.cliente_id, nombre: p.nombre, localidad: p.localidad, motivo: "confirmar_pedido", detalle: p.lineas + " producto(s) apuntados", hora: p.hora, whatsapp: movil(p.whatsapp, p.telefono), telefono: p.telefono, contactado_hoy: p.contactado_hoy })),
    fecha_pedido: fechaPedido, hoy, historial_hasta: ref?.r ?? null, excluidos_por_preferencias: excluidos,
    clientes: out,
    productos_dejados: (dejados as any[]).filter(d => !d.no_contactar).map(d => ({ cliente_id: d.id, nombre: d.nombre, codigo: d.codigo, localidad: d.localidad, motivo: "producto_dejado",
      producto_codigo: d.producto_codigo, detalle: `dejó de pedir ${d.producto} (lo pidió ${d.veces} veces, ${d.total} ${d.ud}; última vez el ${fechaES(String(d.ultima instanceof Date ? d.ultima.toISOString() : d.ultima).slice(0, 10))})`,
      hora: d.hora, whatsapp: movil(d.whatsapp, d.telefono), telefono: d.telefono })),
    leads: (leads as any[]).filter(l => !l.reciente).map(l => ({ prospecto_id: l.id, nombre: l.nombre, tipo: l.tipo, localidad: l.localidad, telefono: l.telefono, whatsapp: movil(l.telefono), estado: l.estado, proximo_contacto: l.proximo_contacto, notas: l.notas })),
    sin_movil: (sinMovil as any[]).filter(s => !movil(s.whatsapp, s.telefono)).slice(0, 200).map(s => ({ cliente_id: s.id, nombre: s.nombre, codigo: s.codigo, telefono: s.telefono, importe_12m: Number(s.importe_90d) })),
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
const SISTEMA_MSG = `Eres Harvey, el comercial de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.: empresa familiar con tres generaciones en Mercamadrid (patatas, fruta, verdura y huevos), con cosechas propias y reparto con nuestros propios repartidores. Preparas mensajes de WhatsApp que una persona de la oficina revisará y enviará con su nombre.

CÓMO ESCRIBES
- Como un comercial con oficio y años de mercado: cercano, seguro y con entereza. Frases bien construidas y párrafos que se leen con naturalidad, nunca telegráficos ni de plantilla.
- Escribe el mensaje para el cliente entre una línea que diga exactamente [MENSAJE] y otra que diga exactamente [FIN]. Fuera de esas marcas, como mucho 2 líneas de nota para la oficina.
- Entre 4 y 8 líneas. Español de España. A negocios que aún no son clientes, de usted; a los clientes habituales, trato cercano en plural («¿qué necesitáis…?»).
- Firma con el nombre de quien escribe si se indica. Nunca te presentes como Harvey ni como una IA. Uno o ningún emoji.

NUESTRA FORMA DE VENDER
- Un negocio que no es cliente ya tiene proveedor y no nos necesita. No competimos por precio: nos diferenciamos por el servicio, la calidad del género, la experiencia de tres generaciones, estar pendientes de ellos y ayudarles en su día a día (que no les falte nada, adaptarnos a su cocina, resolver rápido cualquier problema).
- El objetivo con un negocio nuevo es conseguir una VISITA: pasar a conocerles, ver su cocina, llevarles género para que lo prueben. Propón la visita con naturalidad, con una franja concreta («¿le viene bien que me pase el jueves por la mañana?»). NO ofrezcas mandar tarifas ni listas de precios salvo que nos las pidan.
- Transmite que queremos que les vaya bien: si ellos crecen y están contentos, crecemos todos juntos.
- Con los clientes habituales: pregunta con amabilidad qué necesitan para mañana, ofrécete a ayudar y, si ayuda, recuérdales lo que suelen llevar.
- Las recomendaciones de la semana úsalas solo cuando encajen claramente con lo que ese cliente compra; la mayoría de las veces no hace falta nombrarlas.

DATOS Y PRECIOS
- Usa SOLO los productos y datos que aparecen en los DATOS. Nunca inventes precios, ofertas, disponibilidad, plazos ni condiciones.
- Solo puedes poner un precio si aparece en «OFERTA PARA RECUPERARLO» o en «PRECIOS AUTORIZADOS». Si no, NO menciones precios ni cifras de dinero.
- Si hay OFERTA PARA RECUPERARLO: recuérdale con naturalidad lo que nos compraba y ofrécele ese producto a ese precio, sin presionar y sin decir que es «nuestro coste».
- Si el motivo es CONFIRMAR PEDIDO: escribe una confirmación amable con la lista de lo que va (un producto por línea con su cantidad, tal como viene en los DATOS, sin precios) y pregunta si quieren añadir o cambiar algo antes de prepararlo.`;

async function mensaje(u: { id: string; nombre: string }, b: any) {
  const fecha = fechaValida(b.fecha) || sumaDias(hoyMadrid(), 1); let datos = ""; let clienteId: string | null = null;
  let ofertas: any[] = []; let dudasOferta: string[] = [];
  const recs = await recomendacionesVigentes(fecha);
  const notas = await sql`select texto from harvey.notas where activa order by id`;
  const txtNotas = (notas as any[]).map(n => "- " + n.texto).join("\n");
  const txtRecs = (recs as any[]).map(r => `- ${r.titulo}${r.producto ? " (" + r.producto + ")" : ""}${r.texto ? " · " + r.texto : ""}`).join("\n");
  if (b.cliente_id) {
    clienteId = String(b.cliente_id);
    const [c] = await sql`select id, codigo, coalesce(nombre_comercial, nombre) as nombre, localidad from public.clientes where id = ${clienteId}`;
    if (!c) return json({ error: "Cliente no encontrado" }, 404);
    const recuperar = b.tipo === "sin_pedir" || b.tipo === "producto_dejado";
    let txtPedido = "";
    if (b.tipo === "confirmar_pedido" && b.pedido_id) {
      const ls = await sql`select coalesce(pr.nombre, l.notas, 'producto') as producto, l.cantidad_pedida, l.unidad_pedida from public.lineas_pedido l left join public.productos pr on pr.id = l.producto_id where l.pedido_id = ${String(b.pedido_id)} order by pr.nombre`;
      txtPedido = "PEDIDO YA APUNTADO PARA " + DIAS[isoDow(fecha)] + " " + fechaES(fecha) + ":\n" + (ls as any[]).map(x => `- ${x.cantidad_pedida ?? ""} ${x.unidad_pedida ?? ""} ${x.producto}`.replace(/\s+/g, " ").trim()).join("\n");
    }
    const prods = await productosHabituales(clienteId, 10, recuperar ? 365 : 120) as any[];
    if (recuperar) {
      let objetivo = b.producto_codigo ? prods.filter(p => p.codigo === b.producto_codigo) : prods.slice(0, 2);
      if (b.producto_codigo && !objetivo.length) objetivo = (await sql`select p.id, p.codigo, p.nombre, p.unidad_venta, p.unidad_precio, null as precio_medio from public.productos p where codigo = ${String(b.producto_codigo)}`) as any[];
      const r = await ofertasRecuperar(objetivo); ofertas = r.ofertas; dudasOferta = r.dudas;
    }
    const precios = b.con_precios ? await preciosCliente(clienteId, prods.map(p => p.id)) : new Map<string, number>();
    const euros = (n: number) => n.toFixed(2).replace(".", ",");
    datos = `CLIENTE: ${c.nombre}${c.localidad ? " (" + c.localidad + ")" : ""}
MOTIVO DEL CONTACTO: ${b.motivo || "recordar pedido"}${b.detalle ? " — " + b.detalle : ""}
${recuperar ? "OBJETIVO: recuperar al cliente (o el producto que ha dejado de pedir). Mensaje cercano, sin reproches, recordando lo que nos compraba y ofreciendo nuestra ayuda." : b.tipo === "confirmar_pedido" ? "OBJETIVO: CONFIRMAR PEDIDO.\n" + txtPedido : `OBJETIVO: preguntar con amabilidad qué necesitan para el pedido de ${DIAS[isoDow(fecha)]} ${fechaES(fecha)}.`}
LO QUE ${recuperar ? "COMPRABA" : "SUELE COMPRAR"} (${recuperar ? "último año" : "últimos meses"}):
${prods.map(p => `- ${p.nombre}: ${p.veces} veces, unos ${p.cantidad_media} ${p.unidad_venta || "kg"} cada vez`).join("\n") || "(sin historial)"}
${ofertas.length ? "OFERTA PARA RECUPERARLO (precios que SÍ puedes poner):\n" + ofertas.map(o => `- ${o.producto}: ${euros(o.oferta)} €/${o.unidad}`).join("\n") : ""}
${precios.size ? "PRECIOS AUTORIZADOS por la oficina (tarifa de este cliente):\n" + prods.filter(p => precios.has(p.id)).map(p => `- ${p.nombre}: ${euros(precios.get(p.id)!)} €/${p.unidad_precio || "kg"}`).join("\n") : ""}
RECOMENDACIONES VIGENTES DE LA SEMANA (sin precio):
${txtRecs || "(ninguna)"}`;
  } else if (b.prospecto_id) {
    const [p] = await sql`select nombre, tipo, localidad, notas from public.prospectos where id = ${String(b.prospecto_id)}`;
    if (!p) return json({ error: "Contacto no encontrado" }, 404);
    datos = `NEGOCIO QUE AÚN NO ES CLIENTE: ${p.nombre} (${p.tipo || ""}, ${p.localidad || ""})
NOTAS: ${p.notas || ""}
REFERENCIAS QUE SE PUEDEN NOMBRAR (una, la más cercana): Restaurante La Figal de Pablo (San Sebastián de los Reyes); Hotel Cándido y Mesón de Cándido (Segovia); Colegio Reggio y Residencia El Pardo de Aravaca (colectividades).
RECOMENDACIONES VIGENTES:
${txtRecs || "(ninguna)"}
OBJETIVO: primer contacto o seguimiento. Ya tienen proveedor: preséntanos por servicio, calidad, experiencia y cercanía, y consigue una VISITA para conocerles y que prueben nuestro género (propón un día y una franja). No ofrezcas enviar tarifas.`;
  } else return json({ error: "Falta el cliente" }, 400);
  const texto = await llamarIA(SISTEMA_MSG, `${datos}\n\nNOTAS INTERNAS DE LA EMPRESA (para que decidas bien; NO las cuentes al cliente):\n${txtNotas || "(ninguna)"}\n\nQUIEN ESCRIBE: ${u.nombre || "(nombre de la persona de la oficina)"}\nPrepara el mensaje.`, 900);
  await registrar(u.id, "mensaje_preparado", clienteId, { prospecto_id: b.prospecto_id || null, motivo: b.motivo || null, fecha, ofertas: ofertas.map(o => ({ producto: o.producto, oferta: o.oferta, coste: o.coste })), con_precios: !!b.con_precios });
  return json({ texto, ofertas, dudas_oferta: dudasOferta });
}

const ESQUEMA_PROPUESTA = { type: "object", additionalProperties: false, required: ["titulo", "subtitulo", "intro", "puntos"],
  properties: { titulo: { type: "string", description: "título de portada, corto y con gancho, con el nombre del negocio" }, subtitulo: { type: "string" },
    intro: { type: "string", description: "3-5 frases de presentación personalizada para ese negocio" },
    puntos: { type: "array", items: { type: "string" }, description: "5 compromisos concretos de servicio para ese negocio (sin precios)" } } };
async function propuesta(u: { id: string; nombre: string }, b: any) {
  let datos = ""; let tipoNeg = "hosteleria";
  if (b.prospecto_id) { const [p] = await sql`select nombre, tipo, localidad, notas from public.prospectos where id = ${String(b.prospecto_id)}`; if (!p) return json({ error: "Contacto no encontrado" }, 404);
    datos = `NEGOCIO (aún no es cliente): ${p.nombre} · ${p.tipo || ""} · ${p.localidad || ""}\nNOTAS: ${p.notas || ""}`; if (/colegio|residen|escuela|infantil|guarder|colectiv|catering|hospital/i.test((p.tipo || "") + " " + (p.nombre || ""))) tipoNeg = "colectivos"; }
  else if (b.cliente_id) { const [c] = await sql`select coalesce(nombre_comercial, nombre) as nombre, localidad from public.clientes where id = ${String(b.cliente_id)}`; if (!c) return json({ error: "Cliente no encontrado" }, 404);
    const prods = await productosHabituales(String(b.cliente_id), 8, 365) as any[]; datos = `CLIENTE: ${c.nombre} · ${c.localidad || ""}\nLO QUE NOS COMPRA: ${prods.map(p => p.nombre).join(", ") || "(sin historial)"}`;
    if (/colegio|residen|escuela|infantil|guarder/i.test(c.nombre)) tipoNeg = "colectivos"; }
  else return json({ error: "Falta el cliente" }, 400);
  const salida = await llamarIA(SISTEMA_MSG + "\n\nAHORA NO escribes un WhatsApp: preparas el texto de una presentación personalizada (devuelve SOLO el JSON pedido).",
    `${datos}\nREFERENCIAS QUE SE PUEDEN NOMBRAR: La Figal de Pablo (hostelería, San Sebastián de los Reyes); Hotel Cándido y Mesón de Cándido (Segovia); Colegio Reggio y Residencia El Pardo de Aravaca (colectividades).\nQUIEN LA PRESENTA: ${u.nombre || "la oficina"}`, 1500, ESQUEMA_PROPUESTA);
  let r: any; try { r = JSON.parse(salida); } catch (_) { const m = salida.match(/\{[\s\S]*\}/); r = m ? JSON.parse(m[0]) : null; }
  if (!r) return json({ error: "No se pudo preparar la presentación" }, 502);
  await registrar(u.id, "propuesta_preparada", b.cliente_id || null, { prospecto_id: b.prospecto_id || null });
  return json({ ...r, tipo: tipoNeg });
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
  if (b.solo_whatsapp) {   // desde «Móviles»: solo el número, sin tocar el resto de preferencias
    if (!wa) return json({ error: "Escribe el móvil" }, 400);
    await sql`insert into harvey.preferencias (cliente_id, whatsapp, acepta_whatsapp, updated_at, updated_by) values (${id}, ${wa}, ${!!b.acepta_whatsapp}, now(), ${u.id})
      on conflict (cliente_id) do update set whatsapp = excluded.whatsapp, acepta_whatsapp = harvey.preferencias.acepta_whatsapp or excluded.acepta_whatsapp, updated_at = now(), updated_by = excluded.updated_by`;
    await registrar(u.id, "preferencias_guardadas", id, { whatsapp: true, desde: "moviles" });
    return json({ ok: true });
  }
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
const ACCIONES: Record<string, string> = {
  mensaje_preparado: "✍️ Preparó un mensaje", contacto_apuntado: "✔ Contacto apuntado", contacto_duplicado_evitado: "🛑 Evitó un mensaje repetido",
  borrador_creado: "📥 Interpretó un pedido", borrador_pasado: "➡️ Borrador pasado a pedido", borrador_descartado: "🗑️ Borrador descartado",
  borrador_pendiente: "↩️ Borrador reabierto", preferencias_guardadas: "⚙️ Preferencias cambiadas",
  precio_solicitado: "📲 Pidió aprobación de un precio", propuesta_preparada: "🎬 Preparó una presentación", lista_creada: "📄 Preparó una lista de precios", precio_aprobado: "✅ Precio aprobado", tarifa_recalculada: "🔄 Tarifa recalculada",
  tarifa_aplicada: "💶 Tarifa nueva aplicada", tarifa_deshecha: "↩️ Tarifa deshecha", tarifa_descartada: "🗑️ Borrador de tarifa descartado",
};
async function actividad(b: any) {
  const dias = Math.min(60, Math.max(1, Number(b.dias) || 7));
  const filas = await sql`select r.id, r.created_at, r.accion, r.detalle, coalesce(pe.nombre, 'alguien') as usuario,
      coalesce(c.nombre_comercial, c.nombre, pr.nombre) as cliente
    from harvey.registro r left join public.perfiles pe on pe.id = r.usuario left join public.clientes c on c.id = r.cliente_id
    left join public.prospectos pr on pr.id = nullif(r.detalle->>'prospecto_id', '')::uuid
    where r.created_at > now() - make_interval(days => ${dias}) order by r.created_at desc limit 200`;
  const resumen = await sql`select
      count(*) filter (where accion = 'mensaje_preparado')::int as mensajes,
      count(*) filter (where accion = 'contacto_apuntado')::int as contactos,
      count(*) filter (where accion = 'borrador_creado')::int as pedidos_interpretados,
      count(*) filter (where accion = 'borrador_pasado')::int as pasados_a_pedido,
      count(*) filter (where accion = 'contacto_duplicado_evitado')::int as repetidos_evitados
    from harvey.registro where created_at > now() - make_interval(days => ${dias})`;
  return json({ dias, resumen: resumen[0], acciones: (filas as any[]).map(f => ({ ...f, texto: ACCIONES[f.accion] || f.accion })) });
}
/* ---------- 4. Tarifas para clientes nuevos (borradores que se confirman a mano) ---------- */
async function tarifas() {
  const listas = await sql`select a.lista_id, a.etiqueta, a.margen::float, a.margen_min::float, a.margen_max::float, l.nombre, l.updated_at,
      (select row_to_json(b) from (select id, created_at, margen::float, estado, automatico, items from harvey.listas_borrador b where b.lista_id = a.lista_id and b.estado = 'pendiente' order by created_at desc limit 1) b) as borrador,
      (select row_to_json(b) from (select id, resuelto_en, estado, jsonb_array_length(coalesce(aplicados, '[]')) as n from harvey.listas_borrador b where b.lista_id = a.lista_id and b.estado = 'aplicado' order by resuelto_en desc limit 1) b) as ultimo_aplicado
    from harvey.listas_auto a join public.listas_precios l on l.id = a.lista_id order by a.etiqueta desc`;
  return json({ listas });
}
async function tarifaRecalcular(u: { id: string }, b: any) {
  const [a] = await sql`select * from harvey.listas_auto where lista_id = ${String(b.lista_id || "")}`; if (!a) return json({ error: "Lista no válida" }, 400);
  const m = Math.min(Number(a.margen_max), Math.max(Number(a.margen_min), Number(b.margen) || Number(a.margen)));
  const [r] = await sql`select harvey.proponer_lista(${a.lista_id}, ${m}, true) as id`;
  await sql`update harvey.listas_borrador set automatico = false where id = ${r.id}`;
  await registrar(u.id, "tarifa_recalculada", null, { lista_id: a.lista_id, margen: m });
  return json({ ok: true, id: r.id });
}
async function tarifaAplicar(u: { id: string }, b: any) {
  const [bo] = await sql`select * from harvey.listas_borrador where id = ${String(b.id || "")} and estado = 'pendiente'`; if (!bo) return json({ error: "Ese borrador ya no está pendiente" }, 400);
  const elegidos = new Set((Array.isArray(b.elegidos) ? b.elegidos : []).map(String));
  const aplicados: any[] = [];
  await sql.begin(async (tx: any) => {
    for (const it of bo.items as any[]) {
      const clave = it.item_id || ("p:" + it.producto_id); if (!elegidos.has(clave)) continue;
      const aMano = Number((b.precios || {})[clave]); if (aMano > 0 && aMano < 1000) it.nuevo = Math.round(aMano * 100) / 100;   // precio escrito o subido/bajado con ▲ ▼
      if (it.nuevo == null) continue;
      if (it.item_id) { await tx`update public.listas_precios_items set precio = ${it.nuevo}, coste = ${it.coste} where id = ${it.item_id} and lista_id = ${bo.lista_id}`; aplicados.push({ item_id: it.item_id, antes: it.antes, coste_antes: it.coste_antes, nuevo: it.nuevo }); }
      else { const [n] = await tx`insert into public.listas_precios_items (lista_id, producto_id, nombre, precio, unidad, coste, orden) values (${bo.lista_id}, ${it.producto_id}, ${it.nombre}, ${it.nuevo}, ${it.unidad || "kg"}, ${it.coste}, 999) returning id`; aplicados.push({ item_id: n.id, insertado: true, nuevo: it.nuevo }); }
    }
    await tx`update public.listas_precios set updated_at = now() where id = ${bo.lista_id}`;
    await tx`update harvey.listas_borrador set estado = 'aplicado', resuelto_en = now(), resuelto_por = ${u.id}, aplicados = ${sql.json(aplicados)} where id = ${bo.id}`;
  });
  await registrar(u.id, "tarifa_aplicada", null, { lista_id: bo.lista_id, borrador: bo.id, cambios: aplicados.length, margen: bo.margen });
  return json({ ok: true, cambios: aplicados.length });
}
async function tarifaDeshacer(u: { id: string }, b: any) {
  const [bo] = await sql`select * from harvey.listas_borrador where id = ${String(b.id || "")} and estado = 'aplicado'`; if (!bo) return json({ error: "No hay nada que deshacer" }, 400);
  await sql.begin(async (tx: any) => {
    for (const a of (bo.aplicados || []) as any[]) {
      if (a.insertado) await tx`delete from public.listas_precios_items where id = ${a.item_id} and lista_id = ${bo.lista_id}`;
      else await tx`update public.listas_precios_items set precio = ${a.antes}, coste = ${a.coste_antes} where id = ${a.item_id} and lista_id = ${bo.lista_id}`;
    }
    await tx`update harvey.listas_borrador set estado = 'deshecho', resuelto_en = now(), resuelto_por = ${u.id} where id = ${bo.id}`;
  });
  await registrar(u.id, "tarifa_deshecha", null, { lista_id: bo.lista_id, borrador: bo.id });
  return json({ ok: true });
}
async function tarifaDescartar(u: { id: string }, b: any) {
  const r = await sql`update harvey.listas_borrador set estado = 'descartado', resuelto_en = now(), resuelto_por = ${u.id} where id = ${String(b.id || "")} and estado = 'pendiente' returning lista_id`;
  await registrar(u.id, "tarifa_descartada", null, { borrador: b.id });
  return json({ ok: r.length > 0 });
}
/** Apuntes sueltos en el registro (petición y aprobación de precios). */
async function anotar(u: { id: string }, b: any) {
  const ok = ["precio_solicitado", "precio_aprobado", "lista_creada"]; if (!ok.includes(b.que)) return json({ error: "No válido" }, 400);
  await registrar(u.id, b.que, b.cliente_id || null, { a_quien: b.a_quien || null, ofertas: b.ofertas || null });
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
      case "actividad": return await actividad(b);
      case "tarifas": return await tarifas();
      case "tarifa_recalcular": return await tarifaRecalcular(u, b);
      case "tarifa_aplicar": return await tarifaAplicar(u, b);
      case "tarifa_deshacer": return await tarifaDeshacer(u, b);
      case "tarifa_descartar": return await tarifaDescartar(u, b);
      case "anotar": return await anotar(u, b);
      case "propuesta": return await propuesta(u, b);
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
