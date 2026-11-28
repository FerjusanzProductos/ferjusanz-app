---
name: skill-editor
description: Copia la edición de cualquier reel y la aplica a tu vídeo en bruto con 12 algoritmos reales (referencias, gancho, estructura, ritmo, tipografía, CTA, cortes, trabas, subtítulos, música, zooms y b-roll) - baja la referencia, le saca el gancho, la estructura, el ritmo de cortes, la fuente y el CTA, y luego a tu crudo le sincroniza el micro, le quita el pitido, corta los silencios sin comerse palabras, quita trabas y tomas repetidas, pone subtítulos fuera del HUD de Instagram y sin tapar la cara, mezcla la música a −14 LUFS y lo revisa todo antes de entregar; nunca publica nada. Úsala cuando digan /skill-editor, «comenta SKILL», «la skill del editor», «edita mi reel como este», «copia este reel conmigo», «hazme lo mismo que este reel», «quita silencios y trabas», «quítame las trabas», «qué fuente usa este reel» o pasen un reel de referencia junto a su vídeo en bruto.
---

# skill-editor

Copias un reel que funciona y lo rehaces **contigo**: mismo gancho, misma estructura, mismo ritmo, misma
tipografía, mismo CTA, pero con tu crudo bien cortado. Cada paso es un script con números concretos en
`algoritmos/`. Tú (Claude) los encadenas, miras los resultados y hablas con la persona.

`S=~/.claude/skills/skill-editor` (si la skill está en otra ruta, usa esa). Trabaja siempre en una carpeta de
proyecto de la persona (por ejemplo `~/Movies/skill-editor/<nombre-del-reel>/`), nunca dentro de la skill.


## En FERJUSANZ (léelo primero)
- `S=.claude/skills/skill-editor` (ruta del proyecto). Trabaja en el scratchpad o en una carpeta fuera del repo; **nunca subas vídeos al repositorio**. Entrega el vídeo final con SendUserFile para que Tito lo vea en el móvil.
- En este contenedor ya hay ffmpeg, ffprobe y yt-dlp; los paquetes de Python se instalan con `pip3 install -r $S/requirements.txt` si faltan (no hay `brew`). Whisper `medium` va lento aquí: prueba primero `small`.
- Para Instagram/TikTok, yt-dlp puede necesitar que Tito pase el vídeo descargado (Instagram pide sesión). Nunca publicar: el texto del pie pasa por `node web/revisar-texto.cjs`. Se complementa con `/shorts`, `media-use` e `hyperframes`.

## Reglas que no se rompen

1. **Una pregunta cada vez.** Espera la respuesta antes de la siguiente.
2. **Nunca publiques nada** ni subas vídeos a ningún sitio. Entregas un archivo y dices dónde está.
3. **Nunca cortes una palabra.** Los cortes se deciden por energía del audio (`cortes/apretar.py`), no por los
   tiempos de Whisper. Si la comprobación avisa de un borde con voz, lo miras antes de seguir.
4. **Ningún silencio > 0,25 s** dentro del reel y **1 s de respiro** tras la última palabra del CTA.
5. **HUD de Instagram** (lienzo 1080×1920): ningún texto ni gráfico en y < 250, y > 1500 ni x > 950.
6. **Nunca tapes la cara.** Si un gráfico o b-roll no cabe, pantalla dividida.
7. **Texto blanco o negro.** Nada de colores de plantilla salvo que la referencia los use y la persona lo pida.
8. **Zooms desactivados** salvo que la referencia los use **y** la persona los quiera.
9. **RAM:** un proceso pesado cada vez (Whisper o un render grande). Nunca dos a la vez.
10. Lo que es heurística se dice como heurística («parece Helvetica», no «es Helvetica»).

## Paso 0 · Comprobar el equipo (una vez)

```bash
which ffmpeg ffprobe yt-dlp; python3 -c "import numpy, faster_whisper, PIL; print('ok')"
python3 -c "import cv2" 2>/dev/null && echo "opencv ok" || echo "sin opencv (la cara se supone arriba-centro)"
```

Si falta algo: `brew install ffmpeg yt-dlp` y `pip3 install -r $S/requirements.txt`. Explícalo en una línea.

## Paso 1 · Preguntas (de una en una)

1. «Pásame el reel que quieres copiar (enlace o archivo).»
2. «Ahora tu vídeo en bruto. ¿Grabaste la voz con un micro aparte? Si es así, pásame también ese audio.»
3. Solo si hace falta: «¿Tienes ya canción o te propongo una?» y «¿quieres zooms? (por defecto no)».

## Paso 2 · Analizar la referencia

```bash
python3 $S/algoritmos/referencias/descargar.py "<URL o ref.mp4>" --carpeta ref
python3 $S/algoritmos/gancho/gancho.py ref/video.mp4 --palabras ref/palabras.json --carpeta ref
python3 $S/algoritmos/estructura/estructura.py ref/palabras.json --duracion <dur> --salida ref/estructura.json
python3 $S/algoritmos/ritmo/ritmo.py ref/video.mp4 --palabras ref/palabras.json --salida ref/ritmo.json
python3 $S/algoritmos/cta/cta.py ref/video.mp4 --palabras ref/palabras.json --salida ref/cta.json
```

(Si es un archivo local, `video.mp4` es ese archivo: mira `ref/ficha.json`.)

Mira **siempre** `ref/hoja.jpg` y `ref/hoja_gancho.jpg` con la herramienta de leer imágenes: ahí lees el texto
de los rótulos, la posición de los subtítulos, si hay pantalla dividida y si hay zooms. Luego la tipografía:

```bash
python3 $S/algoritmos/tipografia/tipografia.py ref/video.mp4 --tiempo <t con subtítulo> --texto "<lo que lees>" --carpeta ref
# la 1.ª vez lista los rótulos que ve; repite con --zona x,y,ancho,alto del que quieras
```

Mira `ref/tipografia_comparacion.png` antes de dar el nombre de la fuente.

Resume a la persona en 6-8 líneas: tipo de gancho y su frase, esqueleto con % de tiempo, cortes por segundo y
plano medio, palabras por segundo, estilo de subtítulos (posición, grupo de palabras, mayúsculas, color),
fuente más parecida, CTA y respiro. Si su crudo no sigue esa estructura, díselo (con tacto) antes de editar.

## Paso 3 · Limpiar tu crudo

En este orden (cada uno en su carpeta de trabajo):

```bash
# 3.1 micro externo → imagen (solo si hay micro aparte)
python3 $S/algoritmos/cortes/sincronia.py crudo.mov micro.wav --aplicar crudo_sync.mov
# 3.2 pitido (diagnostica; aplica solo si encuentra picos estables)
python3 $S/algoritmos/cortes/pitido.py crudo_sync.mov --aplicar crudo_limpio.mov
# 3.3 trabas (pesado: Whisper ×2)
python3 $S/algoritmos/trabas/trabas.py crudo_limpio.mov --modelo medium --salida trabas.json
```

Enseña la lista de trabas (tiempo + texto) y pregunta si se quitan todas. Las marcadas «revisar» solo se quitan
si la persona dice que sí; edita `trabas_tramos.json` a mano si hace falta. Si hay varias tomas de la misma
frase, la buena es la última salvo que diga otra cosa.

```bash
# 3.4 silencios fuera sin comer palabras (usa --modo ajustado si la referencia va muy rápida: > 3,5 palabras/s)
python3 $S/algoritmos/cortes/apretar.py crudo_limpio.mov --tramos trabas_tramos.json --salida tramos2.json
# 3.5 montaje exacto a fotograma (vertical si el crudo es horizontal; --x mueve el encuadre; --espejo para la frontal)
python3 $S/algoritmos/cortes/cortar.py crudo_limpio.mov tramos2.json montado.mp4 --vertical
# 3.6 respiro: si apretar avisó de que falta cola tras la última palabra
python3 $S/algoritmos/cta/cta.py montado.mp4 --arreglar montado_ok.mp4 && mv montado_ok.mp4 montado.mp4
# 3.7 transcribe el MONTAJE (los subtítulos así van clavados). --pista con marcas y nombres raros
python3 $S/comun/transcribir.py montado.mp4 --salida montado_palabras.json --idioma es --modelo medium --pista "Claude, <marcas>"
```

Si `apretar.py` avisa de un corte con voz sonando, mira ese segundo (`--desde/--hasta` en transcribir o escucha)
antes de seguir.

## Paso 4 · Vestirlo como la referencia

```bash
# b-roll / capturas donde la referencia pone panel (siempre sin tapar la cara)
python3 $S/algoritmos/broll/broll.py montado.mp4 --inserto captura.png@3.2-6.0 --salida con_broll.mp4
# subtítulos con el estilo de la referencia (grupo, mayúsculas, posición, fuente de tipografia/)
python3 $S/algoritmos/subtitulos/subtitulos.py montado_palabras.json --salida subs --grupo 2 \
        --fuente "<archivo de la fuente>" --quemar con_broll.mp4 --video-salida subtitulado.mp4
# zooms SOLO si la referencia los usa y la persona los quiere
python3 $S/algoritmos/zooms/zooms.py subtitulado.mp4 --palabras montado_palabras.json --auto 3 --activar
```

Pon los zooms **antes** de los subtítulos si los usas (si no, el zoom agranda también el texto).

## Paso 5 · Música

```bash
python3 $S/algoritmos/musica/mezclar.py subtitulado.mp4 cancion.mp3 --desde <s> --bajo 18.5 --salida final.mp4 --sin-musica-tambien
```

Si la voz se oye baja frente a la música, sube `--bajo` (más LU de diferencia). Nunca la misma canción para
todo un lote de reels.

## Paso 6 · Comprobación final (obligatoria)

```bash
python3 $S/algoritmos/cta/cta.py final.mp4 --palabras montado_palabras.json      # respiro 1-2 s (si no: --arreglar)
python3 $S/comun/revisar.py final.mp4 --voz final_sin-musica.mp4               # huecos, respiro, LUFS, pistas, HUD
```

Los huecos se miden en la versión sin música (la música los tapa). Si aparece un hueco > 0,25 s, vuelve a
`apretar.py` (o recorta ese tramo a mano en `tramos2.json`) y repite desde `cortar.py`.
Abre `final_revision.jpg` y míralo: nada de texto en las zonas rojas y la cara siempre visible. Si `revisar.py`
dice «revisar …», arréglalo y vuelve a pasarlo. Solo cuando salga «todo OK» entregas:

> «Listo: `<ruta>/final.mp4` (XX s, −14 LUFS). Cambios respecto al crudo: … ¿Lo quieres más rápido o así?»

## Si solo piden una parte

- «quita silencios y trabas» → pasos 3.3 a 3.5 y revisar.
- «qué fuente usa este reel» → referencias + tipografia.
- «ponle subtítulos» → transcribir + subtitulos.
- «ponle música» → mezclar + revisar.

Hecho por Denís Corral · @deniscorralvillarraso · Sell Your AI (sellyourai.io)
