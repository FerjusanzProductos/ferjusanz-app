// Envía a Jorge (gestoría) los informes de «Informes para Jorge» por correo, con los archivos adjuntos.
// - Sale del Gmail de la empresa (secretos GMAIL_USER y GMAIL_APP_PASSWORD, los mismos que el correo de albaranes).
// - El destinatario es FIJO (JORGE_EMAIL; si no está, el de abajo): la app no puede elegir a quién se manda.
// - Solo oficina y admin. Máximo 12 archivos y 15 MB en total. No toca la base de datos.
import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "npm:postgres@3.4.5";
import nodemailer from "npm:nodemailer@6.9.16";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 2 });
const JORGE = (Deno.env.get("JORGE_EMAIL") || "abogadoonetti@hotmail.com").trim();
const EMPRESA = "FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.";
const TIPOS: Record<string, string> = { xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", pdf: "application/pdf", csv: "text/csv" };
const esc = (s: unknown) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

async function quien(req: Request) {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") || "" } } });
  const { data } = await sb.auth.getUser(); if (!data?.user) return null;
  const [p] = await sql`select nombre, rol, activo from public.perfiles where id = ${data.user.id}`;
  return p && p.activo !== false && ["oficina", "admin"].includes(p.rol) ? p : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const p = await quien(req); if (!p) return json({ error: "Solo la oficina puede mandar los informes a Jorge." }, 403);
    const b = await req.json().catch(() => ({}));
    const archivos = Array.isArray(b.archivos) ? b.archivos : [];
    if (!archivos.length || archivos.length > 12) return json({ error: "No hay archivos que mandar." }, 400);
    let total = 0;
    const adjuntos = archivos.map((a: any) => {
      const nombre = String(a.nombre || "").replace(/[^\w.\-]/g, "_").slice(0, 80); const ext = nombre.split(".").pop()!.toLowerCase();
      if (!TIPOS[ext]) throw new Error("Tipo de archivo no permitido: " + nombre);
      const contenido = Uint8Array.from(atob(String(a.base64 || "")), c => c.charCodeAt(0)); total += contenido.length;
      return { filename: nombre, content: contenido, contentType: TIPOS[ext] };
    });
    if (total > 15 * 1024 * 1024) return json({ error: "Los archivos pesan demasiado (más de 15 MB)." }, 400);
    const pass = Deno.env.get("GMAIL_APP_PASSWORD"), user = Deno.env.get("GMAIL_USER");
    if (!pass || !user) return json({ error: "El correo de la empresa no está configurado." }, 500);
    const periodo = String(b.periodo || "").slice(0, 60), lista = String(b.lista || "").slice(0, 2000), nota = String(b.nota || "").slice(0, 1000);
    const tr = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: user.trim(), pass: pass.replace(/\s+/g, "") } });
    await tr.sendMail({
      from: `"${EMPRESA}" <${user.trim()}>`, replyTo: user.trim(), to: JORGE, bcc: user.trim(),
      subject: `Ferjusanz · informes de ${periodo}`,
      text: `Hola Jorge:\n\nTe mando los informes de Ferjusanz de ${periodo}.\n\n${lista}\n${nota ? "\n" + nota + "\n" : ""}\nUn saludo,\n${p.nombre || ""}\n${EMPRESA}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;font-size:15px"><p>Hola Jorge:</p><p>Te mando los informes de Ferjusanz de <b>${esc(periodo)}</b>:</p><ul>${lista.split("\n").filter(Boolean).map(x => "<li>" + esc(x) + "</li>").join("")}</ul>${nota ? `<p>${esc(nota)}</p>` : ""}<p>Un saludo,<br>${esc(p.nombre || "")}<br><b>${EMPRESA}</b></p></div>`,
      attachments: adjuntos,
    });
    return json({ ok: true, a: JORGE, archivos: adjuntos.length });
  } catch (e) {
    const m = String((e as Error)?.message || e);
    if (/Invalid login|Username and Password|535|534/i.test(m)) return json({ error: "La contraseña del correo de la empresa no vale. Revisa la contraseña de aplicación de Gmail." }, 500);
    console.error(e); return json({ error: m.slice(0, 300) }, 500);
  }
});
