# ritmo

**Qué hace:** mide cada cuánto cambia la imagen (cortes por segundo, duración media de plano, curva cada 5 s) y, con la transcripción, a qué velocidad se habla.

```bash
python3 ritmo.py ref.mp4 --palabras palabras.json --salida ritmo.json
```

**Números:** corte = en una de 6 franjas horizontales cambia > 8 % de los píxeles (más de un 8 % de brillo) y eso es > 4× la mediana de los ±15 fotogramas vecinos. Las franjas detectan los cortes de **pantalla dividida** (solo cambia el panel), que un detector de cuadro entero como `scdet` casi no ve.

**Honesto:** un fundido lento puede no contar como corte y un latigazo de cámara puede contar como uno. Contrástalo con la hoja de fotogramas.
