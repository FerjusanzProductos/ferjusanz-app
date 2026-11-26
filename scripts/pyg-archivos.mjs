// Sube a panel_pyg (fila de hoy) el PDF y el Excel de la cuenta de resultados, para el botón «Descargar» de la app.
// Uso (después de pyg-html.mjs --guardar, pyg-pdf.cjs y pyg-excel.py): NODE_USE_ENV_PROXY=1 node scripts/pyg-archivos.mjs [ref]
import { readFileSync } from 'node:fs';
const REF = process.argv[2] || 'hvydnjaswdexttogsyen';
const b64 = f => readFileSync(new URL('../docs/' + f, import.meta.url)).toString('base64');
const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const q = `update panel_pyg set pdf = '${b64('pyg.pdf')}', xlsx = '${b64('pyg.xlsx')}' where fecha = '${hoy}' returning fecha, length(pdf) pdf, length(xlsx) xlsx`;
const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, { method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
console.log(r.status, (await r.text()).slice(0, 200));
