// Comparativa para Restaurante Duarte (José Aníbal): sus pedidos de octubre 2026 (Golden, sin IVA) a lo que pagó y a los precios nuevos.
// Uso: node docs/hosteleria/duarte-comparativa.mjs <carpeta de salida>
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.';
const nuevo = { 'Patata agria': 0.58, 'Cebolla gorda': 0.65, 'Limones': 1.25, 'Ajos': 3.20, 'Fruta variada': 1.00 };
const P = 'Patata agria', C = 'Cebolla gorda', L = 'Limones', A = 'Ajos', F = 'Fruta variada';
const oct = [ // [día, producto, kg, precio pagado] — albaranes y tickets de octubre en Golden
  ['01/10', P, 200, .64], ['01/10', C, 15, .56], ['01/10', L, 21, 1.70],
  ['05/10', P, 325, .64], ['05/10', C, 25, .56], ['05/10', L, 21, 1.90], ['05/10', A, 6, 4.20], ['05/10', F, 25, 1.00],
  ['08/10', P, 200, .64], ['08/10', L, 10.5, 1.90],
  ['09/10', P, 325, .64], ['09/10', C, 10, .60], ['09/10', L, 10.5, 1.95],
  ['15/10', P, 200, .66], ['15/10', C, 10, .60], ['15/10', L, 21, 1.80], ['15/10', A, 6, 3.80],
  ['19/10', P, 325, .65], ['19/10', C, 25, .60], ['19/10', L, 21, 1.90],
  ['22/10', P, 200, .65], ['22/10', C, 30, .80], ['22/10', L, 10.5, 1.90],
  ['26/10', P, 350, .65], ['26/10', C, 15, .60], ['26/10', L, 21, 1.90],
  ['29/10', P, 200, .62], ['29/10', C, 25, .64], ['29/10', L, 21, 1.90],
];
const sum = (rs, f) => rs.reduce((s, r) => s + f(r), 0);
const antes = rs => sum(rs, r => r[2] * r[3]), ahora = rs => sum(rs, r => r[2] * nuevo[r[1]]);
const mesA = antes(oct), mesN = ahora(oct), ahMes = mesA - mesN, ahSem = ahMes * 7 / 31;
console.assert(Math.abs(mesA - 1961.62) < 0.05, 'octubre debe cuadrar con Golden (1.961,63 €)');
const e = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' €';
const e0 = n => Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' }) + ' €';
const pedido = d => oct.filter(r => r[0] === d);
const pen = pedido('26/10'), ult = pedido('29/10');
// barras dobles (antes/ahora) en SVG
const barras = (grupos, w = 760) => {
  const max = Math.max(...grupos.flatMap(g => [g[1], g[2]])), fila = 40, h = grupos.length * fila + 10, x0 = 150, bw = w - x0 - 90;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${grupos.map(([n, a, b], i) => {
    const y = i * fila + 6, wa = bw * a / max, wb = bw * b / max;
    return `<text x="${x0 - 10}" y="${y + 21}" text-anchor="end" font-size="14" fill="#2a2320">${n}</text>
<rect x="${x0}" y="${y}" width="${wa}" height="15" rx="3" fill="#c9bfb8"/><text x="${x0 + wa + 6}" y="${y + 13}" font-size="12" fill="#666">${e(a)}</text>
<rect x="${x0}" y="${y + 17}" width="${wb}" height="15" rx="3" fill="#e8742b"/><text x="${x0 + wb + 6}" y="${y + 29}" font-size="12" font-weight="bold" fill="#7a1f1f">${e(b)}</text>`;
  }).join('')}</svg>`;
};
const tabla = rs => `<table><tr><th>Producto</th><th>Kilos</th><th>Pagaste</th><th>Ahora</th><th>Antes</th><th>Ahora</th></tr>${rs.map(r =>
  `<tr><td>${r[1]}</td><td>${String(r[2]).replace('.', ',')}</td><td>${e(r[3])}</td><td><b>${e(nuevo[r[1]])}</b></td><td>${e(r[2] * r[3])}</td><td><b>${e(r[2] * nuevo[r[1]])}</b></td></tr>`).join('')}
<tr class=tot><td colspan=4>Total del pedido</td><td>${e(antes(rs))}</td><td>${e(ahora(rs))}</td></tr></table>
<p class=ah>Te ahorras <b>${e(antes(rs) - ahora(rs))}</b> en este pedido.</p>`;
const prods = [P, L, C, A].map(k => { const rs = oct.filter(r => r[1] === k); return [k, antes(rs), ahora(rs)]; });
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}
.top{background:#7a1f1f;color:#fff;padding:7mm 13mm 5mm}.top h1{margin:0;font-size:26px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:3mm;font-size:16px;color:#f39a5c;font-weight:bold}.pg{padding:4mm 13mm}
h2{font-size:16px;color:#7a1f1f;margin:4mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.kpis{display:flex;gap:4mm;margin:3mm 0}.k{flex:1;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:3mm;text-align:center}
.k b{display:block;font-size:24px;color:#7a1f1f}.k span{font-size:12px;color:#555}
.ley{font-size:12px;color:#555}.ley i{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 10px;vertical-align:-1px}
.dos{display:flex;gap:5mm}.dos>div{flex:1}
table{width:100%;border-collapse:collapse;font-size:11px}th{text-align:right;color:#777;font-weight:normal;border-bottom:1px solid #ddd;padding:1mm 1.5mm}th:first-child,td:first-child{text-align:left}
td{text-align:right;white-space:nowrap;padding:.8mm 1.2mm;border-bottom:1px solid #eee}tr.tot td{font-weight:bold;border-top:2px solid #7a1f1f;color:#7a1f1f}
.ah{margin:1.5mm 0 0;font-size:12.5px}.ah b{color:#7a1f1f}h3{margin:2mm 0 1mm;font-size:13.5px}
.nota{font-size:11px;color:#666}.pie{margin-top:3mm;padding-top:2mm;border-top:2px solid #e8742b;font-size:11px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid</p>
<div class=para>Para José Aníbal · Restaurante Duarte · Lo que te ahorrarías</div></div>
<div class=pg>
<p>José Aníbal, he cogido <b>tus pedidos de octubre</b> (los 9) y los he pasado a los precios nuevos. Esto es lo que te ahorrarías:</p>
<div class=kpis><div class=k><b>${e0(ahSem)}</b><span>a la semana</span></div><div class=k><b>${e0(ahMes)}</b><span>al mes</span></div><div class=k><b>${e0(ahMes * 12)}</b><span>al año</span></div></div>
<h2>Tus dos últimos pedidos, antes y ahora</h2>
<div class=ley><i style="background:#c9bfb8"></i>Lo que pagaste<i style="background:#e8742b"></i>Lo que pagarías ahora</div>
${barras([['Penúltimo (26/10)', antes(pen), ahora(pen)], ['Último (29/10)', antes(ult), ahora(ult)], ['Todo octubre', mesA, mesN]])}
<div class=dos><div><h3>Penúltimo pedido · 26/10</h3>${tabla(pen)}</div><div><h3>Último pedido · 29/10</h3>${tabla(ult)}</div></div>
<h2>En un mes, producto a producto (octubre)</h2>
${barras(prods)}
<p class=nota>Precios sin IVA (+4 %). Con los kilos que pediste en octubre en nuestros albaranes. Patata agria a 0,58 €/kg (saco de 25 kg, 14,50 €); limón 1,25; cebolla gorda 0,65; ajos 3,20. Hazme el pedido el día antes y te mando lo que te sale cada cosa.</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · www.ferjusanz-frutas-verduras.es</div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-Duarte-lo-que-ahorras.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-Duarte-lo-que-ahorras.jpg`, type: 'jpeg', quality: 90, fullPage: true }); await b.close();
console.log({ mesA, mesN, ahMes, ahSem });
