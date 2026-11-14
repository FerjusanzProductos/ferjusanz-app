# Paso 2 de prueba.sh: carga datos.json en la réplica local «fuente» (sin disparar triggers, como pg_restore).
import json, subprocess
d = json.load(open('datos.json'))
def cols(t):
    s, n = t.split('.')
    r = subprocess.run(['psql', '-X', '-At', '-d', 'fuente', '-c', f"select string_agg(quote_ident(column_name), ',' order by ordinal_position) from information_schema.columns where table_schema='{s}' and table_name='{n}' and is_generated='NEVER'"], capture_output=True, text=True)
    return r.stdout.strip()
sql = ["set session_replication_role = replica;"]
for t, filas in d.items():
    if t.startswith('__') or not filas: continue
    c = cols(t)
    j = json.dumps(filas).replace('$J$', '')
    sql.append(f"insert into {t} ({c}) overriding system value select {c} from json_populate_recordset(null::{t}, $J${j}$J$);")
for x in d['__secuencias']:
    sql.append(f"select setval('{x['s']}', {x['v']});")
open('cargar.sql', 'w').write('\n'.join(sql))
