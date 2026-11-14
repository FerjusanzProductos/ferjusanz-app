#!/bin/sh
# T-CON-01: ¿la copia de cada noche se recupera con las facturas, sus registros y la cadena intactos y se puede seguir facturando?
# La copia nocturna es de la base REAL (sin facturas aún), así que esto la ensaya con la de PRUEBAS:
#  1. réplica local de la base de pruebas (estructura con scripts/esquema/ddl.py y datos con datos.py, por la API de Supabase);
#  2. copia con los MISMOS pg_dump que scripts/copia-supabase.sh;
#  3. recuperación con el MISMO scripts/prueba-recuperacion.sh en una base vacía;
#  4. en la recuperada: cadena correcta, cerrojos activos y la cadena sigue (anula una factura).
# Necesita un Postgres local vacío (PGHOST/PGPORT/PGUSER) y api.supabase.com. No toca Supabase (solo lee).
# Uso (desde esta carpeta): sh prueba.sh   (ddl.py va contra la base que diga ../../../scripts/esquema/api.py; para pruebas: REF=pbeuxbwbpmlanbhhnpgy)
set -eu
R=../../../scripts
PYTHONPATH=$R/esquema python3 $R/esquema/ddl.py
PYTHONPATH=$R/esquema python3 datos.py
dropdb --if-exists fuente; dropdb --if-exists vacia; createdb fuente
sed -n '/^Q <<.SQL.$/,/^SQL$/p' $R/prueba-recuperacion.sh | sed '1d;$d' > preambulo.sql
cat >> preambulo.sql <<'SQL'
create table if not exists auth.users (id uuid primary key, email text);
create table if not exists storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
create table if not exists storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text, owner uuid, metadata jsonb);
create table if not exists cron.job (jobname text, schedule text, command text);
create or replace function cron.schedule(a text, b text, c text) returns bigint language sql as $$ select 1::bigint $$;
SQL
psql -X -q -d fuente -f preambulo.sql >/dev/null
psql -X -q -d fuente -f esquema_completo.sql 2> errores.txt || true   # solo fallan «maintain» (Postgres 17) y pg_cron
python3 cargar.py && psql -X -q -v ON_ERROR_STOP=1 -d fuente -f cargar.sql >/dev/null
rm -rf copia; mkdir copia; F=ferjusanz-prueba; URL="postgresql:///fuente?host=$PGHOST&port=$PGPORT&user=$PGUSER"
psql "$URL" -X -At -F ' ' -c "select schemaname||'.'||tablename, (xpath('/row/c/text()', query_to_xml(format('select count(*) c from %I.%I', schemaname, tablename), false, true, '')))[1]::text from pg_tables where schemaname in ('public','harvey') order by 1" > copia/$F-filas.txt
pg_dump "$URL" --schema=public --schema=harvey --no-owner --no-privileges -Fc -f copia/$F-datos.dump
pg_dump "$URL" --data-only --table=auth.users --no-owner --no-privileges -Fc -f copia/$F-usuarios.dump
createdb vacia && PGDATABASE=vacia sh $R/prueba-recuperacion.sh copia
CH="set request.jwt.claims='{\"sub\":\"4b39a41c-5e53-4452-94f5-6d4a9c03dc84\"}'; set request.jwt.claim.sub='4b39a41c-5e53-4452-94f5-6d4a9c03dc84';"
Q() { psql -X -At -d "$1" -c "$CH $2" 2>&1 | tail -1; }
echo "Cadena en el origen:    $(Q fuente 'select sif_comprobar_cadena()')"
echo "Cadena recuperada:      $(Q vacia 'select sif_comprobar_cadena()')"
echo "Borrar una factura:     $(Q vacia 'delete from sif_facturas' | grep -o 'sif_no_tocar' || echo 'SE PUDO (MAL)')"
echo "Tocar un registro:      $(Q vacia "update sif_registros set importe_total='1.00'" | grep -o 'sif_no_tocar' || echo 'SE PUDO (MAL)')"
F=$(Q vacia "select f.id from sif_facturas f where f.tipo='ordinaria' and not sif_anulada(f.id) and not exists (select 1 from sif_facturas q where q.rectifica_id=f.id) and not exists (select 1 from facturas_clientes c where c.numero=f.codigo and c.pagada) limit 1")
echo "Seguir la cadena:       $(Q vacia "select sif_anular_factura('$F', 'Prueba tras recuperar la copia')")"
echo "Cadena después:         $(Q vacia 'select sif_comprobar_cadena()')"
