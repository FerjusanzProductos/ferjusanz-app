// Convierte docs/PENDIENTES.md en la página fijada (docs/pendientes.html) para publicarla con el Artifact.
// Uso: node scripts/pendientes-html.mjs   (luego publicar docs/pendientes.html en la misma URL de CLAUDE.md)
import { readFileSync, writeFileSync } from 'node:fs';

const md = readFileSync(new URL('../docs/PENDIENTES.md', import.meta.url), 'utf8');
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>')
  .replace(/(https:\/\/[^\s)<,]+)/g, '<a href="$1">$1</a>')
  .replace(/\\\*/g, '*');

let html = '', open = false, total = 0;
const closeList = () => { if (open) { html += '</ul>'; open = false; } };
for (const line of md.split('\n')) {
  if (line.startsWith('# ')) continue;
  if (line.startsWith('### ')) { closeList(); html += `<h3>${inline(line.slice(4))}</h3>`; continue; }
  if (line.startsWith('## ')) { closeList(); html += `</section><section><h2>${inline(line.slice(3))}</h2>`; continue; }
  if (line.startsWith('- ')) {
    if (!open) { html += '<ul>'; open = true; }
    const t = line.slice(2), p = t.match(/^(🔴|🟡|⚪|⏸)\s*/);
    total++;
    html += `<li class="${{ '🔴': 'alta', '🟡': 'media', '⚪': 'baja', '⏸': 'espera' }[p?.[1]] || 'baja'}">${inline(p ? t.slice(p[0].length) : t)}</li>`;
    continue;
  }
  closeList();
  if (line.trim() && !line.startsWith('_')) html += `<p>${inline(line)}</p>`;
}
closeList();
html = html.replace(/^<\/section>/, '') + '</section>';

const hoy = new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
writeFileSync(new URL('../docs/pendientes.html', import.meta.url), `<title>Pendientes Ferjusanz</title>
<meta name="claude:viewport-fit-sides" content="cover">
<style>
:root{--bg:#f6f7f4;--fg:#1f2a1f;--muted:#5d6b5d;--line:#dde3da;--card:#fff;--alta:#c0392b;--media:#d68910;--baja:#8a968a;--acc:#2e7d32}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#141a14;--fg:#e6ece4;--muted:#9fae9d;--line:#2c362b;--card:#1b231b;--alta:#ef6b5b;--media:#f0b54a;--baja:#7d8b7c;--acc:#7cc47f;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#141a14;--fg:#e6ece4;--muted:#9fae9d;--line:#2c362b;--card:#1b231b;--alta:#ef6b5b;--media:#f0b54a;--baja:#7d8b7c;--acc:#7cc47f;color-scheme:dark}
body{background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 40px}
main{max-width:720px;margin:0 auto}
h1{font-size:1.5rem;margin:0}
.sub{color:var(--muted);font-size:.9rem;margin:.25rem 0 1rem}
.ley{display:flex;flex-wrap:wrap;gap:12px;font-size:.85rem;color:var(--muted);margin-bottom:1rem}
.ley span::before,li::before{content:"";display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:6px;background:var(--c)}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:4px 16px 12px;margin-bottom:16px}
h2{font-size:1.2rem;color:var(--acc);margin:12px 0 4px}
h3{font-size:1rem;margin:16px 0 4px}
ul{list-style:none;padding:0;margin:0}
li{padding:8px 0;border-top:1px solid var(--line);overflow-wrap:anywhere}
li:first-child{border-top:0}
.alta{--c:var(--alta)}.media{--c:var(--media)}.baja{--c:var(--baja)}.espera{--c:transparent}
.espera::before{border:2px solid var(--baja);width:6px;height:6px}
code{font-size:.85em;background:var(--line);padding:0 4px;border-radius:4px}
a{color:var(--acc)}
p{color:var(--muted);font-size:.9rem}
</style>
<main>
<h1>Pendientes Ferjusanz</h1>
<p class="sub">${total} cosas por hacer · actualizado el ${hoy}. Lo que se hace, se quita.</p>
<div class="ley"><span class="alta">Urgente</span><span class="media">Normal</span><span class="baja">Cuando se pueda</span></div>
${html}
</main>
`);
console.log(`docs/pendientes.html: ${total} pendientes`);
