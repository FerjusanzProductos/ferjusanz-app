// Informe «Deudas de clientes» para el padre y Carmen (Tito, 24/11/2026): cliente por cliente, facturas pendientes de Golden con sus albaranes,
// lo pagado a cuenta (nota de Golden), lo que queda, cómo paga cada uno y lo que falta por apuntar. Solo datos REALES de Golden y fichas. Solo lee.
// Uso: NODE_USE_ENV_PROXY=1 node scripts/deudas-html.mjs   → docs/deudas.html (publicarla con el Artifact)
import { writeFileSync } from 'node:fs';

const sql = async q => {
  const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', {
    method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return r.json();
};
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const r2 = n => Math.round((Number(n) || 0) * 100) / 100;
const eur = n => r2(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const num = (n, d) => (Number(n) || 0).toLocaleString('es-ES', { minimumFractionDigits: d || 0, maximumFractionDigits: d || 3 });
const fecha = f => f ? new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: '2-digit' }) : '—';
const numGolden = (s, n) => (s ? s + '/' : '') + String(n || '').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const dias = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
const lit = a => a.map(x => "'" + String(x).replace(/'/g, "''") + "'").join(',');

const hoyS = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
const ini = hoyS.slice(0, 8) + '01', iniPasado = (() => { const d = new Date(ini + 'T12:00:00'); d.setMonth(d.getMonth() - 1); return d.toLocaleDateString('sv-SE'); })();
const mesN = f => new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { month: 'long' });
const mesActual = mesN(ini), mesPasado = mesN(iniPasado);

const [[g], pend] = await Promise.all([
  sql(`select max(fecha)::text hasta from golden_facturas where not borrador`),
  sql(`select contador, codigo, nombre, serie, numero, fecha_factura::text ff, vencimiento::text v, total, observacion, observacion_partes partes, observacion_aviso aviso
       from golden_tesoreria where tipo = 'C' and estado = 'PEN' order by fecha_factura`),
]);
const cods = [...new Set(pend.map(t => String(t.codigo || '').toUpperCase()))];
const nums = pend.map(t => numGolden(t.serie, t.numero));
const [clis, lineas, cobros, fact] = await Promise.all([
  sql(`select upper(codigo) cod, nombre, nombre_comercial, forma_pago, dias_pago, telefono, email, pago_frecuencia, pago_dia, pago_nota from clientes where upper(codigo) in (${lit(cods)})`),
  sql(`select factura_numero f, albaran a, orden, descripcion d, cantidad c, precio p, iva, importe i from golden_lineas where factura_numero in (${lit(nums)}) and not coalesce(repetida, false) order by orden`),
  sql(`select upper(codigo) cod, fecha_factura::text ff, fecha_cobro_pago::text fc, total from golden_tesoreria
       where tipo = 'C' and estado = 'CO' and upper(codigo) in (${lit(cods)}) and fecha_factura >= current_date - 365 order by fecha_cobro_pago desc`),
  sql(`select upper(cliente_codigo) cod, serie, fecha::text f from golden_facturas where not borrador and fecha >= current_date - 150 and upper(cliente_codigo) in (${lit(cods)})`),
]);

/* Cómo paga, deducido de Golden (misma regla que la app, Deudas › Forma de pago): facturas P de fin de mes = al mes; tickets F1 = contado/semanal/quincenal */
const tipoPago = cod => {
  const fs = fact.filter(x => x.cod === cod), P = [...new Set(fs.filter(x => x.serie === 'P').map(x => x.f))].sort(), F = [...new Set(fs.filter(x => x.serie === 'F1').map(x => x.f))].sort();
  const gap = a => { if (a.length < 2) return null; const g = a.slice(1).map((d, i) => dias(a[i], d)).sort((m, n) => m - n); return g[Math.floor(g.length / 2)]; };
  if (!P.length && !F.length) return 'Sin compras en 5 meses';
  if (P.length >= F.length) { const x = gap(P); return x == null || x > 20 ? 'Al mes (factura a fin de mes)' : x > 10 ? 'Cada 15 días' : 'Cada semana'; }
  const x = gap(F); return x == null || x <= 5 || x > 20 ? 'Al contado' : x <= 10 ? 'Cada semana' : 'Cada 15 días';
};
/* Fecha en que le toca pagar: la apuntada en su ficha (📅 Cuándo paga) o supuesta (al mes = día 7 del mes siguiente). Misma regla que la app. */
const sumaD = (f, n) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const prevista = (ff, frec, dia) => { if (frec === 'contado') return ff; if (frec === 'quincenal') return sumaD(ff, 15);
  if (frec === 'semanal') { if (!(dia >= 1 && dia <= 7)) return sumaD(ff, 7); let f = ff; do f = sumaD(f, 1); while (((new Date(f + 'T12:00:00').getDay() + 6) % 7) + 1 !== dia); return f; }
  const d = new Date(ff + 'T12:00:00'), fin = new Date(d.getFullYear(), d.getMonth() + 2, 0).getDate(); d.setDate(1); d.setMonth(d.getMonth() + 1); d.setDate(Math.min(dia || 7, fin)); return d.toLocaleDateString('sv-SE'); };
const FREC = { contado: 'Al contado', semanal: 'Cada semana', quincenal: 'Cada 15 días', mensual: 'Al mes' }, DSEM = ['', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
const pagadoNota = t => r2((Array.isArray(t.partes) ? t.partes : []).reduce((a, p) => a + Number(p.importe || 0), 0));
const albPagados = t => new Set((Array.isArray(t.partes) ? t.partes : []).flatMap(p => p.albaranes || []));

const C = {};
for (const t of pend) {
  const cod = String(t.codigo || '').toUpperCase(), cl = clis.find(c => c.cod === cod) || {};
  const x = C[cod] || (C[cod] = { cod, nom: cl.nombre_comercial || (t.nombre || '').trim(), fiscal: (t.nombre || '').trim(), cl, fs: [], queda: 0, total: 0, antigua: 0, pasado: 0, actual: 0 });
  const pag = pagadoNota(t), queda = Math.max(0, r2(Number(t.total) - pag)); if (queda <= 0.009) continue;
  const ff = t.ff || t.v, num = numGolden(t.serie, t.numero), pagados = albPagados(t);
  const grupos = {}; for (const l of lineas.filter(l => l.f === num)) (grupos[l.a] = grupos[l.a] || { a: l.a, t: 0, prods: [] }).prods.push(l);
  for (const g of Object.values(grupos)) g.t = g.prods.reduce((s, l) => s + Number(l.i || 0), 0);
  const albs = Object.values(grupos).map(l => { const n = (String(l.a).match(/\/\s*(\d+)\s+de/) || [])[1]; return { txt: l.a ? String(l.a).replace(/^Alb\.\s*/, 'Albarán ') : 'Ticket (venta sin albarán)', n, t: r2(l.t), pagado: n && pagados.has(n), prods: l.prods }; }).sort((a, b) => a.txt.localeCompare(b.txt));
  x.fs.push({ t, num, ff, pag, queda, albs, edad: dias(ff, hoyS) }); x.queda += queda; x.total += Number(t.total);
  if (ff >= ini) x.actual += queda; else if (ff >= iniPasado) x.pasado += queda; else x.antigua += queda;
}
const lista = Object.values(C).filter(x => x.fs.length).sort((a, b) => b.queda - a.queda);
for (const x of lista) {
  const cs = cobros.filter(c => c.cod === x.cod && c.fc), ds = cs.map(c => dias(c.ff, c.fc)).filter(d => d >= 0).sort((a, b) => a - b);
  x.pago = tipoPago(x.cod); x.nCobros = cs.length; x.ultCobro = cs[0] ? cs[0].fc : null; x.medDias = ds.length ? ds[Math.floor(ds.length / 2)] : null;
  const frec = x.cl.pago_frecuencia || (/Al mes/.test(x.pago) ? 'mensual' : /semana/.test(x.pago) ? 'semanal' : /15/.test(x.pago) ? 'quincenal' : /contado/.test(x.pago) ? 'contado' : 'mensual');
  x.prev = x.fs.map(f => prevista(f.ff, frec, x.cl.pago_frecuencia ? x.cl.pago_dia : null)).sort()[0];
  x.cuando = x.cl.pago_frecuencia ? FREC[frec] + (frec === 'mensual' && x.cl.pago_dia ? ', día ' + x.cl.pago_dia + ' del mes siguiente' : frec === 'semanal' && x.cl.pago_dia ? ', los ' + DSEM[x.cl.pago_dia] : '') + (x.cl.pago_nota ? ' · ' + x.cl.pago_nota : '') : 'Sin apuntar (supuesto: ' + FREC[frec].toLowerCase() + ')';
  x.faltas = [];
  if (!x.cl.pago_frecuencia) x.faltas.push('Falta apuntar cuándo paga (ficha del cliente › «📅 Cuándo paga»).');
  if (!x.cl.telefono) x.faltas.push('Falta su teléfono en la ficha.');
  const viejasSinNota = x.fs.filter(f => f.edad > 60 && !f.pag);
  if (viejasSinNota.length) x.faltas.push(viejasSinNota.length + (viejasSinNota.length === 1 ? ' factura' : ' facturas') + ' de hace más de 2 meses sin ninguna nota de pago: ¿se cobró y no se marcó en Golden?');
  if (x.fs.some(f => f.t.aviso)) x.faltas.push('Hay una nota de Golden que no se entiende del todo (ver abajo).');
  if (!x.nCobros) x.faltas.push('No consta ningún cobro suyo en Golden en el último año.');
  // Pagó facturas más nuevas y esta sigue pendiente: lo normal es que esté cobrada y sin marcar (Tito, 25/11/2026)
  const ultFfCobrada = cs.map(c => c.ff).filter(Boolean).sort().pop();
  x.sospechosas = ultFfCobrada ? x.fs.filter(f => dias(f.ff, ultFfCobrada) > 20) : [];
  x.ultFfCobrada = ultFfCobrada;
  if (x.sospechosas.length) x.faltas.unshift(`Ya pagó la factura del ${fecha(ultFfCobrada)}, pero siguen pendientes ${x.sospechosas.map(f => f.num).join(', ')} (más antiguas): ¿están pagadas y sin marcar?`);
}
const sosp = lista.filter(x => x.sospechosas.length), sSosp = r2(sosp.reduce((a, x) => a + x.sospechosas.reduce((s, f) => s + f.queda, 0), 0));
const T = k => r2(lista.reduce((a, x) => a + x[k], 0));
const total = T('queda'), actual = T('actual'), pasado = T('pasado'), antigua = T('antigua'), realDeuda = r2(pasado + antigua), aCuenta = r2(pend.reduce((a, t) => a + Math.min(pagadoNota(t), Number(t.total)), 0));
const nViejas = lista.reduce((a, x) => a + x.fs.filter(f => f.edad > 60 && !f.pag).length, 0), sViejas = r2(lista.reduce((a, x) => a + x.fs.filter(f => f.edad > 60 && !f.pag).reduce((s, f) => s + f.queda, 0), 0));
const top3 = lista.slice(0, 3), sTop3 = r2(top3.reduce((a, x) => a + x.queda, 0));
const mensualesPasado = r2(lista.filter(x => /Al mes/.test(x.pago)).reduce((a, x) => a + x.pasado, 0));
const nombra = (re) => lista.find(x => re.test(x.nom + ' ' + x.fiscal));
const ejemplos = [nombra(/florencio/i), nombra(/tejas/i)].filter(Boolean);

const filasXls = lista.flatMap(x => x.fs.flatMap(f => (f.albs.length ? f.albs : [{ txt: 'Ticket (venta sin albarán)', t: f.queda, pagado: false, prods: [{}] }]).flatMap(al => al.prods.map(l => ({
  Cliente: x.nom, 'Razón social': x.fiscal, Código: x.cod, Factura: f.num, 'Fecha factura': f.ff, 'Días': f.edad, Albarán: al.txt, 'Importe albarán': al.t,
  'Estado albarán': al.pagado ? 'pagado a cuenta' : 'sin pagar', 'Total factura': r2(f.t.total), 'Pagado a cuenta (factura)': f.pag, 'Queda (factura)': f.queda,
  'Nota de Golden': f.t.observacion || '', 'Cómo paga (Golden)': x.pago, 'Cuándo paga (ficha)': x.cuando, 'Puede que esté pagada': x.sospechosas.includes(f) ? 'SÍ, revisar' : '', Producto: l.d || '', Cantidad: Number(l.c) || null, Precio: Number(l.p) || null, 'IVA %': Number(l.iva) || null, 'Importe producto': Number(l.i) || null })))));
const filasCli = lista.map(x => ({ Cliente: x.nom, Código: x.cod, 'Queda por cobrar': r2(x.queda), Antiguo: r2(x.antigua), [mesPasado]: r2(x.pasado), [mesActual]: r2(x.actual),
  'Cómo paga (Golden)': x.pago, 'Cuándo paga (ficha)': x.cuando, 'Último cobro': x.ultCobro || '', Teléfono: x.cl.telefono || '', 'Falta apuntar': x.faltas.join(' | ') }));
const tarjeta = (cifra, txt, cls) => `<div class="t ${cls || ''}"><b>${cifra}</b><span>${txt}</span></div>`;
const filaCli = x => {
  const est = x.antigua > 0.009 ? 'roja' : x.pasado > 0.009 ? 'ambar' : 'gris';
  const facts = x.fs.map(f => `<div class="fra">
  <div class="fra-c"><div><b>Factura ${esc(f.num)}</b> <small>del ${fecha(f.ff)} · hace ${f.edad} días</small></div><div class="imp"><b>${eur(f.queda)}</b>${f.pag ? `<small>de ${eur(f.t.total)}</small>` : ''}</div></div>
  ${f.pag ? `<div class="acta">Pagado a cuenta: <b>${eur(f.pag)}</b> · según la nota de Golden: «${esc(f.t.observacion)}»</div>` : ''}
  ${f.t.aviso ? `<div class="avi">⚠️ ${esc(f.t.aviso)}</div>` : ''}
  ${f.albs.length ? `<details open><summary>${f.albs.length} ${f.albs.length === 1 ? 'albarán' : 'albaranes'}</summary>${f.albs.map(a => `<details class="alb${a.pagado ? ' pg' : ''}"><summary><span>${esc(a.txt)}</span><span class="est">${a.pagado ? 'pagado a cuenta' : 'sin pagar'}</span><b class="n">${eur(a.t)}</b></summary>
<table class="ped"><thead><tr><th>Producto</th><th class="n">Cant.</th><th class="n">Precio</th><th class="n">Importe</th></tr></thead><tbody>${a.prods.map(l => `<tr><td>${esc(l.d)}</td><td class="n">${num(l.c)}</td><td class="n">${num(l.p, 2)} €</td><td class="n">${eur(l.i)}</td></tr>`).join('')}</tbody></table></details>`).join('')}</details>` : `<div class="sub">Ticket de venta directa: sin albaranes en Golden.</div>`}
</div>`).join('');
  return `<article class="cli ${est}" id="c-${esc(x.cod.replace(/[^A-Z0-9]/g, ''))}">
<header><div><h3>${esc(x.nom)}</h3><small>${esc(x.fiscal)} · código ${esc(x.cod)}</small></div><div class="imp"><b>${eur(x.queda)}</b><small>${x.fs.length} ${x.fs.length === 1 ? 'factura' : 'facturas'}</small></div></header>
<dl class="pago">
  <div><dt>Cómo paga (según Golden)</dt><dd>${esc(x.pago)}</dd></div>
  <div><dt>Ficha de la app</dt><dd>${x.cl.forma_pago === 'contado' ? 'Contado' : 'Crédito'}${x.cl.dias_pago != null ? ', ' + x.cl.dias_pago + ' días' : ', sin días de plazo'}</dd></div>
  <div><dt>Último cobro en Golden</dt><dd>${x.ultCobro ? fecha(x.ultCobro) + (x.medDias != null ? ` · suele tardar ${x.medDias} días` : '') : 'ninguno en un año'}</dd></div>
  <div><dt>Cuándo paga (ficha)</dt><dd>${esc(x.cuando)}</dd></div>
  <div><dt>Le tocaba pagar</dt><dd>${x.prev < hoyS ? `<span class="r">el ${fecha(x.prev)} (hace ${dias(x.prev, hoyS)} días)</span>` : 'el ' + fecha(x.prev)}</dd></div>
  <div><dt>Reparto de lo que debe</dt><dd>${[x.antigua > 0.009 ? `<span class="r">${eur(x.antigua)} antiguo</span>` : '', x.pasado > 0.009 ? `<span class="a">${eur(x.pasado)} de ${mesPasado}</span>` : '', x.actual > 0.009 ? `${eur(x.actual)} de ${mesActual}` : ''].filter(Boolean).join(' · ')}</dd></div>
</dl>
${x.faltas.length ? `<ul class="faltas">${x.faltas.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
${facts}
</article>`;
};

const html = `<title>Deudas de clientes</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Informe para leer en el móvil o en la mesa con Carmen: resumen arriba, motivos, preguntas y luego cliente por cliente. */
:root{--bg:#f6f6f2;--fg:#1c241d;--muted:#5c6a5e;--line:#dde2d8;--card:#fff;--acc:#24693a;--rojo:#b3261e;--rojo-cl:#fbe9e7;--ambar:#9a5b00;--ambar-cl:#fff3d6;--verde-cl:#e7f3ea;
--sans:"Inter",system-ui,-apple-system,"Segoe UI",sans-serif;--head:"Space Grotesk","Inter",system-ui,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121712;--fg:#e4ebe2;--muted:#9fad9d;--line:#2b352b;--card:#1a211a;--acc:#7cc690;--rojo:#f08a7e;--rojo-cl:#3a1f1c;--ambar:#f0b44f;--ambar-cl:#3a2d12;--verde-cl:#1c2e21;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#121712;--fg:#e4ebe2;--muted:#9fad9d;--line:#2b352b;--card:#1a211a;--acc:#7cc690;--rojo:#f08a7e;--rojo-cl:#3a1f1c;--ambar:#f0b44f;--ambar-cl:#3a2d12;--verde-cl:#1c2e21;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:16px/1.5 var(--sans);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 48px}
main{max-width:760px;margin:0 auto;display:grid;gap:18px}
h1,h2,h3{font-family:var(--head);text-wrap:balance;margin:0}
h1{font-size:1.7rem}h2{font-size:1.2rem;margin-bottom:8px}h3{font-size:1.05rem}
small,.sub{color:var(--muted);font-size:.85rem}
.tarjetas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.t{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.t b{display:block;font-size:1.35rem;font-variant-numeric:tabular-nums}.t span{font-size:.85rem;color:var(--muted)}
.t.r{background:var(--rojo-cl);border-color:transparent}.t.r b{color:var(--rojo)}.t.a{background:var(--ambar-cl);border-color:transparent}.t.a b{color:var(--ambar)}
section.bloque{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px}
section.bloque ul{margin:0;padding-left:20px;display:grid;gap:6px}
.cli{background:var(--card);border:1px solid var(--line);border-left:6px solid var(--line);border-radius:12px;padding:12px 14px;display:grid;gap:10px}
.cli.roja{border-left-color:var(--rojo)}.cli.ambar{border-left-color:var(--ambar)}
.cli header,.fra-c{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.cli header>div:first-child,.fra-c>div:first-child{min-width:0;overflow-wrap:anywhere}
.imp{text-align:right;white-space:nowrap;display:grid}.imp b{font-size:1.15rem;font-variant-numeric:tabular-nums}
.cli header .imp b{color:var(--rojo);font-size:1.3rem}
.pago{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 14px;margin:0;font-size:.9rem}
.pago dt{color:var(--muted);font-size:.78rem;text-transform:uppercase;letter-spacing:.04em}.pago dd{margin:0}
.r{color:var(--rojo);font-weight:600}.a{color:var(--ambar);font-weight:600}
.faltas{margin:0;padding:8px 12px 8px 28px;background:var(--ambar-cl);border-radius:8px;font-size:.9rem;display:grid;gap:3px}
.fra{border-top:1px solid var(--line);padding-top:8px;display:grid;gap:4px}
.acta{font-size:.88rem;background:var(--verde-cl);border-radius:6px;padding:4px 8px;overflow-wrap:anywhere}
.avi{font-size:.88rem;color:var(--ambar);font-weight:600}
details summary{cursor:pointer;color:var(--acc);font-weight:600;font-size:.9rem;min-height:28px}
table{width:100%;border-collapse:collapse;font-size:.88rem;font-variant-numeric:tabular-nums}
td{padding:4px 2px;border-top:1px solid var(--line)}td.n{text-align:right;white-space:nowrap}tr.pg td{color:var(--muted)}tr.pg td:nth-child(2){color:var(--acc)}
.indice{display:flex;flex-wrap:wrap;gap:6px}.indice button{all:unset;cursor:pointer;background:var(--card);border:1px solid var(--line);border-radius:999px;padding:4px 10px;font-size:.85rem}
.indice button:focus-visible,details summary:focus-visible{outline:2px solid var(--acc);outline-offset:2px}
.bajar{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.bajar button{font:600 .95rem var(--sans);background:var(--acc);color:#fff;border:0;border-radius:999px;padding:8px 14px;min-height:40px;cursor:pointer}
.bajar button:disabled{opacity:.5}.bajar button:focus-visible{outline:2px solid var(--fg);outline-offset:2px}
table.cuando th{text-align:left;font-size:.78rem;color:var(--muted);padding:4px 2px}.hueco{color:var(--muted)}
.tabla-cuando{overflow-x:auto}.cuando td{overflow-wrap:anywhere}.cuando td{vertical-align:top}.cuando select,.cuando input{font:inherit;font-size:.9rem;padding:4px 6px;border:1px solid var(--line);border-radius:6px;background:var(--card);color:var(--fg);min-height:34px;max-width:9.5rem}
details.alb{border-top:1px solid var(--line);padding:2px 0}details.alb>summary{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:8px;align-items:center;font-weight:400;color:var(--fg);font-size:.88rem;padding:5px 0}
details.alb>summary .est{color:var(--muted);font-size:.8rem}details.alb.pg>summary .est{color:var(--acc)}details.alb.pg>summary{color:var(--muted)}
details.alb>summary::marker{content:''}details.alb>summary>span:first-child::before{content:'▸ ';color:var(--acc)}details.alb[open]>summary>span:first-child::before{content:'▾ '}table.ped{margin:2px 0 8px;background:var(--bg);border-radius:6px}table.ped th{font-size:.75rem;color:var(--muted);font-weight:600;text-align:left;padding:4px}table.ped th.n,table.ped td.n{text-align:right}table.ped td{padding:3px 4px}
.pasos{margin:0 0 8px;padding-left:22px;display:grid;gap:4px}
@media (max-width:600px){table.cuando thead{display:none}table.cuando,table.cuando tbody{display:block}
table.cuando tr{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:6px 8px;padding:10px 0;border-top:1px solid var(--line)}
table.cuando td{border:0;padding:0}table.cuando td:nth-child(1){font-weight:600}table.cuando td:nth-child(2){font-size:.85rem;color:var(--muted)}
table.cuando td:nth-child(5){grid-column:1/-1}.cuando select,.cuando input{width:100%;max-width:none;box-sizing:border-box}}
@media (max-width:480px){.pago{grid-template-columns:minmax(0,1fr)}}
</style>
<main>
<div class="bajar" aria-label="Descargar"><button type="button" data-bajar="pdf">📄 PDF</button><button type="button" data-bajar="jpg">🖼️ JPG</button><button type="button" data-bajar="xlsx">📊 Excel</button><span id="estado" class="sub" role="status"></span></div>
<div><h1>Deudas de clientes</h1>
<p class="sub">Para revisar con Carmen. Datos de Golden hasta el ${fecha(g.hasta)} (Cobros y facturas), sacados el ${new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}. Lo apuntado «a cuenta» en Golden ya está restado.</p></div>

<div class="tarjetas">
${tarjeta(eur(total), `queda por cobrar en total (${lista.length} clientes)`, '')}
${tarjeta(eur(realDeuda), `deuda de verdad: facturas hasta ${mesPasado}`, 'r')}
${tarjeta(eur(antigua), `antigua: de antes de ${mesPasado}`, 'r')}
${tarjeta(eur(actual), `de ${mesActual}: aún no toca pagarlo`, '')}
</div>

<section class="bloque"><h2>Por qué se debe tanto</h2><ul>
<li><b>${eur(pasado)}</b> son facturas de ${mesPasado}${mensualesPasado > 0 ? ` (${eur(mensualesPasado)} de clientes que pagan al mes)` : ''}. Los que pagan al mes las tenían que haber pagado la primera semana de ${mesActual}: o no han pagado, o han pagado y no se ha marcado en Golden.</li>
<li><b>${eur(antigua)}</b> es deuda antigua, de antes de ${mesPasado}. Esto es lo que más preocupa.</li>
<li><b>${nViejas} facturas</b> de hace más de 2 meses (${eur(sViejas)}) no tienen ninguna nota de pago en Golden. Hay que confirmar una por una si están cobradas y sin marcar.</li>
<li>Solo 3 clientes suman <b>${eur(sTop3)}</b> (${Math.round(sTop3 / total * 100)} % de todo): ${top3.map(x => esc(x.nom) + ' ' + eur(x.queda)).join(', ')}.</li>
<li>Ya se ha restado <b>${eur(aCuenta)}</b> que la oficina tiene apuntado «a cuenta» en las notas de Golden.</li>
<li>En las fichas de la app <b>no está apuntado cuándo paga ningún cliente</b>: por eso nadie sabía quién iba con retraso.${ejemplos.length ? ' Por ejemplo, ' + ejemplos.map(x => `${esc(x.nom)} debe ${eur(x.queda)}`).join(' y ') + '.' : ''}</li>
</ul></section>

${sosp.length ? `<section class="bloque"><h2>Carmen: puede que no deban (${eur(sSosp)})</h2>
<p class="sub">Estos clientes han pagado facturas más nuevas, pero en Golden siguen pendientes otras más antiguas. Lo normal es que estén pagadas y no se marcaran. Mira cada una en el banco o en Golden y marca qué pasa. Se queda guardado en este móvil u ordenador; al terminar, pulsa «💾 Guardar lo apuntado» y manda a Tito el Excel.</p>
<div class="tabla-cuando"><table class="cuando"><thead><tr><th>Cliente</th><th>Factura pendiente</th><th>¿Qué pasa?</th><th>Fecha del cobro</th><th>Nota</th></tr></thead><tbody>
${sosp.flatMap(x => x.sospechosas.map(f => `<tr data-fra="${esc(f.num)}" data-nom="${esc(x.nom)}" data-cod2="${esc(x.cod)}" data-ff="${f.ff}" data-imp="${f.queda}" data-ult="${x.ultFfCobrada}"><td>${esc(x.nom)}<br><small>${esc(x.cl.telefono || '')}</small></td><td>${esc(f.num)} del ${fecha(f.ff)} · <b>${eur(f.queda)}</b><br><small>ya pagó la del ${fecha(x.ultFfCobrada)}${f.t.observacion ? ' · nota: ' + esc(f.t.observacion) : ''}</small></td>
<td><select aria-label="Qué pasa con ${esc(f.num)}" data-c="que"><option value="">¿Qué pasa?…</option><option>Cobrada, sin marcar en Golden</option><option>Se debe de verdad</option><option>Pagada en parte</option><option>Anulada / rectificada</option><option>No lo sé</option></select></td>
<td><input aria-label="Fecha del cobro de ${esc(f.num)}" data-c="cuando" size="10" placeholder="p. ej. 10/03"></td><td><input aria-label="Nota ${esc(f.num)}" data-c="nota" size="12" placeholder="Nota (opcional)"></td></tr>`)).join('')}
</tbody></table></div>
<div class="bajar"><button type="button" data-bajar="carmen">💾 Guardar lo apuntado</button></div></section>` : ''}

<section class="bloque"><h2>Carmen: apuntar cuándo paga cada cliente</h2>
<ol class="pasos"><li><b>Aquí mismo:</b> en cada cliente, elige cómo paga y pon el día (aproximado vale: «día 10», «sobre el 5», «los lunes»). Se queda guardado en este móvil u ordenador.</li>
<li>Al terminar, pulsa <b>«💾 Guardar lo apuntado»</b> y manda a Tito el Excel que sale.</li>
<li><b>En Golden:</b> en la ficha de cada cliente que paga al mes, rellena <b>«Día de Pago 1»</b> con el día aproximado (y «Día de Pago 2» si paga dos veces al mes). Golden ya tiene esos huecos, vacíos en todos los clientes.</li></ol>
<p class="sub">«Según Golden» es lo que se deduce de sus facturas; «suele tardar» son días entre la factura y el cobro marcado. Corrígelo si no es así.</p>
<div class="tabla-cuando"><table class="cuando"><thead><tr><th>Cliente</th><th>Según Golden</th><th>Cómo paga</th><th>Día aprox.</th><th>Nota</th></tr></thead><tbody>
${lista.map(x => `<tr data-cod="${esc(x.cod)}" data-nom="${esc(x.nom)}" data-golden="${esc(x.pago)}"><td>${esc(x.nom)}</td><td>${esc(x.pago)}${x.medDias != null ? `<br><small>suele tardar ${x.medDias} días</small>` : ''}</td>
<td><select aria-label="Cómo paga ${esc(x.nom)}" data-c="frec"><option value="">Cómo paga…</option><option>Al contado</option><option>Cada semana</option><option>Cada 15 días</option><option>Al mes</option></select></td>
<td><input aria-label="Día que paga ${esc(x.nom)}" data-c="dia" size="8" placeholder="día 10"></td><td><input aria-label="Nota ${esc(x.nom)}" data-c="nota" size="12" placeholder="Nota (opcional)"></td></tr>`).join('')}
</tbody></table></div>
<div class="bajar"><button type="button" data-bajar="carmen">💾 Guardar lo apuntado</button><span id="estado2" class="sub" role="status"></span></div></section>

<section class="bloque"><h2>Para preguntar a Carmen</h2><ul>
<li>¿Hay cobros hechos (transferencias, efectivo) que no estén marcados en Golden › Tesorería? Marcarlos el mismo día y con la fecha real.</li>
<li>De las facturas de más de 2 meses sin nota (marcadas abajo en naranja): ¿cuáles están cobradas y cuáles se deben de verdad?</li>
<li>Cuando un cliente paga una parte sin decir de qué albarán, apuntarlo en la nota como «A cuenta 300 €»: la app ya lo resta.</li>
<li>Cuándo paga cada cliente (al contado, semanal, cada 15 días o al mes y qué día): apuntarlo en su ficha › «📅 Cuándo paga». Con eso la app avisa cuándo le toca y si se ha pasado.</li>
</ul></section>

<section class="bloque"><h2>Clientes que deben (${lista.length})</h2>
<p class="sub">Del que más debe al que menos. Borde rojo: tiene deuda antigua. Ámbar: solo de ${mesPasado}. Cada factura lleva todos sus albaranes; pulsa un albarán para ver el pedido (productos, cantidades y precios).</p>
<div class="indice">${lista.map(x => `<button type="button" data-ir="c-${esc(x.cod.replace(/[^A-Z0-9]/g, ''))}">${esc(x.nom)} · ${eur(x.queda)}</button>`).join('')}</div></section>

${lista.map(filaCli).join('\n')}
<p class="sub">Fuente: Golden (Tesorería › Cobros pendientes, facturas y albaranes) y las fichas de clientes de la app. «Cómo paga» se deduce de sus facturas de los últimos 5 meses. «Suele tardar» son días entre la factura y el cobro marcado en Golden (si se marca tarde, sale más alto).</p>
</main>
<script id="datos" type="application/json">${JSON.stringify({ filas: filasXls, clientes: filasCli }).replace(/</g, '\\u003c')}</script>
<script src="https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js"></script>
<script>
// Descargas (Tito, 25/11/2026: «que se pueda ver en jpg, pdf y Excel»). Cada bloque se dibuja aparte y se reparte en hojas A4 (una página entera no cabe en un solo dibujo).
const est = { set textContent(v) { for (const id of ['estado', 'estado2']) document.getElementById(id).textContent = v; } }, botones = [...document.querySelectorAll('[data-bajar]')];
const nombre = 'Deudas de clientes ' + new Date().toLocaleDateString('sv-SE');
let dl = null; if (window.claude && claude.use) claude.use('downloads').then(d => { dl = d; });
async function guardar(filename, data) {
  if (!dl) { // abierto como archivo suelto (WhatsApp, Chrome): descarga normal del navegador
    const f = new File([data instanceof Blob ? data : new Blob([data])], filename);
    if (navigator.canShare && navigator.canShare({ files: [f] })) { try { await navigator.share({ files: [f], title: filename }); est.textContent = 'Enviado: ' + filename; return; } catch (e) { if (e.name === 'AbortError') return; } }
    const a = document.createElement('a'); a.href = URL.createObjectURL(data instanceof Blob ? data : new Blob([data])); a.download = filename; document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    est.textContent = 'Descargado: ' + filename; return; }
  try { await dl.save({ filename, data }); est.textContent = 'Listo: ' + filename; }
  catch (e) { est.textContent = e && e.code === 'declined' ? '' : e && e.code === 'host_unavailable' ? 'Esta app no deja guardar: ábrelo en Chrome.' : 'No se pudo guardar (' + ((e && e.code) || 'error') + ').'; }
}
async function hojas() {
  const W = 794, H = 1123, M = 28, ancho = W - 2 * M, out = []; let c = null, y = 0;
  const nueva = () => { c = document.createElement('canvas'); c.width = W * 2; c.height = H * 2; const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); out.push(c); y = M; };
  document.documentElement.dataset.theme = 'light';
  const cerrados = [...document.querySelectorAll('details:not([open])')]; cerrados.forEach(d => d.open = true);
  const bloques = [...document.querySelectorAll('main > *')].filter(el => !el.classList.contains('bajar'));
  nueva();
  for (const [i, el] of bloques.entries()) {
    est.textContent = 'Preparando… ' + Math.round(i / bloques.length * 100) + ' %';
    const img = await html2canvas(el, { scale: 2, backgroundColor: '#ffffff', windowWidth: 760 });
    const k = ancho / (img.width / 2), alto = img.height / 2 * k;
    let src = 0;
    while (src < img.height) {
      if (y + 40 > H - M) nueva();
      const cabe = (H - M - y) / k * 2, trozo = Math.min(img.height - src, cabe);
      if (trozo < img.height - src && y > M && alto < H - 2 * M) { nueva(); continue; }
      c.getContext('2d').drawImage(img, 0, src, img.width, trozo, M * 2, y * 2, ancho * 2, trozo / 2 * k * 2);
      y += trozo / 2 * k + 10; src += trozo;
    }
  }
  delete document.documentElement.dataset.theme;
  cerrados.forEach(d => d.open = false);
  return out;
}
const accion = {
  async pdf() { const hs = await hojas(); const pdf = new jspdf.jsPDF({ unit: 'px', format: [794, 1123], hotfixes: ['px_scaling'] });
    hs.forEach((h, i) => { if (i) pdf.addPage([794, 1123]); pdf.addImage(h.toDataURL('image/jpeg', .85), 'JPEG', 0, 0, 794, 1123); });
    await guardar(nombre + '.pdf', pdf.output('blob')); },
  async jpg() { const hs = await hojas(); const blobs = await Promise.all(hs.map(h => new Promise(r => h.toBlob(r, 'image/jpeg', .9))));
    if (blobs.length === 1) return guardar(nombre + '.jpg', blobs[0]);
    const z = new JSZip(); blobs.forEach((b, i) => z.file(nombre + ' - hoja ' + String(i + 1).padStart(2, '0') + '.jpg', b));
    await guardar(nombre + ' (JPG).zip', await z.generateAsync({ type: 'blob' })); },
  async xlsx() { const d = JSON.parse(document.getElementById('datos').textContent), wb = XLSX.utils.book_new();
    const hoja = (rows, nom) => { const ws = XLSX.utils.json_to_sheet(rows); ws['!cols'] = Object.keys(rows[0] || {}).map(k => ({ wch: Math.min(45, Math.max(10, k.length + 2, ...rows.map(r => String(r[k] ?? '').length))) })); ws['!autofilter'] = { ref: ws['!ref'] }; XLSX.utils.book_append_sheet(wb, ws, nom); };
    hoja(d.clientes, 'Clientes'); hoja(d.filas, 'Albaranes'); hoja(respuestas(), 'Cuándo paga'); if (revisiones().length) hoja(revisiones(), 'Puede que no deban');
    await guardar(nombre + '.xlsx', new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })])); },
};
const filasCarmen = [...document.querySelectorAll('tr[data-cod]')];
const CLAVE = 'deudas-cuando-paga';
let guardado = {}; try { guardado = JSON.parse(localStorage.getItem(CLAVE) || '{}'); } catch (e) {}
filasCarmen.forEach(tr => { const g = guardado[tr.dataset.cod] || {}; tr.querySelectorAll('[data-c]').forEach(el => { el.value = g[el.dataset.c] || ''; el.addEventListener('input', () => {
  const r = guardado[tr.dataset.cod] = guardado[tr.dataset.cod] || {}; r[el.dataset.c] = el.value; try { localStorage.setItem(CLAVE, JSON.stringify(guardado)); } catch (e) {} }); }); });
const respuestas = () => filasCarmen.map(tr => { const v = c => tr.querySelector('[data-c=' + c + ']').value.trim(); return { Cliente: tr.dataset.nom, Código: tr.dataset.cod, 'Según Golden': tr.dataset.golden, 'Cómo paga (Carmen)': v('frec'), 'Día aprox.': v('dia'), Nota: v('nota') }; });
// «Puede que no deban» (Tito, 26/11/2026): Carmen marca factura por factura qué pasa; va en el mismo Excel de lo apuntado.
const filasRev = [...document.querySelectorAll('tr[data-fra]')], CLAVE2 = 'deudas-puede-que-no';
let guardado2 = {}; try { guardado2 = JSON.parse(localStorage.getItem(CLAVE2) || '{}'); } catch (e) {}
filasRev.forEach(tr => { const g = guardado2[tr.dataset.fra] || {}; tr.querySelectorAll('[data-c]').forEach(el => { el.value = g[el.dataset.c] || ''; el.addEventListener('input', () => {
  const r = guardado2[tr.dataset.fra] = guardado2[tr.dataset.fra] || {}; r[el.dataset.c] = el.value; try { localStorage.setItem(CLAVE2, JSON.stringify(guardado2)); } catch (e) {} }); }); });
const revisiones = () => filasRev.map(tr => { const v = c => tr.querySelector('[data-c=' + c + ']').value.trim(); return { Cliente: tr.dataset.nom, Código: tr.dataset.cod2, Factura: tr.dataset.fra, 'Fecha factura': tr.dataset.ff, Importe: Number(tr.dataset.imp), 'Ya pagó la del': tr.dataset.ult, 'Qué pasa (Carmen)': v('que'), 'Fecha del cobro': v('cuando'), Nota: v('nota') }; });
accion.carmen = async () => { const r = respuestas(), rv = revisiones(), n = r.filter(x => x['Cómo paga (Carmen)'] || x['Día aprox.'] || x.Nota).length + rv.filter(x => x['Qué pasa (Carmen)'] || x['Fecha del cobro'] || x.Nota).length;
  if (!n) { est.textContent = 'No hay nada apuntado todavía.'; return; }
  const wb = XLSX.utils.book_new(), ws = XLSX.utils.json_to_sheet(r); ws['!cols'] = [{ wch: 34 }, { wch: 12 }, { wch: 28 }, { wch: 18 }, { wch: 14 }, { wch: 30 }]; XLSX.utils.book_append_sheet(wb, ws, 'Cuándo paga');
  if (rv.length) { const w2 = XLSX.utils.json_to_sheet(rv); w2['!cols'] = [{ wch: 30 }, { wch: 11 }, { wch: 11 }, { wch: 12 }, { wch: 10 }, { wch: 13 }, { wch: 30 }, { wch: 14 }, { wch: 30 }]; XLSX.utils.book_append_sheet(wb, w2, 'Puede que no deban'); }
  await guardar('Lo apuntado por Carmen ' + new Date().toLocaleDateString('sv-SE') + '.xlsx', new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })])); };
botones.push(...document.querySelectorAll('[data-bajar=carmen]'));
botones.forEach(b => b.addEventListener('click', async () => { botones.forEach(x => x.disabled = true); est.textContent = 'Preparando…';
  try { await accion[b.dataset.bajar](); } catch (e) { est.textContent = 'Error al preparar el archivo.'; console.error(e); } finally { botones.forEach(x => x.disabled = false); } }));
document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.ir); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
</script>`;
writeFileSync('docs/deudas.html', html);
console.log('docs/deudas.html:', lista.length, 'clientes ·', eur(total), '· deuda real', eur(realDeuda), '· antigua', eur(antigua), '· a cuenta', eur(aCuenta), '· ejemplos', ejemplos.map(x => x.nom).join(', '));
