// Lista de precios para Los Barriletes (BARRILETES). Uso: node docs/hosteleria/barriletes.mjs <carpeta de salida>
// Lo que más pide en 2026 según Golden: mismos precios que Florencio donde coinciden; el resto, compra del 24/11 + 0,20 € (patata agria: fijo hostelería 0,66).
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', W = 'https://www.ferjusanz-frutas-verduras.es';
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const lista = [ // [producto, precio nuevo, unidad, lo que pagó en octubre]
  ['Patata agria', 0.66, 'kg', 0.72], ['Tomate pera', 1.10, 'kg', 2.60], ['Limones', 1.50, 'kg', 1.75],
  ['Pimiento rojo', 1.30, 'kg', 3.40], ['Pimiento verde', 1.20, 'kg', 2.75], ['Pimiento de Padrón', 2.30, 'kg', 5.00],
  ['Berenjena', 0.85, 'kg', 2.20], ['Calabacín', 0.90, 'kg', 1.75], ['Puerro', 1.45, 'kg', 2.40],
  ['Cebolla gorda', 0.65, 'kg', 0.70], ['Ajo pelado', 3.50, 'kg', 5.20], ['Zanahoria', 0.80, 'kg', 1.20],
  ['Piña', 1.70, 'kg', 2.20], ['Plátano macho', 2.20, 'kg', 2.50], ['Cebolla morada', 1.40, 'kg', 1.75],
];
console.assert(lista.every(([, p, , a]) => p > 0 && p <= a), 'precios: nunca más caro que lo que paga');
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.top{background:#7a1f1f;color:#fff;padding:8mm 13mm 6mm}.top h1{margin:0;font-size:30px;letter-spacing:1px}.top p{margin:3px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:5mm;font-size:17px;color:#f39a5c;font-weight:bold}.pg{padding:5mm 13mm}
h2{font-size:18px;color:#7a1f1f;margin:4mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
table{width:100%;border-collapse:collapse}td{padding:1mm 3mm;border-bottom:1px solid #eee}tr:nth-child(odd) td{background:#fff6ee}
td.p{text-align:right;font-weight:bold;font-size:15px;white-space:nowrap;color:#7a1f1f}td.u{color:#777;width:22mm}
.nota{font-size:11.5px;color:#666}.pie{margin-top:4mm;padding-top:3mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Más de seis décadas</p>
<div class=para>Para Los Barriletes · 26 de noviembre de 2026</div></div>
<div class=pg>
<p>Hola, buenos días:</p>
<p>Os paso vuestros precios nuevos. He mirado lo que más nos pedís durante el año y os los he ajustado al máximo, con muy poco margen sobre lo que nos cuesta a nosotros en Mercamadrid. <b>El tomate ha bajado mucho</b> estos días y ya lo tenéis aplicado.</p>
<h2>Vuestros precios</h2>
<table>${lista.map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}
<tr><td>Perejil</td><td class=p>de regalo</td><td class=u>con el pedido</td></tr></table>
<p class=nota>Precios + 4 % de IVA. El resto, según mercado: pedidme precio de lo que necesitéis.</p>
<h2>Siempre al día</h2>
<p>Cada semana tenemos <b>ofertas de la semana</b> en nuestra web: <a href="${W}/#ofertas"><b>ferjusanz-frutas-verduras.es</b></a>. Además, <b>cada semana os llegará vuestra lista actualizada</b>, para que siempre sepáis cómo están los precios sin tener que preguntar.</p>
<p>Y <b>ahora lo llevo yo personalmente</b>. Ha habido cambios que me quiero tomar muy en serio, y los precios los pongo yo, sin depender de nadie. Cualquier cosa, escribidme a este mismo WhatsApp.</p>
<p>Un saludo,</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-precios-Barriletes.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-precios-Barriletes.png`, fullPage: true }); await b.close();

const { default: sh } = await import('child_process'); // JPG para WhatsApp
sh.execSync(`python3 -c "from PIL import Image;Image.open('${D}/Ferjusanz-precios-Barriletes.png').convert('RGB').save('${D}/Ferjusanz-precios-Barriletes.jpg',quality=90)"`);
