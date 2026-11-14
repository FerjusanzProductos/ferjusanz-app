// Lanza pruebas/sif/bateria.sql en la base de PRUEBAS (se deshace sola) y recalcula aquí cada huella (T-HASH-06).
// Uso: NODE_USE_ENV_PROXY=1 node pruebas/sif/bateria.mjs [salida.json]
import { readFileSync, writeFileSync } from 'node:fs';
import { huellaAlta, huellaAnulacion } from './huella.mjs';

const REF = 'pbeuxbwbpmlanbhhnpgy';   // solo PRUEBAS
const sql = readFileSync(new URL('./bateria.sql', import.meta.url), 'utf8');
const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
  method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: sql }),
});
const txt = await r.text();
let msg = txt; try { msg = JSON.parse(txt).message ?? txt; } catch {}
const m = msg.match(/RESULTADO:(\{.*\})/s);
if (!m) { console.error('Sin resultado:', msg.slice(0, 2000)); process.exit(1); }
const res = JSON.parse(m[1]);

// T-HASH-06: cada huella, recalculada con el script de referencia, y cada una enganchada a la anterior
const regs = res.registros;
const malas = regs.filter((g, i) => (g.tipo_registro === 'anulacion'
  ? huellaAnulacion({ nif: g.nif_emisor, numSerie: g.num_serie, fecha: g.fecha_expedicion, huellaAnterior: g.huella_anterior, fechaHora: g.fecha_hora_gen })
  : huellaAlta({ nif: g.nif_emisor, numSerie: g.num_serie, fecha: g.fecha_expedicion, tipo: g.tipo_factura,
  cuota: g.cuota_total, importe: g.importe_total, huellaAnterior: g.huella_anterior, fechaHora: g.fecha_hora_gen })) !== g.huella
  || (i > 0 && g.huella_anterior !== regs[i - 1].huella));
res['T-HASH-06'] = { ok: malas.length === 0, recalculadas: regs.length, anulaciones: regs.filter(g => g.tipo_registro === 'anulacion').length, distintas: malas.map(g => g.num_serie) };
// T-HASH-07: importes con 2 decimales siempre (también negativos) en lo que entra en la huella
res['T-HASH-07-importes'] = { ok: regs.filter(g => g.tipo_registro !== 'anulacion').every(g => /^-?\d+\.\d\d$/.test(g.importe_total) && /^-?\d+\.\d\d$/.test(g.cuota_total)),
  negativos: regs.filter(g => (g.importe_total || '').startsWith('-')).map(g => `${g.num_serie} ${g.importe_total}`) };

const salida = process.argv[2];
if (salida) writeFileSync(salida, JSON.stringify(res, null, 2));
const { registros, ...resumen } = res;
console.log(JSON.stringify(resumen, null, 2));
