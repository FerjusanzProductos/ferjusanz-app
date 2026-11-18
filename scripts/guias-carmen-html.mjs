// Convierte las guías de docs/guias-carmen/*.md en una página para el móvil (docs/guias-carmen.html).
// Uso: node scripts/guias-carmen-html.mjs   (luego publicar docs/guias-carmen.html con el Artifact,
// con files: { "guias-carmen/fotos/<foto>.jpg": "docs/guias-carmen/fotos/<foto>.jpg", ... }; ver docs/guias-carmen/LEEME.md)
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';

const DIR = new URL('../docs/guias-carmen/', import.meta.url);
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

const guias = readdirSync(DIR).filter(f => /^\d+-.*\.md$/.test(f)).sort().map(f => {
  const id = f.replace(/^\d+-|\.md$/g, '');
  const g = { id, titulo: '', intro: [], pasos: [], notas: [], lista: [], listaTitulo: '' };
  for (const l of readFileSync(new URL(f, DIR), 'utf8').split('\n')) {
    const paso = l.match(/^(\d+)\. (.*?)(?:\s*\[foto: ([\w-]+)\])?$/);
    if (l.startsWith('# ')) g.titulo = l.slice(2);
    else if (paso) {
      if (paso[3] && !existsSync(new URL(`fotos/${paso[3]}.jpg`, DIR))) throw new Error(`Falta la foto ${paso[3]} (${f})`);
      g.pasos.push({ n: paso[1], texto: paso[2], foto: paso[3] });
    }
    else if (l.startsWith('> ')) g.notas.push(l.slice(2));
    else if (l.startsWith('- ')) g.lista.push(l.slice(2));
    else if (/^\*\*.+…\*\*$/.test(l.trim())) g.listaTitulo = l.trim().replace(/\*\*/g, '');
    else if (l.trim()) g.intro.push(l);
  }
  return g;
});
if (guias.length < 7) throw new Error('Faltan guías: ' + guias.length);

const partir = t => { const i = t.indexOf(' '); return [t.slice(0, i), t.slice(i + 1)]; };

const indice = guias.map(g => { const [e, t] = partir(g.titulo);
  return `<a class="ficha" href="#${g.id}"><span class="emo" aria-hidden="true">${e}</span><span>${esc(t)}</span><span class="cuenta">${g.pasos.length} pasos</span></a>`; }).join('');

const cuerpo = guias.map(g => { const [e, t] = partir(g.titulo);
  const pasos = g.pasos.map(p => `<li class="paso${p.foto ? '' : ' sin-foto'}"><div class="txt"><span class="num">${p.n}</span><p>${inline(p.texto)}</p></div>${p.foto
    ? `<figure><img src="guias-carmen/fotos/${p.foto}.jpg" alt="Paso ${p.n}: ${esc(p.texto.replace(/\*\*/g, ''))}" loading="lazy" width="412" height="860"></figure>` : ''}</li>`).join('');
  const lista = g.lista.length ? `<h3>${esc(g.listaTitulo || 'Más')}</h3><ul class="dice">${g.lista.map(x => `<li>${inline(x)}</li>`).join('')}</ul>` : '';
  const notas = g.notas.length ? `<aside class="ojo"><b>Ojo</b><ul>${g.notas.map(x => `<li>${inline(x)}</li>`).join('')}</ul></aside>` : '';
  return `<section id="${g.id}"><h2><span class="emo" aria-hidden="true">${e}</span>${esc(t)}</h2>${g.intro.map(x => `<p class="intro">${inline(x)}</p>`).join('')}<ol class="pasos">${pasos}</ol>${lista}${notas}<a class="arriba" href="#top">↑ Volver a las guías</a></section>`;
}).join('');

const hoy = new Date().toLocaleDateString('es-ES', { timeZone: 'Europe/Madrid' });
writeFileSync(new URL('../docs/guias-carmen.html', import.meta.url), `<title>Guías de oficina Ferjusanz</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Inter:wght@400;600&display=swap">
<style>
/* Libreta de oficina: fichas por tarea, pasos grandes con la foto debajo, una sola columna en el móvil */
:root{--bg:#f5f6f1;--fg:#1d2a20;--muted:#5a685c;--line:#d9dfd3;--card:#ffffff;--acc:#1f7a3a;--granate:#7b1e2b;--ojo:#fff6dc;--ojo-borde:#e6c35c;
--display:"Barlow Condensed","Arial Narrow",system-ui,sans-serif;--text:Inter,system-ui,-apple-system,sans-serif}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#121813;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b352c;--card:#1a221b;--acc:#6cc884;--granate:#e08592;--ojo:#2d2715;--ojo-borde:#8a7330;color-scheme:dark}}
:root[data-theme="dark"]{--bg:#121813;--fg:#e5ebe3;--muted:#9eac9c;--line:#2b352c;--card:#1a221b;--acc:#6cc884;--granate:#e08592;--ojo:#2d2715;--ojo-borde:#8a7330;color-scheme:dark}
html{scroll-behavior:smooth}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
body{background:var(--bg);color:var(--fg);font:17px/1.5 var(--text);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 48px}
main{max-width:640px;margin:0 auto;display:grid;gap:40px}
header{display:grid;gap:6px}
.marca{font:700 14px/1 var(--display);letter-spacing:.14em;text-transform:uppercase;color:var(--granate)}
h1{font:700 2.4rem/1 var(--display);margin:0;text-wrap:balance}
header p{margin:0;color:var(--muted)}
.indice{display:grid;gap:8px}
.ficha{display:grid;grid-template-columns:2.2rem 1fr auto;align-items:center;gap:10px;padding:14px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--fg);text-decoration:none;font-weight:600}
.ficha:focus-visible,.arriba:focus-visible{outline:3px solid var(--acc);outline-offset:2px}
.cuenta{font-weight:400;font-size:.85rem;color:var(--muted)}
.emo{font-size:1.5rem;line-height:1}
section{display:grid;gap:14px;scroll-margin-top:12px}
h2{font:700 2rem/1.05 var(--display);margin:0;display:flex;gap:10px;align-items:center;padding-top:20px;border-top:3px solid var(--granate);text-wrap:balance}
h3{font:700 1.4rem/1.1 var(--display);margin:8px 0 0}
.intro{margin:0;color:var(--muted)}
.pasos{list-style:none;margin:0;padding:0;display:grid;gap:22px}
.txt{display:grid;grid-template-columns:2.2rem 1fr;gap:10px;align-items:start}
.txt p{margin:0;min-width:0}
.num{display:grid;place-items:center;width:2.2rem;height:2.2rem;border-radius:50%;background:var(--acc);color:var(--bg);font:700 1.25rem/1 var(--display)}
figure{margin:10px 0 0 calc(2.2rem + 10px)}
figure img{display:block;width:100%;max-width:320px;height:auto;border-radius:14px;border:1px solid var(--line)}
@media (max-width:420px){figure{margin-left:0}figure img{max-width:100%}}
.dice{margin:0;padding-left:1.1rem;display:grid;gap:10px}
.ojo{background:var(--ojo);border:1px solid var(--ojo-borde);border-radius:12px;padding:12px 14px}
.ojo b{font:700 1.1rem/1 var(--display);letter-spacing:.06em;text-transform:uppercase}
.ojo ul{margin:6px 0 0;padding-left:1.1rem;display:grid;gap:6px}
.arriba{color:var(--acc);font-weight:600;text-decoration:none;justify-self:start;padding:6px 0}
footer{color:var(--muted);font-size:.85rem}
</style>
<main id="top">
<header><span class="marca">Ferjusanz · oficina</span><h1>Guías para Carmen</h1>
<p>Lo de cada día en la app, paso a paso. Lo que hay que pulsar va en un <strong>recuadro rojo</strong>. Si te atascas, pulsa el botón rojo <strong>SOS</strong> de la app.</p></header>
<nav class="indice" aria-label="Guías">${indice}</nav>
${cuerpo}
<footer>Fotos sacadas de la app de pruebas (naranja) el ${hoy}, con datos de prueba y los nombres tapados. En la app de verdad la cabecera es verde.</footer>
</main>
`);
console.log('docs/guias-carmen.html ·', guias.length, 'guías ·', guias.reduce((s, g) => s + g.pasos.filter(p => p.foto).length, 0), 'fotos');
