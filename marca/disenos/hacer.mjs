// Diseños de imprenta y redes de Ferjusanz (24/11/2026).
// Uso (desde la raíz): node marca/disenos/hacer.mjs
// Saca en marca/disenos/: tarjeta de visita, folleto A5, cartel de ofertas (de web/ofertas.json),
// publicaciones de Instagram y la imagen de ofertas para la ficha de Google, con vistas PNG en vistas/.
// Datos solo los comprobados de web/LEEME.md y docs/FICHA_GOOGLE.md (mismo nombre, teléfono, web y horario: Google los compara).
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const aqui = fileURLToPath(new URL('.', import.meta.url));
const raiz = aqui + '../../';
mkdirSync(aqui + 'vistas', { recursive: true });
const b64 = (p, t) => `data:${t};base64,${readFileSync(raiz + p).toString('base64')}`;
const img = {
  logo: b64('marca/logo/logo-principal.png', 'image/png'),
  logoOsc: b64('marca/logo/logo-principal-fondo-oscuro.png', 'image/png'),
  etiqueta: b64('marca/logo/etiqueta.png', 'image/png'),
  genero: b64('public/pres/f-portada.jpg', 'image/jpeg'),
  furgos: b64('public/pres/f-contacto.jpg', 'image/jpeg'),
  manzana: b64('public/pres/lado1.jpg', 'image/jpeg'),
  patata: b64('public/pres/lado2.jpg', 'image/jpeg'),
  alcachofa: b64('public/pres/lado3.jpg', 'image/jpeg'),
  aguacate: b64('public/pres/lado4.jpg', 'image/jpeg'),
  calabacin: b64('public/pres/f-ancha.jpg', 'image/jpeg'),
};
const f = (n) => b64('web/public/fuentes/' + n, 'font/woff2');

// Datos de contacto: iguales en todo (NAP de Google)
const D = {
  nombre: 'FERJUSANZ', tel: '609 100 690', web: 'www.ferjusanz-frutas-verduras.es',
  correo: 'ferjusanz@hotmail.com', horario: 'Lunes a viernes de 4:30 a 14:00 · sábados de 4:30 a 13:00', zona: 'Madrid y Segovia',
};
// QR de la tarjeta: llama al móvil de Tito (en la tarjeta pone «Fernando Sanz», Tito 25/11/2026: «no pongas Tito») (Tito, 25/11/2026: «el QR con mi número de teléfono»). Librería qrcode-generator (MIT) guardada al lado.
const qrcode = createRequire(import.meta.url)('./qrcode-generator.min.js');
const TITO = '609 567 354';
const qrTito = (() => { const q = qrcode(0, 'M'); q.addData('tel:+34' + TITO.replace(/ /g, '')); q.make(); return q.createSvgTag({ cellSize: 4, margin: 0, scalable: true }); })();
const of = JSON.parse(readFileSync(raiz + 'web/ofertas.json', 'utf8'));
const precio = (n) => n.toFixed(2).replace('.', ',') + ' €';
const fecha = (s) => { const [, m, d] = s.split('-').map(Number); return `${d} de ${['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'][m - 1]}`; };
const fechas = `Del ${fecha(of.desde).replace(/ de \w+$/, of.desde.slice(5, 7) === of.hasta.slice(5, 7) ? '' : '$&')} al ${fecha(of.hasta)}`;

const css = `<meta charset="utf-8"><style>
@font-face{font-family:BC;font-weight:600;src:url(${f('barlow-condensed-latin-600-normal.woff2')})}
@font-face{font-family:BC;font-weight:700;src:url(${f('barlow-condensed-latin-700-normal.woff2')})}
@font-face{font-family:B;font-weight:400;src:url(${f('barlow-latin-400-normal.woff2')})}
@font-face{font-family:B;font-weight:500;src:url(${f('barlow-latin-500-normal.woff2')})}
@font-face{font-family:B;font-weight:600;src:url(${f('barlow-latin-600-normal.woff2')})}
*{box-sizing:border-box;margin:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{font-family:B,sans-serif;color:#161210}
.bc{font-family:BC,sans-serif;font-weight:700;letter-spacing:.01em;line-height:.95}
:root{--noche:#070b1a;--noche2:#0f1630;--sol1:#ffd36b;--sol2:#ff8a3d;--sol3:#f0452b;--oro:#d9a441;--oro1:#f6dd9a;--granate:#6b1216;--verde:#2f7d32;--crema:#fbf6ec;--tinta:#161210}
.cielo{background:radial-gradient(120% 70% at 50% 108%,rgb(255 138 61/.55),rgb(240 69 43/.18) 38%,transparent 62%),linear-gradient(#04060f,#0f1630 70%,#2a1830)}
.sol{background:linear-gradient(90deg,var(--sol1),var(--sol2) 55%,var(--sol3))}
.foto{background-size:cover;background-position:center}
</style>`;
const pag = (w, h, cuerpo, extra = '') => `<!doctype html><html lang="es"><head>${css}<style>@page{size:${w} ${h};margin:0}.p{width:${w};height:${h};position:relative;overflow:hidden;page-break-after:always}${extra}</style></head><body>${cuerpo}</body></html>`;

// 1) Tarjeta de visita 85 x 55 mm + 3 mm de sangrado por lado (91 x 61 mm)
const tarjeta = pag('91mm', '61mm', `
<div class="p" style="background:radial-gradient(90% 90% at 50% 40%,#8a1a1f,#6b1216 60%,#4a0b0e);display:grid;place-items:center">
  <div style="position:absolute;inset:6mm;border:.35mm solid rgb(217 164 65/.7);border-radius:1.2mm"></div>
  <img src="${img.etiqueta}" style="width:66mm">
</div>
<div class="p" style="background:var(--crema);padding:7mm 8mm 6.5mm">
  <div class="sol" style="position:absolute;left:0;right:0;top:0;height:3mm"></div>
  <img src="${img.logo}" style="height:12.5mm">
  <p style="font-size:7.4pt;color:#4b423c;margin-top:2mm;line-height:1.3">Mayorista de frutas y verduras para hostelería y colectividades · ${D.zona}</p>
  <div style="position:absolute;right:8mm;bottom:6.5mm;width:17mm;text-align:center">
    <div style="width:17mm;height:17mm">${qrTito.replace('<svg ', '<svg style="width:100%;height:100%" ')}</div>
    <p style="font-size:5.6pt;color:#4b423c;margin-top:.8mm;line-height:1.15">Escanea<br>y llama</p>
  </div>
  <div style="position:absolute;left:8mm;right:27mm;bottom:6.5mm;font-size:7.6pt;line-height:1.45">
    <p><b class="bc" style="font-size:13pt;color:var(--granate);letter-spacing:.02em">${D.tel}</b> <span style="color:#4b423c">· pedidos y WhatsApp</span></p>
    <p><b class="bc" style="font-size:11pt;color:var(--granate);letter-spacing:.02em">${TITO}</b> <span style="color:#4b423c">· Fernando Sanz</span></p>
    <p style="font-weight:600">${D.web}</p>
    <p>${D.correo}</p>
    <p style="color:#6b5f57">${D.horario}</p>
  </div>
</div>`);

// 2) Folleto A5 (148 x 210 mm), dos caras
const ventajas = [
  ['Tercera generación', 'Más de 60 años en la fruta y la verdura.'],
  ['Elegido cada día', 'En Mercamadrid y con agricultores de confianza.'],
  ['Reparto refrigerado', 'En camiones y furgonetas, en Madrid y Segovia.'],
  ['Sin pedido mínimo', 'Pide hasta la tarde anterior.'],
];
const familias = ['Fruta', 'Verdura y hortaliza', 'Patata, también pelada y cortada', 'Cebolla y ajo', 'Setas y champiñón', 'Legumbres', 'Hierbas', 'Huevos de gallina y codorniz'];
const publicos = [
  ['Restaurantes, bares y hoteles', 'Género que aguanta, patata que vale para todo, limón para barra y aguacate en su punto el día que lo usas.'],
  ['Colegios y escuelas infantiles', 'Fruta en calibre pequeño para el comedor, verdura para cremas y legumbres.'],
  ['Residencias y centros de día', 'Fruta madura y blanda, verdura para purés y guisos, precio estable.'],
  ['Catering y comedores de empresa', 'Pedido fijo semanal, puntualidad y factura clara.'],
];
const folleto = pag('148mm', '210mm', `
<div class="p cielo" style="color:#eef1f8">
  <div class="foto" style="position:absolute;inset:0 0 46%;background-image:linear-gradient(to bottom,rgb(4 6 15/.15),rgb(4 6 15/.0) 40%,#0b1020),url(${img.genero})"></div>
  <img src="${img.logoOsc}" style="position:absolute;top:8mm;left:9mm;height:13mm;filter:drop-shadow(0 1mm 3mm rgb(0 0 0/.6))">
  <div style="position:absolute;left:9mm;right:9mm;top:98mm">
    <h1 class="bc" style="font-size:40pt">Tu cocina,<br><span style="background:linear-gradient(90deg,var(--sol1),var(--sol2),var(--sol3));-webkit-background-clip:text;color:transparent">servida cada mañana</span></h1>
    <p style="font-size:10.5pt;line-height:1.4;margin-top:4mm;color:#c9d0e3;max-width:118mm">Fruta, verdura, patatas, huevos, setas y legumbres para hostelería y colectividades en ${D.zona}.</p>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:3.2mm 6mm;margin-top:7mm">
      ${ventajas.map(([t, d]) => `<div style="border-left:.8mm solid var(--sol2);padding-left:3mm"><p class="bc" style="font-size:13pt;color:#fff">${t}</p><p style="font-size:8.6pt;color:#a9b2ca;line-height:1.3;margin-top:.8mm">${d}</p></div>`).join('')}
    </div>
  </div>
  <div class="sol" style="position:absolute;left:9mm;right:9mm;bottom:9mm;border-radius:3mm;padding:4mm 5mm;color:#1c0a02;display:flex;justify-content:space-between;align-items:center">
    <div><p style="font-size:8.6pt;font-weight:600">Pide precio sin compromiso</p><p class="bc" style="font-size:22pt">WhatsApp ${D.tel}</p></div>
    <p style="font-size:8pt;text-align:right;font-weight:600;line-height:1.35">${D.web}<br>${D.horario.replace('Lunes a viernes, de', 'L-V')}</p>
  </div>
</div>
<div class="p" style="background:var(--crema);padding:10mm 9mm">
  <p class="bc" style="font-size:11pt;color:var(--sol3);letter-spacing:.14em">PARA QUIÉN TRABAJAMOS</p>
  <h2 class="bc" style="font-size:25pt;margin-top:1.5mm">Cocinas que dan de comer a mucha gente</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:4mm;margin-top:5mm">
    ${publicos.map(([t, d], i) => `<div style="background:#fff;border-radius:2.5mm;overflow:hidden;box-shadow:0 .4mm 1.5mm rgb(0 0 0/.08)">
      <div class="foto" style="height:24mm;background-image:url(${[img.aguacate, img.manzana, img.alcachofa, img.patata][i]})"></div>
      <div style="padding:2.6mm 3mm 3mm"><p class="bc" style="font-size:11.5pt;color:var(--granate)">${t}</p><p style="font-size:7.9pt;line-height:1.32;color:#4b423c;margin-top:1mm">${d}</p></div></div>`).join('')}
  </div>
  <p class="bc" style="font-size:11pt;color:var(--sol3);letter-spacing:.14em;margin-top:6mm">MÁS DE 200 PRODUCTOS</p>
  <div style="display:flex;flex-wrap:wrap;gap:1.8mm;margin-top:2.2mm">${familias.map((x) => `<span style="font-size:8.4pt;font-weight:600;padding:1.2mm 2.6mm;border-radius:9mm;background:#fff;border:.3mm solid #e7dcc7">${x}</span>`).join('')}</div>
  <div style="position:absolute;left:9mm;right:9mm;bottom:9mm;display:flex;gap:4mm;align-items:center;border-top:.3mm solid #e2d6bf;padding-top:4mm">
    <div class="foto" style="width:38mm;height:24mm;border-radius:2mm;background-image:url(${img.furgos})"></div>
    <div style="font-size:8.4pt;line-height:1.45"><p class="bc" style="font-size:16pt;color:var(--granate)">${D.tel}</p><p>${D.web}</p><p>${D.correo}</p><p style="color:#6b5f57">${D.horario}. Precio según mercado, al momento.</p></div>
  </div>
</div>`);

// 3) Ofertas de la semana: A4 para imprimir y 1080x1350 para WhatsApp/Instagram
const filas = of.items.map(([p, eur, u]) => `<div class="fila"><span>${p}</span><i></i><b class="bc">${precio(eur)}</b><small>/${u}</small></div>`).join('');
const ofertasCuerpo = (w) => `
<div class="p cielo" style="color:#eef1f8;padding:${w}">
  <div class="foto" style="position:absolute;inset:0 0 auto;height:30%;background-image:linear-gradient(rgb(4 6 15/.35),#070b1a),url(${img.genero});opacity:.9"></div>
  <div style="position:relative">
    <img src="${img.logoOsc}" class="lg">
    <p class="bc eti">${fechas}</p>
    <h1 class="bc tit">Ofertas<br><span style="background:linear-gradient(90deg,var(--sol1),var(--sol2),var(--sol3));-webkit-background-clip:text;color:transparent">de la semana</span></h1>
    <div class="lista">${filas}</div>
    <p class="iva">Precios ${of.nota.replace('+ ', 'más ')}, que se suma al total del pedido.</p>
  </div>
  <div class="sol pie bc">Pídelo por WhatsApp · ${D.tel}</div>
</div>`;
const ofertasCss = (k) => `.lg{height:${12 * k}mm}.eti{display:inline-block;margin-top:${6 * k}mm;font-size:${12 * k}pt;color:#1c0a02;background:var(--oro1);padding:${1 * k}mm ${3 * k}mm;border-radius:9mm}
.tit{font-size:${46 * k}pt;margin-top:${3 * k}mm}.lista{margin-top:${6 * k}mm;background:rgb(7 11 26/.72);border:.3mm solid #26304f;border-radius:${3 * k}mm;padding:${3 * k}mm ${5 * k}mm}
.fila{display:flex;align-items:baseline;gap:${2 * k}mm;padding:${1.55 * k}mm 0;border-bottom:.25mm solid #26304f;font-size:${12.5 * k}pt;font-weight:500}.fila:last-child{border:0}
.fila i{flex:1;border-bottom:.4mm dotted #4a5578;transform:translateY(-1mm)}.fila b{font-size:${17 * k}pt;color:var(--sol1)}.fila small{color:#a9b2ca;font-size:${9.5 * k}pt;min-width:${15 * k}mm}
.iva{margin-top:${3 * k}mm;font-size:${9.5 * k}pt;color:#a9b2ca}.pie{position:absolute;left:0;right:0;bottom:0;text-align:center;color:#1c0a02;font-size:${24 * k}pt;padding:${5 * k}mm}`;
const ofertasA4 = pag('210mm', '297mm', ofertasCuerpo('14mm 16mm'), ofertasCss(1.36));
const ofertasMovil = pag('120mm', '150mm', ofertasCuerpo('7mm 8mm'), ofertasCss(.72));

// 4) Publicaciones de Instagram (1080 x 1350) y 5) imagen de ofertas para la ficha de Google (1200 x 900)
const post = (foto, antetitulo, titulo, linea, oscuro = true) => pag('120mm', '150mm', `
<div class="p" style="background:${oscuro ? '#070b1a' : 'var(--crema)'};color:${oscuro ? '#eef1f8' : 'var(--tinta)'}">
  <div class="foto" style="position:absolute;inset:0 0 34%;background-image:linear-gradient(to bottom,transparent 55%,${oscuro ? '#070b1a' : '#fbf6ec'}),url(${foto})"></div>
  <div style="position:absolute;left:8mm;right:8mm;bottom:8mm">
    <p class="bc" style="font-size:10pt;letter-spacing:.14em;color:${oscuro ? 'var(--sol2)' : 'var(--sol3)'}">${antetitulo}</p>
    <h1 class="bc" style="font-size:29pt;margin-top:1.5mm">${titulo}</h1>
    <p style="font-size:10pt;line-height:1.35;margin-top:2.5mm;color:${oscuro ? '#c9d0e3' : '#4b423c'}">${linea}</p>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:5mm">
      <img src="${oscuro ? img.logoOsc : img.logo}" style="height:8.5mm">
      <span class="sol bc" style="color:#1c0a02;font-size:12pt;padding:1.6mm 3.4mm;border-radius:9mm">WhatsApp ${D.tel}</span>
    </div>
  </div>
</div>`);
const posts = [
  ['post-patata-pelada', post(img.patata, 'PARA COCINAS DE HOSTELERÍA', 'Patata pelada: de la bolsa a la freidora', 'Menos horas pelando y menos merma. Pelada y cortada, lista para tu cocina.')],
  ['post-manzana-colegio', post(img.manzana, 'COMEDORES ESCOLARES', '¿Por qué al colegio le mandamos la manzana pequeña?', 'Calibre 24-26: una pieza por niño, sin tirar media fruta.', false)],
  ['post-un-proveedor', post(img.furgos, 'MADRID Y SEGOVIA', 'Un solo proveedor para toda tu cocina', 'Fruta, verdura, patatas, huevos, setas y legumbres. Sin pedido mínimo y con reparto refrigerado.')],
];
const google = pag('160mm', '120mm', `
<div class="p cielo" style="color:#eef1f8;display:grid;grid-template-columns:1fr 1fr">
  <div class="foto" style="background-image:url(${img.genero})"></div>
  <div style="padding:9mm 8mm">
    <img src="${img.logoOsc}" style="height:9mm">
    <h1 class="bc" style="font-size:26pt;margin-top:5mm">Ofertas<br>de la semana</h1>
    <p class="bc" style="font-size:11pt;color:var(--oro1);margin-top:1.5mm">${fechas}</p>
    <div style="margin-top:3.5mm;font-size:8.6pt;line-height:1.5">${of.items.slice(0, 6).map(([p, eur, u]) => `<p style="display:flex;justify-content:space-between;border-bottom:.2mm solid #26304f"><span>${p}</span><b>${precio(eur)}/${u}</b></p>`).join('')}</div>
    <p style="font-size:7.4pt;color:#a9b2ca;margin-top:2mm">Y ${of.items.length - 6} más. Precios ${of.nota.replace('+ ', 'más ')}.</p>
  </div>
</div>`);

const nav = await chromium.launch();
const p = await nav.newPage();
const pdf = async (html, nombre) => {
  await p.setContent(html, { waitUntil: 'load' });
  await p.pdf({ path: aqui + nombre + '.pdf', preferCSSPageSize: true, printBackground: true });
};
const png = async (html, nombre, ancho, mmAncho, mmAlto) => {
  const pxmm = 96 / 25.4, w = Math.round(mmAncho * pxmm), h = Math.round(mmAlto * pxmm);
  const v = await nav.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: ancho / w });
  await v.setContent(html, { waitUntil: 'load' });
  const n = await v.locator('.p').count();
  for (let i = 0; i < n; i++) await v.locator('.p').nth(i).screenshot({ path: aqui + nombre + (n > 1 ? `-${i + 1}` : '') + '.png' });
  await v.close();
};
await pdf(tarjeta, 'tarjeta-visita'); await png(tarjeta, 'vistas/tarjeta-visita', 1100, 91, 61);
await pdf(folleto, 'folleto-A5'); await png(folleto, 'vistas/folleto-A5', 1240, 148, 210);
await pdf(ofertasA4, 'ofertas-A4'); await png(ofertasA4, 'vistas/ofertas-A4', 1240, 210, 297);
await png(ofertasMovil, 'ofertas-whatsapp', 1080, 120, 150);
for (const [n, h] of posts) await png(h, n, 1080, 120, 150);
await png(google, 'google-ofertas', 1200, 160, 120);
await nav.close();
// Comprobación: los precios de las imágenes salen de ofertas.json, nunca a mano
console.assert(of.items.every(([, e]) => typeof e === 'number' && e > 0), 'precio raro en ofertas.json');
console.log('Hecho en marca/disenos/ (' + fechas + ', ' + of.items.length + ' ofertas)');
