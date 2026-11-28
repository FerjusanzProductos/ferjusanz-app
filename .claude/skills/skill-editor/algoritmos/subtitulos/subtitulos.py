#!/usr/bin/env python3
"""SUBTÍTULOS · palabras.json → subtítulos palabra a palabra (o en grupos de 2-3) en la zona segura de Instagram.

Algoritmo:
  1. Grupos: hasta --grupo palabras (1, 2 o 3). Se cierra el grupo antes si hay pausa > 0,3 s o la palabra acaba en
     . , ? ! (así no se mezclan dos frases en un mismo rótulo) o si el texto no cabe en el ancho seguro.
  2. Tiempos: cada grupo entra cuando empieza su primera palabra y se queda hasta que entra el siguiente (sin
     parpadeo). Si después hay una pausa > 0,5 s, sale 0,15 s después de su última palabra.
  3. Zona segura (lienzo 1080×1920): nada por encima de y=250 (nombre de la cuenta), nada por debajo de y=1500
     (descripción y botones) y nada a la derecha de x=950 (me gusta, comentar, compartir). El texto se centra en
     x=540 con un ancho máximo de 820 px (de x=130 a x=950) y altura por defecto en y=1110 (bajo la barbilla en un
     plano medio). Se mide cada rótulo con la fuente real (Pillow) y, si no cabe, se parte el grupo.
  4. Cara: con --cara x0,y0,x1,y1 (la caja de la cara en el lienzo) o --cara auto (detector de OpenCV en 5
     fotogramas del vídeo) el subtítulo se mueve debajo de la cara (o encima si abajo no cabe) para no taparla.
  5. Color: blanco o negro, nada más. Blanco con borde negro fino (o caja negra con --estilo caja); negro con
     borde blanco. --estilo resaltado: la palabra que se está diciendo al 100 % y el resto del rótulo al 60 %.
  6. Salida: .ass (estilo y posición exactos, para CapCut/Premiere/ffmpeg con libass) y/o .srt, y con --quemar los
     incrusta en el vídeo renderizando cada rótulo con Pillow (funciona aunque tu ffmpeg no tenga libass).

Uso:
  python3 subtitulos.py palabras_montaje.json --salida subs [--formato ass|srt|ambos] [--grupo 2]
                        [--estilo limpio|caja|resaltado] [--color blanco|negro] [--tam 72] [--y 1110]
                        [--mayus] [--fuente /ruta/fuente.ttf] [--cara 340,420,740,900]
                        [--quemar montado.mp4 --video-salida subtitulado.mp4]
"""
import argparse
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import cara as CARA, fuentes, video  # noqa: E402

ANCHO, ALTO = 1080, 1920
HUD = dict(arriba=250, abajo=1500, derecha=950, izquierda=130)


def agrupar(W, n, cabe):
    G, cur = [], []
    for i, w in enumerate(W):
        if cur:
            pausa = w['s'] - W[i - 1]['e'] > 0.3
            puntua = W[i - 1]['w'][-1:] in '.,?!;:…'
            if len(cur) >= n or pausa or puntua or not cabe(' '.join(x['w'] for x in cur + [w])):
                G.append(cur)
                cur = []
        cur.append(w)
    if cur:
        G.append(cur)
    out = []
    for k, g in enumerate(G):
        fin = G[k + 1][0]['s'] if k + 1 < len(G) else g[-1]['e'] + 0.4
        if fin - g[-1]['e'] > 0.5:
            fin = g[-1]['e'] + 0.15
        out.append(dict(ini=g[0]['s'], fin=max(fin, g[0]['s'] + 0.1), palabras=g))
    return out


def ts_ass(t):
    t = max(0.0, t)
    h, m = int(t // 3600), int(t % 3600 // 60)
    return f'{h}:{m:02d}:{t % 60:05.2f}'


def ts_srt(t):
    t = max(0.0, t)
    ms = int(round(t * 1000))
    return f'{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}'


def texto_de(g, mayus):
    t = ' '.join(w['w'] for w in g['palabras'])
    return t.upper() if mayus else t


def escribir_ass(G, ruta, a, familia, y):
    blanco, negro = '&H00FFFFFF', '&H00000000'
    prim, borde = (blanco, negro) if a.color == 'blanco' else (negro, blanco)
    caja = a.estilo == 'caja'
    estilo = (f'Style: Reel,{familia},{a.tam},{prim},{prim},{borde},{"&H80000000" if caja else borde},-1,0,0,0,100,100,0,0,'
              f'{3 if caja else 1},{12 if caja else 4},0,5,{HUD["izquierda"]},{ANCHO - HUD["derecha"]},0,1')
    L = ['[Script Info]', 'ScriptType: v4.00+', f'PlayResX: {ANCHO}', f'PlayResY: {ALTO}', 'WrapStyle: 2', '',
         '[V4+ Styles]',
         'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, '
         'Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
         estilo, '', '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text']
    for g in G:
        if a.estilo == 'resaltado':
            ws = g['palabras']
            for k, w in enumerate(ws):
                ini = g['ini'] if k == 0 else w['s']
                fin = ws[k + 1]['s'] if k + 1 < len(ws) else g['fin']
                partes = [('{\\alpha&H00&}' if j == k else '{\\alpha&H66&}') + (x['w'].upper() if a.mayus else x['w']) for j, x in enumerate(ws)]
                L.append(f'Dialogue: 0,{ts_ass(ini)},{ts_ass(fin)},Reel,,0,0,0,,{{\\an5\\pos(540,{y})}}' + ' '.join(partes))
        else:
            L.append(f'Dialogue: 0,{ts_ass(g["ini"])},{ts_ass(g["fin"])},Reel,,0,0,0,,{{\\an5\\pos(540,{y})}}{texto_de(g, a.mayus)}')
    Path(ruta).write_text('\n'.join(L) + '\n')


def escribir_srt(G, ruta, mayus):
    L = []
    for k, g in enumerate(G, 1):
        L += [str(k), f'{ts_srt(g["ini"])} --> {ts_srt(g["fin"])}', texto_de(g, mayus), '']
    Path(ruta).write_text('\n'.join(L))


def rotulo(texto_partes, activa, font, a):
    """PNG RGBA de 1080×1920 con el rótulo centrado en (540, y)."""
    from PIL import Image, ImageDraw
    im = Image.new('RGBA', (ANCHO, ALTO), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    col = (255, 255, 255) if a.color == 'blanco' else (0, 0, 0)
    bor = (0, 0, 0) if a.color == 'blanco' else (255, 255, 255)
    esp = font.getlength(' ')
    anchos = [font.getlength(p) for p in texto_partes]
    total = sum(anchos) + esp * (len(texto_partes) - 1)
    asc, desc = font.getmetrics()
    x = 540 - total / 2
    ytop = a.y - (asc + desc) / 2
    if a.estilo == 'caja':
        pad = 18
        d.rounded_rectangle([x - pad, ytop - pad / 2, x + total + pad, ytop + asc + desc + pad / 2], radius=14, fill=bor + (200,))
    for k, (p, w) in enumerate(zip(texto_partes, anchos)):
        alfa = 255 if (activa is None or k == activa) else 153
        sw = 0 if a.estilo == 'caja' else max(2, a.tam // 18)
        d.text((x, ytop), p, font=font, fill=col + (alfa,), stroke_width=sw, stroke_fill=bor + (alfa,))
        x += w + esp
    return im


def quemar(G, a, font, video_in, video_out):
    tmp = Path(tempfile.mkdtemp(prefix='subs_'))
    try:
        from PIL import Image
        vacio = tmp / 'vacio.png'
        Image.new('RGBA', (ANCHO, ALTO), (0, 0, 0, 0)).save(vacio)
        tramos, n = [], 0
        for g in G:
            partes = [w['w'].upper() if a.mayus else w['w'] for w in g['palabras']]
            if a.estilo == 'resaltado':
                ws = g['palabras']
                for k, w in enumerate(ws):
                    ini = g['ini'] if k == 0 else w['s']
                    fin = ws[k + 1]['s'] if k + 1 < len(ws) else g['fin']
                    f = tmp / f'{n:05d}.png'
                    rotulo(partes, k, font, a).save(f)
                    tramos.append((ini, fin, f))
                    n += 1
            else:
                f = tmp / f'{n:05d}.png'
                rotulo(partes, None, font, a).save(f)
                tramos.append((g['ini'], g['fin'], f))
                n += 1
        D = video.info(video_in)['duracion']
        lista, t = [], 0.0
        for ini, fin, f in tramos:
            if ini > t + 0.001:
                lista += [f"file '{vacio}'", f'duration {ini - t:.3f}']
            lista += [f"file '{f}'", f'duration {fin - max(ini, t):.3f}']
            t = fin
        lista += [f"file '{vacio}'", f'duration {max(D - t, 0.1):.3f}', f"file '{vacio}'"]
        (tmp / 'lista.txt').write_text('\n'.join(lista) + '\n')
        fps = video.info(video_in)['fps']
        subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-f', 'concat', '-safe', '0', '-i', str(tmp / 'lista.txt'),
                        '-vf', f'fps={fps},format=rgba', '-c:v', 'qtrle', '-t', f'{D:.3f}', str(tmp / 'capa.mov')], check=True)
        inf = video.info(video_in)
        esc = '' if (inf['ancho'], inf['alto']) == (ANCHO, ALTO) else f'[1:v]scale={inf["ancho"]}:{inf["alto"]}[s];'
        fc = esc + f'[0:v][{"s" if esc else "1:v"}]overlay=0:0:eof_action=pass,format=yuv420p[v]'
        subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', video_in, '-i', str(tmp / 'capa.mov'), '-filter_complex', fc,
                        '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-threads', '2',
                        '-c:a', 'copy', video_out], check=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def main():
    ap = argparse.ArgumentParser(description='Subtítulos palabra a palabra en la zona segura de Instagram (.ass/.srt y quemados).')
    ap.add_argument('palabras', help='palabras.json en la línea de tiempo del vídeo final')
    ap.add_argument('--salida', default='subtitulos', help='nombre base de los archivos (sin extensión)')
    ap.add_argument('--formato', choices=['ass', 'srt', 'ambos'], default='ambos')
    ap.add_argument('--grupo', type=int, default=2, choices=[1, 2, 3], help='palabras por rótulo (2)')
    ap.add_argument('--estilo', choices=['limpio', 'caja', 'resaltado'], default='limpio')
    ap.add_argument('--color', choices=['blanco', 'negro'], default='blanco')
    ap.add_argument('--tam', type=int, default=72, help='tamaño de letra en px sobre 1080×1920 (72)')
    ap.add_argument('--y', type=int, default=1110, help='centro vertical del rótulo (1110)')
    ap.add_argument('--mayus', action='store_true')
    ap.add_argument('--fuente', default=None, help='archivo .ttf/.otf (o .ttc#índice). Por defecto, una negrita del sistema')
    ap.add_argument('--cara', default=None, help='caja de la cara x0,y0,x1,y1 en el lienzo 1080×1920, o «auto» (con --quemar)')
    ap.add_argument('--quemar', metavar='VIDEO', help='vídeo sobre el que incrustarlos')
    ap.add_argument('--video-salida', default=None)
    a = ap.parse_args()

    import json
    W = [w for w in json.load(open(a.palabras)) if w['w'].strip()]
    spec = a.fuente or fuentes.por_defecto()
    font = fuentes.cargar(spec, a.tam)
    familia = font.getname()[0]
    alto_txt = sum(font.getmetrics())
    # cara: el rótulo nunca encima
    if a.cara == 'auto':
        if not a.quemar:
            sys.exit('--cara auto necesita --quemar VIDEO para buscar la cara')
        D = video.info(a.quemar)['duracion']
        c = CARA.detectar(a.quemar, [D * f for f in (0.1, 0.3, 0.5, 0.7, 0.9)])
        a.cara = ','.join(str(v) for v in c) if c else None
        print(f'cara detectada en {a.cara}' if c else 'no detecto cara: dejo la altura indicada')
    if a.cara:
        x0, y0, x1, y1 = [int(v) for v in a.cara.split(',')]
        if y0 - alto_txt < a.y < y1 + alto_txt:
            debajo = y1 + 40 + alto_txt // 2
            encima = y0 - 40 - alto_txt // 2
            a.y = debajo if debajo + alto_txt // 2 <= HUD['abajo'] else encima
            print(f'la cara ocupa y {y0}-{y1}: subtítulos movidos a y={a.y}')
    lo, hi = HUD['arriba'] + alto_txt // 2, HUD['abajo'] - alto_txt // 2
    if not lo <= a.y <= hi:
        a.y = min(max(a.y, lo), hi)
        print(f'AVISO: y fuera de la zona segura; ajustado a y={a.y}')
    maxw = HUD['derecha'] - HUD['izquierda'] - (36 if a.estilo == 'caja' else 0)
    cabe = lambda t: font.getlength(t.upper() if a.mayus else t) <= maxw  # noqa: E731
    G = agrupar(W, a.grupo, cabe)
    if a.formato in ('ass', 'ambos'):
        escribir_ass(G, a.salida + '.ass', a, familia, a.y)
    if a.formato in ('srt', 'ambos'):
        escribir_srt(G, a.salida + '.srt', a.mayus)
    largos = [texto_de(g, a.mayus) for g in G if not cabe(texto_de(g, False))]
    print(f'{len(W)} palabras → {len(G)} rótulos · fuente {familia} {a.tam}px · y={a.y} · zona segura x 130-950, y 250-1500')
    if largos:
        print(f'AVISO: {len(largos)} palabra(s) sueltas no caben en 820 px: baja --tam. Ej.: {largos[:3]}')
    print('→', ', '.join(a.salida + e for e in (['.ass'] if a.formato != 'srt' else []) + (['.srt'] if a.formato != 'ass' else [])))
    if a.quemar:
        dest = a.video_salida or os.path.splitext(a.quemar)[0] + '_subs.mp4'
        quemar(G, a, font, a.quemar, dest)
        print(f'subtítulos incrustados → {dest}')


if __name__ == '__main__':
    main()
