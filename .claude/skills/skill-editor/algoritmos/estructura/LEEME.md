# estructura

**Qué hace:** convierte la transcripción en el esqueleto del reel: **gancho → desarrollo (pasos) → prueba → CTA**, con el % de tiempo de cada parte, para copiar las proporciones de la referencia en tu guion.

```bash
python3 estructura.py palabras.json --duracion 80.5 --salida estructura.json
```

**Números:** frases por pausas > 0,35 s o puntuación · bloque nuevo con pausa ≥ 0,6 s, marcador de idea («primero», «además», «la clave»…), marcador de paso o bloque > 12 s · gancho = lo que empieza antes de 3 s · CTA = desde la última frase con «comenta/responde/sígueme/guarda/link…».

**Honesto:** clasifica por palabras clave, no entiende el texto. Claude debe leerlo y corregir lo que no cuadre.
