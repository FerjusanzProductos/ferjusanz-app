# Correo a hostelería de la zona Bernabéu (Tito, 27/11/2026). Uno por restaurante, nunca en tanda (memoria «correos-a-las-7»).
# Uso: python3 correo.py [comic] → correo.html · python3 correo.py --uno '<nombre>' '<barrio>' → correo-uno.html
import sys
W='https://www.ferjusanz-frutas-verduras.es'
uno=sys.argv[1:2]==['--uno']; comic=sys.argv[1:2]==['comic']
nom,barrio=(sys.argv[2],sys.argv[3]) if uno else ('','')
saludo='Hola, equipo de Comic Planet:' if comic else (f'Hola, equipo de {nom}:' if uno else 'Hola:')
zona=''  # el barrio de las fichas no siempre se lee bien en una frase
intro=('<p>Soy Fernando Sanz, de Ferjusanz. A principios de año ya os servimos y nos gustaría volver a trabajar con vosotros. '
 'Estamos por Alberto Alcocer y el Bernabéu muchos días de la semana, así que os pilla de ruta.</p>') if comic else (
 '<p>Soy Fernando Sanz, de <b>Ferjusanz</b>, mayorista de patatas, frutas, verduras, huevos, setas, champiñones y legumbres en Mercamadrid desde hace más de seis décadas.</p>'
 f'<p>Llevamos un tiempo estudiando cómo trabajar mejor con los restaurantes de {zona}la zona del Bernabéu, Cuzco y Castellana: ya servimos allí y estamos por la zona <b>muchos días de la semana</b>, así que os pilla de ruta. Os escribo porque creo que os podemos ayudar a comprar mejor.</p>')
btn=lambda t,u:f'<a href="{u}" style="display:inline-block;background:#e8742b;color:#ffffff;text-decoration:none;font-weight:bold;padding:10px 18px;border-radius:22px;margin:4px 6px 4px 0">{t}</a>'
html=f'''<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#2a2320;max-width:600px">
<div style="background:#7a1f1f;padding:18px 22px;border-radius:10px 10px 0 0"><img src="cid:att0" alt="Ferjusanz" width="240" style="display:block;width:240px;max-width:100%;background:#ffffff;border-radius:6px;padding:6px"></div>
<div style="border:1px solid #eadfd6;border-top:0;border-radius:0 0 10px 10px;padding:20px 22px">
<p>{saludo}</p>
{intro}
<p style="margin-bottom:6px"><b>Lo que más se gasta en cocina, esta semana (IVA aparte):</b></p>
<table style="border-collapse:collapse;width:100%;max-width:420px">
<tr><td style="padding:5px 0;border-bottom:1px solid #eee">Patata especial freír</td><td style="padding:5px 0;border-bottom:1px solid #eee;text-align:right"><b>0,60 €/kg</b></td></tr>
<tr><td style="padding:5px 0;border-bottom:1px solid #eee">Patata agria</td><td style="padding:5px 0;border-bottom:1px solid #eee;text-align:right"><b>0,65 €/kg</b></td></tr>
<tr><td style="padding:5px 0;border-bottom:1px solid #eee">Cebolla</td><td style="padding:5px 0;border-bottom:1px solid #eee;text-align:right"><b>0,70 €/kg</b></td></tr></table>
<div style="background:#eef6ea;border-left:4px solid #2e7d32;padding:10px 14px;margin:16px 0;border-radius:4px"><b>Nuestra recomendación:</b> el tomate ha bajado mucho. Tomate rambo a 1,00 €/kg, tomate pera a 1,10 €/kg, tomate ensalada a 1,30 €/kg y el raf a 2,20 €/kg, menos de la mitad que hace un mes. También en oferta esta semana: naranja de zumo 1,00 €/kg, clementinas 1,10 €/kg, limón 1,30 €/kg, pimiento de Padrón 2,60 €/kg y huevos 2,30 € la docena. Cada semana os puedo mandar aparte nuestras recomendaciones: lo que mejor está de precio y de calidad en Mercamadrid.</div>
<p>Os adjunto la <b>lista completa de precios</b> para hostelería (más de 110 productos) y nuestro <b>folleto</b>. Pensamos siempre en la cocina del cliente: género elegido cada mañana, agricultores de confianza, reparto refrigerado y <b>sin pedido mínimo</b>.</p>
<p>{btn('Ver nuestra web',W)}{btn('Ofertas de la semana',W+'/#ofertas')}{btn('Calcule su tarifa',W+'/calcular-tarifa/')}{btn('Mi tarjeta',W+'/tarjeta/')}</p>
<p>Cuando queráis nos vemos por allí y lo hablamos con calma, o si preferís os llevo una muestra sin compromiso.</p>
<p style="margin-top:20px">Un saludo,<br><b>Fernando Sanz</b><br>Ferjusanz Productos Hortofrutícolas<br>Móvil y WhatsApp: <b>609 567 354</b> · Pedidos: 609 100 690<br><a href="{W}" style="color:#7a1f1f">www.ferjusanz-frutas-verduras.es</a></p>
</div></div>'''
open('correo-comic.html' if comic else ('correo-uno.html' if uno else 'correo.html'),'w').write(html)
