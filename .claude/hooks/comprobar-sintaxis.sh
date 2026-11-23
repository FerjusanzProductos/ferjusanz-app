#!/bin/bash
# Tras editar un archivo, comprueba que no ha quedado roto (JS o JSON). Si falla, avisa a Claude (exit 2).
f=$(node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{console.log(JSON.parse(s).tool_input.file_path||"")}catch{}})')
[ -f "$f" ] || exit 0
case "$f" in
  *.js|*.mjs) out=$(node --check "$f" 2>&1) ;;
  *.json) out=$(node -e 'JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"))' "$f" 2>&1) ;;
  *) exit 0 ;;
esac
[ $? -eq 0 ] && exit 0
echo "Error de sintaxis en $f:" >&2; echo "$out" | head -15 >&2; exit 2
