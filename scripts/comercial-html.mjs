// Página fijada «Comercial Ferjusanz»: lo último de las tareas «Comercial del día» y «Plan comercial de la semana».
// Uso: NODE_USE_ENV_PROXY=1 node scripts/comercial-html.mjs   → docs/comercial.html (luego publicarla con el Artifact en su URL de CLAUDE.md)
import { writeFileSync } from 'node:fs';

const sql = async q => {
  const r = await fetch('https://api.supabase.com/v1/projects/hvydnjaswdexttogsyen/database/query', {
    method: 'POST', headers: { Authorization: 'Bearer proxy-injected', 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q }) });
  if (!r.ok) throw new Error('Supabase ' + r.status + ': ' + (await r.text()).slice(0, 200));
  return r.json();
};
const ultimo = async t => (await sql(`select fecha::text, texto from public.${t} order by fecha desc limit 1`))[0];
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fechaES = f => new Date(f + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

// El texto llega sencillo: títulos en MAYÚSCULAS, listas con «•», lo demás párrafos.
function cuerpo(texto) {
  let html = '', ul = false;
  const cierra = () => { if (ul) { html += '</ul>'; ul = false; } };
  for (const l of texto.split('\n').map(s => s.trim())) {
    if (!l) { cierra(); continue; }
    if (l.startsWith('•')) { if (!ul) { html += '<ul>'; ul = true; } html += `<li>${esc(l.slice(1).trim())}</li>`; continue; }
    cierra();
    const letras = l.replace(/[^\p{L}]/gu, '');
    html += letras.length > 3 && letras === letras.toUpperCase() ? `<h3>${esc(l)}</h3>` : `<p>${esc(l)}</p>`;
  }
  cierra();
  return html;
}
const bloque = (id, titulo, x, vacio) => `<section id="${id}"><h2>${titulo}</h2>${x
  ? `<p class="fecha">Del ${fechaES(x.fecha)}</p>${cuerpo(x.texto)}`
  : `<p class="fecha">${vacio}</p>`}</section>`;

const [dia, semana, [c]] = await Promise.all([ultimo('resumen_comercial'), ultimo('resumen_semana'),
  // Cifras comerciales, solo datos reales (nada de pedidos de la app, que son de prueba).
  sql(`select (select count(*) from prospectos) pros, (select count(*) from prospectos where estado = 'nuevo') sin_contactar,
    (select count(*) from prospectos where proximo_contacto <= current_date) toca,
    (select count(*) from prospectos where created_at > now() - interval '7 days') nuevos7,
    (select count(*) from cliente_peticion_contacto where contestado_at is null) sin_contestar,
    (select count(*) from web_visitas where creado > now() - interval '7 days' and pais = 'ES') web7`)]);
const tarjeta = (n, txt, aviso) => `<div class="t${aviso && n > 0 ? ' aviso' : ''}"><b>${n}</b><span>${txt}</span></div>`;
const ahora = new Date().toLocaleString('es-ES', { timeZone: 'Europe/Madrid', day: 'numeric', month: 'numeric', hour: '2-digit', minute: '2-digit' });

writeFileSync(new URL('../docs/comercial.html', import.meta.url), `<title>Comercial Ferjusanz</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Una columna para leer en el móvil: dos bloques (hoy / semana) con salto rápido arriba. */
:root{--bg:#f5f6f2;--fg:#1d261d;--muted:#5b675a;--line:#dbe1d7;--card:#fff;--dia:#6d28d9;--sem:#0e7490;--acc:#2e7d32}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#131913;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b352a;--card:#1a221a;--dia:#b79cf5;--sem:#5ec8de;--acc:#7cc47f;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#131913;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b352a;--card:#1a221a;--dia:#b79cf5;--sem:#5ec8de;--acc:#7cc47f;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:16px/1.55 system-ui,sans-serif;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 40px}
main{max-width:720px;margin:0 auto}
h1{font-size:1.5rem;margin:0;text-wrap:balance}
.sub{color:var(--muted);font-size:.9rem;margin:.25rem 0 1rem}
nav{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
nav a{flex:1;min-width:140px;text-align:center;padding:12px;border-radius:10px;font-weight:600;text-decoration:none;color:#fff}
nav a:focus-visible{outline:3px solid var(--fg);outline-offset:2px}
.a-dia{background:var(--dia)}.a-sem{background:var(--sem)}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) nav a{color:#111}}
:root[data-theme="dark"] nav a{color:#111}
/* Cifras de arriba: rejilla de 2 en el móvil. */
.tarjetas{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 16px}
.t{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px 12px;border-left:5px solid var(--acc)}
.pie a{color:var(--acc)}
.t.aviso{border-left-color:var(--dia)}
.t b{display:block;font-size:1.35rem;font-variant-numeric:tabular-nums}
.t span{font-size:.85rem;color:var(--muted)}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:4px 16px 14px;margin-bottom:16px;border-top:5px solid var(--c)}
#hoy{--c:var(--dia)}#semana{--c:var(--sem)}
h2{font-size:1.2rem;color:var(--c);margin:12px 0 0}
h3{font-size:.95rem;letter-spacing:.02em;margin:18px 0 4px}
.fecha{color:var(--muted);font-size:.85rem;margin:2px 0 8px}
p{margin:6px 0;overflow-wrap:anywhere}
ul{padding-left:20px;margin:4px 0}
li{margin:4px 0;overflow-wrap:anywhere}
.pie{color:var(--muted);font-size:.85rem}
</style>
<main>
<h1>Comercial Ferjusanz</h1>
<p class="sub">Actualizado el ${ahora}. Solo son borradores: nada se envía sin ti.</p>
<div class="tarjetas">
${tarjeta(c.toca, 'posibles clientes a los que toca llamar', true)}
${tarjeta(c.sin_contestar, 'clientes a los que se pidió correo y teléfono y no han contestado', true)}
${tarjeta(c.pros, `posibles clientes (${c.sin_contactar} sin contactar · ${c.nuevos7} nuevos en 7 días)`)}
${tarjeta(c.web7, 'visitas a la web en 7 días')}
</div>
<nav><a class="a-dia" href="#hoy">📞 Hoy</a><a class="a-sem" href="#semana">🗓️ Esta semana</a></nav>
${bloque('hoy', '📞 Comercial del día', dia, 'Todavía no hay. Sale de lunes a sábado a las 8:27.')}
${bloque('semana', '🗓️ Plan de la semana', semana, 'Todavía no hay. Sale cada domingo a las 19:23.')}
<p class="pie">Ventas, cobros y pagos: <a href="https://claude.ai/artifact/4k7wxTzvttkdBF6xU7AWak">Panel Ferjusanz</a>. También en la app: 📊 Resumen y correo, o Comercial → Avisos.</p>
</main>
`);
console.log('docs/comercial.html:', dia?.fecha || 'sin día', '/', semana?.fecha || 'sin semana');
