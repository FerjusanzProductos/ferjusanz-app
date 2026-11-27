#!/bin/bash
# Genera los Word de ejemplo para prensa: bash hacer.sh (desde docs/redes/prensa)
set -e
n=0
for md in 0*.md; do
  n=$((n+1))
  foto=$(sed -n 's/^foto: //p' "$md"); pie=$(sed -n 's/^pie: //p' "$md"); tipo=$(sed -n 's/^tipo: //p' "$md")
  nombre=$(basename "$md" .md | sed 's/^0[0-9]-//')
  cuerpo=$(awk 'BEGIN{c=0} /^---$/ && c<2 {c++; next} c>=2' "$md")
  titulo=$(printf '%s\n' "$cuerpo" | grep -m1 '^# ')
  resto=$(printf '%s\n' "$cuerpo" | sed '0,/^# /{/^# /d}')
  {
    echo "> **EJEMPLO DE ARTÍCULO N.º $n ($tipo), escrito por Ferjusanz para medios de comunicación.**"
    echo ">"
    echo "> Pueden publicarlo tal cual o adaptarlo. Solo pedimos que citen a **Ferjusanz** como fuente (www.ferjusanz-frutas-verduras.es) y como autor de la foto."
    echo
    echo "$titulo"
    echo
    echo "![$pie]($foto){width=16cm}"
    echo
    echo "$resto"
  } > /tmp/_art.md
  pandoc /tmp/_art.md --resource-path=. -o "Ferjusanz-ejemplo-$n-$nombre.docx"
  echo "Ferjusanz-ejemplo-$n-$nombre.docx"
done
