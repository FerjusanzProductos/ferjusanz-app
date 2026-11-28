# gancho

**Qué hace:** disecciona los primeros 3 segundos: qué palabras dice, cuándo empieza a hablar, cuántos cortes hay, cuándo aparece o cambia el texto en pantalla y qué tipo de gancho es.

```bash
python3 gancho.py ref.mp4 --palabras palabras.json --carpeta analisis/
```

**Números:** primera palabra ideal < 0,3 s (avisa si pasa de 0,6 s) · cortes con el mismo detector de `ritmo/` · texto en pantalla = franjas con > 6 % de bordes fuertes (salto de brillo > 25 %), cambio si la firma de franjas cambia o sus bordes cambian > 35 %.

**Sale:** `gancho.json` y `hoja_gancho.jpg` (un fotograma por segundo y uno por cada cambio de texto). Claude mira la hoja y **lee** el texto exacto: aquí no hay OCR.

**Honesto:** el tipo de gancho (pregunta, cifra, negación/polémica, historia en primera persona, orden directa) sale de palabras clave; es una pista, no un veredicto.
