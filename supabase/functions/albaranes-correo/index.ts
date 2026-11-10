// Envío AUTOMÁTICO del albarán por correo cuando se marca la entrega.
// - Sale del Gmail de Fernando (contraseña de aplicación en el secreto GMAIL_APP_PASSWORD; sin ella no envía nada).
// - Solo a clientes con correo en su ficha y solo entregas de las últimas 24 horas. Cada albarán se manda UNA vez (tabla envios_correo).
// - La llama la app después de guardar una entrega (cualquier móvil del equipo). No modifica pedidos ni albaranes.
import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "npm:postgres@3.4.5";
import nodemailer from "npm:nodemailer@6.9.16";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 2 });
const APP = Deno.env.get("APP_URL") || "https://ferjusanz-productos.fernandosanzalba.workers.dev/";
const EMPRESA = "FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.";
const TELS = "91 763 21 86 · 609 100 690 · 616 439 157 · 609 567 354";
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));
const fechaES = (iso: string) => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4) : "";
const num = (n: unknown) => n == null ? "" : String(Math.round(Number(n) * 100) / 100).replace(".", ",");

async function usuario(req: Request) {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const { data } = await sb.auth.getUser(); if (!data?.user) return null;
  const [p] = await sql`select activo from public.perfiles where id = ${data.user.id}`;
  return p && p.activo !== false ? data.user.id : null;
}

async function token(tabla: "albaran" | "cliente", id: string) {
  if (tabla === "albaran") {
    const [t] = await sql`select token from public.albaran_enlaces where pedido_id = ${id}`; if (t) return t.token as string;
    const nuevo = crypto.randomUUID().replace(/-/g, ""); await sql`insert into public.albaran_enlaces (pedido_id, token) values (${id}, ${nuevo}) on conflict do nothing`;
    const [t2] = await sql`select token from public.albaran_enlaces where pedido_id = ${id}`; return t2.token as string;
  }
  const [t] = await sql`select token from public.cliente_enlaces where cliente_id = ${id}`; if (t) return t.token as string;
  const nuevo = crypto.randomUUID().replace(/-/g, ""); await sql`insert into public.cliente_enlaces (cliente_id, token) values (${id}, ${nuevo}) on conflict do nothing`;
  const [t2] = await sql`select token from public.cliente_enlaces where cliente_id = ${id}`; return t2.token as string;
}

function html(a: any, cli: string, urlAlb: string, urlCli: string, nota: string | null) {
  const filas = (a.lineas || []).map((l: any) => `<tr><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb">${esc(l.nombre)}</td><td style="padding:6px 8px;border-bottom:1px solid #e5e7eb;text-align:right;white-space:nowrap"><b>${num(l.peso_real ?? l.cantidad_pedida)}</b> ${esc(l.unidad_precio === "kg" && l.peso_real != null ? "kg" : (l.unidad_pedida || l.unidad || ""))}</td></tr>`).join("");
  return `<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:auto;color:#111827">
  <div style="background:#166534;color:#fff;padding:18px 20px;border-radius:12px 12px 0 0"><div style="font-size:18px;font-weight:bold">${EMPRESA}</div><div style="color:#dcfce7;font-size:13px">${TELS}</div></div>
  <div style="border:1px solid #d1d5db;border-top:0;border-radius:0 0 12px 12px;padding:18px 20px">
  <p style="font-size:16px">Hola${cli ? ", " + esc(cli) : ""}:</p>
  <p style="font-size:16px">Te hemos entregado tu pedido. Aquí tienes el <b>albarán ${esc(a.serie)} ${String(a.numero).padStart(7, "0")}</b> del <b>${fechaES(String(a.fecha || ""))}</b>${nota ? " (" + esc(nota.toLowerCase()) + ")" : ""}.</p>
  <table style="width:100%;border-collapse:collapse;font-size:15px;margin:10px 0"><tr style="background:#f0fdf4"><th style="text-align:left;padding:6px 8px">Producto</th><th style="text-align:right;padding:6px 8px">Cantidad</th></tr>${filas}</table>
  <p style="text-align:center;margin:20px 0"><a href="${urlAlb}" style="background:#16a34a;color:#fff;text-decoration:none;font-weight:bold;font-size:17px;padding:14px 22px;border-radius:10px;display:inline-block">Ver el albarán completo</a></p>
  <p style="font-size:14px;color:#374151">Todos tus albaranes, siempre a mano: <a href="${urlCli}" style="color:#166534;font-weight:bold">tu página de albaranes</a>. Guarda este correo para abrirla cuando quieras.</p>
  <p style="font-size:13px;color:#6b7280">Si algo no está bien, responde a este correo o llámanos. Si prefieres no recibir estos correos, contéstanos y dejamos de enviarlos.</p>
  </div></div>`;
}

async function pendientes() {
  const pass = Deno.env.get("GMAIL_APP_PASSWORD"); const user = Deno.env.get("GMAIL_USER");
  if (!pass || !user) return { ok: false, motivo: "sin_configurar" };
  const lista = await sql`
    select e.pedido_id, e.entregado_at, e.nota, c.id as cliente_id, coalesce(c.nombre_comercial, c.nombre) as cliente, lower(trim(c.email)) as email
    from public.entregas e join public.pedidos p on p.id = e.pedido_id join public.clientes c on c.id = p.cliente_id
    join public.albaranes a on a.pedido_id = p.id and a.numero is not null
    where e.entregado_at > now() - interval '24 hours' and c.email ~* '^[^@\\s,;]+@[^@\\s,;]+\\.[a-z]{2,}$'
      and coalesce(c.albaran_por_correo, true)
      and not exists (select 1 from public.envios_correo x where x.pedido_id = e.pedido_id)
    order by e.entregado_at limit 15`;
  if (!lista.length) return { ok: true, enviados: 0 };
  const tr = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user, pass } });
  let enviados = 0; const errores: string[] = [];
  for (const x of lista as any[]) {
    const tomado = await sql`insert into public.envios_correo (pedido_id, email, estado) values (${x.pedido_id}, ${x.email}, 'enviando') on conflict do nothing returning pedido_id`;
    if (!tomado.length) continue;   // otro móvil ya lo está enviando
    try {
      const [{ j: a }] = await sql`select public._albaran_json(${x.pedido_id}::uuid) as j`;
      if (!a || !a.ok) throw new Error("albarán no disponible");
      const urlAlb = APP + "?a=" + await token("albaran", x.pedido_id), urlCli = APP + "?c=" + await token("cliente", x.cliente_id);
      await tr.sendMail({ from: `"${EMPRESA}" <${user}>`, replyTo: user, to: x.email,
        subject: `Albarán ${a.serie} ${String(a.numero).padStart(7, "0")} · ${fechaES(String(a.fecha || ""))} · Ferjusanz`,
        html: html(a, x.cliente, urlAlb, urlCli, x.nota),
        text: `Hola${x.cliente ? ", " + x.cliente : ""}. Te hemos entregado tu pedido. Albarán ${a.serie} ${a.numero} del ${fechaES(String(a.fecha || ""))}: ${urlAlb}\nTodos tus albaranes: ${urlCli}\n${EMPRESA} · ${TELS}` });
      await sql`update public.envios_correo set estado = 'enviado', enviado_at = now() where pedido_id = ${x.pedido_id}`;
      await sql`update public.albaran_enlaces set envios = coalesce(envios, '[]'::jsonb) || jsonb_build_array(jsonb_build_object('a', ${"Correo automático " + x.email}::text, 't', now())) where pedido_id = ${x.pedido_id}`;
      enviados++;
    } catch (e) {
      const msg = String((e as Error)?.message || e).slice(0, 300); errores.push(x.cliente + ": " + msg);
      if (/Invalid login|Username and Password|535|534|auth/i.test(msg)) {   // contraseña mal o caducada: no se marca como fallido (se enviará cuando esté bien) y se para
        await sql`delete from public.envios_correo where pedido_id = ${x.pedido_id} and estado = 'enviando'`; errores.push("Revisa la contraseña de aplicación de Gmail"); break; }
      await sql`update public.envios_correo set estado = 'error', error = ${msg} where pedido_id = ${x.pedido_id}`;
    }
  }
  return { ok: true, enviados, errores };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    if (!await usuario(req)) return json({ error: "Inicia sesión" }, 401);
    const b = await req.json().catch(() => ({}));
    if (b.accion === "reintentar" && b.pedido_id) await sql`delete from public.envios_correo where pedido_id = ${String(b.pedido_id)} and estado = 'error'`;
    return json(await pendientes());
  } catch (e) { console.error(e); return json({ error: String((e as Error)?.message || e) }, 500); }
});
