#!/usr/bin/env python3
"""CORTES · sincronía: pone el audio del micro externo (DJI, Rode, iPhone…) clavado a la imagen de la cámara.

Algoritmo (correlación cruzada en dos pasadas):
  1. Las dos pistas a 8 kHz mono con banda 150-3000 Hz (solo la voz; fuera retumbe y siseo, que confunden).
  2. Pasada gruesa: correlación cruzada por FFT de los primeros --analizar s (120) buscando hasta ±--max s (30).
     El pico da el desfase global d: «el micro hay que moverlo d segundos» (d > 0: al micro le sobran d s al
     principio; d < 0: le faltan, se rellenan con silencio).
  3. Pasada fina por ventanas: trozos de 3 s cada 2 s (solo los que tienen voz), buscando ±0,25 s alrededor de d.
     Se descartan las ventanas con correlación normalizada < 0,15 o con el pico pegado al borde de la búsqueda.
     Da el desfase de cada ventana en ms → mediana (el valor que se aplica), rango, cuántas ventanas se salen
     ±40 ms de la mediana y la DERIVA en ms por minuto (recta por mínimos cuadrados). Una deriva > 10 ms/min
     significa relojes distintos (44,1 vs 48 kHz mal etiquetado, o un micro que deriva): avisa.
  4. --aplicar: escribe el vídeo de la cámara con el audio del micro ya desplazado (vídeo sin recomprimir).

Por debajo de ±20 ms no se nota; a partir de ±45 ms se ve la boca descolocada.

Uso:
  python3 sincronia.py camara.mov micro.wav [--aplicar camara_con_micro.mov]
"""
import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import audio, video  # noqa: E402

SR = 8000
BANDA = 'highpass=f=150,lowpass=f=3000'


def desfase_global(cam, mic, maximo):
    n = 1
    while n < len(cam) + len(mic):
        n *= 2
    c = np.fft.irfft(np.fft.rfft(mic, n) * np.conj(np.fft.rfft(cam, n)), n)
    M = int(maximo * SR)
    cand = np.concatenate([c[:M + 1], c[-M:]])
    lags = np.concatenate([np.arange(0, M + 1), np.arange(-M, 0)])
    k = int(np.argmax(np.abs(cand)))
    return lags[k] / SR


def ventanas(cam, mic, d, W=3.0, paso=2.0, busca=0.25, min_ncc=0.15):
    """Desfase por ventanas. Solo cuenta las ventanas con voz clara: correlación normalizada >= min_ncc (0,15: dos micros distintos rara vez pasan de 0,5)
    y pico lejos del borde de búsqueda (si cae en el borde, la ventana no es fiable)."""
    Wn, M, D = int(W * SR), int(busca * SR), int(round(d * SR))
    rms_min = 0.2 * np.sqrt((cam ** 2).mean())
    res, descartes = [], 0
    for s in range(M, len(cam) - Wn - M, int(paso * SR)):
        x = cam[s:s + Wn]
        j0 = s + D - M
        if j0 < 0 or j0 + Wn + 2 * M > len(mic) or np.sqrt((x ** 2).mean()) < rms_min:
            continue
        y = mic[j0:j0 + Wn + 2 * M]
        c = np.correlate(y, x, 'valid')
        e = np.cumsum(np.concatenate([[0.0], y.astype(np.float64) ** 2]))
        ny = np.sqrt(e[Wn:] - e[:-Wn])[:len(c)]
        ncc = np.abs(c) / (np.linalg.norm(x) * ny + 1e-9)
        k = int(np.argmax(ncc))
        if ncc[k] < min_ncc or k < 5 or k > 2 * M - 5:
            descartes += 1
            continue
        res.append((s / SR, (D + k - M) / SR * 1000, float(ncc[k])))
    return res, descartes


def main():
    ap = argparse.ArgumentParser(description='Desfase micro externo ↔ cámara por correlación cruzada (y opcionalmente lo aplica).')
    ap.add_argument('camara', help='vídeo de la cámara (con su audio de referencia)')
    ap.add_argument('micro', help='audio (o vídeo) del micro bueno')
    ap.add_argument('--analizar', type=float, default=120.0, help='segundos para la pasada gruesa (120)')
    ap.add_argument('--max', type=float, default=30.0, help='desfase máximo a buscar en s (30)')
    ap.add_argument('--aplicar', metavar='SALIDA', help='escribe el vídeo de la cámara con el audio del micro alineado')
    a = ap.parse_args()

    cam = audio.leer(a.camara, SR, BANDA)
    mic = audio.leer(a.micro, SR, BANDA)
    n = int(a.analizar * SR)
    d = desfase_global(cam[:n], mic[:n + int(a.max * SR)], a.max)
    res, descartes = ventanas(cam, mic, d)
    if not res:
        sys.exit('No encuentro voz común en las dos pistas: ¿es la misma toma?')
    t = np.array([r[0] for r in res])
    ms = np.array([r[1] for r in res])
    med = float(np.median(ms))
    dentro = np.abs(ms - med) <= 40
    fuera = int((~dentro).sum())
    deriva = float(np.polyfit(t[dentro] / 60, ms[dentro], 1)[0]) if dentro.sum() > 3 else 0.0
    print(f'desfase global (grueso) {d * 1000:+.0f} ms')
    print(f'desfase fino: mediana {med:+.0f} ms · {len(res)} ventanas fiables ({descartes} descartadas por baja correlación) · '
          f'rango {ms.min():+.0f}..{ms.max():+.0f} ms · fuera de ±40 ms: {fuera} · deriva {deriva:+.1f} ms/min')
    d = med / 1000
    if d > 0:
        print(f'→ al micro le sobran {d:.3f} s al principio: se recortan')
    else:
        print(f'→ al micro le faltan {-d:.3f} s al principio: se rellenan con silencio')
    if abs(deriva) > 10:
        print('AVISO: deriva > 10 ms/min, los relojes no coinciden. Sincroniza por trozos o revisa la frecuencia de muestreo.')
    if a.aplicar:
        dur = video.info(a.camara)['duracion']
        af = (f'atrim=start={d:.4f},asetpts=PTS-STARTPTS' if d > 0 else f'adelay={-d * 1000:.1f}:all=1') + f',apad,atrim=0:{dur:.4f}'
        ac = ['-c:a', 'pcm_s24le'] if a.aplicar.lower().endswith('.mov') else ['-c:a', 'aac', '-b:a', '256k']
        subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.camara, '-i', a.micro, '-filter_complex', f'[1:a]{af}[a]',
                        '-map', '0:v', '-map', '[a]', '-c:v', 'copy'] + ac + [a.aplicar], check=True)
        print(f'Audio del micro alineado → {a.aplicar}')


if __name__ == '__main__':
    main()
