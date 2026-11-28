#!/usr/bin/env python3
"""Comprobación final antes de entregar un reel. No publica nada: solo mide y avisa.

Comprueba (y sale con código 1 si algo falla):
  1. Huecos de silencio > 0,25 s dentro del vídeo (fuera del respiro final). Silencio = nivel por debajo de
     ruido de fondo (percentil 5) + 10 dB durante más de 0,25 s seguidos (ventanas de 10 ms). Mídelo en la
     versión SIN música (--voz), porque la música tapa los huecos.
  2. Respiro final: entre 1,0 y 2,0 s desde la última voz hasta el final.
  3. Sonoridad: −14 LUFS ± 1 y pico ≤ −1 dBFS.
  4. Vídeo y audio de la misma duración (± 0,05 s): si no, algo se ha desincronizado.
  5. Formato: 1080×1920 (aviso si no).
  6. Hoja de fotogramas con el HUD de Instagram pintado en rojo (y < 250, y > 1500, x > 950): mírala y comprueba
     que ningún texto ni gráfico cae ahí y que nada tapa la cara.

Uso:
  python3 comun/revisar.py final.mp4 [--voz final_sin-musica.mp4] [--hoja revision.jpg] [--n 12]
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from comun import audio, video  # noqa: E402


def huecos(ruta, maximo=0.25, respiro=2.0):
    db = audio.db_ventanas(audio.leer(ruta, 16000, 'highpass=f=90'), 16000)
    th = audio.ruido_fondo(db, 5) + 10  # p5: en un montaje apretado casi no quedan pausas para medir el ruido
    voz = audio.mascara_voz(db, th)  # sin clics sueltos
    idx = np.where(voz)[0]
    if not len(idx):
        return [], 0.0, 0.0
    ini_voz, fin_voz = idx[0] * 0.01, (idx[-1] + 1) * 0.01
    out = []
    for a, b in audio.tramos_de_voz(~voz):
        if a <= ini_voz or a >= fin_voz:
            continue
        if b - a > maximo:
            out.append((round(a, 2), round(b, 2), round(b - a, 2)))
    return out, ini_voz, fin_voz


def duraciones(ruta):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'stream=codec_type,duration', '-of', 'json', str(ruta)],
                       capture_output=True, text=True)
    d = {}
    for s in json.loads(r.stdout).get('streams', []):
        if s.get('duration'):
            d.setdefault(s['codec_type'], float(s['duration']))
    return d


def main():
    ap = argparse.ArgumentParser(description='Comprobación final: huecos, respiro, −14 LUFS, sincronía de pistas y HUD.')
    ap.add_argument('video')
    ap.add_argument('--hoja', default=None, help='JPG con fotogramas y el HUD en rojo (por defecto <video>_revision.jpg)')
    ap.add_argument('--n', type=int, default=12)
    ap.add_argument('--voz', help='versión sin música para medir huecos y respiro (por defecto, el mismo vídeo)')
    a = ap.parse_args()
    fallos = []
    inf = video.info(a.video)
    D = inf['duracion']

    hs, ini_voz, fin_voz = huecos(a.voz or a.video)
    print(f'1. huecos > 0,25 s: ' + ('ninguno' if not hs else ', '.join(f'{x}-{y} ({d} s)' for x, y, d in hs)))
    if hs:
        fallos.append('huecos')
    resp = D - fin_voz
    ok = 1.0 <= resp <= 2.0
    print(f'2. respiro final: {resp:.2f} s ' + ('OK' if ok else '→ debe estar entre 1,0 y 2,0 s (cta/cta.py --arreglar)'))
    if not ok:
        fallos.append('respiro')
    I, pk = audio.loudness(a.video), audio.pico_db(a.video)
    ok = I is not None and abs(I + 14) <= 1 and (pk is None or pk <= -1.0)
    print(f'3. sonoridad {I:.1f} LUFS · pico {pk:.1f} dBFS ' + ('OK' if ok else '→ objetivo −14 LUFS y pico ≤ −1 dBFS (musica/mezclar.py)'))
    if not ok:
        fallos.append('sonoridad')
    d = duraciones(a.video)
    if 'video' in d and 'audio' in d:
        ok = abs(d['video'] - d['audio']) <= 0.05
        print(f'4. vídeo {d["video"]:.2f} s · audio {d["audio"]:.2f} s ' + ('OK' if ok else '→ pistas de distinta duración'))
        if not ok:
            fallos.append('pistas')
    print(f'5. formato {inf["ancho"]}×{inf["alto"]} @ {inf["fps"]:.2f} fps ' + ('OK' if (inf['ancho'], inf['alto']) == (1080, 1920) else '(aviso: Instagram pide 1080×1920)'))

    hoja = a.hoja or str(Path(a.video).with_suffix('')) + '_revision.jpg'
    def hud(dr, w, h):  # zonas del HUD de Instagram sobre 1080×1920, escaladas a la miniatura
        sx, sy, rojo = w / 1080, h / 1920, (255, 40, 40)
        dr.rectangle([0, 0, w - 1, int(250 * sy)], outline=rojo, width=2)
        dr.rectangle([0, int(1500 * sy), w - 1, h - 1], outline=rojo, width=2)
        dr.rectangle([int(950 * sx), 0, w - 1, h - 1], outline=rojo, width=2)
    ts = [round(D * (i + 0.5) / a.n, 2) for i in range(a.n)]
    video.hoja_tiempos(a.video, ts, hoja, ancho=270, columnas=6, marcas=hud)
    print(f'6. hoja con el HUD en rojo → {hoja} (mírala: nada de texto en las zonas rojas y la cara siempre libre)')
    print('RESULTADO: ' + ('todo OK' if not fallos else 'revisar ' + ', '.join(fallos)))
    return 1 if fallos else 0


if __name__ == '__main__':
    sys.exit(main())
