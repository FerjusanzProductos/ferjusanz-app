// Recuperado el 16/11/2026 de la función publicada en Supabase (base real, v15, verify_jwt=false) para tenerlo en el repositorio (auditoría de seguridad).
// Es el código tal cual se publicó (ya en JavaScript). Publicar SIEMPRE con --no-verify-jwt si así está arriba.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const BUCKETS = [
  'facturas',
  'pedidos-originales'
];
const json = (o, s = 200)=>new Response(JSON.stringify(o), {
    status: s,
    headers: {
      'Content-Type': 'application/json'
    }
  });
Deno.serve(async (req)=>{
  if (req.method !== 'POST') return json({
    error: 'Metodo no permitido'
  }, 405);
  try {
    const supa = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'));
    const ok = await supa.rpc('copia_ok', {
      p_clave: req.headers.get('x-clave') || ''
    });
    if (ok.error || ok.data !== true) return json({
      error: 'No autorizado'
    }, 401);
    const { bucket, ruta } = await req.json();
    if (!BUCKETS.includes(String(bucket))) return json({
      error: 'Bucket no permitido'
    }, 400);
    if (typeof ruta !== 'string' || !ruta || ruta.includes('..')) return json({
      error: 'Ruta no valida'
    }, 400);
    const d = await supa.storage.from(String(bucket)).download(ruta);
    if (d.error || !d.data) return json({
      error: 'No encontrado'
    }, 404);
    return new Response(d.data, {
      status: 200,
      headers: {
        'Content-Type': d.data.type || 'application/octet-stream'
      }
    });
  } catch (e) {
    return json({
      error: String(e && e.message ? e.message : e)
    }, 500);
  }
});
