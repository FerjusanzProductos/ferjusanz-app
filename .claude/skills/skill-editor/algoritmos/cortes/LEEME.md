# cortes

Cuatro herramientas, en este orden:

| Script | Qué hace | Números |
|---|---|---|
| `sincronia.py` | Desfase micro externo ↔ cámara y lo aplica | Correlación cruzada FFT (±30 s) + ventanas de 3 s cada 2 s (±0,25 s), mediana en ms, deriva en ms/min; descarta ventanas con correlación < 0,15 |
| `pitido.py` | Quita pitidos tonales sin dejar la voz «de submarino» | Espectro medio de las tramas más silenciosas; pico > 10 dB sobre la mediana de ±150 Hz y presente en > 60 % → `equalizer` de 40 Hz a −28 dB. Nada de afftdn ni compresión |
| `apretar.py` | Quita silencios sin comer palabras | Voz = ruido de fondo + 10 dB (sin chasquidos < 50 ms) · 0,06 s antes / 0,15 s de cola / huecos < 0,22 s se quedan (`--modo ajustado`: 0,04 / 0,12 / 0,15) · 1 s de respiro final · los 30 ms junto a cada corte por debajo de −40 dB, si no alarga |
| `cortar.py` | Monta los tramos exactos a fotograma | Vídeo por nº de fotograma, audio por nº de muestra (1600/fotograma a 30 fps y 48 kHz), fundidos de 8/12 ms; `--vertical`, `--espejo`, `--audio`, `--palabras` |

```bash
python3 sincronia.py camara.mov micro.wav --aplicar con_micro.mov
python3 pitido.py con_micro.mov --aplicar limpio.mov
python3 apretar.py limpio.mov --tramos trabas_tramos.json --salida tramos2.json
python3 cortar.py limpio.mov tramos2.json montado.mp4 --vertical --palabras palabras.json
```

**Honesto:** `apretar` decide por energía; si de fondo suena música o hay otra persona hablando, sube `--margen`. La comprobación de bordes avisa con el segundo exacto cuando no puede garantizar el corte limpio.
