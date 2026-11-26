import json,re,math,html,urllib.parse
C=[c for c in json.load(open('cand4.json')) if c['nombre']!='Singular Tabernas']
fix={'Levaduramadre':(40.395918,-3.694159),'La Gringa':(40.426124,-3.707905),'Restaurant El Burgales':(40.38359,-3.767513)}
for c in C:
  if c['nombre'] in fix: c['lat'],c['lng']=fix[c['nombre']]
NOM={'El cisne azul':'El Cisne Azul','Singular de Carretas':'Tabernas Singular','Arroceria Daniela':'Arrocería Daniela','las Moreras':'Restaurante Las Moreras','Panem Panaderia Artesana,s.l.':'Panem','Restaurante dosca III':'Restaurante Dosca','El Viejo Fogon':'El Viejo Fogón','La Trasiega':'Restaurante La Trasiega','Charrúa Madrid':'Charrúa','Descaro Restaurante':'Descaro','Toto e peppino':'Totò e Peppino','Tomate El Placer':'Tomaté El Placer','Asador las cañas':'Asador Las Cañas','Marisqueria Norte Sur':'Marisquería Norte Sur','Bienmesabe - General López Pozas':'Bienmesabe','Restaurant El Burgales':'Restaurante El Burgalés','Viga Mar':'Taberna Viga Mar','Taberna El Buo La Latina':'Taberna El Buo','Ramen Shifu Ponzano':'Ramen Shifu','Leaves Restaurant':'Leaves','las Moreras':'Restaurante Las Moreras'}
MAIL={**{o['nombre']:o['to'] for o in json.load(open('correos.json'))},'Alright':'info@alright.es','Bienmesabe - General López Pozas':'administracion@tabernasbienmesabe.com','Toto e peppino':'totoepeppinogestion@gmail.com','Tomate El Placer':'info@toma-te.es','Asador las cañas':'restauranteyeventos@hotmail.com','Puerta 57':'puerta57@grupolamaquina.es','El Viejo Fogon':'elviejofogon@gmail.com','Leaves Restaurant':'reservas@leavesrestaurant.es','Taberna El Buo La Latina':'info@tabernaselbuo.eu','Ramen Shifu Ponzano':'info@ramenshifu.com','Casa Fidel':'casafidelmadrid@gmail.com'}
WA={'Las 3 RRR':'640 587 548','PARSI':'649 728 081','Asador Cristóbal':'606 378 706','Bar Casa Lucía':'655 977 090','Taberna El Buo La Latina':'674 253 806','Trèsde':'609 004 105','La Gringa':''}
RUTAS=[('Cerca de casa','Hortaleza, San Blas, Barajas, Chamartín y Tetuán',['Tomate El Placer','Arroceria Daniela','las Moreras','Bienmesabe - General López Pozas','Viga Mar','Puerta 57','Alright','Asador Cristóbal']),
 ('Retiro y Salamanca','Manuel Becerra, Ibiza y Pacífico',['Leaves Restaurant','Marisqueria Norte Sur','Panem Panaderia Artesana,s.l.','Toto e peppino']),
 ('Centro','Huertas, Sol, La Latina, Malasaña, Plaza de España y Chamberí',['El cisne azul','Charrúa Madrid','Singular de Carretas','El Caldero','Taberna El Buo La Latina','Trèsde','Casa Fidel','La Gringa','Descaro Restaurante','PARSI','Ramen Shifu Ponzano']),
 ('Sur','Vallecas, Arganzuela, Latina y Getafe',['Las 3 RRR','El Puchero Tapas','Levaduramadre','El Capricho de Salvador','Mariacastaña','Restaurant El Burgales','La Trasiega']),
 ('San Sebastián de los Reyes','Dos sitios juntos, a 15 minutos por la A-1',['Bar Casa Lucía','El Pradal']),
 ('Oeste y suroeste','Pozuelo, Majadahonda, Móstoles y Fuenlabrada',['Restaurante dosca III','El Viejo Fogon','Asador las cañas','Restaurante Independencia','Cafetería Frankfurt'])]
GANCHO={'tomate':'Tomate de verdad: ensalada, pera, rama, rosa y raf. Cada semana les decimos cuál está mejor.','verdura':'Verdura de temporada elegida cada mañana: firme, con sabor, para la plancha, la menestra y la guarnición.','setas':'Champiñón, portobello, setas y shiitake frescos, en el mismo reparto que la verdura.','ensalada':'Lechugas crujientes, brotes, cogollos y tomate con sabor para que la ensalada entre por los ojos.','patata':'Patata seleccionada para cada uso, y pelada y cortada lista para cocinar: casero sin perder tiempo.','fruta':'Fruta de temporada en su punto para el postre: lo último que prueba el cliente.','zumo':'Naranja de zumo jugosa (esta semana en oferta) para que el zumo sea natural de verdad.','huevos':'Huevos frescos y patata buena para una tortilla de las de siempre.','otro':'Género fresco cada día, a su hora, a un precio pensado para su cocina.'}
H=(40.4608937,-3.6409123)
def km(a,b):
  R=6371;p1,p2=math.radians(a[0]),math.radians(b[0]);dl=math.radians(b[1]-a[1]);dp=p2-p1
  return 2*R*math.asin(math.sqrt(math.sin(dp/2)**2+math.cos(p1)*math.cos(p2)*math.sin(dl/2)**2))
byn={c['nombre']:c for c in C}
usados=set(); out=[]
for t,sub,ns in RUTAS:
  pend=[byn[n] for n in ns]; pos=H; orden=[]
  while pend:
    nx=min(pend,key=lambda c:km(pos,(c['lat'],c['lng']))); orden.append(nx); pend.remove(nx); pos=(nx['lat'],nx['lng']); usados.add(nx['nombre'])
  out.append((t,sub,orden))
assert len(usados)==len(C), set(byn)-usados
def dirx(c): return (c.get('dir') or '').replace(', España','')
def maps_dir(orden):
  pts=['Calle de Silvano, Madrid']+[dirx(c) or (NOM.get(c['nombre'],c['nombre'])+', Madrid') for c in orden]
  return 'https://www.google.com/maps/dir/'+'/'.join(urllib.parse.quote(p) for p in pts)
e=html.escape
cards=[]
for i,(t,sub,orden) in enumerate(out,1):
  d0=km(H,(orden[0]['lat'],orden[0]['lng']))
  items=[]
  for c in orden:
    n=NOM.get(c['nombre'],c['nombre']); m=MAIL.get(c['nombre']); wa=WA.get(c['nombre'])
    q=re.sub(r'\s+',' ',c['queja']).strip()
    q=q[:230]+('…' if len(q)>230 else '')
    estado='<span class="pill ok">Correo enviado</span>' if m else '<span class="pill no">Sin correo: visita o llamada</span>'
    items.append(f'''<li class="sitio">
<div class="cab"><h3>{e(n)}</h3>{estado}</div>
<p class="dir">{e(dirx(c) or 'Dirección por confirmar')}</p>
<p class="datos"><span>Tel. <b class="sel">{e(c['tel'] or '—')}</b></span>{f'<span>WhatsApp <b class="sel">{e(wa)}</b></span>' if wa else ''}{f'<span>Nota Google <b>{e(str(c["gnota"]))}</b></span>' if c.get('gnota') else ''}<span>A {km(H,(c['lat'],c['lng'])):.1f} km de casa</span></p>
<p class="gancho"><b>Qué ofrecerle:</b> {e(GANCHO.get(c['producto'],GANCHO['otro']))}</p>
<details><summary>Lo que dicen sus clientes (no decírselo)</summary><p class="queja">«{e(q)}»</p></details>
<a class="mapa" href="https://www.google.com/maps/search/?api=1&query={urllib.parse.quote(n+' '+dirx(c))}" target="_blank" rel="noopener">Abrir en Maps ↗</a>
</li>''')
  cards.append(f'''<section class="ruta" id="ruta-{i}">
<div class="rcab"><div><p class="eyebrow">Ruta {i} · {len(orden)} sitios · el primero a {d0:.0f} km</p><h2>{e(t)}</h2><p class="sub">{e(sub)}</p></div>
<a class="boton" href="{e(maps_dir(orden))}" target="_blank" rel="noopener">Ver la ruta en Maps ↗</a></div>
<ol class="lista">{''.join(items)}</ol></section>''')
total=sum(len(o) for _,_,o in out); con=sum(1 for c in C if MAIL.get(c['nombre']))
page=f'''<title>Ruta de visitas Ferjusanz</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600&display=swap">
<style>
/* Libreta de ruta del comercial: rutas por zona, fichas compactas, discurso arriba */
:root{{--bg:#f4f6f1;--card:#ffffff;--fg:#1d261c;--muted:#5b6858;--line:#dbe2d6;--acc:#7a1f1f;--oro:#b8862b;--ok:#2e7d32;--okbg:#e5f2e4;--no:#9a5b00;--nobg:#fbefd9;
--disp:"Barlow Condensed","Arial Narrow",sans-serif;--body:"Barlow",system-ui,sans-serif}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#141a13;--card:#1c241b;--fg:#e8eee5;--muted:#9eac9a;--line:#2e3a2c;--acc:#e08a7e;--oro:#d9ad55;--ok:#8fd18f;--okbg:#1f3320;--no:#f0b44f;--nobg:#3a2c12;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#141a13;--card:#1c241b;--fg:#e8eee5;--muted:#9eac9a;--line:#2e3a2c;--acc:#e08a7e;--oro:#d9ad55;--ok:#8fd18f;--okbg:#1f3320;--no:#f0b44f;--nobg:#3a2c12;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font:16px/1.5 var(--body);padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:20px 48px}}
main{{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:20px}}
h1,h2,h3{{font-family:var(--disp);letter-spacing:.01em;text-wrap:balance;margin:0}}
h1{{font-size:2.1rem;color:var(--acc)}} h2{{font-size:1.6rem}} h3{{font-size:1.25rem}}
.eyebrow{{text-transform:uppercase;letter-spacing:.08em;font-size:.75rem;color:var(--oro);font-weight:600;margin:0}}
.sub,.dir,.intro{{color:var(--muted);margin:2px 0 0}}
.discurso{{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--acc);border-radius:8px;padding:16px}}
.discurso h2{{font-size:1.4rem;margin-bottom:6px}}
.discurso blockquote{{margin:8px 0;font-size:1.05rem;line-height:1.55}}
.discurso ul{{margin:8px 0 0;padding-left:20px}} .discurso li{{margin:4px 0}}
.ruta{{display:flex;flex-direction:column;gap:12px}}
.rcab{{display:flex;justify-content:space-between;align-items:flex-end;gap:12px;flex-wrap:wrap;border-bottom:2px solid var(--acc);padding-bottom:8px}}
.boton{{background:var(--acc);color:var(--bg);text-decoration:none;font-weight:600;padding:8px 14px;border-radius:6px;white-space:nowrap}}
.boton:focus-visible,.mapa:focus-visible,summary:focus-visible{{outline:2px solid var(--oro);outline-offset:2px}}
.lista{{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px;counter-reset:s}}
.sitio{{background:var(--card);border:1px solid var(--line);border-radius:8px;padding:12px 14px;display:flex;flex-direction:column;gap:6px;min-width:0;counter-increment:s}}
.cab{{display:flex;justify-content:space-between;gap:8px;align-items:baseline;flex-wrap:wrap}}
.cab h3::before{{content:counter(s) ". ";color:var(--oro)}}
.pill{{font-size:.75rem;font-weight:600;padding:2px 8px;border-radius:99px;white-space:nowrap}}
.ok{{background:var(--okbg);color:var(--ok)}} .no{{background:var(--nobg);color:var(--no)}}
.datos{{display:flex;flex-wrap:wrap;gap:4px 16px;margin:0;font-size:.92rem;font-variant-numeric:tabular-nums}}
.sel{{user-select:all}}
.gancho{{margin:0}}
details{{font-size:.9rem;color:var(--muted)}} summary{{cursor:pointer}} .queja{{margin:6px 0 0;font-style:italic}}
.mapa{{color:var(--acc);font-weight:600;text-decoration:none;font-size:.92rem;align-self:flex-start}}
.nota{{font-size:.85rem;color:var(--muted)}}
</style>
<main>
<header><p class="eyebrow">Ferjusanz · Visitas a restaurantes</p><h1>Ruta de visitas</h1>
<p class="intro">{total} restaurantes con quejas del género en sus reseñas, ordenados en {len(out)} rutas desde la calle Silvano (Hortaleza). A {con} ya les ha llegado el correo con la lista de precios; a los demás, mejor en persona. Mejor hora: de 10:30 a 12:00 o de 16:00 a 18:00, fuera del servicio.</p></header>
<section class="discurso"><h2>El discurso (30 segundos)</h2>
<blockquote>«Buenos días, soy Fernando Sanz, de Ferjusanz. Somos una empresa familiar de Mercamadrid, más de seis décadas llevando patatas, fruta y verdura a cocinas de Madrid. [Si le llegó el correo:] Les escribí esta semana con nuestra lista de precios. Vengo a traerles una muestra para que la prueben en su cocina, sin compromiso. Trabajamos con agricultores de confianza, elegimos el género cada mañana, no hay pedido mínimo y le hacemos una tarifa según lo que gaste. ¿Quién lleva las compras de la cocina? Me gustaría dejarle la muestra y mi teléfono.»</blockquote>
<ul>
<li><b>Llevar:</b> la muestra del producto de su ficha (tomate, verdura, setas o patata) y el móvil con la tarjeta virtual para enseñar el QR.</li>
<li><b>Preguntar:</b> qué gastan a la semana en fruta y verdura, quién les sirve ahora y qué les falla del proveedor.</li>
<li><b>Nunca</b> decir que hemos leído sus reseñas. Hablar de lo que ganan ellos: sabor, menos merma, menos trabajo y buen precio.</li>
<li><b>Cerrar</b> con algo concreto: «¿Les traigo el primer pedido el martes y lo comparan?».</li>
</ul></section>
{''.join(cards)}
<p class="nota">Distancias en línea recta desde la calle Silvano. Comprobar en Maps que siguen abiertos antes de ir. Datos de Google Maps, Gastroranking y las webs de cada local (26/11/2026). También están en la app: Comercial › Contactos, fuente «Reseñas con quejas de género 2».</p>
</main>'''
open('/home/user/ferjusanz-app/docs/ruta-visitas.html','w').write(page)
for t,_,o in out: print(t,[NOM.get(c['nombre'],c['nombre']) for c in o])
