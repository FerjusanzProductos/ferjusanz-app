// Complutense (SALNAYA SL: INFORMATICA y DOCU): «Lo que os ahorraríais» con sus pedidos reales de Golden, y la lista de precios sola.
// Uso: NODE_USE_ENV_PROXY=1 node docs/universidades/complutense-comparativa.mjs <carpeta de salida>
// Precios nuevos: la lista «Universidades Complutense» de la base real (la misma de la presentación).
import { createRequire } from 'module'; const { chromium } = createRequire('/home/user/ferjusanz-app/')('playwright');
const D = process.argv[2] || '.';
const sql = async q => { const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', { method: 'POST',
  headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status); return r.json(); };
const lista = (await sql(`select i.nombre, i.precio::float precio, i.unidad from listas_precios_items i join listas_precios l on l.id=i.lista_id
  where l.nombre='Universidades Complutense' order by i.orden`));
const P = Object.fromEntries(lista.map(x => [x.nombre, x.precio]));
// código Golden → nombre en su lista. Sin aguacate (en Golden va por piezas y aquí por kg). Iceberg: caja (94-C) y pieza (94); en Golden hay «piezas» a 8-16 €, que son cajas (Tito 27/11: no dejar la iceberg sin comparar).
// La patata agria se compara con la de saco pequeño (0,40), que es la que se les ofrece.
const cod = { '01': 'Patata en saco pequeño', '29': 'Huevos', '91-B': 'Tomate ensalada', '91-D': 'Tomate pera', '42': 'Naranja de zumo',
  '93': 'Melón piel de sapo', '150': 'Piña', '21': 'Cebolla gorda', '111': 'Pimiento rojo', '110': 'Pimiento verde', '118': 'Pimiento italiano',
  '116': 'Pepino', '34': 'Ajo pelado', '105': 'Manzana golden', '40': 'Limones', '159': 'Zanahoria', '104': 'Plátano', '94-C': 'Lechuga iceberg (caja)', '94': 'Lechuga iceberg' };
console.assert(Object.values(cod).every(n => P[n] > 0), 'todos los productos comparados están en la lista');
const rows = (await sql(`select coalesce(l.albaran,'') alb, f.fecha::text fecha, f.cliente_codigo cli, l.producto_codigo cod, l.descripcion d, l.cantidad::float q, l.precio::float p
  from golden_lineas l join golden_facturas f on f.numero=l.factura_numero
  where f.cliente_nombre='SALNAYA SL' and not coalesce(l.repetida,false) and l.cantidad>0`))
  .map(r => r.cod === '94' && r.p > 3 ? { ...r, cod: '94-C' } : r)
  .map(r => ({ ...r, n: cod[r.cod] || r.d, pn: cod[r.cod] ? Math.min(P[cod[r.cod]], r.p) : r.p })); // nunca «ahorro» negativo inventado: si ya pagaba menos, se deja
const curso = rows.filter(r => r.fecha >= '2026-09-01'), meses = 2; // septiembre y octubre: meses de curso completos
const sum = (rs, f) => rs.reduce((s, r) => s + f(r), 0), A = rs => sum(rs, r => r.q * r.p), N = rs => sum(rs, r => r.q * r.pn);
const fechaAlb = a => (a.match(/(\d\d)\/(\d\d)\/(\d{4})/) || []);
const albs = [...new Set(rows.map(r => r.alb).filter(a => fechaAlb(a)[0]))].sort((x, y) => { const a = fechaAlb(x), b = fechaAlb(y); return (a[3] + a[2] + a[1]).localeCompare(b[3] + b[2] + b[1]); }).slice(-2);
const fac = c => c === 'DOCU' ? 'Documentación' : 'Informática';
const [pen, ult] = albs.map(a => { const rs = rows.filter(r => r.alb === a), m = fechaAlb(a); return { dia: m[1] + '/' + m[2], fac: fac(rs[0].cli), rs }; });
const ahMes = (A(curso) - N(curso)) / meses, ahSem = ahMes * 7 / 30.4;
console.assert(ahMes > 0 && pen && ult, 'datos');
const e = n => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: 'always' }) + ' €';
const e0 = n => Math.round(n).toLocaleString('es-ES', { useGrouping: 'always' }) + ' €';
const barras = (grupos, w = 760) => {
  const max = Math.max(...grupos.flatMap(g => [g[1], g[2]])), fila = 34, h = grupos.length * fila + 10, x0 = 190, bw = w - x0 - 90;
  return `<svg viewBox="0 0 ${w} ${h}" width="100%">${grupos.map(([n, a, b], i) => { const y = i * fila + 6, wa = bw * a / max, wb = bw * b / max;
    return `<text x="${x0 - 10}" y="${y + 19}" text-anchor="end" font-size="14" fill="#2a2320">${n}</text>
<rect x="${x0}" y="${y}" width="${wa}" height="13" rx="3" fill="#c9bfb8"/><text x="${x0 + wa + 6}" y="${y + 12}" font-size="12" fill="#666">${e(a)}</text>
<rect x="${x0}" y="${y + 15}" width="${wb}" height="13" rx="3" fill="#e8742b"/><text x="${x0 + wb + 6}" y="${y + 26}" font-size="12" font-weight="bold" fill="#7a1f1f">${e(b)}</text>`; }).join('')}</svg>`;
};
const kg = q => (Math.round(q * 10) / 10).toLocaleString('es-ES');
const tabla = rs => `<table><tr><th>Producto</th><th>Cant.</th><th>Pagasteis</th><th>Ahora</th><th>Antes</th><th>Ahora</th></tr>${rs.map(r =>
  `<tr><td>${r.n}</td><td>${kg(r.q)}</td><td>${e(r.p)}</td><td><b>${e(r.pn)}</b></td><td>${e(r.q * r.p)}</td><td><b>${e(r.q * r.pn)}</b></td></tr>`).join('')}
<tr class=tot><td colspan=4>Total del pedido</td><td>${e(A(rs))}</td><td>${e(N(rs))}</td></tr></table>
<p class=ah>Os ahorráis <b>${e(A(rs) - N(rs))}</b> en este pedido.</p>`;
const porProd = Object.values(curso.reduce((m, r) => { (m[r.n] ||= [r.n, 0, 0]); m[r.n][1] += r.q * r.p / meses; m[r.n][2] += r.q * r.pn / meses; return m; }, {}))
  .filter(x => x[1] - x[2] > 0.5).sort((x, y) => (y[1] - y[2]) - (x[1] - x[2])).slice(0, 6);
const css = `@page{size:A4;margin:0}*{box-sizing:border-box}body{margin:0;font:13px/1.4 Arial,sans-serif;color:#2a2320}
.top{background:#7a1f1f;color:#fff;padding:7mm 13mm 5mm}.top h1{margin:0;font-size:26px;letter-spacing:1px}.top p{margin:2px 0 0;color:#f6dcc8;font-size:12px}
.para{margin-top:3mm;font-size:16px;color:#f39a5c;font-weight:bold}.pg{padding:4mm 13mm}
h2{font-size:15px;color:#7a1f1f;margin:3mm 0 1mm;border-bottom:2px solid #e8742b;padding-bottom:1mm}
.kpis{display:flex;gap:4mm;margin:2mm 0}.k{flex:1;background:#fff6ee;border:2px solid #e8742b;border-radius:3mm;padding:2mm;text-align:center}
.k b{display:block;font-size:22px;color:#7a1f1f}.k span{font-size:12px;color:#555}
.ley{font-size:12px;color:#555}.ley i{display:inline-block;width:10px;height:10px;border-radius:2px;margin:0 4px 0 10px;vertical-align:-1px}
.dos{display:flex;gap:5mm;align-items:flex-start}.dos>div{flex:1}
table{width:100%;border-collapse:collapse;font-size:10.5px}th{text-align:right;color:#777;font-weight:normal;border-bottom:1px solid #ddd;padding:.8mm 1mm}th:first-child,td:first-child{text-align:left}
td{text-align:right;white-space:nowrap;padding:.4mm 1mm;border-bottom:1px solid #eee}tr.tot td{font-weight:bold;border-top:2px solid #7a1f1f;color:#7a1f1f}
.ah{margin:1.5mm 0 0;font-size:12.5px}.ah b{color:#7a1f1f}h3{margin:2mm 0 1mm;font-size:13.5px}
.nota{font-size:11px;color:#666}.pie{margin-top:3mm;padding-top:2mm;border-top:2px solid #e8742b;font-size:11px;color:#555}
.c{column-count:2;column-gap:8mm}.lp td{font-size:14px;padding:1.4mm 2mm}.lp td.p{font-weight:bold;color:#7a1f1f}.lp td.u{color:#777;text-align:left}`;
const cab = t => `<div class=top><h1>FERJUSANZ</h1><p>Patatas, frutas, verduras, huevos, setas, champiñones y legumbres · Mercamadrid</p><div class=para>${t}</div></div>`;
const pie = `<div class=pie><b>Fernando Sanz</b> · FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · Móvil 609 567 354 · WhatsApp pedidos 609 100 690 · www.ferjusanz-frutas-verduras.es</div>`;
const comparativa = `<!doctype html><meta charset=utf-8><style>${css}</style>${cab('Informática y Documentación · UCM · Lo que os ahorraríais')}
<div class=pg>
<p>He cogido <b>vuestros pedidos reales</b> de Informática y Documentación y los he pasado a los precios nuevos. Esto es lo que os ahorraríais:</p>
<div class=kpis><div class=k><b>${e0(ahSem)}</b><span>a la semana</span></div><div class=k><b>${e0(ahMes)}</b><span>al mes</span></div><div class=k><b>${e0(ahMes * 10)}</b><span>en un curso (10 meses)</span></div></div>
<h2>Vuestros dos últimos pedidos, antes y ahora</h2>
<div class=ley><i style="background:#c9bfb8"></i>Lo que pagasteis<i style="background:#e8742b"></i>Lo que pagaríais ahora</div>
${barras([[`Penúltimo · ${pen.dia}`, A(pen.rs), N(pen.rs)], [`Último · ${ult.dia}`, A(ult.rs), N(ult.rs)], ['Un mes de curso', A(curso) / meses, N(curso) / meses]])}
<div class=dos><div><h3>Penúltimo · ${pen.dia} · ${pen.fac}</h3>${tabla(pen.rs)}</div><div><h3>Último · ${ult.dia} · ${ult.fac}</h3>${tabla(ult.rs)}</div></div>
<h2>En un mes de curso, producto a producto</h2>
${barras(porProd)}
<p class=nota>Precios sin IVA (+4 %). «Un mes de curso» es la media de septiembre y octubre de 2026 en nuestros albaranes, las dos facultades juntas. La patata se compara con la de saco pequeño a 0,40 €/kg. Lo que no está en vuestra lista (lechuga en bandeja, aguacate, sandía, hierbas…) se deja al mismo precio.</p>
${pie}</div>`;
const precios = `<!doctype html><meta charset=utf-8><style>${css}</style>${cab('Lista de precios · Informática y Documentación · UCM')}
<div class=pg><h2>Vuestra tarifa</h2><div class=c><table class=lp>${lista.map(x => `<tr><td>${x.nombre}</td><td class=p>${e(x.precio)}</td><td class=u>/ ${x.unidad}</td></tr>`).join('')}</table></div>
<p class=nota>Precios + IVA (4 %). Semana del 26/11/2026; el resto de productos, a precio de mercado. Con cada pedido os llega lo que os va a salir.</p>${pie}</div>`;
const b = await chromium.launch(); const p = await b.newPage({ deviceScaleFactor: 2 });
for (const [h, f] of [[comparativa, 'Ferjusanz-Complutense-lo-que-ahorrais'], [precios, 'Ferjusanz-Complutense-precios']]) {
  await p.setContent(h); await p.pdf({ path: `${D}/${f}.pdf`, format: 'A4', printBackground: true, scale: 0.94 }); // 0,94: el pie no salta a una 2.ª hoja
  await p.setViewportSize({ width: 794, height: 1123 }); await p.screenshot({ path: `${D}/${f}.jpg`, type: 'jpeg', quality: 90, fullPage: true });
}
await b.close();
console.log({ ahMes, ahSem, curso: [A(curso) / meses, N(curso) / meses], pen: [pen.dia, pen.fac, A(pen.rs), N(pen.rs)], ult: [ult.dia, ult.fac, A(ult.rs), N(ult.rs)] });
