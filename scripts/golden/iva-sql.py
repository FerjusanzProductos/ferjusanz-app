#!/usr/bin/env python3
# IVA exacto de las facturas de Golden -> SQL para golden_facturas_iva (una fila por factura y tipo de IVA).
# Uso: python3 -I scripts/golden/iva-sql.py <carpeta_csv> <desde AAAA-MM-DD> > iva.sql
# Lee '*Cabecera Facturacion*.csv' (enteros, troceados o 'Reciente'). Añade o corrige (upsert); no borra nada.
import csv, glob, sys, datetime, json
from decimal import Decimal
carpeta, desde = sys.argv[1], datetime.date.fromisoformat(sys.argv[2])
num = lambda s: Decimal((s or '0').replace('.', '').replace(',', '.')) if ',' in (s or '') else Decimal(s or '0')
fecha = lambda s: datetime.datetime.strptime(s.split()[0], '%d/%m/%Y').date()
numero = lambda serie, n: f"{serie}/{int(n):,}".replace(',', '.')   # igual que facturas-sql.py
filas = {}
for f in sorted(glob.glob(f'{carpeta}/*Cabecera Facturacion.*csv')):
    for r in csv.DictReader(open(f, encoding='utf-8-sig'), delimiter=';'):
        if r['Tipo'] != 'F' or not r['Fecha'] or fecha(r['Fecha']) < desde: continue
        tipos = {}
        for i in range(1, 6):
            b = num(r[f'BaseImp{i}'])
            if b == 0 and num(r[f'imp_iva{i}']) == 0: continue
            t = num(r[f'Iva{i}']); x = tipos.setdefault(t, [Decimal(0), Decimal(0), num(r[f'Rec{i}']), Decimal(0)])
            x[0] += b; x[1] += num(r[f'imp_iva{i}']); x[3] += num(r[f'imp_rec{i}'])
        ex = num(r['BaseExentaIVA'])
        if ex: tipos.setdefault(Decimal(0), [Decimal(0), Decimal(0), Decimal(0), Decimal(0)])[0] += ex
        nu = numero(r['Serie'], r['Numero'])
        for t, (b, c, tr, cr) in tipos.items():   # la última copia manda (los 'Reciente' van después)
            filas[(nu, t)] = dict(factura_numero=nu, tipo_iva=float(t), base=float(round(b, 2)), cuota=float(round(c, 2)), tipo_re=float(tr), cuota_re=float(round(cr, 2)))
datos = json.dumps(list(filas.values()), ensure_ascii=False).replace("'", "''")
print(f"""insert into golden_facturas_iva (factura_numero,tipo_iva,base,cuota,tipo_re,cuota_re)
select * from json_to_recordset('{datos}') as t(factura_numero text,tipo_iva numeric,base numeric,cuota numeric,tipo_re numeric,cuota_re numeric)
on conflict (factura_numero, tipo_iva) do update set base = excluded.base, cuota = excluded.cuota, tipo_re = excluded.tipo_re, cuota_re = excluded.cuota_re;""")
print(f'{len(filas)} filas', file=sys.stderr)
