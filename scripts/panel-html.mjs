// Página fijada «Panel Ferjusanz»: todo en una página, solo con datos REALES (Golden, facturas de proveedor, prospectos, web).
// Nada de pedidos ni cobros de la app (son de prueba). Solo lee.
// Uso: NODE_USE_ENV_PROXY=1 node scripts/panel-html.mjs   → docs/panel.html (luego publicarla con el Artifact en su URL de CLAUDE.md)
import { writeFileSync } from 'node:fs';

const sql = async q => {
  const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', {
    method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return r.json();
};
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const eur = n => Math.round(Number(n) || 0).toLocaleString('es-ES') + ' €';
const fecha = f => f ? new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : '—';
const mes = f => new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });

// «A cuenta» en la nota de Golden = ya pagado (Tito, 24/11/2026): «total» pasa a ser lo que de verdad queda por cobrar; «factura», el total de la factura.
const COBROS = `(select tipo, estado, vencimiento, serie, numero, fecha_factura, nombre, codigo, total factura,
  greatest(0, total - coalesce((select sum((p->>'importe')::numeric) from jsonb_array_elements(t.observacion_partes) p), 0)) total from golden_tesoreria t) c`;
const [[g], ventas, deudores, recibos, [cob], [pag], [prov], [cli], tareas] = await Promise.all([
  sql(`select max(fecha)::text hasta from golden_facturas where not borrador`),
  sql(`select date_trunc('month', fecha)::date::text m, sum(base) base,
         sum(base) filter (where coste > 0) base_c, sum(coste) filter (where coste > 0) coste
       from golden_facturas where not borrador and fecha >= date_trunc('month', current_date) - interval '5 months'
       group by 1 order by 1`),
  // Lo del mes en curso no es deuda: los de pago mensual pagan la 1.ª semana del mes siguiente (REGLAS_INTERNAS, Golden pendientes/pagadas).
  sql(`select nombre, sum(total) total, min(vencimiento)::text desde, count(*) n,
         sum(total) filter (where vencimiento < date_trunc('month', current_date) - interval '1 month') antigua
       from ${COBROS} where tipo = 'C' and estado = 'PEN' and total > 0.009 and vencimiento < date_trunc('month', current_date)
       group by nombre order by 2 desc`),
  sql(`select nombre, serie, numero, fecha_factura::text ff, vencimiento::text v, total, factura,
         vencimiento < date_trunc('month', current_date) - interval '1 month' antigua
       from ${COBROS} where tipo = 'C' and estado = 'PEN' and total > 0.009 and vencimiento < date_trunc('month', current_date)
       order by vencimiento`),
  sql(`select sum(total) pend,
         sum(total) filter (where vencimiento < date_trunc('month', current_date)) vencido,
         count(*) filter (where vencimiento < date_trunc('month', current_date)) n_venc,
         sum(total) filter (where vencimiento < date_trunc('month', current_date) - interval '1 month') antigua,
         sum(total) filter (where vencimiento >= date_trunc('month', current_date)) este_mes
       from ${COBROS} where tipo = 'C' and estado = 'PEN' and total > 0.009`),
  sql(`select sum(total) pend, sum(total) filter (where vencimiento < current_date) vencido,
         sum(total) filter (where vencimiento between current_date and current_date + 7) semana
       from golden_tesoreria where tipo = 'P' and estado = 'PEN'`),
  sql(`select count(*) filter (where estado = 'nueva') por_revisar, count(*) filter (where recibido_en > now() - interval '7 days') semana
       from facturas_recibidas`),
  sql(`select count(*) filter (where activo) activos from clientes`),
  sql(`select 'Mercado' t, max(fecha)::text f from resumen_mercado union all select 'Comercial del día', max(fecha)::text from resumen_comercial
       union all select 'Posibles clientes', max(fecha)::text from resumen_leads union all select 'Plan de la semana', max(fecha)::text from resumen_semana`),
]);

/* 📅 Avisos de cobro (Tito, 24/11/2026): cuándo le toca pagar a cada cliente según su ficha (pago_frecuencia/pago_dia) o, si no está apuntado, supuesto
   (factura P de fin de mes = al mes, día 7 del mes siguiente; otra = al contado). Misma regla que la app (fechaPrevista en public/index.html). */
const [pendAv, pagaron] = await Promise.all([
  sql(`select c2.nombre_comercial nc, c.nombre, c.serie, c.fecha_factura::text ff, c.total, c2.pago_frecuencia frec, c2.pago_dia dia, c2.pago_nota nota
       from ${COBROS} left join clientes c2 on upper(c2.codigo) = upper(c.codigo) where c.tipo = 'C' and c.estado = 'PEN' and c.total > 0.009`),
  sql(`select nombre, serie, numero, total, fecha_cobro_pago::text fc from golden_tesoreria where tipo = 'C' and estado = 'CO' and fecha_cobro_pago >= current_date - 7 and fecha_cobro_pago > fecha_factura order by fecha_cobro_pago desc`),
]);
const hoyS = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' }), sumaD = (f, n) => { const d = new Date(f + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toLocaleDateString('sv-SE'); };
const prevista = (ff, frec, dia) => { if (frec === 'contado') return ff; if (frec === 'quincenal') return sumaD(ff, 15);
  if (frec === 'semanal') { if (!(dia >= 1 && dia <= 7)) return sumaD(ff, 7); let f = ff; do f = sumaD(f, 1); while (((new Date(f + 'T12:00:00').getDay() + 6) % 7) + 1 !== dia); return f; }
  const d = new Date(ff + 'T12:00:00'), fin = new Date(d.getFullYear(), d.getMonth() + 2, 0).getDate(); d.setDate(1); d.setMonth(d.getMonth() + 1); d.setDate(Math.min(dia || 7, fin)); return d.toLocaleDateString('sv-SE'); };
const AV = {}; pendAv.forEach(t => { const n = (t.nc || t.nombre || '').trim(), frec = t.frec || (t.serie === 'P' ? 'mensual' : 'contado'), p = prevista(t.ff, frec, t.frec ? t.dia : null);
  const a = AV[n] || (AV[n] = { n, p, t: 0, ap: !!t.frec, nota: t.nota }); a.t += Number(t.total); if (p < a.p) a.p = p; });
const avL = Object.values(AV), tarde = avL.filter(a => a.p < hoyS).sort((a, b) => a.p.localeCompare(b.p)), proximos = avL.filter(a => a.p >= hoyS && a.p <= sumaD(hoyS, 7)).sort((a, b) => a.p.localeCompare(b.p));
const liAv = a => `<li><b>${esc(a.n)}</b> · ${eur(a.t)} <small>(${a.p === hoyS ? 'HOY' : fecha(a.p)}${a.ap ? '' : ', fecha supuesta'}${a.nota ? ' · ' + esc(a.nota) : ''})</small></li>`;
const nApuntados = avL.filter(a => a.ap).length;
const maxBase = Math.max(...ventas.map(v => Number(v.base) || 0), 1);
const filasVentas = ventas.map((v, i) => {
  const margen = v.base_c > 0 ? Math.round((v.base_c - v.coste) / v.base_c * 100) + ' %' : '—';
  const ultimo = i === ventas.length - 1;
  return `<tr><th scope="row">${mes(v.m)}${ultimo ? '*' : ''}</th>
<td class="barra"><span style="width:${Math.round(Number(v.base) / maxBase * 100)}%"></span></td><td>${eur(v.base)}</td><td>${margen}</td></tr>`;
}).join('\n');
const hoy = new Date(), mesNombre = d => d.toLocaleDateString('es-ES', { month: 'long' });
const mesPasado = mesNombre(new Date(hoy.getFullYear(), hoy.getMonth() - 1, 15)), mesActual = mesNombre(hoy);
const filasDeuda = deudores.map(d => {
  const rs = recibos.filter(r => r.nombre === d.nombre).map(r => `<li${r.antigua ? ' class="antigua"' : ''}>Factura ${esc(r.serie)}/${esc(r.numero)} del ${fecha(r.ff || r.v)} · <b>${eur(r.total)}</b>${Number(r.factura) - Number(r.total) > 0.009 ? ` <small>(de ${eur(r.factura)}; ${eur(r.factura - r.total)} pagado a cuenta)</small>` : ''}${r.antigua ? ' · antigua' : ''}</li>`).join('');
  return `<details><summary><b>${esc(d.nombre.trim())}</b> · ${eur(d.total)}${Number(d.antigua) > 0 ? ` <span class="antigua">(${eur(d.antigua)} de antes de ${mesPasado})</span>` : ''}</summary><ul>${rs}</ul></details>`;
}).join('');
const ahora = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });
const tarjeta = (cifra, texto, aviso) => `<div class="t${aviso ? ' aviso' : ''}"><b>${cifra}</b><span>${texto}</span></div>`;

const html = `<title>Panel Ferjusanz</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Una columna para el móvil: cifras clave arriba y bloques por tema debajo. */
:root{--bg:#f5f6f2;--fg:#1d261d;--muted:#5b675a;--line:#dbe1d7;--card:#fff;--acc:#2e7d32;--warn:#b45309;--bar:#a5d6a7}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#131913;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b352a;--card:#1a221a;--acc:#7cc47f;--warn:#f0a050;--bar:#2f6b33;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#131913;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b352a;--card:#1a221a;--acc:#7cc47f;--warn:#f0a050;--bar:#2f6b33;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 40px}
main{max-width:720px;margin:0 auto}
h1{font-size:1.5rem;margin:0}
.sub,small,.pie{color:var(--muted);font-size:.85rem}
.tarjetas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:14px 0}
.t{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;border-left:5px solid var(--acc)}
.t.aviso{border-left-color:var(--warn)}
.t b{display:block;font-size:1.35rem;font-variant-numeric:tabular-nums}
.t span{font-size:.85rem;color:var(--muted)}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:4px 16px 14px;margin-bottom:16px}
h2{font-size:1.1rem;margin:12px 0 6px}
table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
th,td{padding:5px 4px;text-align:right;white-space:nowrap}
th[scope=row]{text-align:left;font-weight:500}
thead th{font-size:.8rem;color:var(--muted);font-weight:500}
td.barra{width:100%;min-width:40px}
th,td{font-size:.95rem}
td.barra span{display:block;height:12px;background:var(--bar);border-radius:3px}
ul{padding-left:20px;margin:4px 0}li{margin:5px 0;overflow-wrap:anywhere}
a{color:var(--acc)}
button.tl{all:unset;display:block;cursor:pointer;text-align:left}button.tl:focus-visible{outline:2px solid var(--acc);border-radius:10px}button.tl .t{height:100%;box-sizing:border-box}
details{border-top:1px solid var(--line);padding:8px 0}summary{cursor:pointer;min-height:24px;overflow-wrap:anywhere}.r{color:var(--warn)}.antigua{color:var(--warn)}
html{scroll-behavior:smooth}#cobros{scroll-margin-top:12px}
</style>
<main>
<h1>Panel Ferjusanz</h1>
<p class="sub">Actualizado el ${ahora}. Datos de Golden hasta el ${fecha(g.hasta)}. Solo datos reales: los pedidos y cobros de la app aún son de prueba.</p>

<div class="tarjetas">
<button type="button" class="tl" onclick="document.getElementById('cobros').scrollIntoView({behavior:'smooth'})">${tarjeta(eur(cob.vencido), `deuda hasta ${mesPasado} (${cob.n_venc} recibos) · ver quién ›`, true)}</button>
${tarjeta(eur(ventas.at(-2)?.base), `ventas de ${ventas.at(-2) ? mes(ventas.at(-2).m) : 'el mes pasado'} (sin IVA)`)}
${tarjeta(prov.por_revisar, 'facturas de proveedor por revisar', prov.por_revisar > 0)}
${tarjeta(cli.activos, 'clientes activos')}
</div>

<section><h2>💶 Ventas por mes (Golden, sin IVA)</h2>
<table><thead><tr><th></th><th></th><th>Ventas</th><th>Margen</th></tr></thead><tbody>
${filasVentas}
</tbody></table>
<p class="pie">* Mes en curso. Las facturas mensuales (serie P) salen a final de mes: el mes en curso parece bajo hasta entonces.</p></section>

<section><h2>📅 Avisos de cobro</h2>
<p class="pie">Según cuándo paga cada cliente. ${nApuntados ? nApuntados + ' con la fecha apuntada en su ficha; el resto, supuesta (al mes = día 7 del mes siguiente).' : 'Aún no hay ningún cliente con su fecha de pago apuntada en la ficha: las fechas son supuestas (al mes = día 7 del mes siguiente). Se apunta en la app › ficha del cliente › «📅 Cuándo paga».'}</p>
<details${proximos.length ? ' open' : ''}><summary><b>Le toca pagar en 7 días (${proximos.length})</b></summary><ul>${proximos.map(liAv).join('') || '<li>Nadie.</li>'}</ul></details>
<details><summary><b class="r">Se ha pasado su fecha (${tarde.length})</b></summary><ul>${tarde.map(liAv).join('')}</ul></details>
<details open><summary><b>Han pagado esta semana (${pagaron.length})</b></summary><ul>${pagaron.map(x => `<li><b>${esc((x.nombre || '').trim())}</b> · ${eur(x.total)} <small>(factura ${esc(x.serie)}/${esc(x.numero)}, marcada cobrada el ${fecha(x.fc)})</small></li>`).join('') || '<li>Nadie marcado como cobrado en Golden.</li>'}</ul></details></section>

<section id="cobros"><h2>📥 Cobros (Golden)</h2>
<p>Deuda (hasta ${mesPasado}): <b>${eur(cob.vencido)}</b>. De ella, <b>${eur(Number(cob.vencido) - Number(cob.antigua || 0))}</b> es de ${mesPasado} y <b>${eur(cob.antigua)}</b> de antes (deuda antigua).</p>
<p class="pie">Lo de ${mesActual} (${eur(cob.este_mes)}) no cuenta como deuda: los que pagan al mes lo pagan la primera semana del mes siguiente. Las facturas mensuales de ${mesActual} aún no están hechas.</p>
<p>Todos los que deben (${deudores.length}), del que más al que menos. Pulsa un cliente para ver sus facturas; en naranja, la deuda antigua:</p>
${filasDeuda || '<p>Nada vencido.</p>'}</section>

<section><h2>📤 Pagos a proveedores (Golden)</h2>
<p>Sin marcar como pagado en Golden: <b>${eur(pag.pend)}</b> (vence esta semana: ${eur(pag.semana)}). Si es mucho, puede que en Golden falte marcar pagos ya hechos.</p>
<p>Facturas de proveedor llegadas en 7 días: <b>${prov.semana}</b> · por revisar en la app: <b>${prov.por_revisar}</b>.</p></section>

<section><h2>🎯 Clientes</h2>
<p>Clientes activos: <b>${cli.activos}</b>. Posibles clientes, a quién llamar y web: en <a href="https://claude.ai/artifact/WomsAtCVCe1cqaQCwqd9Wh">Comercial Ferjusanz</a>.</p></section>

<section><h2>🤖 Lo último de los ayudantes</h2>
<ul>${tareas.map(t => `<li>${t.t}: ${t.f ? 'del ' + fecha(t.f) : 'todavía no hay'}</li>`).join('')}</ul>
<p>Se leen en la app (📊 Resumen y correo) y en <a href="https://claude.ai/artifact/WomsAtCVCe1cqaQCwqd9Wh">Comercial Ferjusanz</a>.</p></section>

<section><h2>📌 Otras páginas</h2>
<ul><li><a href="https://claude.ai/artifact/5nRfWBHbCCBR6EBRJRxwND">Pendientes</a></li>
<li><a href="https://claude.ai/artifact/VSPKY1BfUkgc5CVJkm53hi">Plan Google y redes</a></li>
<li><a href="https://claude.ai/artifact/5qQe3mrM3E9wHwrQACgkmG">Reunión con Jorge</a></li></ul></section>
<p class="pie">Margen, compras y cobros: solo para Fernando, su padre y Jorge. Se actualiza solo cada mañana.</p>
</main>
`;
writeFileSync(new URL('../docs/panel.html', import.meta.url), html);
// También dentro de la app (📊 Panel, solo oficina y admin), en la real y en pruebas: así Jorge lo consulta sin Claude.
const dia = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
for (const ref of ['hvydnjaswdexttogsyen', 'pbeuxbwbpmlanbhhnpgy']) {
  const r = await fetch('https://api.supabase.com/v1/projects/' + ref + '/database/query', { method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: `insert into public.panel_empresa (fecha, html) values ('${dia}', $p$${html.replaceAll('$p$', '')}$p$) on conflict (fecha) do update set html = excluded.html, creado = now()` }) });
  console.log('app', ref, r.ok ? 'guardado' : 'ERROR ' + r.status + ' ' + (await r.text()).slice(0, 150));
}
console.log('docs/panel.html: Golden hasta', g.hasta, '· meses', ventas.length, '· deudores', deudores.length);
