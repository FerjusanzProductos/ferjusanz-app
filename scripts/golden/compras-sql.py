#!/usr/bin/env python3
# Golden (CSV de EQUIPO-2) -> SQL para golden_compras/golden_compras_lineas (facturas de compra, Tipo F; solo AÑADE)
# y golden_tesoreria (cobros C y pagos P; copia de Golden: añade y pone al día estado, fecha de cobro/pago e importe por «Contador»).
# Uso: python3 -I scripts/golden/compras-sql.py <carpeta_csv> <desde AAAA-MM-DD> [hasta AAAA-MM-DD] [compras|tesoreria] > salida.sql
# Lee '*Cabecera Facturacion Compras*.csv', '*Lineas Facturacion Compras*.csv' (troceados .parteNN) y '*Tesoreria*.csv'.
import csv, glob, sys, datetime, json, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__))); from nota_golden import leer, quitar_prefijo  # «Observación» de Golden › Cobros (24/11/2026)
from decimal import Decimal
carpeta, desde = sys.argv[1], datetime.date.fromisoformat(sys.argv[2]); hasta = datetime.date.fromisoformat(sys.argv.pop(3)) if sys.argv[3:4] and sys.argv[3][:1].isdigit() else datetime.date.max
que = sys.argv[3:] or ['compras', 'tesoreria']
def filas(patron):
    for f in sorted(glob.glob(f'{carpeta}/{patron}')):
        yield from csv.DictReader(open(f, encoding='utf-8-sig'), delimiter=';')
num = lambda s: Decimal((s or '0').replace('.', '').replace(',', '.')) if ',' in (s or '') else Decimal(s or '0')
fecha = lambda s: datetime.datetime.strptime(s.split()[0], '%d/%m/%Y').date() if s else None
js = lambda o: json.dumps(o, ensure_ascii=False).replace("'", "''")
partes = []
if 'compras' in que:
    cab = {(r['Serie'], r['Numero']): r for r in filas('*Cabecera Facturacion Compras*.csv') if r['Tipo'] == 'F' and r['Fecha'] and desde <= fecha(r['Fecha']) <= hasta}
    lin, vistas = {}, set()
    for l in filas('*Lineas Facturacion Compras*.csv'):
        k = (l['Serie'], l['Numero'])
        if l['Tipo'] == 'F' and k in cab and l['Contador'] not in vistas: vistas.add(l['Contador']); lin.setdefault(k, []).append(l)
    cs, ls = [], []
    for (s, n), r in cab.items():
        nu = f'{s}/{n}'; orden = 0
        for l in sorted(lin.get((s, n), []), key=lambda l: int(l['Linea'] or 0)):
            d = l['Descripcion'].strip()
            if not l['Producto'] and d.startswith('Alb.'): continue
            orden += 1
            ls.append(dict(compra_numero=nu, orden=orden, producto_codigo=l['Producto'] or None, descripcion=d, cantidad=float(num(l['Uds Servidas'])),
                           precio=float(num(l['PVP de la Unidad'])), iva=float(num(l['% IVA'])), neto=float(num(l['Importe Neto']))))
        cs.append(dict(numero=nu, serie=s, fecha=fecha(r['Fecha']).isoformat(), su_numero=r['Su Numero'] or None, proveedor_codigo=r['Cliente Proveedor'],
                       proveedor_nombre=r['Nombre Fiscal'], base=float(sum(num(r[f'BaseImp{i}']) for i in range(1, 6)) + num(r['BaseExentaIVA'])),
                       total=float(num(r['Total Factura'])), n_lineas=orden))
    partes.append(f"""with c as (select * from json_to_recordset('{js(cs)}') as t(numero text,serie text,fecha date,su_numero text,proveedor_codigo text,proveedor_nombre text,base numeric,total numeric,n_lineas int)),
l as (select * from json_to_recordset('{js(ls)}') as t(compra_numero text,orden int,producto_codigo text,descripcion text,cantidad numeric,precio numeric,iva numeric,neto numeric)),
nc as (insert into golden_compras (numero,serie,fecha,su_numero,proveedor_codigo,proveedor_nombre,base,total,n_lineas)
  select * from c where not exists (select 1 from golden_compras g where g.numero=c.numero) returning numero),
nl as (insert into golden_compras_lineas (compra_numero,orden,producto_codigo,descripcion,cantidad,precio,iva,neto)
  select l.* from l join nc on nc.numero=l.compra_numero returning 1)
select (select count(*) from nc) compras_nuevas, (select count(*) from nl) lineas_compra_nuevas;""")
if 'tesoreria' in que:
    ts = [dict(contador=int(r['Contador']), tipo=r['Tipo'], estado=r['Estado'] or None, vencimiento=str(fecha(r['Fecha Vencimiento']) or '') or None,
               total=float(num(r['Total'])), serie=r['Serie'] or None, numero=r['Numero'] or None, fecha_factura=str(fecha(r['Fecha Factura']) or '') or None,
               codigo=r['Cliente Proveedor'] or None, nombre=r['Nombre Fiscal'] or None, fecha_cobro_pago=str(fecha(r['FechaCobroPago']) or '') or None,
               forma_pago=r['F Pago'] or None,
               observacion=(quitar_prefijo(r.get('Descripcion Corta'), r['Serie'], r['Numero'], r['Nombre Fiscal']) or None) if r['Tipo'] == 'C' else None)
          for r in filas('*Tesoreria*.csv') if r['Tipo'] in ('C', 'P') and r['Inactivo'] != 'True'
          and ((fecha(r['Fecha Vencimiento']) or desde) >= desde or r['Estado'] == 'PEN')]
    for x in ts: x['observacion_partes'], x['observacion_aviso'] = leer(x['observacion']) if x['observacion'] else (None, None)
    partes.append(f"""with t as (select * from json_to_recordset('{js(ts)}') as x(contador int,tipo text,estado text,vencimiento date,total numeric,serie text,numero text,fecha_factura date,codigo text,nombre text,fecha_cobro_pago date,forma_pago text,observacion text,observacion_partes jsonb,observacion_aviso text)),
u as (insert into golden_tesoreria (contador,tipo,estado,vencimiento,total,serie,numero,fecha_factura,codigo,nombre,fecha_cobro_pago,forma_pago,observacion,observacion_partes,observacion_aviso)
  select * from t on conflict (contador) do update set estado=excluded.estado, vencimiento=excluded.vencimiento, total=excluded.total, fecha_cobro_pago=excluded.fecha_cobro_pago, forma_pago=excluded.forma_pago, observacion=excluded.observacion, observacion_partes=excluded.observacion_partes, observacion_aviso=excluded.observacion_aviso, actualizado=now()
  where (golden_tesoreria.estado, golden_tesoreria.vencimiento, golden_tesoreria.total, golden_tesoreria.fecha_cobro_pago, golden_tesoreria.observacion, golden_tesoreria.observacion_partes, golden_tesoreria.observacion_aviso) is distinct from (excluded.estado, excluded.vencimiento, excluded.total, excluded.fecha_cobro_pago, excluded.observacion, excluded.observacion_partes, excluded.observacion_aviso)
  returning (xmax = 0) nuevo)
select count(*) filter (where nuevo) vencimientos_nuevos, count(*) filter (where not nuevo) vencimientos_al_dia from u;""")
    # Factura anulada por rectificativa (abono del mismo importe): Golden la deja PEN; aquí 'AN' para que no salga como deuda (Tito, 26/11/2026).
    partes.append(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'supabase', 'migrations', '20261226a_tesoreria_anuladas_rectificativa.sql'), encoding='utf-8').read())
print('\n'.join(partes))
