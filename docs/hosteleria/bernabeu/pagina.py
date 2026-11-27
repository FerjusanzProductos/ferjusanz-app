# Página «Ruta Bernabéu» (Tito, 27/11/2026): sitios de la zona + mensaje + PDF de precios.
import json,html,urllib.parse,os
D=os.path.dirname(os.path.abspath(__file__))
S=json.load(open(f'{D}/sitios.json')); MSG=open(f'{D}/mensaje.txt').read()
S=[s for s in S if 'Donostiarra' not in s['nombre']]  # ya contactado antes
ORD=['Estadio Bernabéu','Junto al estadio','Frente al estadio','Padre Damián','Paseo de la Habana','Cuzco','Alberto Alcocer','Avenida de Brasil','Azca','Azca / Capitán Haya','Azca / Nuevos Ministerios','Chamartín','El Viso (cerca del Bernabéu)']
e=lambda s:html.escape(html.unescape(s or ''))
grupos={}
for s in S: grupos.setdefault(s['zona'],[]).append(s)
sec=[]
for z in sorted(grupos,key=lambda z:ORD.index(z) if z in ORD else 99):
  li=[]
  for s in grupos[z]:
    dir_=html.unescape(s['direccion']); q=urllib.parse.quote(html.unescape(s['nombre'])+' '+dir_)
    con=' · '.join(x for x in [f'Tel. <b class="sel">{e(s["telefono"])}</b>' if s['telefono'] else '', f'<span class="sel">{e(s["email"])}</span>' if s['email'] else '', e(s['web'])] if x) or '<span class="falta">Sin teléfono publicado: pasar en persona</span>'
    li.append(f'<li><div class="n">{e(s["nombre"])}</div><div class="d">{e(dir_)}</div><div class="c">{con}</div><div class="g"><b>{e(s["cocina"])}.</b> {e(s["porque"])}</div><a href="https://www.google.com/maps/search/?api=1&query={q}" target="_blank" rel="noopener">Abrir en Maps ↗</a></li>')
  sec.append(f'<section><h2>{e(z)} <small>{len(grupos[z])}</small></h2><ul>{"".join(li)}</ul></section>')
page=f'''<title>Ruta Bernabéu</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap">
<style>
/* Libreta del comercial: mensaje arriba, sitios por calle */
:root{{--bg:#f5f3ef;--card:#fff;--fg:#2a2320;--mu:#6b605a;--line:#e6ddd4;--acc:#7a1f1f;--nar:#e8742b;--ok:#2e7d32;--okbg:#eaf4e8;
--h:'Barlow Condensed',Arial Narrow,sans-serif;--t:'Barlow',Arial,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#1c1816;--card:#26201d;--fg:#f1e9e3;--mu:#b4a79e;--line:#3a312c;--acc:#f0a08a;--nar:#f39a5c;--ok:#8fd08f;--okbg:#22301f;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#1c1816;--card:#26201d;--fg:#f1e9e3;--mu:#b4a79e;--line:#3a312c;--acc:#f0a08a;--nar:#f39a5c;--ok:#8fd08f;--okbg:#22301f;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font:15px/1.5 var(--t);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 40px}}
main{{max-width:760px;margin:0 auto;display:grid;gap:22px}}
h1{{font:700 34px/1 var(--h);color:var(--acc);margin:0;letter-spacing:.5px}} .sub{{color:var(--mu);margin:6px 0 0}}
h2{{font:700 21px var(--h);color:var(--acc);margin:0 0 8px;border-bottom:2px solid var(--nar);padding-bottom:3px}} h2 small{{color:var(--mu);font-weight:600}}
.caja{{background:var(--card);border:1.5px solid var(--nar);border-radius:10px;padding:14px;display:grid;gap:10px}}
pre{{white-space:pre-wrap;font:14px/1.5 var(--t);margin:0;background:var(--okbg);padding:12px;border-radius:8px}}
.bt{{display:flex;flex-wrap:wrap;gap:8px}} button,.btn{{font:600 15px var(--t);background:var(--nar);color:#fff;border:0;border-radius:20px;padding:9px 16px;cursor:pointer;text-decoration:none}}
button:focus-visible,a:focus-visible{{outline:3px solid var(--acc);outline-offset:2px}}
ul{{list-style:none;margin:0;padding:0;display:grid;gap:10px}} li{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:10px 12px;display:grid;gap:3px;min-width:0}}
.n{{font-weight:600;font-size:16px}} .d,.g{{color:var(--mu);font-size:14px}} .c{{font-size:14px;overflow-wrap:anywhere}} .sel{{user-select:all}} .falta{{color:var(--nar)}}
li a{{color:var(--acc);font-size:14px;font-weight:600}} .nota{{color:var(--mu);font-size:13px}}
</style>
<main>
<header><h1>Ruta Bernabéu</h1><p class="sub">{len(S)} restaurantes nuevos alrededor del estadio, Cuzco, Azca y Avenida de Brasil (donde está Casa Tinín) · 27/11/2026 · ya apuntados en Contactos</p></header>
<div class="caja"><h2>Mensaje para mandar (con el PDF)</h2><pre id="msg">{e(MSG)}</pre>
<div class="bt"><button id="copiar" type="button">Copiar mensaje</button><a class="btn" href="Ferjusanz-precios-hosteleria-Bernabeu.pdf" target="_blank" rel="noopener">Ver PDF de precios ↗</a><a class="btn" href="Ferjusanz-precios-hosteleria-Bernabeu.jpg" target="_blank" rel="noopener">Ver imagen para WhatsApp ↗</a></div>
<p class="nota">Precios: compra + 0,30 € (cajas + 0,30 € por kilo); patata freír 0,60, agria 0,65, cebolla 0,70. Casi todos tienen solo teléfono fijo: llamar o pasar en persona y pedir un móvil o correo para mandar esto.</p></div>
{"".join(sec)}
</main>
<script>document.getElementById('copiar').onclick=async e=>{{const t=document.getElementById('msg').innerText;try{{await navigator.clipboard.writeText(t);e.target.textContent='Copiado'}}catch(_){{const r=document.createRange();r.selectNodeContents(document.getElementById('msg'));getSelection().removeAllRanges();getSelection().addRange(r)}}}}</script>'''
open(f'{D}/ruta-bernabeu.html','w').write(page)
