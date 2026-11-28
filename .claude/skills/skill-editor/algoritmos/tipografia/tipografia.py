#!/usr/bin/env python3
"""TIPOGRAFÍA · adivina qué fuente usa tu competencia en sus rótulos comparándola con las fuentes que tienes.

Es una APROXIMACIÓN: compara formas, no lee metadatos (un vídeo no guarda qué fuente se usó). Te da las 5 más
parecidas de las que tienes instaladas (o de una carpeta que le pases) con su puntuación y una imagen para
comparar a ojo. Si la fuente real no está en tu Mac, te dará la más parecida que sí tengas.

Algoritmo:
  1. Fotograma en --tiempo. Zona del texto: la que le des con --zona x,y,ancho,alto o, si no, automática:
     máscara de píxeles casi blancos (luminancia > 0,85 y poca saturación) o casi negros (< 0,15) según --color;
     se buscan franjas horizontales donde esa máscara forma «texto» (≥ 4 cambios tinta/fondo por fila, altura entre
     el 1,5 % y el 15 % del cuadro), las lista y usa la de más tinta. Recorta al bloque de tinta.
  2. Texto: el que le pases con --texto (lo ideal: Claude mira el fotograma y lo escribe tal cual, respetando
     mayúsculas). Si no, y le das --palabras, prueba las combinaciones de 1-4 palabras dichas cerca de ese
     segundo y se queda con la que mejor encaja en proporción (los subtítulos suelen ser lo que se dice).
  3. Para cada fuente candidata: renderiza ese texto con Pillow, binariza, recorta a la tinta y escala al tamaño
     del recorte real. Puntuación = SSIM (similitud estructural, ventana 7×7, sobre las dos máscaras suavizadas)
     − 0,5 × |log(proporción renderizada / proporción real)| (penaliza fuentes más anchas o más estrechas).
  4. Salida: top 5 con puntuación, tipografia.json y tipografia_comparacion.png (real arriba, candidatas debajo).

Uso:
  python3 tipografia.py ref.mp4 --tiempo 2.0 --texto "este bicho de aquí" [--zona 0,1900,1440,200]
                        [--color blanco|negro|auto] [--fuentes ~/MisFuentes] [--filtro Inter,Montserrat] [--carpeta out/]
"""
import argparse
import json
import math
import re
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import fuentes, palabras as P, video  # noqa: E402


def mascara(rgb, color):
    x = rgb.astype(np.float32) / 255
    lum = 0.2126 * x[..., 0] + 0.7152 * x[..., 1] + 0.0722 * x[..., 2]
    sat = x.max(axis=2) - x.min(axis=2)
    blanco = (lum > 0.85) & (sat < 0.15)
    negro = lum < 0.15
    if color == 'blanco':
        return blanco
    if color == 'negro':
        return negro
    return blanco if blanco.mean() <= negro.mean() or negro.mean() > 0.3 else negro


def zonas_auto(m):
    """Todas las franjas con pinta de texto, de más tinta a menos: [(x, y, ancho, alto, tinta)]."""
    H = m.shape[0]
    trans = (np.diff(m.astype(np.int8), axis=1) == 1).sum(axis=1)
    filas = trans >= 4
    runs, i = [], 0
    while i < H:
        if filas[i]:
            j = i
            while j < H and (filas[j] or (j + 2 < H and filas[j + 1:j + 3].any())):
                j += 1
            if 0.015 * H <= j - i <= 0.15 * H:
                runs.append((i, j, int(m[i:j].sum())))
            i = j
        else:
            i += 1
    out = []
    for y0, y1, tinta in sorted(runs, key=lambda r: -r[2]):
        cols = np.where(m[y0:y1].any(axis=0))[0]
        out.append((int(cols.min()), int(y0), int(cols.max() - cols.min() + 1), int(y1 - y0), tinta))
    return out


def recortar_tinta(m):
    ys, xs = np.where(m)
    if len(ys) == 0:
        return None
    return m[ys.min():ys.max() + 1, xs.min():xs.max() + 1]


def caja(img, r=3):
    """Desenfoque de caja (2r+1)² con sumas acumuladas."""
    p = np.pad(img, r, mode='edge').astype(np.float64)
    c = p.cumsum(0).cumsum(1)
    c = np.pad(c, ((1, 0), (1, 0)))
    k = 2 * r + 1
    return (c[k:, k:] - c[:-k, k:] - c[k:, :-k] + c[:-k, :-k]) / (k * k)


def ssim(a, b):
    C1, C2 = 0.01 ** 2, 0.03 ** 2
    ma, mb = caja(a), caja(b)
    va, vb = caja(a * a) - ma ** 2, caja(b * b) - mb ** 2
    cov = caja(a * b) - ma * mb
    s = ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma ** 2 + mb ** 2 + C1) * (va + vb + C2))
    return float(s.mean())


def render(spec, texto, alto_obj):
    from PIL import Image, ImageDraw
    tam = max(12, int(alto_obj * 1.4))
    try:
        f = fuentes.cargar(spec, tam)
        w = int(f.getlength(texto)) + tam
        im = Image.new('L', (max(w, 10), tam * 2), 0)
        ImageDraw.Draw(im).text((tam // 2, tam // 3), texto, font=f, fill=255)
    except Exception:  # fuentes rotas o sin esos caracteres
        return None
    m = np.array(im) > 127
    return recortar_tinta(m)


def redimensionar(m, w, h):
    from PIL import Image
    im = Image.fromarray((m * 255).astype(np.uint8)).resize((w, h), Image.BILINEAR)
    return np.array(im).astype(np.float64) / 255


def puntuar(real, cand):
    h, w = real.shape
    if cand is None or cand.size == 0 or cand.shape[0] < 3:
        return -9.0
    pen = abs(math.log((cand.shape[1] / cand.shape[0]) / (w / h)))
    c = redimensionar(cand, w, h)
    return ssim(real.astype(np.float64), c) - 0.5 * pen


def texto_por_palabras(W, t, real, spec_ref):
    cerca = [w for w in W if abs((w['s'] + w['e']) / 2 - t) < 1.5]
    mejor, mp = None, 9
    ar = real.shape[1] / real.shape[0]
    for i in range(len(cerca)):
        for n in range(1, 5):
            if i + n > len(cerca):
                break
            tx = ' '.join(w['w'] for w in cerca[i:i + n])
            r = render(spec_ref, tx, real.shape[0])
            if r is None:
                continue
            d = abs(math.log((r.shape[1] / r.shape[0]) / ar))
            if d < mp:
                mejor, mp = tx, d
    return mejor


def main():
    ap = argparse.ArgumentParser(description='Aproxima la fuente de un rótulo comparándolo con fuentes instaladas (SSIM).')
    ap.add_argument('video')
    ap.add_argument('--tiempo', type=float, required=True, help='segundo con el texto bien visible')
    ap.add_argument('--texto', help='el texto exacto del rótulo (recomendado)')
    ap.add_argument('--palabras', help='palabras.json para adivinar el texto si no das --texto')
    ap.add_argument('--zona', help='x,y,ancho,alto del rótulo en píxeles del vídeo (si no, automática)')
    ap.add_argument('--color', choices=['auto', 'blanco', 'negro'], default='auto')
    ap.add_argument('--fuentes', action='append', help='carpeta extra con fuentes candidatas (puedes repetirlo)')
    ap.add_argument('--filtro', help='solo familias que contengan estas palabras, separadas por comas')
    ap.add_argument('--top', type=int, default=5)
    ap.add_argument('--carpeta', default='.')
    a = ap.parse_args()

    out = Path(a.carpeta)
    out.mkdir(parents=True, exist_ok=True)
    rgb = video.fotograma(a.video, a.tiempo)
    m = mascara(rgb, a.color)
    if a.zona:
        x, y, w, h = [int(v) for v in a.zona.split(',')]
    else:
        zs = zonas_auto(m)
        if not zs:
            sys.exit('No encuentro texto claro en ese fotograma: pásame --zona x,y,ancho,alto o prueba --color.')
        print('rótulos encontrados (usa --zona para elegir otro):')
        for z in zs[:6]:
            print(f'   --zona {z[0]},{z[1]},{z[2]},{z[3]}')
        x, y, w, h = zs[0][:4]
    real = recortar_tinta(m[y:y + h, x:x + w])
    if real is None or real.shape[0] < 8:
        sys.exit('El recorte no tiene tinta suficiente: ajusta --zona o --color.')
    print(f'rótulo en x={x} y={y} ({w}×{h} px) · tinta {real.shape[1]}×{real.shape[0]} px')

    texto = a.texto
    if not texto and a.palabras:
        texto = texto_por_palabras(P.cargar(a.palabras), a.tiempo, real, fuentes.por_defecto())
        print(f'texto adivinado por lo que se dice: «{texto}» (confírmalo mirando el fotograma)')
    if not texto:
        sys.exit('Necesito el texto del rótulo: --texto "…" (míralo en el fotograma) o --palabras palabras.json')

    cand = fuentes.instaladas(a.fuentes, a.filtro.split(',') if a.filtro else None)
    cand = [c for c in cand if not re.search(r'emoji|braille|symbol|webdings|wingding|lastresort|keyboard|dingbat', c[1].lower())]
    print(f'comparando con {len(cand)} fuentes…')
    res = []
    for spec, fam, est in cand:
        r = render(spec, texto, real.shape[0])
        res.append((puntuar(real, r), spec, fam, est, r))
    res.sort(key=lambda x: -x[0])
    top = res[:a.top]
    for k, (s, spec, fam, est, _) in enumerate(top, 1):
        print(f'  {k}. {fam} {est}  ·  {s:.3f}   ({spec})')

    # imagen de comparación
    from PIL import Image, ImageDraw
    hh = 90
    def fila(mm):  # noqa: E306
        im = Image.fromarray((mm * 255).astype(np.uint8))
        return im.resize((max(1, int(im.width * hh / im.height)), hh))
    filas = [('real', fila(real))] + [(f'{fam} {est} {s:.2f}', fila(r)) for s, _, fam, est, r in top[:3] if r is not None]
    Wc = max(f.width for _, f in filas) + 20
    hoja = Image.new('L', (Wc, len(filas) * (hh + 26)), 0)
    d = ImageDraw.Draw(hoja)
    for k, (et, f) in enumerate(filas):
        d.text((10, k * (hh + 26) + 4), et, fill=160)
        hoja.paste(f, (10, k * (hh + 26) + 22))
    hoja.save(out / 'tipografia_comparacion.png')
    json.dump(dict(tiempo=a.tiempo, zona=[x, y, w, h], texto=texto,
                   top=[dict(familia=fam, estilo=est, archivo=spec, puntuacion=round(s, 4)) for s, spec, fam, est, _ in top]),
              open(out / 'tipografia.json', 'w'), ensure_ascii=False, indent=1)
    print(f'→ {out}/tipografia.json · {out}/tipografia_comparacion.png (míralo: es una aproximación)')


if __name__ == '__main__':
    main()
