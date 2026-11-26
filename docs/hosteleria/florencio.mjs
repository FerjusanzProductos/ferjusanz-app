// Lista de precios para Bar Florencio (FLORE). Uso: node docs/hosteleria/florencio.mjs <carpeta de salida>
// Precios de Tito (26/11/2026) y, el resto de lo que más pide este año, compra del 24/11 + 0,20 € (patata agria: fijo hostelería 0,66).
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', W = 'https://www.ferjusanz-frutas-verduras.es';
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const lista = [
  ['Limones', 1.50, 'kg'], ['Pimiento de Padrón', 2.30, 'kg'], ['Tomate pera', 1.10, 'kg'], ['Tomate de ensalada', 1.40, 'kg'],
  ['Lechuga en bandeja', 1.95, 'bandeja'], ['Patata agria', 0.66, 'kg'], ['Ajo pelado', 3.50, 'kg'], ['Patata pelada bastón', 1.30, 'kg'],
  ['Cebolla morada', 1.40, 'kg'], ['Cebolla gorda', 0.65, 'kg'], ['Repollo', 0.95, 'kg'], ['Piña', 1.70, 'kg'],
  ['Zanahoria', 0.80, 'kg'], ['Pimiento italiano', 2.00, 'kg'], ['Puerro', 1.45, 'kg'],
];
console.assert(lista.every(([, p]) => p > 0), 'precios');
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13.5px/1.45 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.top{background:#7a1f1f;color:#fff;padding:8mm 13mm 6mm}.top h1{margin:0;font-size:30px;letter-spacing:1px}.top p{margin:3px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:5mm;font-size:17px;color:#f39a5c;font-weight:bold}.pg{padding:5mm 13mm}
h2{font-size:18px;color:#7a1f1f;margin:4mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
table{width:100%;border-collapse:collapse}td{padding:1.3mm 3mm;border-bottom:1px solid #eee}tr:nth-child(odd) td{background:#fff6ee}
td.p{text-align:right;font-weight:bold;font-size:16px;white-space:nowrap;color:#7a1f1f}td.u{color:#777;width:22mm}
.nota{font-size:11.5px;color:#666}.pie{margin-top:4mm;padding-top:3mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Más de seis décadas</p>
<div class=para>Para Florencio · Bar Florencio · 26 de noviembre de 2026</div></div>
<div class=pg>
<p>Hola, Florencio:</p>
<p>Te paso tus precios. He mirado lo que más nos pides durante el año y te los he ajustado al máximo: <b>estoy haciendo un esfuerzo</b>, con muy poco margen sobre lo que nos cuesta a nosotros en Mercamadrid.</p>
<h2>Tus precios</h2>
<table>${lista.map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}
<tr><td>Perejil</td><td class=p>de regalo</td><td class=u>con el pedido</td></tr></table>
<p class=nota>Precios + 4 % de IVA. El resto, según mercado: pídeme precio de lo que necesites.</p>
<h2>Cuando quieras, me paso</h2>
<p>Cuando quieras me paso a verte y lo hablamos con calma. Cualquier cosa, escríbeme a este mismo WhatsApp.</p>
<p>Un saludo,</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-precios-Florencio.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-precios-Florencio.png`, fullPage: true }); await b.close();
