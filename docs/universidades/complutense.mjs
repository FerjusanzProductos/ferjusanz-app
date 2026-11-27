// Propuesta para Universidades Complutense (SALNAYA SL: Informática y Documentación; Juanjo) — Tito, 26/11/2026.
// Uso: node docs/universidades/complutense.mjs <carpeta de salida>
//   → Ferjusanz-Complutense.pdf / .jpg (hoja para WhatsApp) y sql-lista.json + sql-pres.js (lista y presentación en la app).
// Reglas de Tito: patata de saco pequeño a 0,40 (si falla, otra a ~0,50); tomates como Florencio/Barriletes; naranja zumo 0,85;
// el resto, compra del 24/11 en Golden + 0,15 €.
import fs from 'fs'; import { execSync } from 'child_process'; import { createRequire } from 'module';
const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.', F = '/home/user/ferjusanz-app/web/fotos/2026/11/', W = 'https://www.ferjusanz-frutas-verduras.es';
const e = n => n.toFixed(2).replace('.', ',') + ' €';
const lista = [ // [producto, precio, unidad, coste de compra (Golden, 24/11 salvo nota)]
  ['Patata en saco pequeño', 0.40, 'kg', 0.33], ['Patata agria', 0.50, 'kg', 0.42], ['Huevos', 2.20, 'docena', 2.00],
  ['Tomate ensalada', 1.10, 'kg', 1.00], ['Tomate pera', 1.10, 'kg', 1.00], ['Naranja de zumo', 0.90, 'kg', 0.70],
  ['Melón piel de sapo', 1.65, 'kg', 1.50], ['Piña', 1.65, 'kg', 1.50], ['Lechuga iceberg (caja)', 5.90, 'caja', 5.75],
  ['Lechuga iceberg', 0.80, 'pieza', 0.55], ['Cebolla gorda', 0.70, 'kg', 0.45], ['Cebolla calibre pequeño', 0.62, 'kg', null], ['Pimiento rojo', 1.25, 'kg', 1.10],
  ['Pimiento verde', 1.20, 'kg', 1.00], ['Pimiento italiano', 1.95, 'kg', 1.80], ['Aguacate', 1.95, 'kg', 1.80],
  ['Pepino', 0.90, 'kg', 0.75], ['Ajo pelado', 3.60, 'kg', 3.30], ['Manzana golden', 1.00, 'kg', 0.85],
  ['Pera conferencia', 1.75, 'kg', 1.60], ['Plátano', 1.85, 'kg', 1.70], ['Limones', 1.35, 'kg', 1.00], ['Zanahoria', 0.75, 'kg', 0.60],
];
console.assert(lista.every(([, p, , c]) => c == null || p > c), 'precios: siempre por encima de la compra'); // ajustes de Tito 26/11: huevos 2,20, ajo 3,60, limones 1,35…

// ---------- Hoja para enviar (PDF + JPG) ----------
const foto = f => 'data:image/jpeg;base64,' + fs.readFileSync(F + f).toString('base64');
const html = `<!doctype html><meta charset=utf-8><style>
@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}a{color:inherit;text-decoration:none}
.top{background:#7a1f1f;color:#fff;padding:8mm 13mm 6mm}.top h1{margin:0;font-size:30px;letter-spacing:1px}.top p{margin:3px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:4mm;font-size:17px;color:#f39a5c;font-weight:bold}.pg{padding:4mm 13mm}
h2{font-size:17px;color:#7a1f1f;margin:3mm 0 1.5mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.saco{display:flex;gap:5mm;align-items:center;background:#fff6ee;border:2px solid #e8742b;border-radius:4mm;padding:3mm;margin:2mm 0}
.saco img{width:46mm;height:34mm;object-fit:cover;border-radius:3mm}.saco b.p{font-size:30px;color:#7a1f1f;display:block}
.c{column-count:2;column-gap:8mm}table{width:100%;border-collapse:collapse}td{padding:.9mm 2mm;border-bottom:1px solid #eee}
td.p{text-align:right;font-weight:bold;white-space:nowrap;color:#7a1f1f}td.u{color:#777;white-space:nowrap}
.nota{font-size:11px;color:#666}.pie{margin-top:3mm;padding-top:2.5mm;border-top:2px solid #e8742b;font-size:11px;color:#555}</style>
<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid · Tercera generación</p>
<div class=para>Para Juanjo · Informática y Documentación · Universidad Complutense</div></div>
<div class=pg>
<p>Hola, Juanjo:</p>
<p>Llevo toda la semana negociando con mis proveedores para sacaros estos precios. Me lo tomo muy en serio: <b>os voy a cuidar como si fuera mi empresa</b>, y si algo no viene como debe, se cambia en el momento.</p>
<p><b>Os colocamos todo el género</b> y llegamos <b>puntuales</b>. Y no tenéis que preocuparos por subidas: <b>con cada pedido os llega lo que os va a salir</b>, sin sorpresas.</p>
<div class=saco><img src="${foto('novedad-2026-11-21-patata-en-saco.jpg')}"><div><b>Patata en saco pequeño</b><b class=p>0,40 € / kg</b>
<span class=nota>Si con los meses esta patata os da problemas, os paso a otra que no sube más de 0,10 €: en torno a <b>0,50 € / kg</b>. Siempre hablándolo antes con vosotros.</span></div></div>
<h2>Vuestros precios</h2>
<div class=c><table>${lista.slice(1).map(([n, p, u]) => `<tr><td>${n}</td><td class=p>${e(p)}</td><td class=u>/ ${u}</td></tr>`).join('')}</table></div>
<p class=nota>Precios + IVA (4 %). Semana del 26/11/2026; el resto de productos, a precio de mercado: pedidme lo que necesitéis.</p>
<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Móvil 609 567 354 · WhatsApp pedidos 609 100 690 · <a href="${W}">www.ferjusanz-frutas-verduras.es</a></div>
</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
await p.setContent(html); await p.pdf({ path: `${D}/Ferjusanz-Complutense.pdf`, format: 'A4', printBackground: true });
await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/Ferjusanz-Complutense.png`, fullPage: true }); await b.close();
execSync(`python3 -c "from PIL import Image;Image.open('${D}/Ferjusanz-Complutense.png').convert('RGB').save('${D}/Ferjusanz-Complutense.jpg',quality=90)"`);
fs.unlinkSync(`${D}/Ferjusanz-Complutense.png`);

// ---------- Lista de precios y presentación en la app (Comercial › Presentaciones) ----------
const L = s => "'" + String(s).replace(/'/g, "''") + "'";
const LISTA = 'Universidades Complutense', PRES = 'Visita · Universidad Complutense (Juanjo)';
const items = lista.map(([n, p, u, c], i) => `(${L(n)},${p},${L(u)},${c ?? 'null::numeric'},${i})`).join(',');
fs.writeFileSync(`${D}/sql-lista.json`, JSON.stringify({ query: `insert into listas_precios (nombre, tipo, titulo, subtitulo, pie, incluir_recomendaciones)
  select ${L(LISTA)}, 'colectivos', 'Precios · Universidad Complutense', 'Informática y Documentación', 'Precios + IVA (4 %). Semana del 26/11/2026; el resto, a precio de mercado.', false
  where not exists (select 1 from listas_precios where nombre=${L(LISTA)});
delete from listas_precios_items where lista_id=(select id from listas_precios where nombre=${L(LISTA)});
insert into listas_precios_items (lista_id, nombre, precio, unidad, coste, orden, precio_fijo)
  select (select id from listas_precios where nombre=${L(LISTA)}), v.n, v.p, v.u, v.c, v.o, true from (values ${items}) v(n,p,u,c,o);
select (select id from listas_precios where nombre=${L(LISTA)}) lista, (select count(*) from listas_precios_items i join listas_precios l on l.id=i.lista_id where l.nombre=${L(LISTA)}) items;` }));
const mini = f => JSON.parse(execSync(`python3 -c "import base64,io,json;from PIL import Image,ImageOps;i=ImageOps.fit(Image.open('${F + f}').convert('RGB'),(480,360));b=io.BytesIO();i.save(b,'JPEG',quality=72);print(json.dumps({'u':'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode(),'w':480,'h':360}))"`).toString());
const fotos = { 'Patata · 0,40 €/kg': mini('novedad-2026-11-21-patata-en-saco.jpg'), 'Huevos · 2,20 €/doc.': mini('huevos-ferjusanz.jpg'),
  'Naranja zumo · 0,90 €': mini('novedad-2026-11-17-naranja-zumo-v2.jpg'), 'Tomate · 1,10 €/kg': mini('novedad-2026-11-26-tomate-en-rama.jpg') };
const diapos = lid => [
  { t: 'portada', titulo: 'Fruta y verdura, sin preocupaciones', sub: 'Propuesta para Informática y Documentación · UCM', pie: 'Ferjusanz · Mercamadrid' },
  { t: 'lista', titulo: 'Mi compromiso con vosotros', puntos: ['Toda la semana negociando con proveedores', 'Precios ajustados al máximo para vosotros', 'Os cuido como si fuera mi empresa', 'Trato directo conmigo, sin intermediarios', 'Si algo viene mal, se cambia en el momento'] },
  { t: 'lista', titulo: 'Nos encargamos de todo', puntos: ['Os colocamos todo el género', 'Puntuales en cada entrega', 'Con cada pedido, os llega lo que os va a salir', 'Sin preocuparos por subidas de precio', 'Sin sorpresas en la factura', 'Un solo contacto: yo', 'Sin pedido mínimo'] }, // 7 puntos: sin foto lateral
  { t: 'productos', titulo: 'Vuestros básicos', items: Object.keys(fotos), fotos },
  { t: 'lista', titulo: 'Patata a 0,40 €/kg, con garantía', puntos: ['Patata de saco pequeño a 0,40 €/kg', 'Si con los meses os da problemas…', '…os paso a otra, como mucho 0,10 € más', 'En torno a 0,50 €/kg', 'Siempre hablándolo antes con vosotros', 'Calidad homogénea, pedido tras pedido', 'Sin pedido mínimo'] }, // 7 puntos: sin foto lateral (la de turno es patata pelada)
  { t: 'precios', titulo: 'Vuestra tarifa', lista_id: lid, soloEnvio: false, nota: 'Precios + IVA (4 %). Semana del 26/11/2026; el resto, a precio de mercado.', _tipo: 'colectivos' },
  { t: 'contacto', titulo: 'Hablad directamente conmigo', lineas: ['Móvil: 609 567 354', 'WhatsApp pedidos: 609 100 690 · Tel. 91 763 21 86', 'Sin pedido mínimo · reparto refrigerado', 'Carare, 2 – 28033 Madrid · ferjusanz@hotmail.com'] },
];
// La presentación necesita el id de la lista: se escribe con «node … <salida> <id>» tras lanzar sql-lista.json.
if (process.argv[3]) fs.writeFileSync(`${D}/sql-pres.json`, JSON.stringify({ query: `delete from presentaciones where titulo=${L(PRES)}; insert into presentaciones (titulo, diapositivas) values (${L(PRES)}, ${L(JSON.stringify(diapos(process.argv[3])))}::jsonb); select titulo, jsonb_array_length(diapositivas) n from presentaciones where titulo=${L(PRES)};` }));
