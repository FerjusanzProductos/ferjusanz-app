# trabas

**Qué hace:** encuentra repeticiones («que que»), palabras cortadas («pro- programa»), muletillas (eh, mmm) y reinicios de frase («te voy a… te voy a enseñar») y te da los tramos limpios.

```bash
python3 trabas.py crudo.mov --modelo medium --salida trabas.json
# → trabas.json (lista con tiempos y texto) + trabas_tramos.json (para cortes/apretar.py --tramos)
```

**Cómo:** doble transcripción con faster-whisper por bloques de ~6 s cortados en el punto más silencioso: una pasada **literal** (prompt lleno de titubeos para que los escriba) y otra **limpia** (sin prompt). Se marcan las trabas sobre la literal y lo que solo aparece en la literal se lista «para revisar». Bordes de corte al punto más silencioso a ±80 ms. Antialucinaciones: no se transcriben bloques sin voz, fuera palabras sin voz debajo y rachas de ≥ 5 palabras iguales.

**Honesto:** es una ayuda muy buena, no un oráculo. Escucha cada traba (2 s) antes de aceptar el corte. `large-v3` encuentra más que `medium`; en CPU las dos pasadas tardan varias veces la duración del vídeo.
