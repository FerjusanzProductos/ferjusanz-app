// 📒 Cuenta de resultados de FERJUSANZ (Tito, 26/11/2026: «balance de pérdidas y ganancias… que pueda pinchar y ver dónde se van las pérdidas
// y dónde están las ganancias… un panel espectacular»). Solo datos REALES: Golden (ventas, coste, compras, cobros), nóminas (gastos_personal)
// y gastos fijos (gastos_fijos). Nada de pedidos ni cobros de la app. Solo LEE, salvo con --guardar (lo deja en panel_pyg para la app).
// Uso: NODE_USE_ENV_PROXY=1 node scripts/pyg-html.mjs [--guardar]  → docs/pyg.html (lleva sueldos: NO se sube al repositorio)
import { writeFileSync } from 'node:fs';

const REF = 'hvydnjaswdexttogsyen';
const sql = async q => {
  const r = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + (await r.text()).slice(0, 300));
  return r.json();
};
// Las facturas mensuales (serie P) de un mes se hicieron a veces los primeros días del siguiente (enero → 2-6 de febrero): cuentan en su mes.
const MES = `to_char(case when f.serie = 'P' and extract(day from f.fecha) <= 7 then f.fecha - interval '1 month' else f.fecha end, 'YYYY-MM')`;
// Solo meses cerrados: las facturas P del mes en curso aún no están hechas.
const CERRADO = `(case when f.serie = 'P' and extract(day from f.fecha) <= 7 then f.fecha - interval '1 month' else f.fecha end) < date_trunc('month', current_date)`;

const [[g], lineas, abonos, extra, compras, personal, fijos, deudas, nombresPro] = await Promise.all([
  sql(`select max(fecha)::text hasta from golden_facturas where not borrador`),
  sql(`select ${MES} m, upper(trim(f.cliente_nombre)) c, coalesce(l.producto_codigo, '') p,
         round(sum(l.neto), 2) v, round(sum(l.coste) filter (where l.coste > 0), 2) k, round(sum(l.neto) filter (where l.coste > 0), 2) vk,
         round(sum(l.cantidad), 1) q, round(sum(l.neto - l.coste) filter (where l.coste > 0 and l.neto < l.coste), 2) pe
       from golden_facturas f join golden_lineas l on l.factura_numero = f.numero
       where not f.borrador and not l.repetida and f.serie <> 'D' and ${CERRADO} group by 1, 2, 3`),
  sql(`select ${MES} m, upper(trim(f.cliente_nombre)) c, f.numero n, round(f.base, 2) v from golden_facturas f
       where not f.borrador and f.serie = 'R' and ${CERRADO} order by 1`),
  sql(`select f.fecha::text, ${MES} m, f.numero, round(f.base, 2) v, (select string_agg(l.descripcion, ' ') from golden_lineas l where l.factura_numero = f.numero) d
       from golden_facturas f where not f.borrador and f.serie = 'D'`),
  sql(`select to_char(fecha, 'YYYY-MM') m, proveedor_nombre p, round(sum(base), 2) v from golden_compras
       where fecha < date_trunc('month', current_date) and proveedor_nombre <> '' group by 1, 2`),
  sql(`select to_char(mes, 'YYYY-MM') m, trabajador t, dias, bruto, ss_empresa ss, liquido, nota from gastos_personal order by mes, trabajador`),
  sql(`select concepto, grupo, importe_mes::float i, to_char(desde, 'YYYY-MM') d, to_char(hasta, 'YYYY-MM') h, nota, en_resultado r from gastos_fijos`),
  sql(`select nombre, round(sum(total), 2) total, min(vencimiento)::text desde from (
         select nombre, vencimiento, greatest(0, total - coalesce((select sum((p->>'importe')::numeric) from jsonb_array_elements(t.observacion_partes) p), 0)) total
         from golden_tesoreria t where tipo = 'C' and estado = 'PEN') c
       where total > 0.009 and vencimiento < date_trunc('month', current_date) - interval '1 month' group by nombre order by 2 desc`),
  sql(`select producto_codigo p, mode() within group (order by descripcion) d from golden_lineas where producto_codigo is not null group by 1`),
]);

const meses = [...new Set(lineas.map(x => x.m))].sort();
const cli = [...new Set(lineas.map(x => x.c))].sort(), ci = Object.fromEntries(cli.map((c, i) => [c, i]));
const nomP = Object.fromEntries(nombresPro.map(x => [x.p, (x.d || x.p).trim()]));
const pro = [...new Set(lineas.map(x => x.p))].sort(), pi = Object.fromEntries(pro.map((p, i) => [p, i]));
const mi = Object.fromEntries(meses.map((m, i) => [m, i]));
const n = x => x == null ? 0 : Math.round(Number(x) * 100) / 100;

// Nóminas: lo que hay de cada mes; los meses sin nómina copian el más cercano (Tito: «es así durante el año, las nóminas no suelen cambiar»).
const pmeses = [...new Set(personal.map(x => x.m))].sort();
const pers = [];
for (const m of meses) {
  const base = pmeses.includes(m) ? m : (m < pmeses[0] ? pmeses[0] : pmeses[pmeses.length - 1]);
  for (const x of personal.filter(y => y.m === base)) pers.push([mi[m], x.t, n(x.bruto), n(x.ss), base !== m ? 1 : 0, x.nota || '']);
}
const fij = [];
const fuera = [];
for (const m of meses) for (const f of fijos) if (f.d <= m && (!f.h || f.h >= m)) (f.r ? fij : fuera).push([mi[m], f.grupo, f.concepto, n(f.i), f.nota || '', f.d === f.h ? 1 : 0]);

const D = {
  hasta: g.hasta, hoy: new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' }), meses, cli,
  pro: pro.map(p => [p, nomP[p] || p]),
  v: lineas.filter(x => mi[x.m] != null).map(x => [mi[x.m], ci[x.c], pi[x.p], n(x.v), n(x.k), n(x.vk), n(x.q), n(x.pe)]),
  ab: abonos.filter(x => mi[x.m] != null).map(x => [mi[x.m], x.c, x.n, n(x.v)]),
  ex: extra.map(x => [mi[x.m] ?? -1, x.fecha, x.numero, n(x.v), (x.d || '').replace(/\s+/g, ' ').trim()]),
  co: compras.filter(x => mi[x.m] != null).map(x => [mi[x.m], x.p, n(x.v)]),
  pe: pers, fi: fij, fu: fuera,
  de: deudas.map(x => [x.nombre, n(x.total), x.desde]),
};
const datos = JSON.stringify(D).replace(/</g, '\\u003c');

const html = `<title>Cuenta de resultados</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap">
<style>
/* Libro de cuentas de un almacén de Mercamadrid: verde de hoja para lo que se gana, rojo de tomate para lo que se pierde, ocre de patata para lo elegido. Una columna en el móvil, dos en pantalla grande. */
:root{--bg:#f3f6f1;--panel:#ffffff;--ink:#16231b;--muted:#5c6b61;--line:#dbe3dc;--gana:#1d7a4c;--gana-bg:#e3f1e8;--pierde:#c0412b;--pierde-bg:#f9e5e0;--acento:#a8701a;--acento-bg:#f6ead3;--barra:#c9d6cc;
--f-titulo:"Bricolage Grotesque","Trebuchet MS",system-ui,sans-serif;--f-texto:"Figtree",system-ui,-apple-system,"Segoe UI",sans-serif;--f-num:"JetBrains Mono",ui-monospace,"SFMono-Regular",Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#0e1611;--panel:#16211a;--ink:#e3ece5;--muted:#9aaa9f;--line:#28362d;--gana:#4cc38a;--gana-bg:#173326;--pierde:#f0745d;--pierde-bg:#3a1c16;--acento:#e2aa4c;--acento-bg:#3a2c12;--barra:#33443a;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#0e1611;--panel:#16211a;--ink:#e3ece5;--muted:#9aaa9f;--line:#28362d;--gana:#4cc38a;--gana-bg:#173326;--pierde:#f0745d;--pierde-bg:#3a1c16;--acento:#e2aa4c;--acento-bg:#3a2c12;--barra:#33443a;color-scheme:dark}
*{box-sizing:border-box}
body{background:var(--bg);color:var(--ink);font:15px/1.5 var(--f-texto);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 48px}
main{max-width:1120px;margin:0 auto;display:grid;gap:18px}
h1,h2,h3{font-family:var(--f-titulo);text-wrap:balance;margin:0;letter-spacing:-.01em}
h1{font-size:clamp(1.7rem,4.6vw,2.6rem);font-weight:800;line-height:1.05}
h2{font-size:1.15rem;font-weight:700}
.eti{font-size:.72rem;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);font-weight:600}
.num{font-family:var(--f-num);font-variant-numeric:tabular-nums;white-space:nowrap}
.sub{color:var(--muted);font-size:.88rem}
header{display:grid;gap:6px}
.chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;scrollbar-width:thin}
.chip{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--ink);border-radius:999px;padding:6px 12px;font:600 .85rem var(--f-texto);cursor:pointer}
.chip[aria-pressed="true"]{background:var(--acento-bg);border-color:var(--acento);color:var(--ink)}
.chip:focus-visible,.fila:focus-visible,button:focus-visible,input:focus-visible{outline:2px solid var(--acento);outline-offset:2px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px}
.kpi{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:12px 14px;display:grid;gap:2px;min-width:0}
.kpi .valor{font-family:var(--f-num);font-weight:700;font-size:clamp(1.15rem,3.6vw,1.5rem);font-variant-numeric:tabular-nums}
.kpi.res{border-color:var(--gana);background:var(--gana-bg)}
.kpi.res.neg{border-color:var(--pierde);background:var(--pierde-bg)}
.caja{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:16px;display:grid;gap:12px;min-width:0}
.dos{display:grid;gap:18px;grid-template-columns:1fr}
@media (min-width:900px){.dos{grid-template-columns:1fr 1fr}}
svg{display:block;width:100%;height:auto;max-width:100%}
svg text{font-family:var(--f-num);fill:var(--muted)}
.bar{cursor:pointer;transition:opacity .15s}
.bar:hover{opacity:.8}
.tabs{display:flex;gap:4px;border-bottom:1px solid var(--line);overflow-x:auto}
.tab{flex:none;border:0;background:none;color:var(--muted);font:700 .92rem var(--f-texto);padding:8px 12px;border-bottom:3px solid transparent;cursor:pointer}
.tab[aria-selected="true"]{color:var(--ink);border-color:var(--acento)}
.lista{display:grid}
.fila{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:2px 10px;padding:9px 4px;border-top:1px solid var(--line);cursor:pointer;align-items:baseline}
.fila:first-child{border-top:0}
.fila .nom{overflow-wrap:anywhere;font-weight:600}
.fila .det{grid-column:1/-1;font-size:.8rem;color:var(--muted)}
.fila .mini{grid-column:1/-1;height:6px;border-radius:3px;background:var(--barra);overflow:hidden}
.fila .mini span{display:block;height:100%}
.fila[aria-expanded="true"]{background:var(--acento-bg);border-radius:8px}
.abre{grid-column:1/-1;display:grid;gap:2px;padding:6px 0 4px 10px;border-left:3px solid var(--acento);margin:4px 0;font-size:.85rem;cursor:auto}
.abre .l{display:flex;justify-content:space-between;gap:10px}
.abre .l span:first-child{overflow-wrap:anywhere;min-width:0}
.g{color:var(--gana)} .p{color:var(--pierde)}
.pill{display:inline-block;border-radius:999px;padding:1px 8px;font-size:.75rem;font-weight:700}
.pill.g{background:var(--gana-bg)} .pill.p{background:var(--pierde-bg)}
.aviso{background:var(--acento-bg);border-radius:12px;padding:10px 12px;font-size:.85rem}
table{border-collapse:collapse;width:100%;font-size:.85rem}
th,td{padding:6px 8px;border-top:1px solid var(--line);text-align:right;white-space:nowrap}
th:first-child,td:first-child{text-align:left;white-space:normal}
th{font-weight:600;color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.05em}
.scroll{overflow-x:auto}
.sim{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}
.sim label{display:grid;gap:4px;font-size:.85rem;font-weight:600}
.sim input{font:600 1rem var(--f-num);padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:var(--bg);color:var(--ink);width:100%}
.pie{font-size:.8rem;color:var(--muted)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
<main>
<header>
  <span class="eti">Ferjusanz Productos Hortofrutícolas S.L. · sin IVA</span>
  <h1>Cuenta de resultados 2026</h1>
  <span class="sub" id="fuente"></span>
  <div class="chips" id="periodos" role="group" aria-label="Periodo"></div>
</header>
<section class="kpis" id="kpis"></section>
<section class="caja">
  <div><h2>De lo que se vende a lo que queda</h2><span class="sub">Pincha una barra para ver el detalle.</span></div>
  <div id="cascada"></div>
</section>
<section class="caja">
  <div><h2>Mes a mes</h2><span class="sub">Margen bruto (claro) y lo que queda tras gastos (fuerte). Pincha un mes para verlo solo.</span></div>
  <div class="scroll"><div id="meses" style="min-width:520px"></div></div>
</section>
<section class="caja">
  <div class="tabs" role="tablist" id="tabs"></div>
  <div id="panel"></div>
</section>
<p class="pie" id="pie"></p>
</main>
<script>
const D = ${datos};
const $ = s => document.querySelector(s), h = (t, a = {}, ...c) => { const e = document.createElement(t); for (const k in a) k.startsWith('on') ? e.addEventListener(k.slice(2), a[k]) : e.setAttribute(k, a[k]); e.append(...c.flat().filter(x => x != null && x !== false)); return e; };
const eur = x => Math.round(x).toLocaleString('es-ES') + ' €', pct = (a, b) => b ? (Math.round(a / b * 1000) / 10).toLocaleString('es-ES') + ' %' : '—';
const NM = m => new Date(m + '-15').toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
const NML = m => new Date(m + '-15').toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } } };
const N = D.meses.length, ult3 = D.meses.slice(-3).map((m, i) => N - 3 + i);
const PERIODOS = [['ano', 'Año (' + NM(D.meses[0]) + '–' + NM(D.meses[N - 1]) + ')', D.meses.map((m, i) => i)], ['tri', 'Últimos 3 meses', ult3], ...D.meses.map((m, i) => ['m' + i, NM(m), [i]]).reverse()];
let per = ls.get('pyg_per', 'ano'); if (!PERIODOS.some(p => p[0] === per)) per = 'ano';
let tab = ls.get('pyg_tab', 'gana');
const SIMS = [['puesto', 'Puesto o nave en Mercamadrid (no sale en el banco)'], ['autonomos', 'Cuotas de autónomos (tu padre y Juli)'], ['cb', 'Lo que se paga desde la cuenta de la C.B.'], ['seguros', 'Otros seguros (además de AXA)'], ['otros', 'Otros']];
let sim = ls.get('pyg_sim', {});

function calc(ms) {
  const S = new Set(ms), r = { v: 0, k: 0, vk: 0, pe: 0, pers: 0, fij: 0, ex: 0, ab: 0, cli: {}, pro: {}, cp: {}, perd: {}, perdC: {}, persL: {}, fijL: {}, compras: {}, abL: [], exL: [] };
  for (const [m, c, p, v, k, vk, q, pe] of D.v) if (S.has(m)) {
    r.v += v; r.k += k; r.vk += vk; r.pe += pe;
    const C = r.cli[c] ??= { v: 0, k: 0, vk: 0, pe: 0 }, P = r.pro[p] ??= { v: 0, k: 0, vk: 0, pe: 0, q: 0 };
    C.v += v; C.k += k; C.vk += vk; C.pe += pe; P.v += v; P.k += k; P.vk += vk; P.pe += pe; P.q += q;
    const x = r.cp[c + '|' + p] ??= { c, p, v: 0, k: 0, vk: 0, pe: 0, q: 0 }; x.v += v; x.k += k; x.vk += vk; x.pe += pe; x.q += q;
  }
  for (const [m, t, b, ss, est, nota] of D.pe) if (S.has(m)) { const x = r.persL[t] ??= { b: 0, ss: 0, est: 0, nota, meses: [] }; x.b += b; x.ss += ss; x.est += est; x.meses.push([m, b + ss, est]); r.pers += b + ss; }
  for (const [m, g, c, i, nota, una] of D.fi) if (S.has(m)) { const x = r.fijL[g] ??= { t: 0, l: {} }; x.t += i; const y = x.l[c] ??= { t: 0, nota, n: 0, una }; y.t += i; y.n++; r.fij += i; }
  for (const [m, p, v] of D.co) if (S.has(m)) r.compras[p] = (r.compras[p] || 0) + v;
  for (const [m, c, num, v] of D.ab) if (S.has(m)) { r.ab += v; r.abL.push([c, num, v, m]); }
  for (const [m, f, num, v, d] of D.ex) if (S.has(m)) { r.ex += v; r.exL.push([f, num, v, d]); }
  const simMes = SIMS.reduce((a, [k]) => a + (Number(sim[k]) || 0), 0);
  r.mg = r.vk - r.k; r.mgTodo = r.v - r.k; r.res = r.mgTodo - r.pers - r.fij; r.sim = simMes * ms.length; r.resSim = r.res - r.sim; r.n = ms.length;
  return r;
}

function periodo() { return PERIODOS.find(p => p[0] === per)[2]; }
function pintarPeriodos() { $('#periodos').replaceChildren(...PERIODOS.map(([k, t]) => h('button', { class: 'chip', 'aria-pressed': String(k === per), onclick: () => { per = k; ls.set('pyg_per', k); todo(); } }, t))); }

function kpis(r) {
  const neg = r.resSim < 0, anual = r.resSim / r.n * 12;
  const k = (t, v, s, cls = '') => h('div', { class: 'kpi ' + cls }, h('span', { class: 'eti' }, t), h('span', { class: 'valor' }, v), h('span', { class: 'sub' }, s));
  $('#kpis').replaceChildren(
    k('Ventas', eur(r.v), r.n > 1 ? eur(r.v / r.n) + ' al mes' : NML(D.meses[periodo()[0]])),
    k('Margen bruto', eur(r.mgTodo), pct(r.mg, r.vk) + ' de lo vendido'),
    k('Gastos', eur(r.pers + r.fij + r.sim), 'Personal ' + eur(r.pers) + ' · fijos ' + eur(r.fij + r.sim)),
    k(r.sim ? 'Queda (con lo que has puesto)' : 'Queda antes de impuestos', eur(r.resSim), (r.n > 1 ? eur(r.resSim / r.n) + ' al mes · ' : '') + pct(r.resSim, r.v) + ' de las ventas', 'res' + (neg ? ' neg' : '')),
    k('A este ritmo, al año', eur(anual), 'Sin lo que falta por apuntar' + (r.sim ? ' (ya restado lo del simulador)' : ''), anual < 0 ? 'p' : ''));
}

function cascada(r) {
  const pasos = [['Ventas', r.v, 'ventas', 0], ['Coste de la mercancía', -r.k, 'mercancia', 1], ['Margen bruto', r.mgTodo, 'gana', 2], ['Personal', -r.pers, 'personal', 1], ['Gastos fijos', -r.fij, 'fijos', 1]];
  if (r.sim) pasos.push(['Lo del simulador', -r.sim, 'simulador', 1]);
  pasos.push(['Queda', r.resSim, 'gana', 2]);
  const W = Math.max(340, Math.min(900, $('#cascada').clientWidth || 720)), H = W < 500 ? 280 : 300, top = 26, bot = 56, max = Math.max(r.v, 1), y = v => top + (H - top - bot) * (1 - v / max), bw = W / pasos.length;
  const estrecho = W < 560, fs = estrecho ? 11 : 12, partir = t => { const p = t.split(' '); if (p.length < 2 || (!estrecho && t.length <= 14)) return [t]; const c = Math.ceil(p.length / 2); return [p.slice(0, c).join(' '), p.slice(c).join(' ')]; };
  let acc = 0; const s = [];
  pasos.forEach(([t, v, dest, tipo], i) => {
    let a, b; if (tipo === 0 || tipo === 2) { a = 0; b = v; acc = v; } else { a = acc; b = acc + v; acc = b; }
    const y1 = y(Math.max(a, b)), y2 = y(Math.min(a, b)), x = i * bw + bw * .14, w = bw * .72;
    const col = tipo === 1 ? 'var(--pierde)' : v < 0 ? 'var(--pierde)' : tipo === 2 ? 'var(--gana)' : 'var(--ink)';
    s.push(\`<g class="bar" data-dest="\${dest}" tabindex="0" role="button" aria-label="\${t}: \${eur(Math.abs(v))}"><rect x="\${x}" y="\${y1}" width="\${w}" height="\${Math.max(2, y2 - y1)}" rx="5" fill="\${col}" opacity="\${tipo === 1 ? .85 : 1}"/>
      <text x="\${x + w / 2}" y="\${y1 - 7}" text-anchor="middle" font-size="\${fs}" font-weight="700" style="fill:var(--ink)">\${(tipo === 1 ? '−' : '') + (estrecho ? Math.round(Math.abs(v) / 1000) + 'k' : eur(Math.abs(v)).replace(' €', ''))}</text>
      \${partir(t).map((tt, j) => \`<text x="\${x + w / 2}" y="\${H - bot + 18 + j * 14}" text-anchor="middle" font-size="\${fs - 1}">\${tt}</text>\`).join('')}</g>\`);
    if (i < pasos.length - 1) s.push(\`<line x1="\${x + w}" x2="\${(i + 1) * bw + bw * .14}" y1="\${y(acc)}" y2="\${y(acc)}" stroke="var(--barra)" stroke-dasharray="3 3"/>\`);
  });
  $('#cascada').innerHTML = \`<svg viewBox="0 0 \${W} \${H}" role="img" aria-label="Cascada de la cuenta de resultados"><line x1="0" x2="\${W}" y1="\${y(0)}" y2="\${y(0)}" stroke="var(--line)"/>\${s.join('')}</svg>\`;
  $('#cascada').querySelectorAll('.bar').forEach(b => { const ir = () => { const d = b.dataset.dest; tab = { ventas: 'clientes', mercancia: 'gastos', personal: 'gastos', fijos: 'gastos', simulador: 'simulador', gana: 'gana' }[d]; ls.set('pyg_tab', tab); pintarTab(calc(periodo())); $('#tabs').scrollIntoView({ behavior: 'smooth', block: 'start' }); };
    b.addEventListener('click', ir); b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } }); });
}

function mesAMes() {
  const rs = D.meses.map((m, i) => calc([i])), W = Math.max(520, N * 64), H = 240, top = 22, bot = 34;
  const max = Math.max(...rs.map(r => r.mgTodo), 1), min = Math.min(0, ...rs.map(r => r.resSim)), y = v => top + (H - top - bot) * (max - v) / (max - min), bw = W / N;
  const sel = new Set(periodo()), grid = [];
  for (let v = 0; v <= max; v += 10000) grid.push(\`<line x1="0" x2="\${W}" y1="\${y(v)}" y2="\${y(v)}" stroke="var(--line)"/><text x="2" y="\${y(v) - 3}" font-size="10">\${v / 1000}k</text>\`);
  const barras = rs.map((r, i) => { const x = i * bw + bw * .18, w = bw * .64, act = sel.has(i);
    return \`<g class="bar" data-i="\${i}" tabindex="0" role="button" aria-label="\${NML(D.meses[i])}: queda \${eur(r.resSim)}" opacity="\${act ? 1 : .45}">
      <rect x="\${x}" y="\${y(r.mgTodo)}" width="\${w}" height="\${y(0) - y(r.mgTodo)}" rx="4" fill="var(--gana-bg)" stroke="var(--gana)" stroke-width=".6"/>
      <rect x="\${x + w * .2}" y="\${y(Math.max(0, r.resSim))}" width="\${w * .6}" height="\${Math.abs(y(0) - y(r.resSim))}" rx="3" fill="\${r.resSim < 0 ? 'var(--pierde)' : 'var(--gana)'}"/>
      <text x="\${x + w / 2}" y="\${y(r.mgTodo) - 5}" text-anchor="middle" font-size="10" style="fill:var(--ink)">\${Math.round(r.resSim / 100) / 10}k</text>
      <text x="\${x + w / 2}" y="\${H - 12}" text-anchor="middle" font-size="11" font-weight="\${act ? 700 : 500}" style="fill:\${act ? 'var(--ink)' : 'var(--muted)'}">\${NM(D.meses[i])}</text></g>\`; });
  $('#meses').innerHTML = \`<svg viewBox="0 0 \${W} \${H}" role="img" aria-label="Margen y lo que queda, mes a mes">\${grid.join('')}<line x1="0" x2="\${W}" y1="\${y(0)}" y2="\${y(0)}" stroke="var(--muted)"/>\${barras.join('')}</svg>\`;
  $('#meses').querySelectorAll('.bar').forEach(b => { const ir = () => { per = 'm' + b.dataset.i; ls.set('pyg_per', per); todo(); }; b.addEventListener('click', ir); b.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ir(); } }); });
}

// Fila que se abre al pincharla
function fila(nom, valor, det, abrir, barra) {
  const f = h('div', { class: 'fila', tabindex: '0', role: 'button', 'aria-expanded': 'false' }, h('span', { class: 'nom' }, nom), h('span', { class: 'num' }, valor), det ? h('span', { class: 'det' }, det) : null, barra || null);
  let ab = null; const t = e => { if (ab && ab.contains(e.target)) return; if (!abrir) return; if (ab) { ab.remove(); ab = null; f.setAttribute('aria-expanded', 'false'); } else { ab = h('div', { class: 'abre' }, ...abrir()); f.append(ab); f.setAttribute('aria-expanded', 'true'); } };
  f.addEventListener('click', t); f.addEventListener('keydown', e => { if (e.target === f && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); t(e); } });
  return f;
}
const l = (a, b, cls = '') => h('div', { class: 'l' }, h('span', {}, a), h('span', { class: 'num ' + cls }, b));
const mini = (v, max, cls) => h('div', { class: 'mini' }, h('span', { style: \`width:\${Math.max(2, Math.min(100, Math.abs(v) / max * 100))}%;background:var(--\${cls})\` }));
const nomPro = p => D.pro[p][1], nomCli = c => D.cli[c];
const margen = x => x.vk - x.k;
function desglose(r, campo, id, n = 12) {
  const xs = Object.values(r.cp).filter(x => x[campo] == id).sort((a, b) => margen(b) - margen(a)), out = [];
  const mejores = xs.slice(0, n), peores = xs.filter(x => margen(x) < 0).slice(-5).reverse();
  out.push(h('span', { class: 'eti' }, campo === 'c' ? 'Productos que más le dejan' : 'Clientes a los que más deja'));
  for (const x of mejores) out.push(l((campo === 'c' ? nomPro(x.p) : nomCli(x.c)) + ' · vendido ' + eur(x.v), (margen(x) >= 0 ? '+' : '') + eur(margen(x)), margen(x) >= 0 ? 'g' : 'p'));
  if (peores.length) { out.push(h('span', { class: 'eti', style: 'margin-top:6px' }, 'Donde pierde')); for (const x of peores) out.push(l((campo === 'c' ? nomPro(x.p) : nomCli(x.c)) + ' · vendido ' + eur(x.v), eur(margen(x)), 'p')); }
  if (xs.length > n) out.push(h('span', { class: 'sub' }, 'y ' + (xs.length - n) + ' más'));
  return out;
}

function tabGana(r) {
  const cs = Object.entries(r.cli).map(([c, x]) => ({ c, ...x, m: margen(x) })).sort((a, b) => b.m - a.m), ps = Object.entries(r.pro).map(([p, x]) => ({ p, ...x, m: margen(x) })).sort((a, b) => b.m - a.m);
  const maxC = cs[0]?.m || 1, maxP = ps[0]?.m || 1, top10c = cs.slice(0, 10).reduce((a, x) => a + x.m, 0);
  return [h('div', { class: 'aviso' }, 'Los 10 clientes que más dejan suman ' + eur(top10c) + ' de margen: el ' + pct(top10c, r.mgTodo) + ' de todo lo que se gana con la mercancía.'),
    h('div', { class: 'dos' },
      h('div', {}, h('h3', {}, 'Clientes que más dejan'), h('div', { class: 'lista' }, ...cs.slice(0, 15).map(x => fila(nomCli(x.c), '+' + eur(x.m), 'Vende ' + eur(x.v) + ' · margen ' + pct(x.m, x.vk), () => desglose(r, 'c', x.c), mini(x.m, maxC, 'gana'))))),
      h('div', {}, h('h3', {}, 'Productos que más dejan'), h('div', { class: 'lista' }, ...ps.slice(0, 15).map(x => fila(nomPro(x.p), '+' + eur(x.m), 'Vende ' + eur(x.v) + (x.q ? ' · ' + Math.round(x.q).toLocaleString('es-ES') + ' uds/kg' : '') + ' · margen ' + pct(x.m, x.vk), () => desglose(r, 'p', x.p), mini(x.m, maxP, 'gana'))))))];
}

function tabPierde(r) {
  const out = [];
  const bajo = Object.entries(r.pro).filter(([, x]) => x.pe < 0).map(([p, x]) => ({ p, pe: x.pe })).sort((a, b) => a.pe - b.pe);
  const bajoC = Object.entries(r.cli).filter(([, x]) => x.pe < 0).map(([c, x]) => ({ c, pe: x.pe })).sort((a, b) => a.pe - b.pe);
  const totBajo = bajo.reduce((a, x) => a + x.pe, 0);
  const flojos = Object.entries(r.cli).map(([c, x]) => ({ c, ...x, m: margen(x) })).filter(x => x.vk >= 300 * r.n).sort((a, b) => a.m / a.vk - b.m / b.vk).slice(0, 10);
  const deBaja = Object.entries(r.persL).filter(([t]) => /baja/i.test(t));
  const totDeuda = D.de.reduce((a, x) => a + x[1], 0);
  out.push(h('div', { class: 'aviso' }, 'Aquí está todo lo que resta. Lo que más pesa son las nóminas (' + eur(r.pers) + ') y los gastos fijos (' + eur(r.fij) + '). Vender por debajo de lo que costó la mercancía ha costado ' + eur(-totBajo) + '.'));
  const maxB = -(bajo[0]?.pe || 1), maxBC = -(bajoC[0]?.pe || 1);
  out.push(h('div', { class: 'dos' },
    h('div', {}, h('h3', {}, 'Vendido por debajo de lo que costó'), h('span', { class: 'sub' }, 'Por producto. Pincha para ver a quién.'), h('div', { class: 'lista' }, ...bajo.slice(0, 12).map(x => fila(nomPro(x.p), eur(x.pe), null, () => Object.values(r.cp).filter(y => y.p == x.p && y.pe < 0).sort((a, b) => a.pe - b.pe).slice(0, 10).map(y => l(nomCli(y.c), eur(y.pe), 'p')), mini(x.pe, maxB, 'pierde'))))),
    h('div', {}, h('h3', {}, 'Clientes a los que se vende por debajo de coste'), h('span', { class: 'sub' }, 'Pincha para ver qué productos.'), h('div', { class: 'lista' }, ...bajoC.slice(0, 12).map(x => fila(nomCli(x.c), eur(x.pe), null, () => Object.values(r.cp).filter(y => y.c == x.c && y.pe < 0).sort((a, b) => a.pe - b.pe).slice(0, 10).map(y => l(nomPro(y.p), eur(y.pe), 'p')), mini(x.pe, maxBC, 'pierde')))))));
  out.push(h('div', { class: 'dos' },
    h('div', {}, h('h3', {}, 'Clientes con el margen más bajo'), h('span', { class: 'sub' }, 'Se les vende mucho pero dejan poco por cada euro.'), h('div', { class: 'lista' }, ...flojos.map(x => fila(nomCli(x.c), pct(x.m, x.vk), 'Vende ' + eur(x.v) + ' · deja ' + eur(x.m), () => desglose(r, 'c', x.c, 8))))),
    h('div', {}, h('h3', {}, 'Otras fugas'), h('div', { class: 'lista' },
      ...deBaja.map(([t, x]) => fila(t, '−' + eur(x.b + x.ss), 'Coste para la empresa estando de baja (complemento y Seguridad Social)', () => x.meses.map(([m, v, est]) => l(NML(D.meses[m]) + (est ? ' (estimado)' : ''), '−' + eur(v), 'p')))),
      r.ab ? fila('Abonos a clientes (rectificativas)', eur(r.ab), r.abL.length + ' facturas', () => r.abL.map(([c, num, v, m]) => l(c + ' · ' + num + ' · ' + NM(D.meses[m]), eur(v), 'p'))) : null,
      fila('Nos deben desde hace más de 2 meses', eur(totDeuda), 'No es pérdida todavía, pero es dinero en riesgo. ' + D.de.length + ' clientes.', () => D.de.slice(0, 15).map(([c, v, d]) => l(c + ' · desde ' + new Date(d).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }), eur(v), 'p')))))));
  return out;
}

function tabGastos(r) {
  const out = [];
  const pers = Object.entries(r.persL).sort((a, b) => (b[1].b + b[1].ss) - (a[1].b + a[1].ss)), maxP = pers[0] ? pers[0][1].b + pers[0][1].ss : 1;
  const est = pers.some(([, x]) => x.est);
  out.push(h('div', { class: 'dos' },
    h('div', {}, h('h3', {}, 'Personal · ' + eur(r.pers)), h('span', { class: 'sub' }, 'Coste para la empresa: sueldo bruto + Seguridad Social.' + (est ? ' Los meses sin nómina se copian del más cercano.' : '')),
      h('div', { class: 'lista' }, ...pers.map(([t, x]) => fila(t, eur(x.b + x.ss), (r.n > 1 ? eur((x.b + x.ss) / x.meses.length) + ' al mes · ' : '') + 'bruto ' + eur(x.b) + ' + S. Social ' + eur(x.ss), () => [h('span', { class: 'sub' }, x.nota), ...x.meses.map(([m, v, e]) => l(NML(D.meses[m]) + (e ? ' (copiado)' : ''), eur(v)))], mini(x.b + x.ss, maxP, 'pierde'))))),
    h('div', {}, h('h3', {}, 'Gastos fijos · ' + eur(r.fij)), h('span', { class: 'sub' }, 'De las facturas y del banco (sin IVA). Pincha un grupo para ver cada gasto.'),
      h('div', { class: 'lista' }, ...Object.entries(r.fijL).sort((a, b) => b[1].t - a[1].t).map(([g, x]) => fila(g, eur(x.t), Object.keys(x.l).length + ' conceptos', () => Object.entries(x.l).map(([c, y]) => h('div', {}, l(c + (y.una ? ' (una vez)' : ' · ' + y.n + ' meses'), eur(y.t)), h('div', { class: 'sub' }, y.nota)))))))));
  const fu = {}; for (const [m, g, c, i] of D.fu) if (periodo().includes(m)) fu[c] = (fu[c] || 0) + i;
  const fuL = Object.entries(fu).sort((a, b) => b[1] - a[1]);
  if (fuL.length) out.push(h('div', {}, h('h3', {}, 'Pagos del banco que no son gasto del año'), h('span', { class: 'sub' }, 'Salen de la cuenta, pero no restan en el resultado: deudas de 2025, pagos a los socios fuera de nómina, IVA a Hacienda…'),
    h('div', { class: 'lista' }, ...fuL.map(([c, v]) => fila(c, eur(v), null, null)))));
  const comp = Object.entries(r.compras).sort((a, b) => b[1] - a[1]), totC = comp.reduce((a, x) => a + x[1], 0), maxC = comp[0]?.[1] || 1;
  out.push(h('div', {}, h('h3', {}, 'Coste de la mercancía · ' + eur(r.k)), h('span', { class: 'sub' }, 'A quién se le compra (compras de Golden del periodo: ' + eur(totC) + '; el coste de lo vendido sale de cada línea de venta).'),
    h('div', { class: 'lista' }, ...comp.slice(0, 15).map(([p, v]) => fila(p, eur(v), pct(v, totC) + ' de las compras', null, mini(v, maxC, 'barra'))))));
  return out;
}

function tabClientes(r) {
  const cs = Object.entries(r.cli).map(([c, x]) => ({ c, ...x, m: margen(x) })).sort((a, b) => b.v - a.v);
  return [h('span', { class: 'sub' }, cs.length + ' clientes con ventas en el periodo. Pincha uno para ver qué le vendes y cuánto deja.'),
    h('div', { class: 'scroll' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Cliente'), h('th', {}, 'Ventas'), h('th', {}, 'Margen'), h('th', {}, '%'))),
      h('tbody', {}, ...cs.map(x => { const tr = h('tr', { style: 'cursor:pointer', tabindex: '0' }, h('td', {}, nomCli(x.c)), h('td', { class: 'num' }, eur(x.v)), h('td', { class: 'num ' + (x.m < 0 ? 'p' : 'g') }, eur(x.m)), h('td', { class: 'num' }, pct(x.m, x.vk)));
        let ab = null; tr.addEventListener('click', () => { if (ab) { ab.remove(); ab = null; return; } ab = h('tr', {}, h('td', { colspan: '4' }, h('div', { class: 'abre' }, ...desglose(r, 'c', x.c, 15)))); tr.after(ab); }); return tr; }))))];
}
function tabProductos(r) {
  const ps = Object.entries(r.pro).map(([p, x]) => ({ p, ...x, m: margen(x) })).sort((a, b) => b.v - a.v);
  return [h('span', { class: 'sub' }, ps.length + ' productos vendidos en el periodo. Pincha uno para ver a quién y cuánto deja.'),
    h('div', { class: 'scroll' }, h('table', {}, h('thead', {}, h('tr', {}, h('th', {}, 'Producto'), h('th', {}, 'Ventas'), h('th', {}, 'Margen'), h('th', {}, '%'))),
      h('tbody', {}, ...ps.map(x => { const tr = h('tr', { style: 'cursor:pointer', tabindex: '0' }, h('td', {}, nomPro(x.p)), h('td', { class: 'num' }, eur(x.v)), h('td', { class: 'num ' + (x.m < 0 ? 'p' : 'g') }, eur(x.m)), h('td', { class: 'num' }, pct(x.m, x.vk)));
        let ab = null; tr.addEventListener('click', () => { if (ab) { ab.remove(); ab = null; return; } ab = h('tr', {}, h('td', { colspan: '4' }, h('div', { class: 'abre' }, ...desglose(r, 'p', x.p, 15)))); tr.after(ab); }); return tr; }))))];
}
function tabSimulador(r) {
  const res = h('div', { class: 'kpis' });
  const pintaRes = () => { const x = calc(periodo()), mes = SIMS.reduce((a, [k]) => a + (Number(sim[k]) || 0), 0);
    res.replaceChildren(h('div', { class: 'kpi' }, h('span', { class: 'eti' }, 'Lo que has puesto'), h('span', { class: 'valor' }, eur(mes)), h('span', { class: 'sub' }, 'al mes')),
      h('div', { class: 'kpi res' + (x.resSim < 0 ? ' neg' : '') }, h('span', { class: 'eti' }, 'Beneficio real al mes'), h('span', { class: 'valor' }, eur(x.resSim / x.n)), h('span', { class: 'sub' }, 'Antes del Impuesto de Sociedades')),
      h('div', { class: 'kpi' }, h('span', { class: 'eti' }, 'Al año'), h('span', { class: 'valor' }, eur(x.resSim / x.n * 12)), h('span', { class: 'sub' }, 'a este ritmo'))); };
  const campos = SIMS.map(([k, t]) => h('label', { for: 'sim-' + k }, t, h('input', { id: 'sim-' + k, type: 'number', inputmode: 'decimal', min: '0', step: '10', placeholder: '€ al mes', value: sim[k] ?? '', oninput: e => { sim[k] = e.target.value; ls.set('pyg_sim', sim); pintaRes(); kpis(calc(periodo())); cascada(calc(periodo())); mesAMes(); } })));
  pintaRes();
  return [h('div', { class: 'aviso' }, 'Lo del banco y las facturas ya está restado. Aquí solo lo que no sale en la cuenta 4501. Pon lo que pagáis al mes (sin IVA) y verás el beneficio de verdad. Se queda guardado solo en este móvil. Cuando sepas las cifras, díselas a Claude y las meto para todos.'), h('div', { class: 'sim' }, ...campos), res];
}
const TABS = [['gana', 'Dónde se gana', tabGana], ['pierde', 'Dónde se pierde', tabPierde], ['gastos', 'Gastos', tabGastos], ['clientes', 'Clientes', tabClientes], ['productos', 'Productos', tabProductos], ['simulador', 'Simulador', tabSimulador]];
function pintarTab(r) {
  if (!TABS.some(t => t[0] === tab)) tab = 'gana';
  $('#tabs').replaceChildren(...TABS.map(([k, t]) => h('button', { class: 'tab', role: 'tab', 'aria-selected': String(k === tab), onclick: () => { tab = k; ls.set('pyg_tab', k); pintarTab(calc(periodo())); } }, t)));
  $('#panel').replaceChildren(...TABS.find(t => t[0] === tab)[2](r));
}
function todo() {
  const r = calc(periodo()); pintarPeriodos(); kpis(r); cascada(r); mesAMes(); pintarTab(r);
  const ex = D.ex.filter(x => x[0] >= 0);
  $('#pie').textContent = 'Ventas y coste: Golden Soft (facturas hasta el ' + new Date(D.hasta).toLocaleDateString('es-ES') + '; solo meses cerrados, las facturas del mes en curso se hacen a fin de mes). Personal: nóminas de agosto a noviembre; de enero a julio, la de agosto con las personas que cobraban según el banco. Gastos fijos: facturas recibidas (alquiler, luz, furgoneta) y movimientos de la cuenta CaixaBank 4501 (desde marzo; enero y febrero, media de marzo a octubre), sin IVA. ' + (ex.length ? 'No se cuenta como venta: ' + ex.map(x => x[4] + ' (' + x[2] + ', ' + eur(x[3]) + ')').join('; ') + ', ingreso extraordinario. ' : '') + 'Faltan gastos que no llegan por correo: mira el simulador. Generado el ' + D.hoy + '.';
  $('#fuente').textContent = 'Datos reales de Golden y nóminas · ' + NM(D.meses[0]) + '–' + NM(D.meses[N - 1]) + ' 2026';
}
todo();
let anchoAnt = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - anchoAnt) > 40) { anchoAnt = innerWidth; cascada(calc(periodo())); } });
</script>`;

writeFileSync('docs/pyg.html', html);
console.log('docs/pyg.html', (html.length / 1024).toFixed(0) + ' KB · meses', meses.join(','), '· Golden hasta', g.hasta);
if (process.argv.includes('--guardar')) {
  const hoy = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' });
  await sql(`insert into panel_pyg (fecha, html) values ('${hoy}', $pyg$${html}$pyg$) on conflict (fecha) do update set html = excluded.html, creado = now()`);
  console.log('Guardado en panel_pyg', hoy);
}
