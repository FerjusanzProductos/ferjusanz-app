# Lista amplia hostelería zona Bernabéu (Tito, 27/11/2026): última compra (30 días, factura o Golden) + 0,30 €;
# cajas + 0,30 €/kg; fijos patata freír 0,60 · agria 0,65 · cebolla 0,70; las ofertas de la web nunca más caras que en la web.
# Uso: python3 precios.py <compras.json> (sale de la consulta de productos con última compra; lleva costes: fuera del repo)
import json,sys,os
D=os.path.dirname(os.path.abspath(__file__))
A=json.load(open(sys.argv[1])); WEB={n:p for n,p,u in json.load(open(f'{D}/../../../web/ofertas.json'))['items']}
M=0.30
FUERA={'bandeja de flores','CARDOS','Piparras','Chirivia','Sandía fashion (sin pepita)','Patata nueva esp. freír (general)','Patata Agria','Cebollas Gordas Calibre 2-3','Piparras Tarro','Micromezclun','Calabaza 2x2','Lechuga Icerberg cajas','Aguacate piezas','Limas Kilo','Mini Puerro','Mini Zanahoria','zanahoria 1x1','Plátanos 1ª','piña','MIX FRUTOS DEL BOSQUE','Maché achè'}
N={'acelgas':'Acelgas','Aguacate Cajas':'Aguacate Hass (caja 4 kg)','Ajos Extras':'Ajos extra','Apio Nabo':'Apionabo','Arandano':'Arándanos','Bananas':'Bananas','Berenjenas':'Berenjena','brocoli':'Brócoli','Calabaza carruecano':'Calabaza','Caqui':'Caqui','Champiñón':'Champiñón','Champiñon Portobello':'Champiñón portobello','Chirimolla 1ª':'Chirimoya','Clementina':'Clementina 1ª','Clementinas 2ª':'Clementinas','Cogollos de tudela':'Cogollos de Tudela','Endivias':'Endivias','Ensalada Campestre':'Ensalada campestre','Ensalada Gourmet':'Ensalada gourmet','Escarola en bolsa':'Escarola','Espinaca Bolsa':'Espinaca','Freson 1ª':'Fresón','Garbanzos Pedrosillano':'Garbanzo pedrosillano','Judías Blancas Riñón':'Alubia blanca riñón','Kiwi-Nueva Zelanda':'Kiwi','lechuga bandeja 900gr':'Lechuga en bandeja','Lechuga iceberg Piezas':'Lechuga iceberg','Lima caja':'Limas (caja 4,3 kg)','Limones 1ª':'Limón','Maché achè':'Canónigos','maiz':'Maíz','Mango':'Mango','Manzana Golden perlin':'Manzana golden','Manzana Grani 1ª(cal-85-90)':'Manzana granny','manzana reineta':'Manzana reineta','Manzana Starki extra(cal.85-95)':'Manzana starking','Melón piel de sapo':'Melón piel de sapo','MIX FRUTOS DEL BOSQUE':'Frutos del bosque (caja)','Naranja mesa navel-late cal.2-3':'Naranja de mesa','Naranjas de zumo 1ª cal-5-6':'Naranja de zumo','Nuez Francia':'Nuez de Francia','Patata Lavada':'Patata lavada','Patata Monalisa':'Patata monalisa','Patatas Brava':'Patata pelada para bravas','Patatas de tornear':'Patata para tornear','Patatas Peladas Baston':'Patata pelada bastón','Patatas peladas env.al vacìo':'Patata pelada al vacío','Patatas peladas panaderas':'Patata pelada panadera','Pera de agua-Cal:18-20':'Pera de agua','Pimiento Italiano':'Pimiento verde italiano','pimiento rojo 2º':'Pimiento rojo 2ª','Pimiento rojo extra':'Pimiento rojo extra','pimiento verde 2º':'Pimiento verde 2ª','Pimiento Verde extra':'Pimiento verde extra','Pimiento de padrón':'Pimiento de Padrón','Piña del monte':'Piña','Plátano extra':'Plátano de Canarias','Platano Macho':'Plátano macho','Puerros':'Puerro','repollo':'Repollo','Rucula':'Rúcula','Seta 1ª':'Setas','SHITAKI':'Shiitake','Tomate Azul':'Tomate azul','Tomate Cherri':'Tomate cherry','Tomate maduro (salsa)':'Tomate maduro para salsa','Tomate pera':'Tomate pera','Tomate raf':'Tomate raf','Tomate Rambo':'Tomate rambo','Tomate Rosa':'Tomate rosa','Uva blanca':'Uva blanca','Yuca':'Yuca','Zanahorias':'Zanahoria','Cebollinos':'Cebollino','Cebolla Dulce':'Cebolla dulce','Cebolla Morada':'Cebolla morada','Cebolla pelada':'Cebolla pelada','Cebolleta China':'Cebolleta china','Apio verde':'Apio','Remolacha cocida':'Remolacha cocida','Germinados':'Germinados','Patata Cocida':'Patata cocida'}
# oferta de la web → nombre en la lista
W2L={'Tomate ensalada':'Tomate ensalada','Tomate pera':'Tomate pera','Lechuga en bandeja':'Lechuga en bandeja','Lechuga iceberg':'Lechuga iceberg','Limón nuevo':'Limón','Naranja de mesa':'Naranja de mesa','Naranja de zumo':'Naranja de zumo','Clementinas':'Clementinas','Pimiento de Padrón':'Pimiento de Padrón','Huevos':'Huevos (docena)'}
N['Huevos']='Huevos (docena)'
F=[]
for r in A:
  if r['nombre'] in FUERA: continue
  c=float(r['precio']); u=r['uv']; kg=r['kgcaja'] and float(r['kgcaja'])
  if r['cu']!=u:
    if r['ct']: c=c/float(r['ct'])
    else: continue
  if u=='caja': p=c+M*(kg or 1); assert kg, r['nombre']
  else: p=c+M
  F.append(dict(nombre=N.get(r['nombre'],r['nombre']),unidad=u,precio=round(p,2),dest=False,web=False))
F+=[dict(nombre='Patata especial freír',unidad='kg',precio=0.60,dest=True,web=False),dict(nombre='Patata agria',unidad='kg',precio=0.65,dest=True,web=False),
    dict(nombre='Cebolla gorda',unidad='kg',precio=0.70,dest=True,web=True)]
by={f['nombre']:f for f in F}
for w,l in W2L.items():
  f=by[l]; f['web']=True
  if WEB[w]<f['precio']: f['precio']=WEB[w]
for f in F:
  if f['nombre'] in ('Tomate pera','Tomate ensalada','Tomate rambo','Tomate raf'): f['dest']=True
  if f['nombre']=='Perejil': f['precio']=0
  assert f['precio']<=WEB.get(next((w for w,l in W2L.items() if l==f['nombre']),''),99)
F.sort(key=lambda f:f['nombre'].lower().translate(str.maketrans('áéíóúñ','aeioun')))
json.dump(F,open(f'{D}/precios.json','w'),ensure_ascii=False,indent=1)
print(len(F)); [print(('★' if f['dest'] else ' ')+('W' if f['web'] else ' '),f['nombre'],f['precio'],f['unidad']) for f in F]
