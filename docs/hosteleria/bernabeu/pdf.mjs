// PDF «Precios para hostelería · zona Bernabéu» (Tito, 27/11/2026). Antes: node precios.mjs
import fs from 'fs'; import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const F = JSON.parse(fs.readFileSync(new URL('precios.json', import.meta.url)));
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const fila = f => `<tr><td>${f.dest ? '<span class=o>★</span> ' : ''}${f.nombre}${f.web ? ' <span class=w>oferta</span>' : ''}</td><td class=p>${f.precio === 0 ? 'de regalo' : e(f.precio)}</td><td class=u>${f.precio === 0 ? 'con el pedido' : '/ ' + f.unidad}</td></tr>`;
const g = n => F.find(f => f.nombre.startsWith(n));
const raf = g('Tomate raf');
const css = `@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:11.5px/1.45 Arial,sans-serif;color:#2a2320}
.top{background:#7a1f1f;color:#fff;padding:10mm 13mm 7mm}.top h1{margin:0;font-size:26px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:4mm;font-size:15px;color:#ffb27a;font-weight:bold}.pg{padding:7mm 13mm 8mm}
h2{font-size:15px;color:#7a1f1f;margin:5mm 0 2mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.dest{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}.d{background:#fff6ee;border:1.5px solid #e8742b;border-radius:8px;padding:3mm}
.d b{display:block;font-size:12.5px;color:#7a1f1f}.d .pr{font-size:20px;font-weight:bold;color:#7a1f1f}.d small{color:#555}
.rec{background:#eef6ea;border-left:4px solid #2e7d32;padding:3mm 4mm;border-radius:4px}
table{width:100%;border-collapse:collapse}td{padding:1.3mm 1.5mm;border-bottom:1px solid #eee}.p{text-align:right;font-weight:bold;white-space:nowrap}.u{color:#666;white-space:nowrap}.o{color:#d68910}
.c{column-count:3;column-gap:6mm;font-size:10px}.c td{padding:.9mm 1mm}.c tr{break-inside:avoid}.w{font-size:8px;color:#2e7d32;border:1px solid #2e7d32;border-radius:3px;padding:0 2px}.pie{margin-top:5mm;padding-top:3mm;border-top:2px solid #e8742b;font-size:10.5px;color:#444}`;
const html = `<!doctype html><meta charset=utf-8><style>${css}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas · frutas · verduras · huevos · setas · champiñones · legumbres — mayorista en Mercamadrid desde hace más de seis décadas</p>
<div class=para>Precios para hostelería · zona Bernabéu, Cuzco y Avenida de Brasil · semana del 27/11/2026</div></div>
<div class=pg>
<p>Hola. Soy <b>Fernando Sanz</b>, de Ferjusanz. Ya servimos en la zona (estamos por allí <b>muchos días de la semana</b>, es parte de nuestra ruta) y os dejo nuestros precios para que los comparéis con lo que pagáis ahora.</p>
<h2>Lo que más se gasta en cocina</h2>
<div class=dest>
<div class=d><b>Patata especial freír</b><span class=pr>${e(g('Patata especial').precio)}</span> <small>/ kg · saco 25 kg: ${e(g('Patata especial').precio * 25)}</small></div>
<div class=d><b>Patata agria</b><span class=pr>${e(g('Patata agria').precio)}</span> <small>/ kg · saco 25 kg: ${e(g('Patata agria').precio * 25)}</small></div>
<div class=d><b>Cebolla</b><span class=pr>${e(g('Cebolla gorda').precio)}</span> <small>/ kg</small></div>
</div>
<h2>Nuestra recomendación de la semana: el tomate</h2>
<div class=rec>El <b>tomate ha bajado mucho</b> estas semanas: es buen momento para ensaladas, salmorejo y sofritos.
Tomate rambo <b>${e(g('Tomate rambo').precio)}/kg</b> · tomate pera <b>${e(g('Tomate pera').precio)}/kg</b> · tomate ensalada <b>${e(g('Tomate ensalada').precio)}/kg</b> · tomate raf <b>${e(raf.precio)}/kg</b>, menos de la mitad que hace un mes.
<br>Cada semana os puedo mandar aparte nuestras recomendaciones: lo que está mejor de precio y de calidad en Mercamadrid.</div>
<h2>Lista completa: ${F.length} productos</h2>
<div class=c><table>${F.map(fila).join('')}</table></div>
<p style="margin-top:4mm">Precios de esta semana, IVA aparte; el género fresco sigue al mercado y en cada pedido va el precio del día. ★ = destacado · <span class=w>oferta</span> = oferta de la semana en nuestra web, hasta el 30/11. Pregúntenos por lo que no esté en la lista: tenemos más de 200 productos, también huevos, legumbres, frutos secos y aceite.</p>
<div class=pie><b>Fernando Sanz</b> · móvil 609 567 354 · WhatsApp pedidos 609 100 690 · www.ferjusanz-frutas-verduras.es<br>
Agricultores de confianza y género elegido cada mañana en Mercamadrid · Reparto refrigerado · Sin pedido mínimo · Cuando queráis, nos vemos y lo hablamos con calma.</div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 794, height: 1123 } });
await p.setContent(html);
await p.pdf({ path: 'Ferjusanz-precios-hosteleria-Bernabeu.pdf', format: 'A4', printBackground: true });
await p.screenshot({ path: 'Ferjusanz-precios-hosteleria-Bernabeu.jpg', fullPage: true, type: 'jpeg', quality: 85 });
await b.close();
