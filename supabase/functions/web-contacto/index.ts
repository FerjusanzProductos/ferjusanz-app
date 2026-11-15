// Formulario de contacto de la web (Worker «ferjusanz-web» → aquí): manda un correo a la empresa con lo que escribe el visitante.
// - Sale del Gmail de la empresa (GMAIL_USER / GMAIL_APP_PASSWORD) y llega SIEMPRE a ferjusanz@hotmail.com (fijo: nadie puede elegir a quién se envía).
// - Se llama sin haber entrado (verify_jwt = false). No guarda nada en la base.
// - Campo trampa «web»: si viene relleno es un robot; se contesta «ok» y no se manda nada.
// - Base de PRUEBAS: no manda correo, solo contesta (para probarlo sin llenar el buzón).
// shortcut: sin límite de envíos por persona (solo la trampa); si llega spam, guardar la IP en la base y limitar.
import nodemailer from "npm:nodemailer@6.9.16";

const DESTINO = "ferjusanz@hotmail.com";
const EMPRESA = "FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.";
const PRUEBAS = /pbeuxbwbpmlanbhhnpgy/.test(Deno.env.get("SUPABASE_URL") || "");
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { "Content-Type": "application/json" } });
const limpio = (v: unknown, max: number) => String(v ?? "").replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, "").trim().slice(0, max);
const html = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

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
