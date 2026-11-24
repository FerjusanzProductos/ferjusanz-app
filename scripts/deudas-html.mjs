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
  sql(`select upper(codigo) cod, nombre, nombre_comercial, forma_pago, dias_pago, telefono, email from clientes where upper(codigo) in (${lit(cods)})`),
  sql(`select factura_numero f, albaran a, sum(importe) t, count(*) n from golden_lineas where factura_numero in (${lit(nums)}) and not coalesce(repetida, false) group by 1, 2`),
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
const pagadoNota = t => r2((Array.isArray(t.partes) ? t.partes : []).reduce((a, p) => a + Number(p.importe || 0), 0));
const albPagados = t => new Set((Array.isArray(t.partes) ? t.partes : []).flatMap(p => p.albaranes || []));

const C = {};
for (const t of pend) {
  const cod = String(t.codigo || '').toUpperCase(), cl = clis.find(c => c.cod === cod) || {};
  const x = C[cod] || (C[cod] = { cod, nom: cl.nombre_comercial || (t.nombre || '').trim(), fiscal: (t.nombre || '').trim(), cl, fs: [], queda: 0, total: 0, antigua: 0, pasado: 0, actual: 0 });
  const pag = pagadoNota(t), queda = Math.max(0, r2(Number(t.total) - pag)); if (queda <= 0.009) continue;
  const ff = t.ff || t.v, num = numGolden(t.serie, t.numero), pagados = albPagados(t);
  const albs = lineas.filter(l => l.f === num).map(l => { const n = (String(l.a).match(/\/\s*(\d+)\s+de/) || [])[1]; return { txt: String(l.a).replace(/^Alb\.\s*/, 'Albarán '), n, t: r2(l.t), pagado: n && pagados.has(n) }; }).sort((a, b) => a.txt.localeCompare(b.txt));
  x.fs.push({ t, num, ff, pag, queda, albs, edad: dias(ff, hoyS) }); x.queda += queda; x.total += Number(t.total);
  if (ff >= ini) x.actual += queda; else if (ff >= iniPasado) x.pasado += queda; else x.antigua += queda;
}
const lista = Object.values(C).filter(x => x.fs.length).sort((a, b) => b.queda - a.queda);
for (const x of lista) {
  const cs = cobros.filter(c => c.cod === x.cod && c.fc), ds = cs.map(c => dias(c.ff, c.fc)).filter(d => d >= 0).sort((a, b) => a - b);
  x.pago = tipoPago(x.cod); x.nCobros = cs.length; x.ultCobro = cs[0] ? cs[0].fc : null; x.medDias = ds.length ? ds[Math.floor(ds.length / 2)] : null;
  x.faltas = [];
  if (x.cl.dias_pago == null) x.faltas.push('En su ficha no están apuntados los días de plazo de pago.');
  if (!x.cl.telefono) x.faltas.push('Falta su teléfono en la ficha.');
  const viejasSinNota = x.fs.filter(f => f.edad > 60 && !f.pag);
  if (viejasSinNota.length) x.faltas.push(viejasSinNota.length + (viejasSinNota.length === 1 ? ' factura' : ' facturas') + ' de hace más de 2 meses sin ninguna nota de pago: ¿se cobró y no se marcó en Golden?');
  if (x.fs.some(f => f.t.aviso)) x.faltas.push('Hay una nota de Golden que no se entiende del todo (ver abajo).');
  if (!x.nCobros) x.faltas.push('No consta ningún cobro suyo en Golden en el último año.');
}
const T = k => r2(lista.reduce((a, x) => a + x[k], 0));
const total = T('queda'), actual = T('actual'), pasado = T('pasado'), antigua = T('antigua'), realDeuda = r2(pasado + antigua), aCuenta = r2(pend.reduce((a, t) => a + Math.min(pagadoNota(t), Number(t.total)), 0));
const nViejas = lista.reduce((a, x) => a + x.fs.filter(f => f.edad > 60 && !f.pag).length, 0), sViejas = r2(lista.reduce((a, x) => a + x.fs.filter(f => f.edad > 60 && !f.pag).reduce((s, f) => s + f.queda, 0), 0));
const top3 = lista.slice(0, 3), sTop3 = r2(top3.reduce((a, x) => a + x.queda, 0));
const mensualesPasado = r2(lista.filter(x => /Al mes/.test(x.pago)).reduce((a, x) => a + x.pasado, 0));
const nombra = (re) => lista.find(x => re.test(x.nom + ' ' + x.fiscal));
const ejemplos = [nombra(/florencio/i), nombra(/tejas/i)].filter(Boolean);

const tarjeta = (cifra, txt, cls) => `<div class="t ${cls || ''}"><b>${cifra}</b><span>${txt}</span></div>`;
const filaCli = x => {
  const est = x.antigua > 0.009 ? 'roja' : x.pasado > 0.009 ? 'ambar' : 'gris';
  const facts = x.fs.map(f => `<div class="fra">
  <div class="fra-c"><div><b>Factura ${esc(f.num)}</b> <small>del ${fecha(f.ff)} · hace ${f.edad} días</small></div><div class="imp"><b>${eur(f.queda)}</b>${f.pag ? `<small>de ${eur(f.t.total)}</small>` : ''}</div></div>
  ${f.pag ? `<div class="acta">Pagado a cuenta: <b>${eur(f.pag)}</b> · según la nota de Golden: «${esc(f.t.observacion)}»</div>` : ''}
  ${f.t.aviso ? `<div class="avi">⚠️ ${esc(f.t.aviso)}</div>` : ''}
  ${f.albs.length ? `<details><summary>${f.albs.length} ${f.albs.length === 1 ? 'albarán' : 'albaranes'}</summary><table><tbody>${f.albs.map(a => `<tr${a.pagado ? ' class="pg"' : ''}><td>${esc(a.txt)}</td><td>${a.pagado ? 'pagado a cuenta' : 'sin pagar'}</td><td class="n">${eur(a.t)}</td></tr>`).join('')}</tbody></table></details>` : ''}
</div>`).join('');
  return `<article class="cli ${est}" id="c-${esc(x.cod.replace(/[^A-Z0-9]/g, ''))}">
<header><div><h3>${esc(x.nom)}</h3><small>${esc(x.fiscal)} · código ${esc(x.cod)}</small></div><div class="imp"><b>${eur(x.queda)}</b><small>${x.fs.length} ${x.fs.length === 1 ? 'factura' : 'facturas'}</small></div></header>
<dl class="pago">
  <div><dt>Cómo paga (según Golden)</dt><dd>${esc(x.pago)}</dd></div>
  <div><dt>Ficha de la app</dt><dd>${x.cl.forma_pago === 'contado' ? 'Contado' : 'Crédito'}${x.cl.dias_pago != null ? ', ' + x.cl.dias_pago + ' días' : ', sin días de plazo'}</dd></div>
  <div><dt>Último cobro en Golden</dt><dd>${x.ultCobro ? fecha(x.ultCobro) + (x.medDias != null ? ` · suele tardar ${x.medDias} días` : '') : 'ninguno en un año'}</dd></div>
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
@media (max-width:480px){.pago{grid-template-columns:minmax(0,1fr)}}
</style>
<main>
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
<li>En las fichas de la app <b>no está apuntado el plazo de pago de ningún cliente</b>: por eso nadie sabía quién iba con retraso.${ejemplos.length ? ' Por ejemplo, ' + ejemplos.map(x => `${esc(x.nom)} debe ${eur(x.queda)}`).join(' y ') + '.' : ''}</li>
</ul></section>

<section class="bloque"><h2>Para preguntar a Carmen</h2><ul>
<li>¿Hay cobros hechos (transferencias, efectivo) que no estén marcados en Golden › Tesorería? Marcarlos el mismo día y con la fecha real.</li>
<li>De las facturas de más de 2 meses sin nota (marcadas abajo en naranja): ¿cuáles están cobradas y cuáles se deben de verdad?</li>
<li>Cuando un cliente paga una parte sin decir de qué albarán, apuntarlo en la nota como «A cuenta 300 €»: la app ya lo resta.</li>
<li>Plazo de pago de cada cliente (al contado, semanal, 15 días, al mes): decirlo para apuntarlo en su ficha.</li>
</ul></section>

<section class="bloque"><h2>Clientes que deben (${lista.length})</h2>
<p class="sub">Del que más debe al que menos. Borde rojo: tiene deuda antigua. Ámbar: solo de ${mesPasado}. Pulsa «albaranes» para ver el desglose.</p>
<div class="indice">${lista.map(x => `<button type="button" data-ir="c-${esc(x.cod.replace(/[^A-Z0-9]/g, ''))}">${esc(x.nom)} · ${eur(x.queda)}</button>`).join('')}</div></section>

${lista.map(filaCli).join('\n')}
<p class="sub">Fuente: Golden (Tesorería › Cobros pendientes, facturas y albaranes) y las fichas de clientes de la app. «Cómo paga» se deduce de sus facturas de los últimos 5 meses. «Suele tardar» son días entre la factura y el cobro marcado en Golden (si se marca tarde, sale más alto).</p>
</main>
<script>
document.querySelectorAll('[data-ir]').forEach(b => b.addEventListener('click', () => { const el = document.getElementById(b.dataset.ir); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }));
</script>`;
writeFileSync('docs/deudas.html', html);
console.log('docs/deudas.html:', lista.length, 'clientes ·', eur(total), '· deuda real', eur(realDeuda), '· antigua', eur(antigua), '· a cuenta', eur(aCuenta), '· ejemplos', ejemplos.map(x => x.nom).join(', '));
