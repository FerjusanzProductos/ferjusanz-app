// Lista para Restaurante Club de Tenis (DIPAHI SL, TENIS; «Bustamante» según Tito; cliente perdido desde el 31/03/2026). Uso: node docs/hosteleria/bustamante.mjs <carpeta de salida>
// Tito 26/11/2026: compra + 0,20 € (compras Golden 14-24/11); patata agria como Duarte (0,58). Fotos propias de web/fotos.
import fs from 'fs'; import { execSync } from 'child_process'; import { createRequire } from 'module';
const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', F = '/home/user/ferjusanz-app/web/fotos/', W = 'https://www.ferjusanz-frutas-verduras.es';
const tmp = fs.mkdtempSync('/tmp/claude-0/bus-');
const img = f => { const o = `${tmp}/${f.replace(/\W/g, '_')}.jpg`; // fotos reducidas para que el PDF pese poco
  execSync(`python3 -c "from PIL import Image;i=Image.open('${F}${f}').convert('RGB');i.thumbnail((520,520));i.save('${o}',quality=82)"`);
  return 'data:image/jpeg;base64,' + fs.readFileSync(o).toString('base64'); };
const e = n => n.toFixed(2).replace('.', ',') + ' €';
// [nombre, precio, unidad, compra, foto]
const tomates = [
  ['Tomate RAF', 2.00, 'kg', 1.80, 'catalogo/09-tomate-raf.jpg'], ['Tomate de ensalada', 1.40, 'kg', 1.20, 'catalogo/45-tomate-asurcado.jpg'], ['Tomate rosa', 3.50, 'kg', 3.30, 'catalogo/10-tomate-rosa.jpg'],
  ['Tomate en rama', 1.70, 'kg', 1.50, '2026/11/novedad-2026-11-26-tomate-en-rama.jpg'], ['Cherry de colores', 4.95, 'kg', 4.75, 'catalogo/13-tomate-cherry-de-colores.jpg'],
];
const setas = [
  ['Setas de ostra', 4.00, 'kg', 3.80, 'catalogo/25-setas-de-ostra.jpg'], ['Champiñón', 3.00, 'kg', 2.80, 'catalogo/24-champinon-grande-y-gordo.jpg'],
  ['Boletus y níscalos', null, 'según mercado', null, 'catalogo/27-boletus.jpg'],
];
const resto = [
  ['Zanahoria', 0.80, 'kg', 0.60], ['Calabacín', 0.90, 'kg', 0.70], ['Berenjena', 0.80, 'kg', 0.60], ['Pimiento italiano', 2.00, 'kg', 1.80],
  ['Pimiento rojo', 1.30, 'kg', 1.10], ['Limones', 1.20, 'kg', 1.00], ['Plátano', 1.90, 'kg', 1.70], ['Melón piel de sapo', 1.70, 'kg', 1.50],
  ['Piña', 1.70, 'kg', 1.50], ['Mezclum (ensalada gourmet)', 2.15, 'bolsa', 1.95], ['Repollo', 0.95, 'kg', 0.75], ['Cebolla morada', 1.40, 'kg', 1.20],
  ['Puerro', 1.45, 'kg', 1.25], ['Cebollino', 1.70, 'manojo', 1.50],
];
// su pedido del 04/03/2026 (albarán F/1943): [producto, cantidad, precio de entonces, precio de hoy]
const marzo = [['Patata agria', 175, .46, .58], ['Tomate pera', 32, 1.50, 1.20], ['Tomate RAF', 9.5, 2.50, 2.00], ['Tomate RAF extra', 5.4, 5.00, 4.70],
  ['Calabacín', 10.8, 1.60, .90], ['Berenjena', 8.5, 2.20, .80], ['Pimiento italiano', 10.3, 2.25, 2.00], ['Limones', 10.5, 1.70, 1.20],
  ['Plátano', 10, 2.30, 1.90], ['Melón', 12, 2.30, 1.70], ['Piña', 9, 1.70, 1.70], ['Mezclum', 6, 2.90, 2.15], ['Zanahoria', 5, 1.00, .80],
  ['Repollo', 3, 1.00, .95], ['Cebollino', 1, 2.20, 1.70]];
const lista = [tomates[1], ['Tomate pera', 1.20, 'kg', 1.00], tomates[0], ['Tomate RAF extra', 4.70, 'kg', 4.50], ...tomates.slice(2), ...setas.filter(x => x[1] != null), ...resto];
console.assert(new Set(lista.map(x => x[0])).size === lista.length, 'sin repetidos');
const mA = marzo.reduce((s, r) => s + r[1] * r[2], 0), mN = marzo.reduce((s, r) => s + r[1] * r[3], 0);
console.assert([...tomates, ...setas, ...resto, ['', 1.20, '', 1.00], ['', 4.70, '', 4.50]].every(([, p, , c]) => p == null || Math.abs(p - c - 0.20) < 0.001), 'todo a compra + 0,20');
const pat = 0.58;
const tarj = l => l.map(([n, , , , f]) => `<div class=c><img src="${img(f)}"><b>${n}</b></div>`).join(''); // fotos sin precio: cada precio sale una sola vez, en la lista
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.45 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.top{background:#7a1f1f;color:#fff;padding:8mm 13mm 6mm}.top h1{margin:0;font-size:28px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:3mm;font-size:16px;color:#f39a5c;font-weight:bold}.pg{padding:5mm 13mm}
h2{font-size:16px;color:#7a1f1f;margin:4mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.pat{display:flex;flex-wrap:wrap;align-items:center;gap:2mm 6mm;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:3mm 5mm;margin:3mm 0}
.pat img{width:24mm;height:24mm;object-fit:cover;border-radius:2mm}.pat b{font-size:19px;color:#7a1f1f}.pat span{font-size:24px;font-weight:bold;color:#7a1f1f}.pat small{color:#555}
.g{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.c{break-inside:avoid;border:1px solid #eadfd6;border-radius:2.5mm;overflow:hidden;background:#fff}
.c img{width:100%;height:28mm;object-fit:cover;display:block}.c b{display:block;padding:1.5mm 2.5mm 0;font-size:13px}.c span{display:block;padding:0 2.5mm 2mm;color:#7a1f1f;font-weight:bold;font-size:15px}
table{width:100%;border-collapse:collapse}tr{break-inside:avoid}h2{break-after:avoid}td{padding:.9mm 3mm;border-bottom:1px solid #eee}tr:nth-child(odd) td{background:#fff6ee}
td.p{text-align:right;font-weight:bold;font-size:15px;white-space:nowrap;color:#7a1f1f}td.u{color:#777;width:22mm}
.box{background:#fff6ee;border-left:4px solid #e8742b;padding:3mm 5mm;margin:3mm 0}.nota{font-size:11.5px;color:#666}
.pie{margin-top:5mm;padding-top:3mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}.brk{break-before:page}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid</p>
<div class=para>Para Bustamante · Restaurante Club de Tenis · 26 de noviembre de 2026</div></div>
<div class=pg>
<p>Hola, Bustamante, buenos días:</p>
<p>Hace tiempo que no trabajamos juntos y me gustaría volver a hacerlo. Te paso tu lista nueva. <b>Ahora llevo yo las riendas</b>: los precios los manejo yo, y te los he puesto <b>muy ajustados</b>, casi a lo que nos cuesta a nosotros en Mercamadrid. Quiero que estés contento con nosotros y tratarte bien, para que no te haga falta mirar otras alternativas.</p>
<div class=pat><img src="${img('catalogo/01-patata-en-saco.jpg')}"><b>Patata agria</b><span>${e(pat)} / kg</span><small>Saco de 25 kg: ${e(pat * 25)}</small></div>
<h2>Nuestro género: tomates de muchas variedades, y bonitos</h2>
<div class=g>${tarj(tomates)}</div>
<div class=g style="margin-top:3mm">${tarj(setas)}</div>
</div>
<div class=pg>
<h2>Tus precios</h2>
<table>${lista.map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}
<tr><td>Ñoras, boletus y níscalos</td><td class=p>según mercado</td><td class=u></td></tr><tr><td>Perejil</td><td class=p>de regalo</td><td class=u>con el pedido</td></tr></table>
<p class=nota>Precios + 4 % de IVA. Lo que no esté aquí, pídeme precio: lo tengo todo. Las fotos son de nuestro propio género (más en <a href="${W}/#ofertas"><b>ferjusanz-frutas-verduras.es</b></a>, con las ofertas de la semana).</p>
<div class=box><p style="margin:0">Tu último pedido (4 de marzo) te costó <b>${e(mA)}</b>. Con estos precios te habría salido por <b>${e(mN)}</b>.</p></div>
<h2>Tú sabes siempre lo que vas a pagar</h2>
<div class=box><p style="margin:0">Hazme el pedido <b>con tiempo, el día antes</b>, y yo mismo te apunto <b>a cuánto te sale cada cosa y el total</b> antes de llevártelo. Sin sorpresas en la factura.</p></div>
<p>Pídeme lo que necesites a este mismo WhatsApp. Te voy a tratar bien.</p>
<p>Un saludo,</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · www.ferjusanz-frutas-verduras.es</div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-precios-Club-de-Tenis.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-precios-Club-de-Tenis.jpg`, type: 'jpeg', quality: 88, fullPage: true }); await b.close();
fs.rmSync(tmp, { recursive: true });
console.log({ mA, mN });
