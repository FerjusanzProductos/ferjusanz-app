import fs from 'fs'; import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2], W = 'https://www.ferjusanz-frutas-verduras.es', N = W + '/novedades/';
const img = f => 'data:image/jpeg;base64,' + fs.readFileSync(`${D}/f/${f}.jpg`).toString('base64');
const fotos = [
 ['novedad-2026-11-26-tomate-asurcado','Tomate asurcado','Recién llegado hoy'],
 ['novedad-2026-11-26-tomate-de-temporada-en-caja-de-madera','Tomate de temporada','En caja de madera'],
 ['novedad-2026-11-17-tomate-raf-v2','Tomate RAF','Para ensaladas con sabor'],
 ['novedad-2026-11-21-tomate-cherry-de-colores','Cherry de colores','Para emplatar bonito'],
 ['novedad-2026-11-21-boletus','Boletus','Setas de temporada'],
 ['novedad-2026-11-21-setas-de-ostra','Setas de ostra','Para plancha y revueltos'],
 ['novedad-2026-11-17-champinon-grande-v2','Champiñón grande','Gordo, para rellenar'],
 ['novedad-2026-11-26-pimiento-rojo-grande','Pimiento rojo grande','Para asar'],
 ['novedad-2026-11-21-patata-en-saco','Patata en saco','Varias variedades'],
 ['novedad-2026-11-17-patata-baston-grueso-v3','Patata pelada','Corte bastón grueso'],
 ['huevos-ferjusanz','Huevos','Morenos, muy buenos', W + '/productos/huevos/'],
 ['novedad-2026-11-17-alcachofas-v2','Alcachofas','Entrando en temporada'],
 ['novedad-2026-11-26-brocoli-con-hielo','Brócoli con hielo','Fresco del día'],
 ['novedad-2026-11-17-aguacate-hass-v2','Aguacate Hass','Listo para tostas'],
 ['novedad-2026-11-26-granada-mollar-de-elche-d-o-p','Granada mollar de Elche','D.O.P., muy dulce'],
 ['novedad-2026-11-26-nuestro-camion-refrigerado','Nuestro camión','Reparto refrigerado'],
];
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const kg = 0.65, saco = 25, total = Math.round(kg * saco * 100) / 100, conIva = Math.round(total * 1.04 * 100) / 100;
console.assert(total === 16.25 && conIva === 16.9, 'cuenta del saco');
const of = JSON.parse(fs.readFileSync('/home/user/ferjusanz-app/web/ofertas.json')).items.filter(i => !['Huevos','Limón nuevo','Naranja de zumo','Pimiento de Padrón','Cebolla'].includes(i[0]));
const tus = [['Patata agria (saco de 25 kg: ' + e(total) + ')', kg, 'kg'], ['Cebolla pequeña', 0.65, 'kg'], ['Limón de segunda', 1.10, 'kg'], ['Pimiento de Padrón', 2.00, 'kg'], ['Naranja de zumo', 0.80, 'kg'], ['Huevos tamaño L', 2.20, 'docena']];
const grid = fotos.map(([f, t, s, u]) => `<a class=c href="${u || N}"><img src="${img(f)}"><b>${t}</b><span>${s}</span></a>`).join('');
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:12.5px/1.45 Arial,sans-serif;color:#2a2320}
a{color:inherit;text-decoration:none}.pg{padding:14mm 13mm 10mm}
.top{background:#7a1f1f;color:#fff;padding:12mm 13mm 9mm}.top h1{margin:0;font-size:30px;letter-spacing:1px}.top p{margin:3px 0 0;color:#f6dcc8}
.para{margin-top:6mm;font-size:16px;color:#e8742b;font-weight:bold}
h2{font-size:17px;color:#7a1f1f;margin:7mm 0 2mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.box{display:flex;gap:6mm;background:#fff6ee;border:1.5px solid #e8742b;border-radius:10px;padding:5mm;margin-top:3mm;align-items:center}
.box img{width:46mm;height:46mm;object-fit:cover;border-radius:8px}.box .t{flex:1}.box h3{margin:0 0 1mm;font-size:19px;color:#7a1f1f}
.pr{font-size:24px;font-weight:bold;color:#7a1f1f}.pr small{font-size:13px;color:#555;font-weight:normal}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:3.5mm}.c{display:block;border:1px solid #eadfd6;border-radius:8px;overflow:hidden;break-inside:avoid}
.c img{width:100%;aspect-ratio:1;object-fit:cover;display:block}.c b{display:block;padding:1.5mm 2mm 0;font-size:12px}.c span{display:block;padding:0 2mm 2mm;color:#777;font-size:10.5px}
table{width:100%;border-collapse:collapse}td{padding:1.6mm 2mm;border-bottom:1px solid #eee}td.p{text-align:right;font-weight:bold;white-space:nowrap}.cols{column-count:2;column-gap:8mm}
.btn{display:inline-block;background:#e8742b;color:#fff;font-weight:bold;padding:2.5mm 5mm;border-radius:20px;margin:2mm 2mm 0 0}
.pie{margin-top:6mm;padding-top:3mm;border-top:2px solid #e8742b;font-size:11px;color:#555}.brk{break-before:page;padding-top:10mm}
</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Más de 40 años y tres generaciones</p>
<div class=para>Para Claudia · Taberna El Silo · 26 de noviembre de 2026</div></div>
<div class=pg>
<p>Hola, Claudia:</p>
<p>Muchas gracias por atenderme hoy en la taberna. Como te comenté, te dejo lo que tenemos ahora mismo en el puesto, con fotos de <b>nuestro propio género</b> (pulsa en cualquier foto para verlo en nuestra web).</p>
<h2>La patata agria, a vuestra medida</h2>
<div class=box><img src="${img('novedad-2026-11-21-patata-en-saco')}"><div class=t>
<h3>Patata agria</h3><div class=pr>${e(kg)}/kg <small>· saco de ${saco} kg</small></div>
<div class=pr>${e(total)} el saco <small>(${e(conIva)} con el 4 % de IVA)</small></div></div></div>
<p>Sabemos que trabajáis con patata agria y que es muy importante en vuestra cocina. Nosotros trabajamos con <b>distintas variedades</b> y la agria os va a venir muy bien.</p>
<p>Como ya os contó en su día el especialista en patata, <b>no conviene trabajar siempre con la misma patata</b>: va cambiando con el tiempo, con los cambios de temperatura y con la conservación. Por eso la elegimos cada mañana en Mercamadrid y os llevamos la que mejor responda en cada momento, para que la fritura salga siempre igual de buena.</p>
<h2>Huevos</h2>
<div class=box><img src="${img('huevos-ferjusanz')}"><div class=t><h3>Huevos morenos, tamaño L</h3><div class=pr>${e(2.20)} <small>la docena</small></div><p style="margin:1mm 0 0">Salen muy buenos: yema bonita y buen calibre.</p></div></div>
<h2 class=brk>Novedades del puesto</h2>
<div class=g>${grid}</div>
<h2 class=brk>Tus precios, Claudia</h2>
<table>${tus.map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)} / ${u}</td></tr>`).join('')}<tr><td>Perejil</td><td class=p>de regalo con el pedido</td></tr></table>
<h2>Más ofertas de la semana (hasta el 30/11)</h2>
<div class=cols><table>${of.map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)} / ${u}</td></tr>`).join('')}</table></div>
<p style="font-size:11px;color:#666">Precios + 4 % de IVA. El resto, según mercado: pídenos precio de lo que necesites.</p>
<h2>Quedo pendiente</h2>
<p>Quedo pendiente de lo que me digas. Si queréis probar, os preparamos un primer pedido sin compromiso y <b>sin pedido mínimo</b>, con reparto refrigerado. Cualquier duda, escríbeme a este mismo WhatsApp.</p>
<a class=btn href="${N}">Ver todas las novedades</a><a class=btn href="${W}/proveedor-de-frutas-y-verduras-para-hosteleria-madrid/">Hostelería</a><a class=btn href="https://wa.me/34609100690">Pedidos por WhatsApp</a>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Mercamadrid · Pedidos por WhatsApp 609 100 690 · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 1 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-Taberna-El-Silo.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/vista.png`, fullPage: true }); await b.close();
