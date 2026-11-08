#!/bin/sh
# Copia de seguridad de la base de datos de Supabase (la lanza GitLab cada noche, ver .gitlab-ci.yml).
# Necesita dos variables de CI/CD en GitLab:
#   SUPABASE_DB_URL       → la dirección "Session pooler" de Supabase › Connect (tal cual, con [YOUR-PASSWORD] dentro)
#   SUPABASE_DB_PASSWORD  → la contraseña de la base de datos (variable "Masked", nunca se muestra)
set -eu
[ -n "${SUPABASE_DB_URL:-}" ] || { echo "ERROR: falta la variable SUPABASE_DB_URL en GitLab › Settings › CI/CD › Variables"; exit 1; }
[ -n "${SUPABASE_DB_PASSWORD:-}" ] || { echo "ERROR: falta la variable SUPABASE_DB_PASSWORD en GitLab › Settings › CI/CD › Variables"; exit 1; }
export PGPASSWORD="$SUPABASE_DB_PASSWORD" PGCONNECT_TIMEOUT=30
# Quita el hueco de la contraseña de la dirección: la contraseña va aparte (así da igual qué símbolos tenga).
URL=$(printf '%s' "$SUPABASE_DB_URL" | sed -e 's/:\[YOUR-PASSWORD\]//' -e 's/^ *//' -e 's/ *$//')
DIR=${1:-copia}; F=ferjusanz-$(date +%Y-%m-%d)
mkdir -p "$DIR"

echo "1/3 Datos y estructura de la app (esquema public)…"
pg_dump "$URL" --schema=public --no-owner --no-privileges -Fc -f "$DIR/$F-datos.dump"
# Misma copia en texto (SQL comprimido): se puede abrir y mirar sin herramientas especiales.
pg_dump "$URL" --schema=public --no-owner --no-privileges | gzip -9 > "$DIR/$F-datos.sql.gz"

echo "2/3 Usuarios de la app (para no perder los inicios de sesión)…"
if ! pg_dump "$URL" --data-only --table=auth.users --table=auth.identities --no-owner --no-privileges -Fc -f "$DIR/$F-usuarios.dump"; then
  echo "AVISO: no se pudo copiar la lista de usuarios; la copia de datos sí está hecha."; rm -f "$DIR/$F-usuarios.dump"
fi

echo "3/3 Comprobación…"
TABLAS=$(pg_restore --list "$DIR/$F-datos.dump" | grep -c "TABLE DATA" || true)
echo "Tablas con datos en la copia: $TABLAS"
[ "$TABLAS" -ge 10 ] || { echo "ERROR: la copia tiene muy pocas tablas ($TABLAS). Algo va mal."; exit 1; }
ls -lh "$DIR"
echo "✔ Copia terminada: $F"
