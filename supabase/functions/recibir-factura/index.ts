// Recuperado el 16/11/2026 de la función publicada en Supabase (base real, v28, verify_jwt=false) para tenerlo en el repositorio (auditoría de seguridad).
// Es el código tal cual se publicó (ya en JavaScript). Publicar SIEMPRE con --no-verify-jwt si así está arriba.
// Función de Supabase «recibir-factura»: recibe un PDF o una foto desde el Gmail de facturas
// y lo deja en la bandeja «Facturas recibidas». Se protege con una clave secreta (FACTURAS_CLAVE).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';
const json = (o, status = 200)=>new Response(JSON.stringify(o), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
const TIPOS = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
Deno.serve(async (req)=>{
  if (req.method !== 'POST') return json({
    error: 'Método no permitido'
  }, 405);
  try {
    const clave = Deno.env.get('FACTURAS_CLAVE') ?? '';
    const recibida = req.headers.get('x-clave') ?? '';
    if (!clave || recibida.length !== clave.length || recibida !== clave) return json({
      error: 'No autorizado'
    }, 401);
    const { remitente, asunto, fecha, nombre, tipo, base64, fecha_factura } = await req.json();
    // Fecha de la factura (AAAA-MM-DD) calculada por el Gmail; si no es válida se ignora.
    let ffac = null;
    if (typeof fecha_factura === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha_factura)) {
      const t = Date.parse(fecha_factura + 'T00:00:00Z');
      if (!Number.isNaN(t) && t <= Date.now() + 2 * 86400000 && t >= Date.UTC(2015, 0, 1)) ffac = fecha_factura;
    }
    const ext = TIPOS[String(tipo ?? '').toLowerCase()];
    if (!ext) return json({
      error: 'Tipo de archivo no admitido'
    }, 415);
    if (!base64 || typeof base64 !== 'string' || base64.length > 14_000_000) return json({
      error: 'Archivo vacío o demasiado grande'
    }, 413);
    const bytes = Uint8Array.from(atob(base64), (c)=>c.charCodeAt(0));
    const dig = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const hash = Array.from(dig).map((b)=>b.toString(16).padStart(2, '0')).join('');
    const supa = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const { data: ya } = await supa.from('facturas_recibidas').select('id,fecha_factura').eq('hash', hash).maybeSingle();
    if (ya) {
      // Ya estaba: solo se completa la fecha de la factura si faltaba.
      if (ffac && !ya.fecha_factura) await supa.from('facturas_recibidas').update({
        fecha_factura: ffac
      }).eq('id', ya.id);
      return json({
        ok: true,
        duplicado: true
      });
    }
    // Proveedor por correo exacto del remitente, o por el dominio si solo hay uno con ese dominio.
    const rem = String(remitente ?? '').toLowerCase().trim();
    let proveedor_id = null;
    if (rem) {
      const { data: p1 } = await supa.from('proveedores').select('id').ilike('email', rem);
      if (p1 && p1.length === 1) proveedor_id = p1[0].id;
      else if (rem.includes('@')) {
        const dom = rem.split('@')[1];
        const { data: p2 } = await supa.from('proveedores').select('id').ilike('email', '%@' + dom);
        if (p2 && p2.length === 1) proveedor_id = p2[0].id;
      }
    }
    const d = new Date();
    const ruta = `recibidas/${d.getUTCFullYear()}/${String(d.getUTCMonth() + 1).padStart(2, '0')}/${crypto.randomUUID()}.${ext}`;
    const up = await supa.storage.from('facturas').upload(ruta, bytes, {
      contentType: String(tipo)
    });
    if (up.error) return json({
      error: up.error.message
    }, 500);
    const ins = await supa.from('facturas_recibidas').insert({
      remitente: rem || null,
      asunto: String(asunto ?? '').slice(0, 300) || null,
      fecha_correo: fecha ? new Date(fecha).toISOString() : null,
      ruta,
      nombre: String(nombre ?? '').slice(0, 200) || null,
      hash,
      proveedor_id,
      fecha_factura: ffac
    });
    if (ins.error) {
      await supa.storage.from('facturas').remove([
        ruta
      ]);
      return json({
        error: ins.error.message
      }, 500);
    }
    // Aviso al móvil (si hay claves VAPID configuradas). Si falla, NO afecta a la factura: ya está guardada.
    try {
      await avisarMovil(supa, proveedor_id, rem, String(asunto ?? ''));
    } catch (_e) {}
    return json({
      ok: true
    });
  } catch (e) {
    return json({
      error: String(e.message ?? e)
    }, 500);
  }
});
// Envía «Ha llegado una factura» a los móviles de oficina, administración y compras que activaron los avisos.
async function avisarMovil(supa, proveedor_id, rem, asunto) {
  const pub = Deno.env.get('VAPID_PUBLIC'), priv = Deno.env.get('VAPID_PRIVATE');
  if (!pub || !priv) return;
  webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') ?? 'mailto:ferjusanzfacturas@gmail.com', pub, priv);
  let nombre = rem || 'un proveedor';
  if (proveedor_id) {
    const { data: p } = await supa.from('proveedores').select('nombre').eq('id', proveedor_id).maybeSingle();
    if (p?.nombre) nombre = p.nombre;
  }
  const { data: subs } = await supa.from('push_suscripciones').select('id,endpoint,p256dh,auth,usuario_id');
  if (!subs || !subs.length) return;
  const { data: perf } = await supa.from('perfiles').select('id,rol,activo').in('id', [
    ...new Set(subs.map((x)=>x.usuario_id))
  ]);
  const ok = new Set((perf ?? []).filter((x)=>x.activo !== false && [
      'admin',
      'oficina',
      'compras'
    ].includes(x.rol)).map((x)=>x.id));
  const carga = JSON.stringify({
    titulo: '📥 Factura nueva',
    cuerpo: nombre + (asunto ? ' · ' + asunto.slice(0, 80) : ''),
    tag: 'factura-recibida',
    ir: 'recib'
  });
  for (const s of subs.filter((x)=>ok.has(x.usuario_id))){
    try {
      await webpush.sendNotification({
        endpoint: s.endpoint,
        keys: {
          p256dh: s.p256dh,
          auth: s.auth
        }
      }, carga, {
        TTL: 86400
      });
    } catch (e) {
      const c = e?.statusCode;
      if (c === 404 || c === 410) await supa.from('push_suscripciones').delete().eq('id', s.id);
    }
  }
}
