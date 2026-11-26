// Lista de precios para Cervecería Los Picos (PICOS). Uso: node docs/hosteleria/picos.mjs <carpeta de salida>
// Tito 26/11/2026: lo que compraba (Golden, mar-jul 2026) a compra del 24/11 + 0,40 €; patata especial freír a 0,60 (no nos la compra).
// Fuera: lo que con +0,40 le saldría más caro que antes (aguacate, pepino, puerro), sandía (no es temporada) y sueltos (piparras, papayón, brevas, picotas).
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', W = 'https://www.ferjusanz-frutas-verduras.es', TEL = '609 567 354';
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const e0 = n => Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' }) + ' €';
const lista = [ // [producto, compra 24/11 (null = precio de Tito), unidad, lo que pagaba de media, cantidad mar-jul]
  ['Tomate ensalada', 1.00, 'kg', 1.95, 197], ['Tomate pera', 1.00, 'kg', 2.23, 46.9], ['Pimiento rojo', 1.90, 'kg', 2.77, 100.9],
  ['Pimiento verde', 1.00, 'kg', 2.75, 66.5], ['Pimiento italiano', 1.80, 'kg', 2.27, 13.1], ['Pimiento de Padrón', 1.50, 'kg', 4.79, 3.5],
  ['Limones', 1.00, 'kg', 2.32, 84.6], ['Naranja de zumo', 0.70, 'kg', 1.17, 92.6], ['Cebolla gorda', 0.45, 'kg', 1.02, 68.3],
  ['Melón piel de sapo', 1.50, 'kg', 1.99, 54.5], ['Piña', 1.50, 'kg', 1.96, 17.1], ['Champiñón', 2.80, 'kg', 3.58, 9.9],
  ['Lechuga bandeja 900 g', 1.45, 'bandeja', 2.40, 14], ['Lechuga iceberg', 0.55, 'pieza', 1.10, 21], ['Zanahoria', 0.60, 'kg', 1.15, 20],
  ['Acelgas', 0.60, 'kg', 1.38, 16.9], ['Calabacín', 0.70, 'kg', 1.67, 11.4], ['Berenjena', 0.65, 'kg', 1.77, 7.5],
  ['Ajo pelado', 3.30, 'kg', 5.40, 2], ['Ajos', 2.90, 'kg', 4.00, 2.2],
  ['Huevos', 2.00, 'docena', null, 0], // Tito 26/11: «y los huevos» (no los compraba; Patatas del Olmo, 2,00/docena)
].map(([n, c, u, a, q]) => [n, +(c + 0.40).toFixed(2), u, a, q]);
console.assert(lista.every(([, p, , a]) => a == null || p < a), 'nunca más caro que lo que pagaba');
const PAT = 0.60;
const antes = lista.reduce((s, r) => s + (r[3] ?? 0) * r[4], 0), ahora = lista.reduce((s, r) => s + r[1] * r[4], 0), meses = 5;
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.top{background:#7a1f1f;color:#fff;padding:7mm 13mm 5mm}.top h1{margin:0;font-size:28px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:3mm;font-size:17px;color:#f39a5c;font-weight:bold}.pg{padding:3mm 13mm}p{margin:2mm 0}
h2{font-size:17px;color:#7a1f1f;margin:3mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.pat{display:flex;flex-wrap:wrap;align-items:baseline;gap:2mm 6mm;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:3mm 6mm;margin:2mm 0}.pat b{font-size:19px;color:#7a1f1f}.pat span{font-size:25px;font-weight:bold;color:#7a1f1f}.pat small{color:#555;font-size:13px}
table{width:100%;border-collapse:collapse}th{text-align:right;color:#777;font-weight:normal;font-size:11.5px;padding:.5mm 2.5mm;border-bottom:1px solid #ddd}th:first-child{text-align:left}
td{padding:.45mm 2.5mm;font-size:12.5px;border-bottom:1px solid #eee}tr:nth-child(even) td{background:#fff6ee}
td.a{text-align:right;color:#999;text-decoration:line-through;white-space:nowrap}td.p{text-align:right;font-weight:bold;font-size:13.5px;white-space:nowrap;color:#7a1f1f}td.u{color:#777;width:24mm;white-space:nowrap}
.ah{background:#7a1f1f;color:#fff;border-radius:3mm;padding:3mm 5mm;margin:3mm 0;font-size:14px}.ah b{color:#ffd1a8;font-size:17px}
.nota{font-size:11px;color:#666}.pie{margin-top:3mm;padding-top:2.5mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Más de seis décadas</p>
<div class=para>Para Cervecería Los Picos · 26 de noviembre de 2026</div></div>
<div class=pg>
<p>Hola, buenos días:</p>
<p>He mirado lo que nos pedíais y os he bajado los precios al máximo, con muy poco margen sobre lo que nos cuesta a nosotros en Mercamadrid. Ahora lo llevo yo personalmente y los precios los pongo yo.</p>
<div class=pat><b>Patata especial freír</b><span>${e(PAT)} / kg</span><small>Saco de 25 kg: ${e(PAT * 25)}</small></div>
<h2>Vuestros precios</h2>
<table><tr><th>Producto</th><th>Antes</th><th>Ahora</th><th></th></tr>${lista.map(([n, p, u, a]) => `<tr><td>${n}</td><td class=a>${a == null ? '' : e(a)}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}
<tr><td>Perejil</td><td></td><td class=p>de regalo</td><td class=u>con el pedido</td></tr></table>
<div class=ah>Con lo que nos comprasteis de marzo a julio, habríais pagado <b>${e0(ahora)}</b> en vez de ${e0(antes)}: <b>unos ${e0((antes - ahora) / meses)} menos al mes</b>.</div>
<p class=nota>«Antes»: lo que pagabais de media de marzo a julio. Precios + 4 % de IVA. El resto, según mercado: pedidme precio de lo que necesitéis.</p>
<p>Cada semana tenemos <b>ofertas y novedades</b> en <a href="${W}/#ofertas"><b>ferjusanz-frutas-verduras.es</b></a>. Cualquier cosa, escribidme al <b>${TEL}</b>. Un saludo,</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Móvil y WhatsApp <b>${TEL}</b> · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-precios-Los-Picos.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-precios-Los-Picos.jpg`, type: 'jpeg', quality: 88, fullPage: true }); await b.close();
console.log({ antes, ahora, mes: (antes - ahora) / meses });
