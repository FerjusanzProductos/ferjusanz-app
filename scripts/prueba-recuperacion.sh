#!/bin/sh
# Prueba de recuperación: monta la copia de esta noche en una base de datos vacía y desechable
# (la que crea GitLab para este trabajo, ver .gitlab-ci.yml) y comprueba que cada tabla tiene
# las mismas filas que tenía Supabase al hacer la copia. No toca Supabase.
# Uso: sh scripts/prueba-recuperacion.sh copia
# La base vacía se indica con las variables normales de PostgreSQL (PGHOST, PGUSER, PGPASSWORD, PGDATABASE).
set -eu
DIR=${1:-copia}
DATOS=$(ls "$DIR"/*-datos.dump | tail -1); BASE=${DATOS%-datos.dump}
FILAS="$BASE-filas.txt"; USUARIOS="$BASE-usuarios.dump"
[ -f "$FILAS" ] || { echo "ERROR: falta $FILAS (la copia es antigua)"; exit 1; }
echo "Copia a recuperar: $(basename "$BASE")"
Q() { psql -X -q -v ON_ERROR_STOP=1 "$@"; }

echo "1/4 Preparando una base vacía parecida a Supabase…"
# Lo que Supabase ya trae de serie y la copia da por hecho: roles, extensiones y el esquema auth.
Q <<'SQL'
do $$ begin
  if not exists (select from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists "uuid-ossp" with schema extensions;
create schema if not exists auth;
create or replace function auth.uid() returns uuid language sql stable as
  $f$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $f$;
create or replace function auth.role() returns text language sql stable as
  $f$ select nullif(current_setting('request.jwt.claim.role', true), '') $f$;
create or replace function auth.jwt() returns jsonb language sql stable as
  $f$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $f$;
create schema if not exists storage;
create schema if not exists cron;
SQL

# Tablas de usuarios con las mismas columnas que la copia (id como uuid; el resto como texto).
for T in users identities; do
  COLS=""
  [ -f "$USUARIOS" ] && COLS=$(pg_restore -f - --data-only --table="$T" "$USUARIOS" | sed -n "s/^COPY auth\.$T (\(.*\)) FROM stdin;$/\1/p" | head -1)
  [ -n "$COLS" ] || COLS="id"
  DEF=$(printf '%s' "$COLS" | tr ',' '\n' | sed 's/^ *//' | awk -v t="$T" '{ if ($0=="id") print (t=="users" ? "id uuid primary key" : "id text"); else if (t=="identities" && $0=="user_id") print "user_id uuid"; else print $0 " text" }' | paste -sd, -)
  Q -c "create table if not exists auth.$T ($DEF)"
done
if [ -f "$USUARIOS" ]; then
  pg_restore --data-only --no-owner -d "${PGDATABASE:-postgres}" "$USUARIOS"
  echo "Usuarios recuperados: $(Q -At -c 'select count(*) from auth.users')"
else
  echo "AVISO: la copia no tiene usuarios."
fi

echo "2/4 Recuperando la copia…"
pg_restore --no-owner --no-privileges -d "${PGDATABASE:-postgres}" "$DATOS" 2> restaurar.log || true
# «schema public already exists» es normal (la base vacía ya trae ese esquema). Cualquier otro error cuenta como fallo.
ERRORES=$(grep "^pg_restore: error" restaurar.log | grep -vc 'schema "public" already exists' || true)
echo "Errores al recuperar: $ERRORES"
[ "$ERRORES" -eq 0 ] || grep -A3 "^pg_restore: error" restaurar.log | grep -v 'schema "public" already exists' | sed -n '1,60p'

echo "3/4 Comparando filas tabla a tabla…"
Q -At -F ' ' -c "
  select schemaname||'.'||tablename,
         (xpath('/row/c/text()', query_to_xml(format('select count(*) c from %I.%I', schemaname, tablename), false, true, '')))[1]::text
  from pg_tables where schemaname in ('public','harvey') order by 1" > recuperado.txt
MAL=$ERRORES; DISTINTAS=0; TOTAL=0; FILASOK=0
while read -r TABLA N; do
  TOTAL=$((TOTAL+1))
  R=$(awk -v t="$TABLA" '$1==t {print $2}' recuperado.txt)
  if [ "$R" = "$N" ]; then FILASOK=$((FILASOK+N)); else MAL=$((MAL+1)); DISTINTAS=$((DISTINTAS+1)); echo "  ✘ $TABLA: en Supabase $N, recuperadas ${R:-0 (no existe)}"; fi
done < "$FILAS"
echo "Tablas iguales: $((TOTAL-DISTINTAS)) de $TOTAL · filas recuperadas: $FILASOK"

echo "4/4 Resto de la copia…"
[ -f "$BASE-tareas.sql" ] && echo "Tareas automáticas guardadas: $(grep -c 'cron.schedule' "$BASE-tareas.sql" || true)"
if [ -f "$BASE-archivos.tar.gz" ]; then
  EN_COPIA=$(tar -tzf "$BASE-archivos.tar.gz" | grep -vc '/$' || true)
  EN_LISTA=$(wc -l < "$BASE-archivos.txt")
  echo "Archivos: $EN_COPIA en la copia de $EN_LISTA en Supabase"
  [ "$EN_COPIA" -eq "$EN_LISTA" ] || { echo "ERROR: faltan archivos en la copia"; MAL=$((MAL+1)); }
else
  echo "AVISO: esta copia no lleva los archivos (falta SUPABASE_SECRET_KEY en GitLab)."
fi

[ "$MAL" -eq 0 ] || { echo "ERROR: la recuperación NO cuadra."; exit 1; }
echo "✔ Recuperación comprobada: la copia se puede recuperar entera."
