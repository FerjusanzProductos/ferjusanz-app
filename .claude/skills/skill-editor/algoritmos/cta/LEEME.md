# cta

**Qué hace:** encuentra la llamada a la acción («comenta / responde PALABRA», o «sígueme / guárdalo» si no hay palabra) y comprueba el respiro final.

```bash
python3 cta.py reel.mp4 --palabras palabras.json                       # diagnostica
python3 cta.py reel.mp4 --palabras palabras.json --arreglar reel_ok.mp4  # deja el respiro en 1,0 s exacto
```

**Números:** respiro = desde la última ventana de 10 ms con voz (ruido de fondo + 10 dB) hasta el final, medido en el audio. Regla: entre 1,0 y 2,0 s. `--arreglar` recorta si sobra o congela el último fotograma con silencio si falta.

**Honesto:** la PALABRA clave se adivina (mayúsculas, comillas o la primera palabra que no es de relleno tras el verbo). Confírmala.
