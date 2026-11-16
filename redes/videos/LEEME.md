# Vídeos de redes con HyperFrames

Vídeos cortos verticales (Reels, TikTok, Shorts y la web), hechos con HyperFrames (heygen-com/hyperframes, Apache-2.0): se escribe el vídeo como una página web y se convierte en MP4. Gratis y sin cuenta.

## Cómo se hace uno nuevo
1. Copiar `naranja-zumo/` con otro nombre y cambiar textos, fotos (`img/`) y tiempos en `index.html`.
2. Voz de Fernando: la graba con la Grabadora del Samsung y la guarda en su Google Drive; Claude la baja con el conector de Drive y la limpia con:
   `ffmpeg -i original.m4a -af "highpass=f=90,afftdn=nf=-25,loudnorm=I=-16:TP=-1.5" -ar 44100 -c:a aac -b:a 96k voz.m4a`
   Para cuadrar cada pantalla con la voz, pasar la voz a texto con Gemini (`gemini-3.5-flash`, clave ya puesta).
3. Comprobar: `npx -y hyperframes@0.9.58 lint` y `npx -y hyperframes@0.9.58 snapshot --at 2,6,13` (mirar la hoja de capturas).
4. Sacar el vídeo y aligerarlo:
   `npx -y hyperframes@0.9.58 render -o grande.mp4`
   - Redes (con voz): `ffmpeg -i grande.mp4 -vf scale=720:-2 -c:v libx264 -crf 28 -preset slow -pix_fmt yuv420p -c:a aac -b:a 96k -movflags +faststart redes.mp4`
   - Web (sin sonido): lo mismo con `-an` en vez de `-c:a aac -b:a 96k`.
5. Mandárselo a Fernando. Los MP4 no se suben al repo.

## Reglas
- La primera vez: `npx -y hyperframes@0.9.58 telemetry disable`.
- **Nunca** `npm run publish` ni `hyperframes publish` ni `cloud`: suben el vídeo a los servidores de HeyGen.
- Música: no hay gratis para empresa por IA (MusicGen es «no comercial»; Lyria de Gemini es de pago, 0,04 $ por 30 s, sin activar). Fernando la pone desde Instagram/TikTok al subir. Los efectos de sonido de `media-use` (Pixabay) sí se pueden usar.
- Precios y cifras, solo los que diga Fernando. Fotos: las reales de Fernando o las de `web/public/fotos`.
- Nada se publica en redes ni en la web sin su «sí».
