# skill-editor

**Copia la edición de cualquier reel y aplícala a tu vídeo, dentro de Claude Code.**

Le pasas el reel que te gusta (el de tu competencia, el que se ha hecho viral) y tu vídeo en bruto. Claude
analiza la referencia con 12 algoritmos (gancho, estructura, ritmo de cortes, tipografía, CTA…) y edita tu crudo
igual: sincroniza el micro, quita el pitido, corta los silencios sin comerse palabras, quita las trabas, pone
subtítulos en la zona segura, mezcla la música a −14 LUFS y lo revisa todo antes de dártelo.

No es «darle un prompt a Claude»: cada paso es un script de Python con números concretos que puedes leer,
probar y cambiar. Y donde algo es una heurística, el propio script lo dice.

## Los 12 algoritmos

| Carpeta | Qué hace | Cómo (resumen) |
|---|---|---|
| `referencias/` | Baja el reel de referencia y lo deja listo | yt-dlp → MP4, ficha, hojas de fotogramas y transcripción palabra a palabra |
| `gancho/` | Disecciona los 3 primeros segundos | Palabras, tiempo hasta la primera palabra, cortes, cambios de texto en pantalla, tipo de gancho |
| `estructura/` | Saca el esqueleto: gancho → desarrollo → prueba → CTA | Frases por pausas, bloques por marcadores, % de tiempo de cada parte |
| `ritmo/` | Cortes por segundo y duración de plano | Diferencia de píxeles por 6 franjas (detecta los cortes de pantalla dividida) |
| `tipografia/` | Adivina la fuente de los rótulos | Renderiza el mismo texto con tus fuentes y compara con SSIM (aproximación) |
| `cta/` | Encuentra «comenta PALABRA» y mide el respiro final | Busca el verbo de CTA; respiro medido en el audio, 1-2 s |
| `cortes/` | Sincronía, pitido, silencios y montaje exacto | Correlación cruzada · ecualizadores de 40 Hz · energía sobre el ruido de fondo · corte a fotograma |
| `trabas/` | Repeticiones, palabras cortadas, muletillas, reinicios | Doble transcripción (literal y limpia) y comparación |
| `subtitulos/` | Subtítulos palabra a palabra en la zona segura | .ass / .srt / quemados; fuera del HUD de Instagram y nunca sobre la cara |
| `musica/` | Mezcla voz + canción | 18,5 LU bajo la voz, ducking, bucle con fundido cruzado, −14 LUFS con limitador |
| `zooms/` | Punch-in suave en palabras clave | **Desactivado por defecto** |
| `broll/` | Inserta clips e imágenes | Pantalla dividida si hay cara: nunca la tapa |

Más `comun/`: lectura de audio a numpy, transcripción con faster-whisper, fuentes, detección de cara y
`revisar.py`, la comprobación final (huecos > 0,25 s, respiro, −14 LUFS, pistas iguales y HUD pintado en rojo).

Cada carpeta tiene su `LEEME.md` y cada script su `--help`.

## Instalación

```bash
git clone https://github.com/deniscorral3am/skill-editor ~/.claude/skills/skill-editor
cd ~/.claude/skills/skill-editor
brew install ffmpeg yt-dlp            # en Mac (en Linux: apt install ffmpeg)
pip3 install -r requirements.txt
```

Abre Claude Code y escribe **`/skill-editor`** o «edita mi reel como este».

### Requisitos

- **ffmpeg** y **ffprobe** (cualquier versión reciente; no hace falta libass).
- **Python 3.9+** con **numpy**, **faster-whisper** y **Pillow**.
- Opcional: **opencv-python-headless** (detectar la cara) y **yt-dlp** (bajar referencias).
- Con 16 GB de RAM va bien: los scripts usan 2 hilos y Claude lanza un proceso pesado cada vez.
  La primera transcripción descarga el modelo de Whisper (small ≈ 0,5 GB, medium ≈ 1,5 GB).

## Prueba rápida

```bash
S=~/.claude/skills/skill-editor/algoritmos
python3 $S/cortes/apretar.py mi_crudo.mov --salida tramos2.json
python3 $S/cortes/cortar.py mi_crudo.mov tramos2.json montado.mp4 --vertical
python3 ~/.claude/skills/skill-editor/comun/revisar.py montado.mp4
```

## Lo que NO hace (para que nadie se lleve sorpresas)

- No publica nada ni sube tus vídeos a ningún sitio: todo corre en tu ordenador.
- La tipografía y el tipo de gancho/estructura son aproximaciones explicadas; Claude las revisa contigo.
- No pone la música «en tendencia» de Instagram: eso solo se puede desde la app.

---

Hecho por Denís Corral · [@deniscorralvillarraso](https://instagram.com/deniscorralvillarraso) · [Sell Your AI](https://sellyourai.io)

Licencia MIT.
