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
- MUY IMPORTANTE: cada mensaje que el cliente vaya a recibir (WhatsApp, correo o frase de llamada) escríbelo entre una línea que diga exactamente [MENSAJE] y otra que diga exactamente [FIN]. Si el mensaje es para un cliente concreto cuyo código conoces (por buscar_clientes), abre con [MENSAJE para=CÓDIGO] (por ejemplo [MENSAJE para=FIGAL]); si es para un contacto pendiente (prospecto) cuyo id conoces, con [MENSAJE para=P:id]. Así la app pone su teléfono en el botón de WhatsApp. Dentro va solo el texto para el cliente, sin títulos ni comentarios. Las explicaciones y notas para la oficina van siempre fuera de esas marcas. Si preparas varios mensajes, cada uno con sus propias marcas.
- Usa solo los productos, precios y datos que aparecen en el CONTEXTO. Si falta un precio, no lo inventes: pon «[precio]» para que la oficina lo rellene.
- Nunca prometas descuentos, plazos de pago, crédito ni pedidos mínimos: eso lo decide la oficina. Di que se estudia de forma personalizada.
- Ante una queja: escuchar, reconocer, pedir detalles (producto, día, albarán, foto) y proponer solución concreta; nunca culpar al transportista ni al mercado.
- Termina las propuestas con un siguiente paso con fecha (mandar tarifa, llamar el jueves, prueba con un producto).
- Si te preguntan algo que no sabes de la empresa, dilo y sugiere qué dato pedir a la oficina.
- No uses formato Markdown complicado (ni tablas ni almohadillas); como mucho guiones y negritas con *asteriscos* al estilo WhatsApp.

Consultas a la base de datos (herramientas de SOLO LECTURA):
- Puedes consultar clientes, deudas, pedidos e importes, ventas por fechas, contactos pendientes (prospectos) y quejas abiertas. Úsalas cuando la pregunta necesite datos concretos y no estén ya en el CONTEXTO. Puedes hacer varias consultas seguidas.
- Las cifras que des (importes, deudas, fechas) deben salir de esas consultas; si no lo encuentras, dilo. Los importes van con IVA y en euros, con coma decimal.
- No puedes enviar mensajes, ni cambiar o borrar nada. Si te piden apuntar algo (un contacto, un «volver a llamar», un cobro…), prepara el texto y di qué tiene que apuntar la oficina y en qué pantalla de la app. La ÚNICA excepción es dar de alta un cliente provisional (ver abajo).

Clientes (muy importante):
- Cuando te nombren un cliente, búscalo SIEMPRE con buscar_clientes, aunque el nombre no sea exacto: muchos clientes están registrados con su razón social, con erratas o con otro nombre. La búsqueda tolera tildes, erratas y palabras sueltas, y también busca por código y localidad.
- Si sale UNA coincidencia clara (confianza «alta» y muy por encima de las demás), úsala y di entre paréntesis cuál has entendido: «(entiendo que es Asador de pollos Sadelia, código ADELIA)».
- Las fichas desactivadas suelen ser antiguas o duplicadas: menciónalas solo si no hay otra activa que encaje.
- Si hay VARIAS parecidas, NO sigas: enumera las opciones (1, 2, 3…) con nombre comercial, razón social, código y localidad, y pregunta cuál es. Espera la respuesta.
- Si NO aparece, dilo, enseña las más parecidas por si es alguna, y ofrece darlo de alta como cliente provisional: pide el nombre con el que lo conocen y el código que le quieran poner (y si se le cobra sin IVA, la localidad o alguna nota, si lo saben).
- Alta provisional: primero resume exactamente lo que vas a crear (nombre, código, notas) y pregunta «¿Lo creo? Responde sí». Solo cuando la persona conteste que sí, usa crear_cliente_provisional. El cliente queda marcado «FALTA COMPLETAR» para que la secretaria rellene el resto de la ficha; recuérdalo al terminar.
- Por privacidad, las consultas no traen teléfonos ni correos: solo si los hay. Remite a la ficha de la app para verlos.
- Antes de un recordatorio de pago, comprueba la deuda con la herramienta. Tono siempre educado, sin amenazas, y recuerda que la oficina decide cuándo enviarlo.`;

// ===================== Herramientas de solo lectura =====================
// Se ejecutan con la sesión de quien pregunta (sus mismos permisos en Supabase): solo SELECT.
const HERRAMIENTAS: Anthropic.Tool[] = [
  {
    name: "buscar_clientes",
    description: "Busca clientes de Ferjusanz de forma tolerante (sin tildes, con erratas o palabras sueltas) por nombre comercial, razón social, alias, código o localidad. Devuelve las coincidencias ordenadas con una puntuación y una confianza (alta/media/baja), el id, código, nombres, localidad, forma de pago, si está activo y si tiene teléfono/correo (sin mostrarlos). Úsala SIEMPRE que te nombren un cliente, para conseguir el cliente_id antes de mirar sus pedidos o deudas.",
    input_schema: { type: "object", properties: {
      texto: { type: "string", description: "Parte del nombre, código o localidad. Vacío = clientes más recientes." },
      limite: { type: "integer", description: "Máximo de resultados (por defecto 15, máximo 50)." },
    }, required: ["texto"] },
  },
  {
    name: "crear_cliente_provisional",
    description: "Da de alta un cliente nuevo provisional, marcado «FALTA COMPLETAR» para que la secretaria complete la ficha. ÚSALA SOLO después de haber resumido los datos y de que la persona haya contestado «sí» en su último mensaje; si no, el alta se rechaza. Antes comprueba con buscar_clientes que no existe ya.",
    input_schema: { type: "object", properties: {
      nombre: { type: "string", description: "Nombre con el que conocen al cliente (se guarda como nombre y nombre comercial)." },
      codigo: { type: "string", description: "Código que ha dicho la persona, tal cual (p. ej. «LUCAS» o «Falta poner 6»). Máximo 20 caracteres." },
      localidad: { type: "string", description: "Opcional." },
      sin_iva: { type: "boolean", description: "Opcional. true si han dicho que se le cobra sin IVA (solo se apunta en las notas)." },
      notas: { type: "string", description: "Opcional. Otra información que hayan dado." },
    }, required: ["nombre", "codigo"] },
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

// ---------- Búsqueda tolerante de clientes ----------
const VACIAS = new Set(["el", "la", "los", "las", "de", "del", "y", "e", "en", "a", "sl", "sa", "slu", "s", "l", "cb", "sc", "rest", "restaurante", "bar", "cafeteria", "cafe", "meson", "asador", "taberna", "cerveceria", "hotel", "colegio", "residencia", "grupo", "hosteleria", "distrib", "comercial"]);
const norm = (t: unknown) => String(t ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]+/g, " ").trim();
const tokens = (t: unknown) => norm(t).split(" ").filter(w => w && !VACIAS.has(w));
function lev(a: string, b: string) {
  if (a === b) return 0; const m = a.length, n = b.length; if (!m || !n) return m || n;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) { const cur = [i]; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); prev = cur; }
  return prev[n];
}
function simPalabra(q: string, c: string) {
  if (q === c) return 1;
  const c2 = c.replace(/\d+$/, "");
  if (c2 && c2 !== c && q === c2) return 0.97;
  if (q.length >= 3 && c.startsWith(q)) return 0.75 + 0.2 * (q.length / c.length);
  if (c.length >= 4 && q.startsWith(c)) return 0.8;
  const d = Math.min(lev(q, c), c2 ? lev(q, c2) + 0.5 : 99), l = Math.max(q.length, c.length);
  const r = 1 - d / l; return q.length <= 3 ? (d === 0 ? 1 : 0) : r;
}
function puntuar(q: string, c: any) {
  const qn = norm(q), cod = norm(c.codigo);
  if (!qn) return 0;
  if (qn === cod) return 1;
  const textos = [c.nombre_comercial, c.nombre, ...(c.alias || [])].filter(Boolean);
  let mejor = 0;
  for (const t of textos) {
    const tn = norm(t); if (tn === qn) return 0.98;
    let base = tn.includes(qn) && qn.length >= 4 ? 0.9 : 0;
    const qt = tokens(q), ct = tokens(t);
    if (qt.length && ct.length) {
      const media = qt.reduce((s, w) => s + Math.max(...ct.map(x => simPalabra(w, x))), 0) / qt.length;
      base = Math.max(base, media * 0.95);
    }
    mejor = Math.max(mejor, base);
  }
  if (cod && qn.replace(/ /g, "").length >= 3 && cod.startsWith(qn.replace(/ /g, ""))) mejor = Math.max(mejor, 0.85);
  if (cod && cod.length >= 3 && norm(q).split(" ").includes(cod)) mejor = Math.max(mejor, 0.92);
  const loc = norm(c.localidad); if (loc && qn === loc) mejor = Math.max(mejor, 0.6);
  return mejor;
}
async function todosClientes(sb: SB) {
  const todos: any[] = [];
  for (let desde = 0; desde < 20000; desde += 1000) {
    const d = chk(await sb.from("clientes").select("id,codigo,nombre,nombre_comercial,alias,localidad,forma_pago,dias_pago,activo,telefono,email,notas").range(desde, desde + 999)) as any[];
    todos.push(...d); if (d.length < 1000) break;
  }
  return todos;
}
const fichaCliente = (c: any) => ({ id: c.id, codigo: c.codigo, nombre_comercial: c.nombre_comercial || null, razon_social: c.nombre, alias: c.alias?.length ? c.alias : undefined,
  localidad: c.localidad, forma_pago: c.forma_pago, dias_pago: c.dias_pago, activo: c.activo, tiene_telefono: !!c.telefono, tiene_email: !!c.email, notas: String(c.notas || "").slice(0, 200) });
const AFIRMA = /^\s*(s[ií]+|vale|ok|okey|okay|de acuerdo|confirmo|confirmado|adelante|cr[eé]alo|hazlo|correcto|perfecto|dale)\b/i;

type Ctx = { sb: SB; ultimoUsuario: string; autor: string };

async function ejecutar(ctx: Ctx, nombre: string, a: any): Promise<unknown> {
  const sb = ctx.sb;
  switch (nombre) {
    case "buscar_clientes": {
      const lim = Math.min(Math.max(Number(a.limite) || 8, 1), 30);
      const texto = String(a.texto || "").slice(0, 80);
      if (!norm(texto)) {
        const d = chk(await sb.from("clientes").select("id,codigo,nombre,nombre_comercial,alias,localidad,forma_pago,dias_pago,activo,telefono,email,notas").order("created_at", { ascending: false }).limit(lim)) as any[];
        return { nota: "Sin texto: clientes dados de alta más recientemente.", clientes: d.map(fichaCliente) };
      }
      const res = (await todosClientes(sb)).map(c => ({ c, p: puntuar(texto, c) * (c.activo === false ? 0.85 : 1) })).filter(x => x.p >= 0.55).sort((x, y) => y.p - x.p).slice(0, lim);
      const conf = (p: number) => p >= 0.9 ? "alta" : p >= 0.72 ? "media" : "baja";
      const clara = res.length > 0 && res[0].p >= 0.9 && (res.length === 1 || res[0].p - res[1].p >= 0.12);
      return { buscado: texto, coincidencia_clara: clara, total: res.length,
        aviso: clara ? undefined : res.length ? "Hay varias posibles o ninguna clara: pregunta cuál es antes de seguir." : "No aparece. Ofrece alta provisional.",
        clientes: res.map(x => ({ puntuacion: Math.round(x.p * 100), confianza: conf(x.p), ...fichaCliente(x.c) })) };
    }
    case "crear_cliente_provisional": {
      if (!AFIRMA.test(ctx.ultimoUsuario)) return { creado: false, motivo: "La persona no ha confirmado. Resume los datos y pregunta «¿Lo creo? Responde sí»." };
      const nom = String(a.nombre || "").replace(/\s+/g, " ").trim().slice(0, 120);
      const cod = String(a.codigo || "").replace(/\s+/g, " ").trim();
      if (nom.length < 2) return { creado: false, motivo: "Falta el nombre." };
      if (!/^[A-Za-z0-9ÑñÇç ._-]{1,20}$/.test(cod)) return { creado: false, motivo: "El código solo puede tener letras, números, espacios, punto o guion, y como mucho 20 caracteres." };
      const ya = chk(await sb.from("clientes").select("id,codigo,nombre,nombre_comercial").ilike("codigo", cod.replace(/[%_]/g, "\\$&")).limit(1)) as any[];
      if (ya.length) return { creado: false, motivo: `El código ${cod} ya lo tiene otro cliente: ${ya[0].nombre_comercial || ya[0].nombre}. Pide otro código.` };
      const fecha = new Date().toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
      const notas = [`⚠️ FALTA COMPLETAR · alta provisional desde Harvey por ${ctx.autor || "la oficina"} el ${fecha}`, a.sin_iva ? "Se le cobra sin IVA" : "", String(a.notas || "").slice(0, 300)].filter(Boolean).join(" · ");
      const r = await sb.from("clientes").insert({ codigo: cod, nombre: nom, nombre_comercial: nom, localidad: a.localidad ? String(a.localidad).slice(0, 80) : null, notas }).select("id,codigo,nombre").single();
      if (r.error) return { creado: false, motivo: r.error.code === "23505" ? `El código ${cod} ya existe.` : "No se pudo crear: " + r.error.message };
      return { creado: true, cliente: r.data, notas, recuerda: "Avisar a la secretaria para que complete la ficha (Clientes › buscar el código)." };
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
  const { data: perfil } = await sb.from("perfiles").select("rol,activo,nombre").eq("id", u.user.id).maybeSingle();
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
  const ultimo = msgs[msgs.length - 1];
  const ctx: Ctx = { sb, ultimoUsuario: typeof ultimo.content === "string" ? ultimo.content.split("\n\n").pop() || "" : "", autor: (perfil as any).nombre || "" };
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
          const out = JSON.stringify(await ejecutar(ctx, b.name, b.input || {}));
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
