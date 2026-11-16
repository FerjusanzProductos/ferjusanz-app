// Formulario de contacto de la web (Worker «ferjusanz-web» → aquí): manda un correo a la empresa con lo que escribe el visitante.
// - Sale del Gmail de la empresa (GMAIL_USER / GMAIL_APP_PASSWORD) y llega SIEMPRE a ferjusanz@hotmail.com (fijo: nadie puede elegir a quién se envía).
// - Se llama sin haber entrado (verify_jwt = false).
// - Además lo apunta en Contactos (tabla prospectos, fuente «Formulario de la web») para que la oficina y Harvey lo vean y lo clasifiquen.
//   Si ya hay un contacto con ese correo o teléfono, solo le añade la nota (sin borrar las anteriores). Si falla, el correo se manda igual.
// - Campo trampa «web»: si viene relleno es un robot; se contesta «ok» y no se manda nada.
// - Base de PRUEBAS: no manda correo, solo contesta (para probarlo sin llenar el buzón).
// - Límites por contacto y por día (ver apuntarContacto). shortcut: sin límite por IP; si llega spam variando teléfonos, guardar la IP y limitar.
import nodemailer from "npm:nodemailer@6.9.16";
import { createClient } from "npm:@supabase/supabase-js@2";

const DESTINO = "ferjusanz@hotmail.com";
const EMPRESA = "FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.";
const PRUEBAS = /pbeuxbwbpmlanbhhnpgy/.test(Deno.env.get("SUPABASE_URL") || "");
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
const limpio = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
const html = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

// Tipo de negocio adivinado por palabras; si no encaja, «otro» y lo clasifica Harvey u oficina.
const TIPOS: [string, RegExp][] = [
  ["escuela_infantil", /escuela infantil|guarder|infantil/], ["colegio", /colegio|cole\b|escuela|instituto|comedor escolar/],
  ["residencia", /residencia|geri[aá]tric|mayores|hospital|cl[ií]nica/], ["catering", /catering|colectividad/],
  ["bar", /\bbar\b|cafeter|caf[eé]\b|taberna|cervecer/], ["restaurante", /restaurante|asador|meson|mes[oó]n|hotel|cocina|marisquer|pizzer/],
];
export const tipoDe = (t: string) => (TIPOS.find(([, r]) => r.test(t.toLowerCase())) || ["otro"])[0];

// Límites (auditoría 16/11/2026): las notas que ya tenía el contacto NUNCA se recortan; como mucho 3 mensajes de la web
// por contacto y día, y 30 contactos nuevos de la web al día. Pasado el límite no se apunta ni se manda correo (devuelve false).
const MAX_NOTAS = 12000, MAX_DIA_CONTACTO = 3, MAX_NUEVOS_DIA = 30;
async function apuntarContacto(nombre: string, negocio: string, telefono: string, email: string, mensaje: string): Promise<boolean> {
  const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, { auth: { persistSession: false } });
  const hoy = new Date().toLocaleDateString("es-ES", { timeZone: "Europe/Madrid" });
  const marca = `🌐 Formulario de la web ${hoy}`;
  const nota = `${marca}${negocio ? ` (${nombre})` : ""}: ${mensaje}`;
  // Mismo contacto si coincide el correo o los últimos 9 números del teléfono (sin espacios, puntos ni +34).
  const nums = (t: unknown) => String(t ?? "").replace(/\D/g, "").slice(-9);
  const tel = nums(telefono);
  // shortcut: lee todos los contactos (hoy < 100); si pasan de 1.000, buscar con una función SQL.
  const { data: todos, error: e0 } = await sb.from("prospectos").select("id,notas,email,telefono").limit(1000);
  if (e0) throw e0;
  const ya = (todos || []).filter((p) => (email && (p.email || "").toLowerCase() === email) || (tel.length === 9 && nums(p.telefono) === tel));
  if (ya?.length) {
    const antes = ya[0].notas || "";
    if (antes.split(marca).length - 1 >= MAX_DIA_CONTACTO) return false;
    const sitio = MAX_NOTAS - antes.length - 1;
    if (sitio < 40) return true;   // ya no cabe más: no se toca la ficha, pero el correo a la empresa sí sale
    const { error } = await sb.from("prospectos").update({ notas: [antes, nota.slice(0, sitio)].filter(Boolean).join("\n") }).eq("id", ya[0].id);
    if (error) throw error;
    return true;
  }
  const { count, error: e1 } = await sb.from("prospectos").select("id", { count: "exact", head: true })
    .eq("fuente", "Formulario de la web").gte("created_at", new Date(Date.now() - 86400000).toISOString());
  if (e1) throw e1;
  if ((count ?? 0) >= MAX_NUEVOS_DIA) return false;
  const { error } = await sb.from("prospectos").insert({
    nombre: negocio || nombre, tipo: tipoDe(`${negocio} ${mensaje}`), telefono: telefono || null, email: email || null,
    fuente: "Formulario de la web", estado: "nuevo", notas: nota,
  });
  if (error) throw error;
  return true;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Solo POST" }, 405);
  try {
    const b = await req.json().catch(() => ({}));
    if (limpio(b.web, 200)) return json({ ok: true });
    const nombre = limpio(b.nombre, 80).replace(/\s+/g, " "), negocio = limpio(b.negocio, 120).replace(/\s+/g, " "), mensaje = limpio(b.mensaje, 2000);
    const telefono = limpio(b.telefono, 20).replace(/[^\d+ ]/g, ""), email = limpio(b.email, 120).toLowerCase();
    const mailOk = /^[^\s@]{1,64}@[^\s@]{1,50}\.[a-z]{2,}$/.test(email);
    if (!nombre) return json({ error: "nombre" }, 400);
    if (!mailOk && telefono.replace(/\D/g, "").length < 9) return json({ error: "contacto" }, 400);
    if (email && !mailOk) return json({ error: "email" }, 400);
    if (mensaje.length < 3) return json({ error: "mensaje" }, 400);
    const seguir = await apuntarContacto(nombre, negocio, telefono, mailOk ? email : "", mensaje).catch((e) => { console.error("prospecto", e); return true; });
    if (!seguir) return json({ ok: true });   // límite del día: no se apunta ni se manda (el visitante no nota la diferencia)
    if (PRUEBAS) return json({ ok: true, prueba: true });
    const pass = Deno.env.get("GMAIL_APP_PASSWORD"), user = Deno.env.get("GMAIL_USER");
    if (!pass || !user) return json({ error: "correo" }, 500);
    const tr = nodemailer.createTransport({ host: "smtp.gmail.com", port: 465, secure: true, auth: { user: user.trim(), pass: pass.replace(/\s+/g, "") } });
    const filas: [string, string][] = [["Nombre", nombre], ["Negocio", negocio], ["Teléfono", telefono], ["Correo", email], ["Mensaje", mensaje]];
    await tr.sendMail({
      from: `"Web Ferjusanz" <${user.trim()}>`, to: DESTINO, ...(mailOk ? { replyTo: email } : {}),
      subject: `Web: mensaje de ${nombre}${negocio ? ` (${negocio})` : ""}`,
      text: filas.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`).join("\n") + `\n\nEnviado desde el formulario de contacto de la web. ${EMPRESA}`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;font-size:16px;color:#111">${filas.filter(([, v]) => v).map(([k, v]) => `<p><b>${k}:</b> ${html(v).replace(/\n/g, "<br>")}</p>`).join("")}<p style="color:#666;font-size:13px">Enviado desde el formulario de contacto de la web.${mailOk ? " Para contestar, pulsa «Responder»." : ""}</p></div>`,
    });
    return json({ ok: true });
  } catch (e) {
    console.error(e);
    return json({ error: "envio" }, 500);
  }
});
