#!/usr/bin/env bash
# ScrapeGraphAI (ScrapeGraphAI/Scrapegraph-ai, MIT): lee una web y saca lo que se le pida, con Gemini (clave puesta por el entorno).
# Uso: bash scripts/scrapegraph.sh <url> "<qué sacar>"
# En la nube solo llega a las webs permitidas en la red del entorno; para el resto, Firecrawl.
set -euo pipefail
V="$HOME/.cache/scrapegraph-venv"
if [ ! -x "$V/bin/python" ]; then
  python3 -m venv "$V"
  "$V/bin/pip" install -q scrapegraphai langchain-google-genai
fi
"$V/bin/python" -I - "$1" "$2" <<'EOF'
import sys
import scrapegraphai.utils.tokenizer as t
t.num_tokens_openai = lambda s: len(s) // 4  # shortcut: aproximado, tiktoken no se puede descargar en la nube; quitar si hay red libre
from scrapegraphai.graphs import SmartScraperGraph
cfg = {"llm": {"model": "google_genai/gemini-3.5-flash", "api_key": "proxy-injected", "model_tokens": 100000},
       "loader_kwargs": {"executable_path": "/opt/pw-browsers/chromium"}, "headless": True, "verbose": False}
print(SmartScraperGraph(prompt=sys.argv[2], source=sys.argv[1], config=cfg).run())
EOF
