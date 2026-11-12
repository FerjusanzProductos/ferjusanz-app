#!/usr/bin/env bash
# Ferjusanz: prepara claude-shorts en una sesión de Claude Code en la nube.
# Idempotente: si ya está preparado, no hace nada. Tarda 2-4 min la primera vez.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV="$HOME/.shorts-skill"
export HF_HUB_DISABLE_XET=1

# Python 3.12: mediapipe 0.10.21 (con face_detection) no existe para 3.13
if ! "$VENV/bin/python" -c "import faster_whisper, mediapipe, cv2; mediapipe.solutions" 2>/dev/null; then
  rm -rf "$VENV"
  PY=$(command -v python3.12 || command -v python3.11 || command -v python3)
  "$PY" -m venv "$VENV"
  "$VENV/bin/pip" install -q faster-whisper "av<16" "mediapipe==0.10.21" "numpy<2" opencv-python-headless
fi

# Modelo de voz a texto (descarga una vez, ~500 MB)
MODEL="${SHORTS_MODEL:-small}"
"$VENV/bin/python" -c "from faster_whisper import WhisperModel; WhisperModel('$MODEL', device='cpu', compute_type='int8')" >/dev/null 2>&1

# Remotion
[ -d "$DIR/remotion/node_modules" ] || (cd "$DIR/remotion" && npm install --silent)

command -v ffmpeg >/dev/null || { echo "Falta ffmpeg"; exit 1; }
B=$(ls /opt/pw-browsers/chromium_headless_shell-*/*/chrome-headless-shell 2>/dev/null | head -1 || true)
echo "LISTO venv=$VENV modelo=$MODEL navegador=${B:-NO_ENCONTRADO}"
echo "export REMOTION_BROWSER_EXECUTABLE=$B"
