// Lista de precios para Restaurante Duarte (DUARTE). Uso: node docs/hosteleria/duarte.mjs <carpeta de salida>
// Tito 26/11/2026: patata a compra + 8-10 cts (lo que se le sirve es Jelly, especial freír, aunque en Golden y para él sea «agria»: compra 0,40-0,42); el resto a compra + 0,20-0,30 €. Compra = Golden 14-24/11 (patata: media por kilos).
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', W = 'https://www.ferjusanz-frutas-verduras.es';
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const lista = [ // [producto, precio, unidad, lo que nos costó (compras 14-24/11)]
  ['Patata agria', 0.50, 'kg', 0.42], ['Limones', 1.25, 'kg', 1.00], ['Cebolla gorda', 0.65, 'kg', 0.45], ['Ajos', 3.20, 'kg', 2.90],
  ['Tomate pera', 1.25, 'kg', 1.00], ['Pimiento verde', 1.25, 'kg', 1.00], ['Pimiento rojo', 1.35, 'kg', 1.10], ['Calabacín', 0.95, 'kg', 0.70],
  ['Berenjena', 0.90, 'kg', 0.65], ['Zanahoria', 0.85, 'kg', 0.60], ['Ajo pelado', 3.60, 'kg', 3.30],
];
console.assert(lista.every(([, p, , c]) => p - c >= 0.08 && p - c <= 0.31), 'margen 8-30 céntimos');
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.top{background:#7a1f1f;color:#fff;padding:8mm 13mm 6mm}.top h1{margin:0;font-size:30px;letter-spacing:1px}.top p{margin:3px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:5mm;font-size:17px;color:#f39a5c;font-weight:bold}.pg{padding:5mm 13mm}
h2{font-size:18px;color:#7a1f1f;margin:4mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
table{width:100%;border-collapse:collapse}td{padding:1mm 3mm;border-bottom:1px solid #eee}tr:nth-child(odd) td{background:#fff6ee}
td.p{text-align:right;font-weight:bold;font-size:15px;white-space:nowrap;color:#7a1f1f}td.u{color:#777;width:22mm}
.nota{font-size:11.5px;color:#666}.pat{display:flex;flex-wrap:wrap;align-items:baseline;gap:2mm 6mm;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:4mm 6mm;margin:3mm 0 2mm}.pat b{font-size:20px;color:#7a1f1f}.pat span{font-size:26px;font-weight:bold;color:#7a1f1f}.pat small{color:#555;font-size:13px}.pie{margin-top:4mm;padding-top:3mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Más de seis décadas</p>
<div class=para>Para Restaurante Duarte · 26 de noviembre de 2026</div></div>
<div class=pg>
<p>Hola, buenos días:</p>
<p>Muchas gracias otra vez por recibirme las dos veces. Espero que te esté yendo bien con la patata barata que me comentaste. De todas formas, <b>nosotros la tenemos</b>, y a un precio que te lo pone fácil:</p>
<div class=pat><b>Patata agria</b><span>${e(lista[0][1])} / kg</span><small>Saco de 25 kg: ${e(lista[0][1] * 25)}</small></div>
<h2>Y el resto, también muy ajustado</h2>
<table>${lista.slice(1).map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}
<tr><td>Perejil</td><td class=p>de regalo</td><td class=u>con el pedido</td></tr></table>
<p class=nota>Precios + 4 % de IVA. El resto, según mercado: pídeme precio de lo que necesites.</p>
<h2>Tú tienes siempre el control</h2>
<p>Hazme el pedido el día antes y, <b>nada más hacerlo, te mando la lista con lo que te sale cada cosa</b>. Así sabes lo que vas a pagar antes de recibirlo, sin sorpresas en la factura.</p>
<p>Y cada semana tenemos <b>ofertas de la semana</b> en nuestra web: <a href="${W}/#ofertas"><b>ferjusanz-frutas-verduras.es</b></a>.</p>
<p>Cualquier cosa, escríbeme a este mismo WhatsApp.</p>
<p>Un saludo,</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-precios-Duarte.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-precios-Duarte.png`, fullPage: true }); await b.close();

const { default: sh } = await import('child_process'); // JPG para WhatsApp
sh.execSync(`python3 -c "from PIL import Image;Image.open('${D}/Ferjusanz-precios-Duarte.png').convert('RGB').save('${D}/Ferjusanz-precios-Duarte.jpg',quality=90)"`);
