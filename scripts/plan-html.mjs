// Convierte un .md sencillo (títulos, listas, tablas) en una página para publicar con el Artifact.
// Uso: node scripts/plan-html.mjs docs/PLAN_MARKETING.md docs/plan-marketing.html "Plan Google y redes"
//      node scripts/plan-html.mjs docs/PREGUNTAS_JORGE.md docs/preguntas-jorge.html "Reunión con Jorge"
import { readFileSync, writeFileSync } from 'node:fs';

const [, , src, out, titulo] = process.argv;
if (!src || !out || !titulo) { console.error('Uso: node scripts/plan-html.mjs <entrada.md> <salida.html> "<título>"'); process.exit(1); }
const md = readFileSync(src, 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/(https:\/\/[^\s)<,]+)/g, '<a href="$1">$1</a>')
  .replace(/\\\*/g, '*');

let html = '', list = null, tabla = null, sub = '';
const cierra = () => {
  if (list) { html += `</${list}>`; list = null; }
  if (tabla) { html += '</tbody></table></div>'; tabla = null; }
};
const celdas = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
for (const line of md.split('\n')) {
  if (line.startsWith('# ')) continue;
  if (/^_.*_$/.test(line.trim())) { if (!html) { sub += `<p class="sub">${inline(line.trim().slice(1, -1))}</p>`; continue; } }
  if (line.startsWith('|')) {
    if (/^\|[\s|:-]+\|$/.test(line.trim())) continue; // separador
    if (!tabla) { cierra(); tabla = 1; html += `<div class="tabla"><table><thead><tr>${celdas(line).map(c => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>`; continue; }
    html += `<tr>${celdas(line).map(c => `<td>${inline(c)}</td>`).join('')}</tr>`; continue;
  }
  if (line.startsWith('### ')) { cierra(); html += `<h3>${inline(line.slice(4))}</h3>`; continue; }
  if (line.startsWith('## ')) { cierra(); html += `</section><section><h2>${inline(line.slice(3))}</h2>`; continue; }
  const li = line.match(/^\s*(?:- |(\d+)\. )(.*)$/);
  if (li) {
    const tipo = li[1] ? 'ol' : 'ul';
    if (list !== tipo) { cierra(); list = tipo; html += li[1] && li[1] !== '1' ? `<ol start="${li[1]}">` : `<${tipo}>`; }
    html += `<li>${inline(li[2])}</li>`; continue;
  }
  cierra();
  if (line.trim()) html += `<p>${inline(line.replace(/^_(.*)_$/, '$1'))}</p>`;
}
cierra();
html = html.replace(/^<\/section>/, '') + '</section>';

const hoy = new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
writeFileSync(out, `<title>${esc(titulo)}</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
/* Una columna de lectura; tarjetas por apartado, tablas con su propio desplazamiento */
:root{--bg:#f5f6f2;--fg:#1f2a1f;--muted:#5b675a;--line:#dce2d8;--card:#fff;--acc:#2e6b31;--head:#eef2ea;--f:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#131913;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b3529;--card:#1a221a;--acc:#86c788;--head:#202a20;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#131913;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b3529;--card:#1a221a;--acc:#86c788;--head:#202a20;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:16px/1.55 var(--f);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 40px}
main{max-width:760px;margin:0 auto}
h1{font-size:1.5rem;margin:0;text-wrap:balance}
.sub{color:var(--muted);font-size:.9rem;margin:.3rem 0}
.fecha{color:var(--muted);font-size:.8rem;margin:.2rem 0 1rem}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:4px 16px 14px;margin-bottom:16px;min-width:0}
h2{font-size:1.15rem;color:var(--acc);margin:14px 0 6px;text-wrap:balance}
h3{font-size:1rem;margin:16px 0 4px}
ul,ol{padding-left:1.3rem;margin:6px 0}
li{padding:4px 0;overflow-wrap:anywhere}
p{margin:8px 0}
.tabla{overflow-x:auto;margin:8px 0;border:1px solid var(--line);border-radius:8px}
table{border-collapse:collapse;font-size:.88rem;min-width:560px;width:100%}
th,td{text-align:left;vertical-align:top;padding:6px 8px;border-top:1px solid var(--line)}
th{background:var(--head);border-top:0}
td:first-child{font-variant-numeric:tabular-nums}
code{font-size:.85em;background:var(--head);padding:0 4px;border-radius:4px;overflow-wrap:anywhere}
a{color:var(--acc)}
</style>
<main>
<h1>${esc(titulo)}</h1>
${sub}<p class="fecha">Actualizado el ${hoy}</p>
${html}
</main>
`);
console.log('Hecho:', out);
