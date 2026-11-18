#!/usr/bin/env python3
# Golden -> SQL que RELLENA HUECOS (nunca cambia lo escrito) en clientes y proveedores de la app, por código.
# Uso: python3 -I scripts/golden/fichas-sql.py <carpeta_csv> > salida.sql
# Lee Clientes.csv, Direcciones.csv, Personas.csv, Proveedores.csv, DireccionesProv.csv, PersonasProv.csv.
import csv, sys, re, json
G = sys.argv[1]
rd = lambda f: list(csv.DictReader(open(f'{G}/{f}', encoding='utf-8-sig'), delimiter=';'))
s = lambda v: (v or '').strip()
CAMPOS = ['nif', 'direccion', 'codigo_postal', 'localidad', 'telefono', 'email']
def fichas(maestro, dirs_f, pers_f, ref):
    m = {r['Contador']: r for r in rd(maestro)}
    dirs, mails = {}, {}
    for d in rd(dirs_f): dirs.setdefault(d[ref], []).append(d)
    for p in rd(pers_f):
        if s(p['EMail']): mails.setdefault(p[ref], s(p['EMail']))
    out = []
    for c, g in m.items():
        ds = sorted(dirs.get(c, []), key=lambda d: (d['Fiscal'] != 'True', not s(d['Domicilio'])))
        f = ds[0] if ds else {}
        tel = next((s(d['Telefono1']) or s(d['Telefono2']) for d in ds if s(d['Telefono1']) or s(d['Telefono2'])), '')
        cp = s(f.get('C Postal'))
        out.append({'codigo': s(g['Codigo']), 'nif': s(g['CIF']), 'direccion': s(f.get('Domicilio')).replace(';', ', '),
                    'codigo_postal': cp if re.fullmatch(r'\d{5}', cp) else '', 'localidad': s(f.get('Poblacion')),
                    'telefono': tel, 'email': mails.get(c, '')})
    return [{k: (v or None) for k, v in x.items()} for x in out if x['codigo']]
def sql(tabla, filas):
    j = json.dumps(filas, ensure_ascii=False).replace("'", "''")
    sets = ', '.join(f"{c}=coalesce(nullif(trim(t.{c}),''),v.{c})" for c in CAMPOS)
    cond = ' or '.join(f"(coalesce(trim(t.{c}),'')='' and v.{c} is not null)" for c in CAMPOS)
    return (f"u_{tabla} as (update {tabla} t set {sets} from json_to_recordset('{j}') as v(codigo text,{','.join(c+' text' for c in CAMPOS)}) "
            f"where t.codigo=v.codigo and ({cond}) returning 1)")
cl, pv = fichas('Clientes.csv', 'Direcciones.csv', 'Personas.csv', 'Cliente'), fichas('Proveedores.csv', 'DireccionesProv.csv', 'PersonasProv.csv', 'Proveedor')
assert cl and pv and all(set(x) == {'codigo', *CAMPOS} for x in cl + pv)
print(f"with {sql('clientes', cl)}, {sql('proveedores', pv)} select (select count(*) from u_clientes) clientes_completados, (select count(*) from u_proveedores) proveedores_completados")
