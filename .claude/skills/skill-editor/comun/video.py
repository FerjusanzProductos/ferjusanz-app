"""Información y fotogramas de vídeo con ffprobe/ffmpeg."""
import json
import subprocess
from fractions import Fraction

import numpy as np


def info(ruta):
    """Devuelve dict con duracion, ancho, alto, fps (float), fps_frac (Fraction), sr (audio) y si tiene audio."""
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries',
                        'format=duration:stream=codec_type,width,height,r_frame_rate,sample_rate',
                        '-of', 'json', str(ruta)], capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f'ffprobe no puede abrir {ruta}')
    j = json.loads(r.stdout)
    d = {'duracion': float(j.get('format', {}).get('duration', 0) or 0), 'audio': False, 'video': False}
    for s in j.get('streams', []):
        if s.get('codec_type') == 'video' and not d['video']:
            d['video'] = True
            d['ancho'], d['alto'] = int(s['width']), int(s['height'])
            fr = Fraction(s.get('r_frame_rate', '30/1'))
            d['fps_frac'] = fr if fr > 0 else Fraction(30)
            d['fps'] = float(d['fps_frac'])
        if s.get('codec_type') == 'audio' and not d['audio']:
            d['audio'] = True
            d['sr'] = int(s.get('sample_rate', 48000))
    return d


def fotograma(ruta, t, ancho=None):
    """Un fotograma en el segundo t como array RGB uint8 (alto, ancho, 3)."""
    i = info(ruta)
    w, h = i['ancho'], i['alto']
    vf = []
    if ancho:
        h = int(round(h * ancho / w / 2) * 2)
        w = ancho
        vf = ['-vf', f'scale={w}:{h}']
    r = subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-ss', str(t), '-i', str(ruta), '-frames:v', '1'] + vf +
                       ['-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True)
    if len(r.stdout) < w * h * 3:
        raise RuntimeError(f'no hay fotograma en t={t}')
    return np.frombuffer(r.stdout[:w * h * 3], np.uint8).reshape(h, w, 3)


def fotogramas(ruta, fps=5, ancho=160, desde=None, duracion=None):
    """Fotogramas muestreados a `fps` y reducidos a `ancho` px, en gris (float32 0-1). Devuelve (array N×H×W, tiempos)."""
    i = info(ruta)
    h = int(round(i['alto'] * ancho / i['ancho'] / 2) * 2)
    cmd = ['ffmpeg', '-v', 'error', '-nostdin']
    if desde is not None:
        cmd += ['-ss', str(desde)]
    if duracion is not None:
        cmd += ['-t', str(duracion)]
    cmd += ['-i', str(ruta), '-vf', f'fps={fps},scale={ancho}:{h}', '-f', 'rawvideo', '-pix_fmt', 'gray', '-']
    r = subprocess.run(cmd, capture_output=True)
    n = len(r.stdout) // (ancho * h)
    arr = np.frombuffer(r.stdout[:n * ancho * h], np.uint8).reshape(n, h, ancho).astype(np.float32) / 255
    t0 = desde or 0.0
    return arr, [t0 + k / fps for k in range(n)]


def hoja(ruta, salida, n=12, ancho=360, columnas=4, desde=0.0, hasta=None):
    """Hoja de contacto JPG con n fotogramas repartidos y el tiempo de cada uno."""
    i = info(ruta)
    fin = hasta if hasta is not None else i['duracion']
    paso = max((fin - desde) / n, 0.05)
    filas = (n + columnas - 1) // columnas
    vf = f"fps=1/{paso:.4f},scale={ancho}:-2,tile={columnas}x{filas}:padding=4:color=black"
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-ss', str(desde + paso / 2), '-t', str(fin - desde), '-i', str(ruta),
                    '-vf', vf, '-frames:v', '1', '-q:v', '3', str(salida)], check=True)
    return [round(desde + paso / 2 + k * paso, 2) for k in range(n)]


def hoja_tiempos(ruta, tiempos, salida, ancho=270, columnas=6, marcas=None):
    """Hoja de contacto con los fotogramas de `tiempos` y el segundo escrito en cada uno (Pillow).
    `marcas`: función opcional (ImageDraw, ancho, alto) para pintar encima (p. ej. el HUD)."""
    from PIL import Image, ImageDraw
    ims = []
    for t in tiempos:
        try:
            ims.append((t, Image.fromarray(fotograma(ruta, t, ancho=ancho))))
        except RuntimeError:
            pass
    if not ims:
        return
    w, h = ims[0][1].size
    filas = (len(ims) + columnas - 1) // columnas
    hoja = Image.new('RGB', (min(len(ims), columnas) * (w + 4), filas * (h + 4)), 'black')
    for k, (t, im) in enumerate(ims):
        d = ImageDraw.Draw(im)
        if marcas:
            marcas(d, w, h)
        d.rectangle([0, 0, 64, 20], fill='black')
        d.text((4, 4), f'{t:.2f} s', fill='white')
        hoja.paste(im, ((k % columnas) * (w + 4), (k // columnas) * (h + 4)))
    hoja.save(salida, quality=85)


# seis franjas horizontales; cada una se nombra por dónde cae su centro
ZONAS = {f'{n}{k}': (i / 6, (i + 1) / 6) for i, (n, k) in enumerate([('arriba', 1), ('arriba', 2), ('medio', 1), ('medio', 2), ('abajo', 1), ('abajo', 2)])}


def cambios_de_plano(ruta, desde=None, duracion=None, umbral=0.08, factor=4.0, ancho=96):
    """Detecta cortes (cambios de plano) también en reels de pantalla dividida.

    Para cada fotograma (a fps completos, reducido a `ancho` px, en gris) mide qué fracción de píxeles cambia más
    de un 8 % de brillo respecto al anterior, en el cuadro entero y en seis franjas horizontales (agrupadas como arriba/medio/abajo). Hay corte
    en una franja cuando esa fracción supera a la vez `umbral` (0,08 = el 8 % de la franja) y `factor`× la mediana
    de los ±15 fotogramas vecinos (así el movimiento normal de manos o cámara no cuenta). Dos cortes a menos de
    3 fotogramas se funden. Heurística: un fundido lento o una animación de entrada pueden no contar como corte,
    y un movimiento brusco de cámara puede contar como uno.
    Devuelve [{t, zonas: [...], fuerza}] ordenado por tiempo.
    """
    i = info(ruta)
    arr, ts = fotogramas(ruta, fps=i['fps'], ancho=ancho, desde=desde, duracion=duracion)
    if len(arr) < 3:
        return []
    H = arr.shape[1]
    zonas = dict(todo=(0.0, 1.0), **ZONAS)
    res = {}
    for nombre, (y0, y1) in zonas.items():
        z = arr[:, int(y0 * H):int(y1 * H), :]
        d = np.concatenate([[0.0], (np.abs(np.diff(z, axis=0)) > 0.08).mean(axis=(1, 2))])
        p = np.pad(d, 15, mode='edge')
        med = np.median(np.lib.stride_tricks.sliding_window_view(p, 31), axis=1)
        pic = np.where((d > umbral) & (d > factor * med) & (np.arange(len(d)) > 0))[0]
        for k in pic:
            res.setdefault(int(k), []).append((nombre, float(d[k])))
    out = []
    for k in sorted(res):
        zs = res[k]
        if out and k - out[-1]['_k'] < 3:
            if max(s for _, s in zs) > out[-1]['fuerza']:
                out[-1].update(_k=k, t=round(ts[k], 3), zonas=[n for n, _ in zs], fuerza=round(max(s for _, s in zs), 3))
            continue
        out.append(dict(_k=k, t=round(ts[k], 3), zonas=[n for n, _ in zs], fuerza=round(max(s for _, s in zs), 3)))
    for o in out:
        o.pop('_k')
        zs = sorted(set(z.rstrip('12') for z in o['zonas'] if z != 'todo'))
        o['zonas'] = ['todo'] if ('todo' in o['zonas'] and len(zs) >= 3) or not zs else zs
    return out
