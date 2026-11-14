# Saca por la API todos los datos de la base de PRUEBAS (public + harvey + auth.users) a datos.json
import json
from api import q
tabs = [r['t'] for r in q("select schemaname||'.'||tablename t from pg_tables where schemaname in ('public','harvey') order by 1")]
out = {}
for t in tabs:
    out[t] = q(f"select coalesce(json_agg(x), '[]') d from {t} x")[0]['d']
out['auth.users'] = q("select coalesce(json_agg(json_build_object('id', id, 'email', email)), '[]') d from auth.users")[0]['d']
out['__secuencias'] = q("select coalesce(json_agg(json_build_object('s', schemaname||'.'||sequencename, 'v', last_value)), '[]') d from pg_sequences where schemaname in ('public','harvey') and last_value is not null")[0]['d']
json.dump(out, open('datos.json', 'w'))
print(len(tabs), 'tablas,', sum(len(v) for k, v in out.items() if not k.startswith('__')), 'filas')
