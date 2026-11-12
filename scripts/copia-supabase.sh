#!/bin/sh
# Copia de seguridad de la base de datos de Supabase (la lanza GitLab cada noche, ver .gitlab-ci.yml).
# Variables de CI/CD en GitLab:
#   SUPABASE_DB_URL       → la dirección "Session pooler" de Supabase › Connect (tal cual, con [YOUR-PASSWORD] dentro)
#   SUPABASE_DB_PASSWORD  → la contraseña de la base de datos (variable "Masked", nunca se muestra)
#   SUPABASE_SECRET_KEY   → (opcional) clave secreta de Supabase (Settings › API Keys, «sb_secret_…»), "Masked".
#                           Solo sirve para bajar los archivos (PDF, fotos, audios). Sin ella, la copia de datos se hace igual.
# Qué guarda (carpeta $DIR):
#   -datos.dump / -datos.sql.gz  → tablas de la app (public) y de Harvey (harvey), estructura y datos
#   -usuarios.dump               → usuarios para iniciar sesión (auth.users y auth.identities)
#   -tareas.sql                  → tareas automáticas (pg_cron), listas para volver a crearlas
#   -filas.txt                   → cuántas filas tenía cada tabla (lo usa la prueba de recuperación)
#   -archivos.tar.gz + -archivos.txt → los archivos de Storage y su lista
set -eu
[ -n "${SUPABASE_DB_URL:-}" ] || { echo "ERROR: falta la variable SUPABASE_DB_URL en GitLab › Settings › CI/CD › Variables"; exit 1; }
[ -n "${SUPABASE_DB_PASSWORD:-}" ] || { echo "ERROR: falta la variable SUPABASE_DB_PASSWORD en GitLab › Settings › CI/CD › Variables"; exit 1; }
export PGPASSWORD="$SUPABASE_DB_PASSWORD" PGCONNECT_TIMEOUT=30
# Quita el hueco de la contraseña de la dirección: la contraseña va aparte (así da igual qué símbolos tenga).
URL=$(printf '%s' "$SUPABASE_DB_URL" | sed -e 's/:\[YOUR-PASSWORD\]//' -e 's/^ *//' -e 's/ *$//')
DIR=${1:-copia}; F=ferjusanz-$(date +%Y-%m-%d)
mkdir -p "$DIR"
ESQUEMAS="--schema=public --schema=harvey"

echo "1/6 Filas de cada tabla (para comprobar la recuperación)…"
psql "$URL" -X -At -F ' ' -v ON_ERROR_STOP=1 -c "
  select schemaname||'.'||tablename,
         (xpath('/row/c/text()', query_to_xml(format('select count(*) c from %I.%I', schemaname, tablename), false, true, '')))[1]::text
  from pg_tables where schemaname in ('public','harvey') order by 1" > "$DIR/$F-filas.txt"
echo "Tablas contadas: $(wc -l < "$DIR/$F-filas.txt")"

echo "2/6 Datos y estructura de la app y de Harvey (esquemas public y harvey)…"
# shellcheck disable=SC2086
pg_dump "$URL" $ESQUEMAS --no-owner --no-privileges -Fc -f "$DIR/$F-datos.dump"
# Misma copia en texto (SQL comprimido): se puede abrir y mirar sin herramientas especiales.
# shellcheck disable=SC2086
pg_dump "$URL" $ESQUEMAS --no-owner --no-privileges | gzip -9 > "$DIR/$F-datos.sql.gz"

echo "3/6 Usuarios de la app (para no perder los inicios de sesión)…"
if ! pg_dump "$URL" --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges -Fc -f "$DIR/$F-usuarios.dump"; then
  echo "AVISO: no se pudo copiar la lista de usuarios; la copia de datos sí está hecha."; rm -f "$DIR/$F-usuarios.dump"
fi

echo "4/6 Tareas automáticas (pg_cron)…"
if ! psql "$URL" -X -At -v ON_ERROR_STOP=1 -c "
  select format('select cron.schedule(%L, %L, %L);', jobname, schedule, command) from cron.job order by jobname" > "$DIR/$F-tareas.sql"; then
  echo "AVISO: no se pudieron copiar las tareas automáticas."; rm -f "$DIR/$F-tareas.sql"
fi

echo "5/6 Archivos de Storage (PDF, fotos, audios)…"
psql "$URL" -X -At -F ' ' -v ON_ERROR_STOP=1 -c "
  select bucket_id, name, coalesce(metadata->>'size','0') from storage.objects order by bucket_id, name" > "$DIR/$F-archivos.txt"
echo "Archivos en Supabase: $(wc -l < "$DIR/$F-archivos.txt")"
if [ -n "${SUPABASE_SECRET_KEY:-}" ]; then
  # El nombre del proyecto va en el usuario de la dirección: postgres.<proyecto>@…
  REF=$(printf '%s' "$URL" | sed -n 's|.*://postgres\.\([a-z0-9]*\)[:@].*|\1|p')
  [ -n "$REF" ] || { echo "ERROR: no encuentro el proyecto en SUPABASE_DB_URL"; exit 1; }
  AUTH=""; case "$SUPABASE_SECRET_KEY" in eyJ*) AUTH="Authorization: Bearer $SUPABASE_SECRET_KEY";; esac
  T="$DIR/archivos"; FALLOS=0; N=0
  while read -r B NOMBRE _; do
    mkdir -p "$T/$B/$(dirname "$NOMBRE")"
    RUTA=$(printf '%s' "$NOMBRE" | sed -e 's/%/%25/g' -e 's/ /%20/g' -e 's/#/%23/g' -e 's/?/%3F/g')
    if curl -fsS --retry 3 -o "$T/$B/$NOMBRE" -H "apikey: $SUPABASE_SECRET_KEY" ${AUTH:+-H "$AUTH"} \
         "https://$REF.supabase.co/storage/v1/object/$B/$RUTA"; then N=$((N+1)); else FALLOS=$((FALLOS+1)); echo "  no se pudo bajar: $B/$NOMBRE"; fi
  done < "$DIR/$F-archivos.txt"
  if [ -d "$T" ]; then tar -czf "$DIR/$F-archivos.tar.gz" -C "$T" . && rm -rf "$T"; fi
  echo "Archivos bajados: $N · fallos: $FALLOS"
  [ "$FALLOS" -eq 0 ] || { echo "ERROR: faltan archivos en la copia."; exit 1; }
else
  echo "AVISO: falta la variable SUPABASE_SECRET_KEY; se guarda la lista de archivos, pero no los archivos."
fi

echo "6/6 Comprobación…"
TABLAS=$(pg_restore --list "$DIR/$F-datos.dump" | grep -c "TABLE DATA" || true)
echo "Tablas con datos en la copia: $TABLAS"
[ "$TABLAS" -ge 10 ] || { echo "ERROR: la copia tiene muy pocas tablas ($TABLAS). Algo va mal."; exit 1; }
ls -lh "$DIR"
echo "✔ Copia terminada: $F"
