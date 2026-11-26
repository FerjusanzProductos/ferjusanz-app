// Gráfico de ahorro para Bar Florencio (FLORE): lo que pagó de enero a septiembre de 2026 (Golden) frente a lo mismo con su lista nueva.
// Uso: NODE_USE_ENV_PROXY=1 node docs/hosteleria/florencio-ahorro.mjs <carpeta de salida>
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.';
// Precios de la lista nueva (los mismos que florencio.mjs), por código de Golden.
const P = { '40': ['Limones', 1.5], '151': ['Pimiento de Padrón', 2.3], '91-D': ['Tomate pera', 1.1], '168': ['Lechuga en bandeja', 1.95],
  '01': ['Patata agria', 0.66], '34': ['Ajo pelado', 3.5], '10-BA': ['Patata pelada bastón', 1.3], '25': ['Cebolla morada', 1.4],
  '21': ['Cebolla gorda', 0.65], '132': ['Repollo', 0.95], '150': ['Piña', 1.7], '159': ['Zanahoria', 0.8], '118': ['Pimiento italiano', 2], '17': ['Puerro', 1.45] };
const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', { method: 'POST',
  headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: `select l.producto_codigo c, sum(l.cantidad)::float q, sum(l.importe)::float i from golden_lineas l
    join golden_facturas f on f.numero = l.factura_numero where f.cliente_codigo = 'FLORE' and f.fecha between '2026-01-01' and '2026-09-30'
    and not coalesce(l.repetida, false) and l.producto_codigo in (${Object.keys(P).map(k => `'${k}'`)}) group by 1` }) });
if (!r.ok) throw new Error('Supabase ' + r.status);
const MESES = 9, SEMANAS = 39; // facturas de enero a septiembre (la de enero va fechada el 3/2)
const filas = (await r.json()).map(x => ({ n: P[x.c][0], antes: x.i / MESES, ahora: x.q * P[x.c][1] / MESES })).sort((a, b) => b.antes - a.antes);
const A = filas.reduce((s, f) => s + f.antes, 0) * MESES, N = filas.reduce((s, f) => s + f.ahora, 0) * MESES;
console.assert(N < A && filas.length === Object.keys(P).length, 'datos');
const e = (n, d = 0) => n.toLocaleString('es-ES', { minimumFractionDigits: d, maximumFractionDigits: d, useGrouping: 'always' }) + ' €';
const pct = Math.round((1 - N / A) * 100);
const kpi = (t, a, n) => `<div class=k><div class=kt>${t}</div><div class=kv>${e(a - n)}</div><div class=ks>Antes ${e(a)} → ahora <b>${e(n)}</b></div></div>`;
const max = Math.max(...filas.map(f => f.antes));
const bar = (v, cls) => `<div class="b ${cls}" style="width:${(v / max * 100).toFixed(1)}%"></div><span class=v>${e(v)}</span>`;
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320;background:#fff}
.top{background:#7a1f1f;color:#fff;padding:8mm 13mm 6mm}.top h1{margin:0;font-size:26px}.top p{margin:2mm 0 0;color:#f6dcc8;font-size:15px}
.pg{padding:5mm 13mm}.ks b{color:#2a2320}
.ks2{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}.k{border:1.5px solid #e8742b;border-radius:10px;padding:4mm;background:#fff6ee}
.kt{font-size:13px;color:#555}.kv{font-size:30px;font-weight:bold;color:#7a1f1f;margin:1mm 0}.ks{font-size:12px;color:#555}
.big{margin:5mm 0 1mm;font-size:17px}.big b{color:#7a1f1f}
h2{font-size:17px;color:#7a1f1f;margin:5mm 0 1mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.ley{font-size:12px;color:#555;margin:1mm 0 2mm}.ley i{display:inline-block;width:12px;height:12px;border-radius:2px;vertical-align:-2px;margin:0 4px 0 10px}
.r{display:grid;grid-template-columns:42mm 1fr;align-items:center;gap:2mm;padding:1mm 0;border-bottom:1px solid #f1ebe6}.r>div:first-child{font-size:12.5px}
.l{display:flex;align-items:center;gap:2mm;height:11px;margin:1.5px 0}.b{height:11px;border-radius:0 4px 4px 0}.v{font-size:11px;color:#2a2320;white-space:nowrap}
.antes{background:#b9aea6}.ahora{background:#7a1f1f}
.nota{font-size:10.5px;color:#666;margin-top:3mm}.pie{margin-top:3mm;padding-top:2mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}</style>
<div class=top><h1>Florencio, esto es lo que te ahorras</h1><p>Con lo mismo que nos pediste este año, a tus precios nuevos</p></div>
<div class=pg>
<div class=ks2>${kpi('Te ahorras a la semana', A / SEMANAS, N / SEMANAS)}${kpi('Te ahorras al mes', A / MESES, N / MESES)}${kpi('Te ahorras al año', A / MESES * 12, N / MESES * 12)}</div>
<p class=big>Pagas un <b>${pct} % menos</b> por el mismo género.</p>
<h2>Al mes, producto a producto</h2>
<div class=ley><i class=antes style="margin-left:0"></i>Lo que pagabas <i class=ahora></i>Con tus precios nuevos</div>
${filas.map(f => `<div class=r><div>${f.n}</div><div><div class=l>${bar(f.antes, 'antes')}</div><div class=l>${bar(f.ahora, 'ahora')}</div></div></div>`).join('')}
<p class=nota>Cuentas hechas con lo que nos pediste de enero a septiembre de 2026 (${filas.length} productos de tu lista) y tus precios nuevos del 26/11/2026. Sin IVA. Los precios siguen al mercado, así que el ahorro de cada mes puede variar un poco.</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · www.ferjusanz-frutas-verduras.es</div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2, viewport: { width: 794, height: 1123 } });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-ahorro-Florencio.pdf`, format: 'A4', printBackground: true });
await p.screenshot({ path: `${D}/Ferjusanz-ahorro-Florencio.jpg`, type: 'jpeg', quality: 90, fullPage: true }); await b.close();
console.log({ antes: A.toFixed(2), ahora: N.toFixed(2), pct });
