# zooms — DESACTIVADO POR DEFECTO

Muchos creadores **no** quieren zooms. Sin `--activar` este script solo enseña el plan y no toca el vídeo.

```bash
python3 zooms.py montado.mp4 --palabras palabras_montaje.json --auto 4                      # plan
python3 zooms.py montado.mp4 --palabras palabras_montaje.json --claves "gratis,30" --activar --salida z.mp4
```

**Números:** zoom 1,00 → 1,08 en 0,20 s con curva smoothstep, se mantiene hasta 0,4 s tras la palabra (máx. 1,2 s), mínimo 4 s entre zooms, centrado en la cara (OpenCV) o en `--centro`. `--fino` escala ×2 antes para que no tiemble.

**Honesto:** elige las palabras automáticas por cifras, MAYÚSCULAS y longitud; mejor dale tú las claves.
