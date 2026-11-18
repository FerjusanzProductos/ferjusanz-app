#!/usr/bin/env python3
# Golden (SQL Server, exportado a CSV por EQUIPO-2) -> SQL que añade a golden_facturas/golden_lineas las facturas que faltan.
# Uso: python3 -I scripts/golden/facturas-sql.py <carpeta_csv> <desde AAAA-MM-DD> [hasta AAAA-MM-DD] [--json] > salida.sql
# Lee '*Cabecera Facturacion*.csv' y '*Lineas Facturacion*.csv' (enteros, troceados .parteNN o los 'Reciente …' de 45 días). Solo AÑADE (no cambia ni borra).
# Desde el 18/11/2026 también lleva neto y coste (Uds × «Precio costo») y rellena esos huecos en lo ya cargado (solo la primera copia de cada línea).
import csv, glob, sys, datetime, json
from decimal import Decimal
carpeta, desde = sys.argv[1], datetime.date.fromisoformat(sys.argv[2])
hasta = datetime.date.fromisoformat(sys.argv.pop(3)) if sys.argv[3:4] and sys.argv[3][:1].isdigit() else datetime.date.max  # por trozos si la consulta pesa demasiado
TIPOS = {'P': 'Serie PC', 'F1': 'Facturas Fernando', 'BOR': 'Facturas borrador', 'R': 'RECTIFICATIVA', 'D': 'FSH con IVA'}
def filas(patron):
    for f in sorted(glob.glob(f'{carpeta}/{patron}')):
        yield from csv.DictReader(open(f, encoding='utf-8-sig'), delimiter=';')
num = lambda s: Decimal((s or '0').replace('.', '').replace(',', '.')) if ',' in (s or '') else Decimal(s or '0')
fecha = lambda s: datetime.datetime.strptime(s.split()[0], '%d/%m/%Y').date()
numero = lambda serie, n: f"{serie}/{int(n):,}".replace(',', '.')
cab = {}
for r in filas('*Cabecera Facturacion.*csv'):
    if r['Tipo'] != 'F' or not r['Fecha']: continue
    if not desde <= fecha(r['Fecha']) <= hasta: continue
    cab[(r['Serie'], r['Numero'])] = r
lin, vistas = {}, set()
for l in filas('*Lineas Facturacion.*csv'):
    k = (l['Serie'], l['Numero'])
    if l['Tipo'] == 'F' and k in cab and l['Contador'] not in vistas:  # la misma línea puede venir en un trozo y en 'Reciente'
        vistas.add(l['Contador']); lin.setdefault(k, []).append(l)
facts, lins = [], []
for (s, n), r in cab.items():
    nu = numero(s, n); alb = None; orden = 0
    for l in sorted(lin.get((s, n), []), key=lambda l: int(l['Linea'])):
        d = l['Descripcion'].strip()
        if not l['Producto'] and d.startswith('Alb.'): alb = d; continue
        orden += 1; iva = num(l['% IVA'])
        lins.append([nu, orden, alb, l['Producto'] or None, d, float(num(l['Uds Servidas'])), float(num(l['PVP de la Unidad'])),
                     float(iva), float(round(num(l['Importe Neto']) * (1 + iva / 100), 2)),
                     float(num(l['Importe Neto'])), float(round(num(l['Uds Servidas']) * num(l['Precio costo']), 4))])
    base = sum(num(r[f'BaseImp{i}']) for i in range(1, 6)) + num(r['BaseExentaIVA'])
    facts.append([nu, s, fecha(r['Fecha']).isoformat(), TIPOS.get(s, s), r['Cliente Proveedor'], r['Nombre Fiscal'],
                  float(num(r['BrutoExIVA']) or base + num(r['Imp Dto Com']) + num(r['Imp Dto PP'])),
                  float(num(r['Imp Dto Com']) + num(r['Imp Dto PP'])), float(num(r['Otros Gastos'])), float(base),
                  float(num(r['Total Factura'])), s == 'BOR', orden, float(num(r['Costos Brutos']))])
assert all(len(f) == 14 for f in facts) and all(len(l) == 11 for l in lins)
if sys.argv[3:] == ['--json']: print(json.dumps({'facturas': facts, 'lineas': lins}, ensure_ascii=False)); sys.exit()
print(f"""with f(numero,serie,fecha,tipo,cliente_codigo,cliente_nombre,bruto,descuentos,gastos,base,total,borrador,n_lineas,coste) as (
  select * from json_to_recordset('{json.dumps([dict(zip('numero serie fecha tipo cliente_codigo cliente_nombre bruto descuentos gastos base total borrador n_lineas coste'.split(), x)) for x in facts], ensure_ascii=False).replace("'", "''")}')
  as t(numero text,serie text,fecha date,tipo text,cliente_codigo text,cliente_nombre text,bruto numeric,descuentos numeric,gastos numeric,base numeric,total numeric,borrador boolean,n_lineas int,coste numeric)),
l(factura_numero,orden,albaran,producto_codigo,descripcion,cantidad,precio,iva,importe,neto,coste) as (
  select * from json_to_recordset('{json.dumps([dict(zip('factura_numero orden albaran producto_codigo descripcion cantidad precio iva importe neto coste'.split(), x)) for x in lins], ensure_ascii=False).replace("'", "''")}')
  as t(factura_numero text,orden int,albaran text,producto_codigo text,descripcion text,cantidad numeric,precio numeric,iva numeric,importe numeric,neto numeric,coste numeric)),
nuevas as (insert into golden_facturas (numero,serie,fecha,tipo,cliente_codigo,cliente_nombre,bruto,descuentos,gastos,base,total,borrador,n_lineas,coste)
  select * from f where not exists (select 1 from golden_facturas g where g.numero=f.numero) returning numero),
nl as (insert into golden_lineas (factura_numero,orden,albaran,producto_codigo,descripcion,cantidad,precio,iva,importe,neto,coste)
  select l.* from l join nuevas n on n.numero=l.factura_numero returning 1),
fc as (update golden_facturas g set coste=f.coste from f where g.numero=f.numero and g.coste is null returning 1),
-- huecos de neto/coste en lo cargado antes: solo la primera copia de cada (factura, orden) y si la descripción coincide (hay líneas repetidas de cargas viejas)
primera as (select distinct on (factura_numero,orden) id,factura_numero,orden,descripcion from golden_lineas where coste is null order by factura_numero,orden,id),
lc as (update golden_lineas g set neto=l.neto, coste=l.coste from primera p join l on l.factura_numero=p.factura_numero and l.orden=p.orden and l.descripcion=p.descripcion
  where g.id=p.id and not exists (select 1 from golden_lineas o where o.factura_numero=p.factura_numero and o.orden=p.orden and o.coste is not null) returning 1)
select (select count(*) from nuevas) facturas_nuevas, (select count(*) from nl) lineas_nuevas, (select count(*) from fc) facturas_con_coste, (select count(*) from lc) lineas_con_coste""")
