# referencias

**Qué hace:** baja el reel que quieres copiar (Instagram, TikTok, YouTube Shorts) con `yt-dlp` o toma un MP4 que ya tengas, y deja en una carpeta todo lo que necesitan los demás algoritmos.

```bash
python3 descargar.py "https://www.instagram.com/reel/XXXX/" --carpeta referencias/mi-ref
python3 descargar.py ref.mp4 --carpeta referencias/mi-ref          # archivo local
python3 descargar.py URL --cookies-desde-navegador chrome           # si Instagram pide sesión
```

**Sale:** `video.mp4`, `ficha.json` (duración, resolución, fps, palabras/s), `hoja.jpg` (16 fotogramas), `hoja_gancho.jpg` (8 fotogramas de los 3 primeros segundos) y `palabras.json` + `palabras.txt` (faster-whisper `small`).

**Honesto:** Instagram cambia a menudo y a veces exige sesión. Usa solo contenido que tengas derecho a analizar; el vídeo no sale de tu ordenador.
