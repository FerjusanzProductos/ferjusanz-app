// Comparativa para Cervecería Los Picos (PICOS): sus 2 últimos pedidos y su media mensual mar-jul 2026 (Golden, sin IVA) a lo que pagó y a los precios de su hoja (picos.mjs).
// Uso: NODE_USE_ENV_PROXY=1 node docs/hosteleria/picos-comparativa.mjs <carpeta de salida>
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.';
const sql = async q => { const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', { method: 'POST',
  headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status); return r.json(); };
// código Golden → [nombre, precio de su hoja (picos.mjs)]; lo demás (sandía, aguacate, pepino, patata agria…) se deja como lo pagó
const nuevo = { '91-B': ['Tomate ensalada', 1.40], '91-D': ['Tomate pera', 1.40], '111': ['Pimiento rojo', 2.30], '110': ['Pimiento verde', 1.40],
  '118': ['Pimiento italiano', 2.20], '151': ['Pimiento de Padrón', 1.90], '40': ['Limones', 1.40], '42': ['Naranja de zumo', 1.10],
  '21': ['Cebolla gorda', .85], '93': ['Melón piel de sapo', 1.90], '150': ['Piña', 1.90], '28': ['Champiñón', 3.20],
  '168': ['Lechuga bandeja 900 g', 1.85], '94': ['Lechuga iceberg', .95], '159': ['Zanahoria', 1.00], '123': ['Acelgas', 1.00],
  '108': ['Calabacín', 1.10], '251': ['Berenjena', 1.05], '34': ['Ajo pelado', 3.70], '30': ['Ajos', 3.30] };
const rows = (await sql(`select coalesce(l.albaran,'') alb, f.fecha::text fecha, l.producto_codigo cod, l.descripcion d, l.cantidad::float q, l.precio::float p
  from golden_lineas l join golden_facturas f on f.numero=l.factura_numero
  where f.cliente_codigo='PICOS' and f.fecha>='2026-01-01' and not coalesce(l.repetida,false) and l.cantidad>0`))
  .map(r => ({ ...r, n: nuevo[r.cod]?.[0] || r.d, pn: nuevo[r.cod]?.[1] ?? r.p }));
const meses = new Set(rows.map(r => r.fecha.slice(0, 7))).size;
const sum = (rs, f) => rs.reduce((s, r) => s + f(r), 0), A = rs => sum(rs, r => r.q * r.p), N = rs => sum(rs, r => r.q * r.pn);
const totA = A(rows), totN = N(rows), ahMes = (totA - totN) / meses, ahSem = ahMes * 7 / 30.4;
console.assert(ahMes > 0 && meses === 5, 'datos: 5 meses (mar-jul)');
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
const MES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const porMes = [...new Set(rows.map(r => r.fecha.slice(0, 7)))].sort().map(m => { const rs = rows.filter(r => r.fecha.startsWith(m)); return [MES[+m.slice(5)], A(rs), N(rs)]; });
console.assert(porMes.every(x => x[2] < x[1]), 'cada mes ahorra');
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
<div class=para>Para Cervecería Los Picos · Lo que os ahorraríais</div></div>
<div class=pg>
<p>He cogido <b>vuestros pedidos de marzo a julio</b> y los he pasado a los precios nuevos. Esto es lo que os ahorraríais:</p>
<div class=kpis><div class=k><b>${e0(ahSem)}</b><span>a la semana</span></div><div class=k><b>${e0(ahMes)}</b><span>al mes</span></div><div class=k><b>${e0(ahMes * 12)}</b><span>al año</span></div></div>
<h2>Mes a mes, antes y ahora</h2>
<div class=ley><i style="background:#c9bfb8"></i>Lo que pagasteis<i style="background:#e8742b"></i>Lo que pagaríais ahora</div>
${barras([...porMes, ['Un mes normal', totA / meses, totN / meses]])}
<h2>En un mes normal, producto a producto</h2>
${barras(porProd)}
<p class=nota>Precios sin IVA (+4 %). «Un mes normal» es la media de lo que nos habéis pedido de marzo a julio en nuestros albaranes. Lo que no está en vuestra hoja (sandía, aguacate, pepino…) se deja al mismo precio. Ojo: el melón, en pleno verano, lo pagasteis más barato (1,40); ahora va a 1,90. Patata especial freír, a 0,60 €/kg; huevos, a 2,40 € la docena.</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Móvil y WhatsApp <b>609 567 354</b> · www.ferjusanz-frutas-verduras.es</div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-Los-Picos-lo-que-ahorrais.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-Los-Picos-lo-que-ahorrais.jpg`, type: 'jpeg', quality: 90, fullPage: true }); await b.close();
console.log({ meses, totA, totN, ahMes, ahSem, porMes });
