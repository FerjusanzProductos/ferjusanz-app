# tipografia

**Qué hace:** propone la fuente de tus fuentes instaladas que más se parece a la de los rótulos o subtítulos de la referencia.

```bash
python3 tipografia.py ref.mp4 --tiempo 2.0 --texto "este bicho de aquí"            # lista los rótulos que ve
python3 tipografia.py ref.mp4 --tiempo 2.0 --texto "este bicho de aquí" --zona 489,2016,461,59 --carpeta out/
```

**Cómo:** máscara de píxeles casi blancos o casi negros → recorte de la tinta → renderiza el mismo texto con cada fuente (Pillow) → SSIM 7×7 entre las dos máscaras − 0,5 × diferencia de proporción. Te da el top 5 y `tipografia_comparacion.png`.

**Honesto:** es una **aproximación**. Un vídeo no guarda qué fuente se usó; si la fuente real no la tienes instalada, te da la más parecida que sí tengas (añade carpetas con `--fuentes`). Lo ideal es que Claude lea el texto del fotograma y lo pase con `--texto`.
