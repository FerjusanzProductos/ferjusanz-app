// «He olvidado la contraseña»: manda por correo un enlace de un solo uso para poner una contraseña nueva.
// - Sale del Gmail de la empresa (GMAIL_USER / GMAIL_APP_PASSWORD), porque el correo de Supabase sin SMTP propio solo llega al equipo de Supabase.
// - Se llama SIN haber entrado (verify_jwt = false). Responde siempre lo mismo, exista o no el correo (no se puede averiguar quién tiene usuario).
// - Solo usuarios con perfil activo. Como mucho 1 correo cada 5 minutos por usuario.
// - El enlace va SIEMPRE a la app de su base (fijo aquí), nunca a una dirección que mande el móvil. Caduca en 1 hora (ajuste de Supabase).
// - Base de PRUEBAS y correo @pruebas.invalid: no manda correo, devuelve el enlace (para que Claude lo compruebe).
import { createClient } from "npm:@supabase/supabase-js@2";
import postgres from "npm:postgres@3.4.5";
import nodemailer from "npm:nodemailer@6.9.16";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const sql = postgres(Deno.env.get("SUPABASE_DB_URL")!, { prepare: false, max: 2 });
const PRUEBAS = /pbeuxbwbpmlanbhhnpgy/.test(Deno.env.get("SUPABASE_URL") || "");
const APP = PRUEBAS ? "https://ferjusanz-pruebas.fernandosanzalba.workers.dev" : "https://ferjusanz-productos.fernandosanzalba.workers.dev";
const EMPRESA = "FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.";
const LISTO = { ok: true, mensaje: "Si ese correo tiene usuario, en un momento te llega el enlace. Mira también en «Spam» o «Correo no deseado»." };

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = await req.json().catch(() => ({}));
    const email = String(b.email || "").trim().toLowerCase();
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/.test(email)) return json({ error: "Escribe bien tu correo." }, 400);
    const [u] = await sql`select u.id, p.nombre, coalesce(u.recovery_sent_at > now() - interval '5 minutes', false) as reciente
      from auth.users u join public.perfiles p on p.id = u.id where lower(u.email) = ${email} and p.activo is not false`;
    if (!u || u.reciente) return json(LISTO);
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
    const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
    if (error || !data?.properties?.hashed_token) throw error || new Error("Sin enlace");
    // Enlace propio (no el de Supabase): se usa al pulsar «Guardar» en la app, así los antivirus del correo que abren enlaces no lo gastan.
    const enlace = `${APP}/?recuperar=${encodeURIComponent(data.properties.hashed_token)}`;
    if (PRUEBAS && email.endsWith("@pruebas.invalid")) return json({ ...LISTO, enlace_prueba: enlace });
    const pass = Deno.env.get("GMAIL_APP_PASSWORD"), user = Deno.env.get("GMAIL_USER");
    if (!pass || !user) return json({ error: "El correo de la empresa no está configurado. Pide a administración que te cambie la contraseña." }, 500);
    const tr = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: user.trim(), pass: pass.replace(/\s+/g, "") } });
    const hola = u.nombre ? `Hola ${u.nombre}:` : "Hola:";
    await tr.sendMail({
      from: `"${EMPRESA}" <${user.trim()}>`, to: email,
      subject: "Ferjusanz · poner una contraseña nueva",
      text: `${hola}\n\nHas pedido poner una contraseña nueva en la app de Ferjusanz. Abre este enlace (vale 1 hora y una sola vez):\n\n${enlace}\n\nSi no lo has pedido tú, no hagas nada: tu contraseña sigue igual.\n\n${EMPRESA}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;color:#111827;font-size:16px"><p>${hola.replace(/[&<>"]/g, "")}</p><p>Has pedido poner una contraseña nueva en la app de Ferjusanz.</p><p><a href="${enlace}" style="display:inline-block;background:#15803d;color:#fff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:bold">Poner contraseña nueva</a></p><p style="color:#6b7280;font-size:14px">El enlace vale 1 hora y una sola vez. Si no lo has pedido tú, no hagas nada: tu contraseña sigue igual.</p><p style="color:#6b7280;font-size:13px">${EMPRESA}</p></div>`,
    });
    return json(LISTO);
  } catch (e) {
    console.error(e);
    return json({ error: "No se pudo mandar el correo. Prueba otra vez en un rato o pide a administración que te la cambie." }, 500);
  }
});
