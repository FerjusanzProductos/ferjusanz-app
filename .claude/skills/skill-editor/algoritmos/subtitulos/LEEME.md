# subtitulos

**Qué hace:** de `palabras.json` a subtítulos palabra a palabra o en grupos de 2-3, en la zona segura de Instagram, en `.ass`, `.srt` o quemados en el vídeo.

```bash
python3 subtitulos.py palabras_montaje.json --salida subs --grupo 2 --estilo limpio --color blanco
python3 subtitulos.py palabras_montaje.json --salida subs --quemar montado.mp4 --video-salida subtitulado.mp4
```

**Reglas:** nada por encima de y=250, por debajo de y=1500 ni a la derecha de x=950 (lienzo 1080×1920) · ancho máximo 820 px medido con la fuente real · altura por defecto y=1110 · con `--cara x0,y0,x1,y1` nunca encima de la cara · solo blanco o negro (`--estilo caja` con fondo, `--estilo resaltado` con la palabra activa al 100 % y el resto al 60 %).

**Honesto:** los tiempos son los de Whisper (±50-100 ms). Para que vayan clavados, transcribe el **montaje final** en vez de reutilizar las palabras del crudo.
