# Pasa a modo esquema las 4 presentaciones que se envían (solo textos; fotos, listas y precios igual). Uso: python3 esquema.py <ref> <salida.json>
import json, sys, subprocess
ref, out = sys.argv[1], sys.argv[2]
def q(sql):
    r = subprocess.run(['curl','-sS','-X','POST',f'https://api.supabase.com/v1/projects/{ref}/database/query','-H','Authorization: Bearer proxy-injected','-H','Content-Type: application/json','--data',json.dumps({'query':sql})],capture_output=True,text=True)
    return json.loads(r.stdout)
filas = q("select id, titulo, diapositivas from presentaciones where titulo like 'Presentación para %' order by titulo")
json.dump(filas, open(out,'w'), ensure_ascii=False)  # copia de antes
E = {'porque': {'hosteleria': ['Tres generaciones en el oficio', 'Fresco cada mañana de Mercamadrid', 'Agricultores de confianza', 'Reparto puntual en tu local', 'Un comercial directo'], 'colectivos': ['Tres generaciones en el oficio', 'Volumen y continuidad para centros grandes', 'Fresco de temporada de Mercamadrid', 'Reparto regular y puntual', 'Un contacto directo para todo el centro']},
 'como': {'hosteleria': ['Pides por WhatsApp o teléfono', 'Lo preparamos con el producto del día', 'Te lo llevamos al local', 'Albarán con pesos reales', 'Calidades y formatos a tu medida'], 'colectivos': ['Días y horas de entrega acordados', 'Patata pelada en varios cortes', 'Albarán con pesos reales', 'Tarifa revisada cada 7-10 días', 'Atención directa ante incidencias']},
 'confiar': ['Las mismas ganas del primer día', 'Calidad homogénea, pedido tras pedido', 'La mejor calidad-precio', 'Trato directo, sin centralitas', 'Díganos qué podemos mejorar'],
 'primer': ['Marque en un minuto lo que usa', 'Le enviamos su tarifa', 'Sin compromiso ni pedido mínimo', 'Madrid y Segovia'],
 'ex': ['Es opcional: ya le conocemos', 'Un minuto, si quiere afinar el precio', 'Sin compromiso ni pedido mínimo']}
PROD = ['Patatas y patata pelada', 'Fruta de temporada y tropical', 'Verduras y hortalizas', 'Cebollas, ajos y puerros', 'Huevos', 'Setas y champiñones', 'Legumbres', 'Hierbas aromáticas']
for f in filas:
    ex = 'exclientes' in f['titulo']; tipo = 'colectivos' if 'Colegios' in f['titulo'] else 'hosteleria'
    for d in f['diapositivas']:
        t = d['t']; ti = d.get('titulo', '')
        if t == 'portada':
            d['sub'] = 'Patatas, frutas, verduras, huevos, setas, champiñones y legumbres' if ex else ('Colegios, residencias, catering y escuelas infantiles' if tipo == 'colectivos' else 'También huevos, setas, champiñones y legumbres')
            d['pie'] = 'Empresa familiar, tercera generación'
        elif t == 'texto': d['texto'] = 'Mayoristas en Mercamadrid, con agricultores de confianza.'
        elif t == 'lista' and d.get('enlace') is not None:
            if ex: d['titulo'] = 'Díganos qué usa ahora'; d['puntos'] = E['ex']
            else: d['titulo'] = 'Imagine su primer pedido'; d['puntos'] = E['primer']
        elif t == 'lista' and ti == 'Por qué elegirnos': d['puntos'] = E['porque'][tipo]
        elif t == 'lista' and ti == 'Cómo trabajamos': d['puntos'] = E['como'][tipo]
        elif t == 'lista' and ti == 'Vuelva a confiar en nosotros': d['puntos'] = E['confiar']
        elif t == 'productos' and (d.get('items') or [''])[0] == 'Patatas': d['items'] = PROD
        elif t == 'ofertas': d['texto'] = 'Pregunte por las ofertas de esta semana.'
        elif t == 'contacto': d['lineas'] = ['Sin pedido mínimo', 'Trato directo, sin centralitas'] + [l for l in d['lineas'] if l.startswith('Tels') or 'Madrid' in l or '@' in l]
    j = json.dumps(f['diapositivas'], ensure_ascii=False).replace("'", "''")
    print(f['titulo'], q(f"update presentaciones set diapositivas = '{j}'::jsonb, updated_at = now() where id = '{f['id']}' returning id"))
