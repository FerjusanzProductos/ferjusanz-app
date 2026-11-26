// Comparativa para Los Barriletes: sus 2 últimos pedidos y su media mensual de 2026 (Golden, sin IVA) a lo que pagó y a los precios de su hoja.
// Uso: NODE_USE_ENV_PROXY=1 node docs/hosteleria/barriletes-comparativa.mjs <carpeta de salida>
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.';
const sql = async q => { const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', { method: 'POST',
  headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status); return r.json(); };
// código Golden → [nombre, precio de su hoja (barriletes.mjs)]
const nuevo = { '01': ['Patata agria', .66], '91-D': ['Tomate pera', 1.10], '40': ['Limones', 1.50], '111': ['Pimiento rojo', 1.30],
  '110': ['Pimiento verde', 1.20], '151': ['Pimiento de Padrón', 2.30], '251': ['Berenjena', .85], '108': ['Calabacín', .90],
  '17': ['Puerro', 1.45], '21': ['Cebolla gorda', .65], '34': ['Ajo pelado', 3.50], '159': ['Zanahoria', .80], '150': ['Piña', 1.70],
  '104-A': ['Plátano macho', 2.20], '25': ['Cebolla morada', 1.40] };
const rows = (await sql(`select coalesce(l.albaran,'') alb, f.fecha::text fecha, l.producto_codigo cod, l.descripcion d, l.cantidad::float q, l.precio::float p
  from golden_lineas l join golden_facturas f on f.numero=l.factura_numero
  where f.cliente_codigo='BARRILETES' and f.fecha>='2026-01-01' and not coalesce(l.repetida,false) and l.cantidad>0`))
  .map(r => ({ ...r, n: nuevo[r.cod]?.[0] || r.d, pn: nuevo[r.cod]?.[1] ?? r.p }));
const meses = new Set(rows.map(r => r.fecha.slice(0, 7))).size;
const sum = (rs, f) => rs.reduce((s, r) => s + f(r), 0), A = rs => sum(rs, r => r.q * r.p), N = rs => sum(rs, r => r.q * r.pn);
const albs = [...new Set(rows.map(r => r.alb).filter(Boolean))].map(a => [a, a.match(/(\d\d)\/(\d\d)\/(\d{4})/)]).filter(x => x[1])
  .sort((x, y) => (x[1][3] + x[1][2] + x[1][1]).localeCompare(y[1][3] + y[1][2] + y[1][1])).slice(-2);
const [pen, ult] = albs.map(([a, m]) => ({ dia: m[1] + '/' + m[2], rs: rows.filter(r => r.alb === a) }));
const totA = A(rows), totN = N(rows), ahMes = (totA - totN) / meses, ahSem = ahMes * 7 / 30.4;
console.assert(ahMes > 0 && pen && ult && meses === 9, 'datos: 9 meses (feb-oct)');
const e = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' €';
const e0 = n => Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' }) + ' €';
const barras = (grupos, w = 760) => {
  const max = Math.max(...grupos.flatMap(g => [g[1], g[2]])), fila = 34, h = grupos.length * fila + 10, x0 = 150, bw = w - x0 - 90;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${grupos.map(([n, a, b], i) => { const y = i * fila + 6, wa = bw * a / max, wb = bw * b / max;
    return `<text x="${x0 - 10}" y="${y + 19}" text-anchor="end" font-size="14" fill="#2a2320">${n}</text>
<rect x="${x0}" y="${y}" width="${wa}" height="13" rx="3" fill="#c9bfb8"/><text x="${x0 + wa + 6}" y="${y + 12}" font-size="12" fill="#666">${e(a)}</text>
<rect x="${x0}" y="${y + 15}" width="${wb}" height="13" rx="3" fill="#e8742b"/><text x="${x0 + wb + 6}" y="${y + 26}" font-size="12" font-weight="bold" fill="#7a1f1f">${e(b)}</text>`; }).join('')}</svg>`;
};
const kg = q => (Math.round(q * 10) / 10).toLocaleString('es-ES');
const tabla = rs => `<table><tr><th>Producto</th><th>Kilos</th><th>Pagasteis</th><th>Ahora</th><th>Antes</th><th>Ahora</th></tr>${rs.map(r =>
  `<tr><td>${r.n}</td><td>${kg(r.q)}</td><td>${e(r.p)}</td><td><b>${e(r.pn)}</b></td><td>${e(r.q * r.p)}</td><td><b>${e(r.q * r.pn)}</b></td></tr>`).join('')}
<tr class=tot><td colspan=4>Total del pedido</td><td>${e(A(rs))}</td><td>${e(N(rs))}</td></tr></table>
<p class=ah>Os ahorráis <b>${e(A(rs) - N(rs))}</b> en este pedido.</p>`;
const porProd = Object.values(rows.reduce((m, r) => { (m[r.n] ||= [r.n, 0, 0]); m[r.n][1] += r.q * r.p / meses; m[r.n][2] += r.q * r.pn / meses; return m; }, {}))
  .filter(x => x[1] - x[2] > 0.5).sort((x, y) => (y[1] - y[2]) - (x[1] - x[2])).slice(0, 5);
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}
.top{background:#7a1f1f;color:#fff;padding:7mm 13mm 5mm}.top h1{margin:0;font-size:26px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:3mm;font-size:16px;color:#f39a5c;font-weight:bold}.pg{padding:4mm 13mm}
h2{font-size:15px;color:#7a1f1f;margin:3mm 0 1mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.kpis{display:flex;gap:4mm;margin:2mm 0}.k{flex:1;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:2mm;text-align:center}
.k b{display:block;font-size:22px;color:#7a1f1f}.k span{font-size:12px;color:#555}
.ley{font-size:12px;color:#555}.ley i{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 10px;vertical-align:-1px}
.dos{display:flex;gap:5mm;align-items:flex-start}.dos>div{flex:1}
table{width:100%;border-collapse:collapse;font-size:10.5px}th{text-align:right;color:#777;font-weight:normal;border-bottom:1px solid #ddd;padding:.8mm 1mm}th:first-child,td:first-child{text-align:left}
td{text-align:right;white-space:nowrap;padding:.4mm 1mm;border-bottom:1px solid #eee}tr.tot td{font-weight:bold;border-top:2px solid #7a1f1f;color:#7a1f1f}
.ah{margin:1.5mm 0 0;font-size:12.5px}.ah b{color:#7a1f1f}h3{margin:2mm 0 1mm;font-size:13.5px}
.nota{font-size:11px;color:#666}.pie{margin-top:3mm;padding-top:2mm;border-top:2px solid #e8742b;font-size:11px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid</p>
<div class=para>Para Los Barriletes · Lo que os ahorraríais</div></div>
<div class=pg>
<p>He cogido <b>vuestros pedidos de este año</b> y los he pasado a los precios nuevos. Esto es lo que os ahorraríais:</p>
<div class=kpis><div class=k><b>${e0(ahSem)}</b><span>a la semana</span></div><div class=k><b>${e0(ahMes)}</b><span>al mes</span></div><div class=k><b>${e0(ahMes * 12)}</b><span>al año</span></div></div>
<h2>Vuestros dos últimos pedidos, antes y ahora</h2>
<div class=ley><i style="background:#c9bfb8"></i>Lo que pagasteis<i style="background:#e8742b"></i>Lo que pagaríais ahora</div>
${barras([[`Penúltimo (${pen.dia})`, A(pen.rs), N(pen.rs)], [`Último (${ult.dia})`, A(ult.rs), N(ult.rs)], ['Un mes normal', totA / meses, totN / meses]])}
<div class=dos><div><h3>Penúltimo pedido · ${pen.dia}</h3>${tabla(pen.rs)}</div><div><h3>Último pedido · ${ult.dia}</h3>${tabla(ult.rs)}</div></div>
<h2>En un mes normal, producto a producto</h2>
${barras(porProd)}
<p class=nota>Precios sin IVA (+4 %). «Un mes normal» es la media de lo que nos habéis pedido de febrero a octubre en nuestros albaranes. Lo que no está en vuestra hoja (melón, sandía, cherry…) se deja al mismo precio. Y cada semana os llegará vuestra lista actualizada.</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · www.ferjusanz-frutas-verduras.es</div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-Barriletes-lo-que-ahorrais.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-Barriletes-lo-que-ahorrais.jpg`, type: 'jpeg', quality: 90, fullPage: true }); await b.close();
console.log({ meses, totA, totN, ahMes, ahSem, pen: [pen.dia, A(pen.rs), N(pen.rs)], ult: [ult.dia, A(ult.rs), N(ult.rs)] });
