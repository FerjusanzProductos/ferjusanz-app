import json
L=json.load(open('lista.json'))
fuera={'Pimiento de padrón','Naranjas de zumo 1ª cal-5-6','Manzana caja 7 kg','Pimiento rojo extra','Zumo naranja litro'}
web={'Tomate ensalada':1.40,'Naranjas de zumo':1.00,'Cebolla gorda calibre 2-3':0.70,'Huevos (tamaño L)':2.35,'Lechuga iceberg gorda':1.00,'Limones':1.50,'Pimiento Padrón gallego':3.00,'Tomate pera gordo':1.85}
filas=[]
for i in L:
  if i['nombre'] in fuera: continue
  p=i['p']; of=False
  if i['nombre'] in web and web[i['nombre']]<p: p=web[i['nombre']]; of=True
  assert i['c'] is None or p>=i['c'] or i['nombre']=='Perejil', i['nombre']
  filas.append(dict(nombre=i['nombre'],unidad=i['unidad'],precio=round(p,2),oferta=of))
filas+= [dict(nombre='Clementinas',unidad='kg',precio=1.45,oferta=True),dict(nombre='Naranja de mesa',unidad='kg',precio=1.30,oferta=True),dict(nombre='Tomate pera',unidad='kg',precio=1.45,oferta=True)]
filas.sort(key=lambda f:f['nombre'].lower().replace('á','a').replace('é','e').replace('í','i').replace('ó','o').replace('ú','u'))
json.dump(filas,open('precios.json','w'),ensure_ascii=False,indent=1)
print(len(filas)); [print(('★ ' if f['oferta'] else '  ')+f['nombre'],f['precio'],f['unidad']) for f in filas if f['oferta']]
