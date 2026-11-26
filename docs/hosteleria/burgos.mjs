// Bar/Restaurante Burgos (REBU; Emilio, el jefe, va él a Mercamadrid) — Tito, 26/11/2026.
// Uso: node docs/hosteleria/burgos.mjs <carpeta de salida> [id de la lista en la app]
//   → Ferjusanz-Burgos.pdf (2 hojas), Ferjusanz-Burgos-1-lo-que-te-ahorras.jpg y -2-precios.jpg, sql-lista.json y (con id) sql-pres.json.
// Precios de Tito sobre la compra de Golden 14-24/11: patata especial freír y cebolla gorda + 0,10; pimientos + 0,25; zanahoria + 0,20;
// tomate pera como Duarte (1,25); mezcluna 2,45; iceberg 0,95 pieza; naranja 0,90. Tomates de carta (rama, RAF) como Padel Spirit (compra + 0,20).
// En la hoja solo el móvil de Tito (609 567 354), nunca el 609 100 690.
import fs from 'fs'; import { execSync } from 'child_process'; import { createRequire } from 'module';
const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', F = '/home/user/ferjusanz-app/web/fotos/', W = 'https://www.ferjusanz-frutas-verduras.es', TEL = '609 567 354';
const e = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const e0 = n => Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' }) + ' €';
const lista = [ // [producto, precio, unidad, compra Golden, margen pedido por Tito (null = precio dado por él)]
  ['Patata especial freír', 0.52, 'kg', 0.42, 0.10], ['Cebolla gorda', 0.55, 'kg', 0.45, 0.10],
  ['Tomate pera', 1.25, 'kg', 1.00, null], ['Tomate en rama', 1.70, 'kg', 1.50, 0.20], ['Tomate RAF', 2.00, 'kg', 1.80, 0.20],
  ['Lechuga mezcluna', 2.45, 'kg', null, null], ['Lechuga iceberg', 0.95, 'pieza', 0.55, null], ['Naranja de zumo', 0.90, 'kg', 0.75, null],
  ['Pimiento rojo de primera', 2.15, 'kg', 1.90, 0.25], ['Pimiento rojo de segunda', 1.35, 'kg', 1.10, 0.25], ['Pimiento verde', 1.25, 'kg', 1.00, 0.25],
  ['Pimiento italiano', 2.05, 'kg', 1.80, 0.25], ['Pimiento de Padrón', 1.75, 'kg', 1.50, 0.25], ['Zanahoria', 0.80, 'kg', 0.60, 0.20],
];
console.assert(lista.every(([, p, , c, m]) => m == null || Math.abs(p - c - m) < 0.001), 'margen de Tito sobre la compra');

// ---- Lo que le cuesta ir él a Mercamadrid (a la semana). Supuestos a la vista en la hoja. ----
const SAC = 8, KG = SAC * 25, PAT = lista[0][1];
const S = { viajes: 2, km: 40, eurKm: 0.26, horas: 2.5, eurHora: 15, patataAlli: 0.58 }; // 0,26 €/km: lo que Hacienda da por km en coche; 0,58: lo que nos cobran a nosotros por sacos sueltos (0,50-0,66)
const coche = S.viajes * S.km * S.eurKm, tiempo = S.viajes * S.horas * S.eurHora, patAlli = KG * S.patataAlli, patNos = KG * PAT;
const tu = patAlli + coche + tiempo, nos = patNos, sem = tu - nos, mes = sem * 52 / 12;
console.assert(Math.abs(sem - (KG * (S.patataAlli - PAT) + coche + tiempo)) < 1e-9 && sem > 0, 'ahorro semanal');

const tmp = fs.mkdtempSync('/tmp/claude-0/burgos-');
const img = (f, l = 640) => { const o = `${tmp}/${f.replace(/\W/g, '_')}.jpg`; // fotos reducidas para que el PDF pese poco
  execSync(`python3 -c "from PIL import Image;i=Image.open('${F}${f}').convert('RGB');i.thumbnail((${l},${l}));i.save('${o}',quality=82)"`);
  return 'data:image/jpeg;base64,' + fs.readFileSync(o).toString('base64'); };
const FOTO = { pat: 'catalogo/01-patata-en-saco.jpg', rama: '2026/11/novedad-2026-11-26-tomate-en-rama.jpg', raf: '2026/11/novedad-2026-11-17-tomate-raf-v2.jpg',
  rojo: '2026/11/novedad-2026-11-26-pimiento-rojo-grande-v2.jpg', ital: '2026/11/novedad-2026-11-26-pimiento-verde-italiano.jpg', nar: '2026/11/novedad-2026-11-17-naranja-zumo-v2.jpg',
  camion: '2026/11/novedad-2026-11-26-nuestro-camion-refrigerado.jpg' };

// barras apiladas: [etiqueta, [[trozo, €, color]...]]
const apiladas = (filas, w = 760) => { const max = Math.max(...filas.map(f => f[1].reduce((s, t) => s + t[1], 0))), x0 = 190, bw = w - x0 - 110, alto = 46, fila = 70;
  return `<svg viewBox="0 0 ${w} ${filas.length * fila + 8}" width="100%">${filas.map(([n, ts], i) => { let x = x0; const y = i * fila + 6, tot = ts.reduce((s, t) => s + t[1], 0);
    return `<text x="${x0 - 12}" y="${y + 30}" text-anchor="end" font-size="16" font-weight="bold" fill="#2a2320">${n}</text>` + ts.map(([t, v, col]) => { const ww = bw * v / max, r = `<rect x="${x}" y="${y}" width="${ww}" height="${alto}" fill="${col}"/>${ww > 70 ? `<text x="${x + ww / 2}" y="${y + 29}" text-anchor="middle" font-size="13" fill="#fff" font-weight="bold">${t} ${e0(v)}</text>` : ''}`; x += ww; return r; }).join('') +
      `<text x="${x + 8}" y="${y + 30}" font-size="19" font-weight="bold" fill="#7a1f1f">${e0(tot)}</text>`; }).join('')}</svg>`; };
const C = { pat: '#c9a227', coche: '#8a7f76', hora: '#b0473a', nos: '#e8742b' };

const css = `@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.h{width:210mm;height:297mm;overflow:hidden;position:relative;page-break-after:always}
.top{background:#7a1f1f;color:#fff;padding:7mm 13mm 5mm}.top h1{margin:0;font-size:28px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:3mm;font-size:17px;color:#f39a5c;font-weight:bold}.pg{padding:4mm 13mm}
h2{font-size:17px;color:#7a1f1f;margin:4mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.kpis{display:flex;gap:4mm;margin:3mm 0}.k{flex:1;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:3mm;text-align:center}.k b{display:block;font-size:25px;color:#7a1f1f}.k span{font-size:12px;color:#555}
.ley{font-size:12px;color:#555;margin-bottom:1mm}.ley i{display:inline-block;width:11px;height:11px;border-radius:2px;margin:0 4px 0 10px;vertical-align:-1px}
.dos{display:flex;gap:6mm}.dos>div{flex:1}ul{margin:1mm 0;padding-left:5mm}li{margin:1mm 0}
.sup{background:#f6f2ea;border-radius:3mm;padding:2.5mm 4mm;font-size:11.5px;color:#555;margin-top:3mm}
table{width:100%;border-collapse:collapse}td{padding:1.1mm 2.5mm;border-bottom:1px solid #eee}tr:nth-child(odd) td{background:#fff6ee}
td.p{text-align:right;font-weight:bold;font-size:14px;white-space:nowrap;color:#7a1f1f}td.u{color:#777;white-space:nowrap;width:16mm}
.fotos{display:grid;grid-template-columns:repeat(3,1fr);gap:3mm;margin:2mm 0}.f{background:#fff;border:1px solid #eadfd4;border-radius:3mm;overflow:hidden}
.f img{width:100%;height:33mm;object-fit:cover;display:block}.f b{display:block;padding:1.5mm 2.5mm 0;font-size:13px}.f span{display:block;padding:0 2.5mm 1.5mm;color:#7a1f1f;font-weight:bold;font-size:15px}
.carta{display:flex;gap:4mm;align-items:center;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:3mm;margin:2mm 0}.carta img{width:34mm;height:26mm;object-fit:cover;border-radius:2mm}
.nota{font-size:11px;color:#666}.col{column-count:2;column-gap:6mm}.col td{font-size:12.5px}.pie{position:absolute;left:13mm;right:13mm;bottom:8mm;padding-top:2.5mm;border-top:2px solid #e8742b;font-size:11.5px;color:#555}`;
const cab = sub => `<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Más de seis décadas</p><div class=para>${sub}</div></div>`;
const pie = `<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Móvil y WhatsApp <b>${TEL}</b> · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>`;
const precio = n => { const r = lista.find(x => x[0] === n); return `${e(r[1])} / ${r[2]}`; };

const hoja1 = `<div class=h>${cab('Para Emilio · Bar Burgos · Lo que te ahorras sin ir a Mercamadrid')}<div class=pg>
<p>Hola, Emilio:</p>
<p>Hace años ya os llevábamos el género, y me han dicho que ahora vas tú a Mercamadrid. Te he hecho la cuenta de lo que te cuesta <b>de verdad</b> cada semana, con tus <b>${SAC} sacos de patata de 25 kg</b>:</p>
<div class=kpis><div class=k><b>${e0(sem)}</b><span>a la semana</span></div><div class=k><b>${e0(mes)}</b><span>al mes</span></div><div class=k><b>${e0(sem * 52)}</b><span>al año</span></div><div class=k><b>${S.viajes * S.horas} h</b><span>libres cada semana</span></div></div>
<h2>Una semana, solo con la patata</h2>
<div class=ley><i style="background:${C.pat}"></i>Patata<i style="background:${C.coche}"></i>Coche<i style="background:${C.hora}"></i>Tus horas<i style="background:${C.nos}"></i>Patata con Ferjusanz, en la puerta</div>
${apiladas([['Vas tú', [['Patata', patAlli, C.pat], ['Coche', coche, C.coche], ['Horas', tiempo, C.hora]]], ['Con Ferjusanz', [['Patata', patNos, C.nos]]]])}
<div class=dos><div><h2>Lo que te cuesta ir tú</h2><ul>
<li><b>Madrugar</b> ${S.viajes} días a la semana, antes de abrir el bar.</li>
<li><b>Unos ${S.viajes * S.km} km de coche</b> a la semana: gasolina, desgaste y la entrada a Mercamadrid.</li>
<li><b>${S.viajes * S.horas} horas</b> que no estás en el bar: ir, buscar, cargar y volver.</li>
<li><b>Cargar ${KG} kg</b> de patata a pulso cada semana.</li>
<li>Y la patata <b>más cara</b>: por sacos sueltos se paga más que comprando por camiones, como hacemos nosotros.</li></ul></div>
<div><h2>Con nosotros</h2><ul>
<li>Patata especial freír a <b>${e(PAT)}/kg</b>: el saco de 25 kg, <b>${e(PAT * 25)}</b>.</li>
<li>Te lo llevamos <b>al bar</b>, en camión refrigerado.</li>
<li><b>Llevo yo el control</b>: te digo a cuánto va cada cosa antes de que pidas.</li>
<li>Siempre <b>ofertas y novedades</b> en nuestra web.</li>
<li>Y tú, descansado y en tu negocio.</li></ul></div></div>
<div class=sup><b>Cómo está hecha la cuenta</b> (por lo bajo): ${S.viajes} viajes a la semana · ${S.km} km ida y vuelta · ${e(S.eurKm)} por km (lo que Hacienda considera que cuesta cada km en coche) · ${String(S.horas).replace('.', ',')} h por viaje · tu hora a ${e0(S.eurHora)} · la patata allí, por sacos sueltos, a ${e(S.patataAlli)}/kg. Si vas más veces o compras más cosas, te ahorras más. Precios + 4 % de IVA.</div>
</div>${pie}</div>`;

const hoja2 = `<div class=h>${cab('Para Emilio · Bar Burgos · Tus precios · 26 de noviembre de 2026')}<div class=pg>
<div class=fotos>${[['Patata especial freír', 'pat'], ['Tomate en rama', 'rama'], ['Tomate RAF', 'raf'], ['Pimiento rojo de primera', 'rojo'], ['Pimiento italiano', 'ital'], ['Naranja de zumo', 'nar']]
  .map(([n, f]) => `<div class=f><img src="${img(FOTO[f])}"><b>${n}</b><span>${precio(n)}</span></div>`).join('')}</div>
<div class=carta><img src="${img(FOTO.raf, 400)}"><div><b style="font-size:16px;color:#7a1f1f">Un tomate de los buenos para tu carta</b><br>
<b>Tomate RAF</b> a ${precio('Tomate RAF')} y <b>tomate en rama</b> a ${precio('Tomate en rama')}. Para una ensalada o una tosta que se note. Dime y te lo llevo con el pedido para que lo veas.</div></div>
<h2>Todos tus precios</h2>
<div class=col><table>${lista.map(([n, p, u]) => `<tr><td>${n}${n.startsWith('Patata') ? `<br><span class=nota>saco de 25 kg: ${e(p * 25)}</span>` : ''}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}</table></div>
<p class=nota>Precios + 4 % de IVA. El resto, según mercado: pídeme precio de lo que necesites.</p>
<p><b>Llevo yo el control</b>: antes de que pidas te digo a cuánto va cada cosa, sin sorpresas. Y siempre tenemos <b>ofertas y novedades</b> en <a href="${W}/#ofertas"><b>ferjusanz-frutas-verduras.es</b></a>.</p>
<p>Escríbeme cuando quieras al <b>${TEL}</b>. Un saludo,</p>
</div>${pie}</div>`;

const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(`<!doctype html><meta charset=utf-8><style>${css}</style>${hoja1}${hoja2}`);
await p.pdf({ path: `${D}/Ferjusanz-Burgos.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 });
for (const [k, n] of [[0, '1-lo-que-te-ahorras'], [1, '2-precios']]) await p.locator('.h').nth(k).screenshot({ path: `${D}/Ferjusanz-Burgos-${n}.jpg`, type: 'jpeg', quality: 88 });
await b.close();
console.log({ semana: +sem.toFixed(2), mes: +mes.toFixed(2), año: +(sem * 52).toFixed(2), tu, nos, coche, tiempo });

// ---------- Lista de precios y presentación en la app (Comercial › Presentaciones) ----------
const L = s => "'" + String(s).replace(/'/g, "''") + "'";
const LISTA = 'Bar Burgos (Emilio)', PRES = 'Visita · Bar Burgos (Emilio)';
const items = lista.map(([n, p, u, c], i) => `(${L(n)},${p},${L(u)},${c ?? 'null::numeric'},${i})`).join(',');
fs.writeFileSync(`${D}/sql-lista.json`, JSON.stringify({ query: `insert into listas_precios (nombre, tipo, titulo, subtitulo, pie, incluir_recomendaciones)
  select ${L(LISTA)}, 'hosteleria', 'Precios · Bar Burgos', 'Para Emilio', 'Precios + 4 % de IVA. Semana del 26/11/2026; el resto, según mercado.', false
  where not exists (select 1 from listas_precios where nombre=${L(LISTA)});
delete from listas_precios_items where lista_id=(select id from listas_precios where nombre=${L(LISTA)});
insert into listas_precios_items (lista_id, nombre, precio, unidad, coste, orden, precio_fijo)
  select (select id from listas_precios where nombre=${L(LISTA)}), v.n, v.p, v.u, v.c, v.o, true from (values ${items}) v(n,p,u,c,o);
select (select id from listas_precios where nombre=${L(LISTA)}) lista, (select count(*) from listas_precios_items i join listas_precios l on l.id=i.lista_id where l.nombre=${L(LISTA)}) items;` }));
if (process.argv[3]) {
  const mini = f => JSON.parse(execSync(`python3 -c "import base64,io,json;from PIL import Image,ImageOps;i=ImageOps.fit(Image.open('${F + f}').convert('RGB'),(480,360));b=io.BytesIO();i.save(b,'JPEG',quality=72);print(json.dumps({'u':'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode(),'w':480,'h':360}))"`).toString());
  const fotos = { [`Patata freír · ${e(PAT)}`]: mini(FOTO.pat), 'Tomate en rama · 1,70 €': mini(FOTO.rama), 'Tomate RAF · 2,00 €': mini(FOTO.raf),
    'Pimiento rojo · 2,15 €': mini(FOTO.rojo), 'Pimiento italiano · 2,05 €': mini(FOTO.ital), 'Naranja zumo · 0,90 €': mini(FOTO.nar) };
  const diapos = [
    { t: 'portada', titulo: 'Deja de madrugar para ir a Mercamadrid', sub: 'Para Emilio · Bar Burgos', pie: 'Ferjusanz · Mercamadrid · tercera generación' },
    { t: 'texto', titulo: 'Lo que te ahorras', texto: `Con tus ${SAC} sacos de patata a la semana y ${S.viajes} viajes a Mercamadrid.`,
      cifras: [[e0(sem), 'a la semana'], [e0(mes), 'al mes'], [e0(sem * 52), 'al año'], [`${S.viajes * S.horas} h`, 'libres cada semana']] },
    { t: 'lista', titulo: 'Ir tú a Mercamadrid te cuesta', puntos: [`Madrugar ${S.viajes} días a la semana`, `Unos ${S.viajes * S.km} km de coche a la semana`, `${S.viajes * S.horas} horas fuera del bar`, `Cargar ${KG} kg de patata a pulso`, 'Y la patata, más cara por sacos sueltos', 'Cansado antes de abrir el bar', 'Y la entrada a Mercamadrid'] }, // 7 puntos: sin foto lateral al azar,
    { t: 'productos', titulo: 'Tus precios, con fotos', items: Object.keys(fotos), fotos },
    { t: 'lista', titulo: 'Un tomate bueno para tu carta', puntos: ['Tomate RAF a 2,00 €/kg', 'Tomate en rama a 1,70 €/kg', 'Elegido cada mañana en Mercamadrid', 'Para una ensalada o tosta que se note', 'Dime y te lo llevo con el pedido', 'Pídeme precio de otros tomates', 'Siempre te digo antes a cuánto va'] },
    { t: 'lista', titulo: 'Llevo yo el control', puntos: ['Te digo a cuánto va cada cosa antes de pedir', 'Siempre ofertas y novedades en la web', 'Te lo llevamos al bar, sin madrugar', 'En camión refrigerado', 'Sin pedido mínimo', 'Trato directo conmigo', `Escríbeme al ${TEL}`] },
    { t: 'precios', titulo: 'Tus precios', lista_id: process.argv[3], soloEnvio: false, nota: 'Precios + 4 % de IVA. Semana del 26/11/2026; el resto, según mercado.', _tipo: 'hosteleria' },
    { t: 'contacto', titulo: 'Fernando Sanz, tu contacto directo', lineas: [`Móvil y WhatsApp: ${TEL}`, 'Sin pedido mínimo · reparto refrigerado', 'Ofertas y novedades: ferjusanz-frutas-verduras.es'] },
  ];
  fs.writeFileSync(`${D}/sql-pres.json`, JSON.stringify({ query: `delete from presentaciones where titulo=${L(PRES)}; insert into presentaciones (titulo, diapositivas) values (${L(PRES)}, ${L(JSON.stringify(diapos))}::jsonb); select titulo, jsonb_array_length(diapositivas) n from presentaciones where titulo=${L(PRES)};` }));
}
