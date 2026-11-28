#!/usr/bin/env python3
"""CORTES · pitido: encuentra y quita pitidos/zumbidos tonales (ventilador, cargador, monitor, 50 Hz…) sin tocar la voz.

Por qué así: un reductor de ruido fuerte (afftdn alto) o una compresión agresiva dejan la voz «de submarino».
Un pitido es UNA frecuencia fija: basta con quitar esa franja estrecha y dejar el resto intacto.

Algoritmo:
  1. Audio mono a 48 kHz (sin filtros), en tramas de 4096 muestras (85 ms) con salto de 2048.
  2. Zona sin voz: las tramas más silenciosas (percentil 20 del nivel). Si le das --zona 3.2-4.5, usa esa.
  3. Espectro de potencia promediado en esas tramas (Welch con ventana de Hann) → dB por frecuencia.
  4. Para cada frecuencia, la mediana de sus vecinas (±150 Hz). Pico tonal = máximo local que sobresale
     > 10 dB de esa mediana, entre 40 Hz y 18 kHz. Se juntan los picos a menos de 40 Hz y se quedan los 8 más altos.
  5. Estabilidad: % de tramas silenciosas en las que ese pico también sobresale > 6 dB. Un pitido real sale
     en casi todas (> 60 %); un ruido suelto, no. Solo se filtran los estables.
  6. Filtro: un `equalizer` de ffmpeg por pico, muy estrecho (40 Hz de ancho) y profundo (−28 dB).
     Nada más: sin afftdn, sin compresor.
  7. --aplicar: escribe el archivo filtrado (vídeo sin recomprimir) y vuelve a medir cuánto ha bajado cada pico.

Uso:
  python3 pitido.py crudo.mov                         # solo diagnostica e imprime el filtro
  python3 pitido.py crudo.mov --aplicar limpio.mov    # lo quita
"""
import argparse
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import audio  # noqa: E402

SR = 48000
N = 4096
HOP = 2048


def tramas(a):
    k = (len(a) - N) // HOP
    idx = np.arange(N)[None, :] + HOP * np.arange(k)[:, None]
    return a[idx] * np.hanning(N)[None, :]


def mediana_vecinas(x, medio):
    p = np.pad(x, medio, mode='edge')
    v = np.lib.stride_tricks.sliding_window_view(p, 2 * medio + 1)
    return np.median(v, axis=1)


def detectar(a, zona=None, umbral=10.0, max_picos=8):
    if zona:
        a = a[int(zona[0] * SR):int(zona[1] * SR)]
    T = tramas(a)
    nivel = 10 * np.log10((T ** 2).mean(axis=1) + 1e-12)
    sil = T if zona else T[nivel <= np.percentile(nivel, 20)]
    S = np.abs(np.fft.rfft(sil, axis=1)) ** 2
    f = np.fft.rfftfreq(N, 1 / SR)
    medio = int(150 / (SR / N))
    esp = 10 * np.log10(S.mean(axis=0) + 1e-20)
    ref = mediana_vecinas(esp, medio)
    sobre = esp - ref
    cand = [i for i in range(2, len(f) - 2)
            if 40 <= f[i] <= 18000 and sobre[i] > umbral and esp[i] >= esp[i - 1] and esp[i] >= esp[i + 1]]
    cand.sort(key=lambda i: -sobre[i])
    picos = []
    for i in cand:
        if all(abs(f[i] - f[j]) > 40 for j in picos):
            picos.append(i)
        if len(picos) >= max_picos:
            break
    Sdb = 10 * np.log10(S + 1e-20)
    out = []
    for i in picos:
        # frecuencia afinada por interpolación parabólica del pico
        y0, y1, y2 = esp[i - 1], esp[i], esp[i + 1]
        dlt = 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2 + 1e-12)
        fr = (i + dlt) * SR / N
        estab = float((Sdb[:, i] - ref[i] > 6).mean())
        out.append(dict(hz=round(float(fr), 1), sobre_db=round(float(sobre[i]), 1), estable=round(estab, 2)))
    return sorted(out, key=lambda p: p['hz']), len(sil)


def relativo(a, hz, zona=None):
    """dB que sobresale la frecuencia hz sobre la mediana de sus vecinas (±150 Hz) en las tramas silenciosas."""
    if zona:
        a = a[int(zona[0] * SR):int(zona[1] * SR)]
    T = tramas(a)
    nivel = 10 * np.log10((T ** 2).mean(axis=1) + 1e-12)
    sil = T if zona else T[nivel <= np.percentile(nivel, 20)]
    esp = 10 * np.log10((np.abs(np.fft.rfft(sil, axis=1)) ** 2).mean(axis=0) + 1e-20)
    ref = mediana_vecinas(esp, int(150 / (SR / N)))
    i = int(round(hz * N / SR))
    return float(esp[i] - ref[i])


def filtro(picos, ancho=40, ganancia=-28):
    return ','.join(f'equalizer=f={p["hz"]}:t=h:w={ancho}:g={ganancia}' for p in picos)


def main():
    ap = argparse.ArgumentParser(description='Detecta pitidos tonales en la zona sin voz y los quita con ecualizadores estrechos.')
    ap.add_argument('entrada')
    ap.add_argument('--zona', help='zona sin voz «ini-fin» en segundos (por defecto, las tramas más silenciosas)')
    ap.add_argument('--umbral', type=float, default=10.0, help='dB sobre la mediana vecina para contar como pico (10)')
    ap.add_argument('--min-estable', type=float, default=0.6, help='fracción mínima de tramas donde aparece (0,6)')
    ap.add_argument('--ancho', type=float, default=40, help='ancho de cada ecualizador en Hz (40)')
    ap.add_argument('--ganancia', type=float, default=-28, help='dB de cada ecualizador (−28)')
    ap.add_argument('--aplicar', metavar='SALIDA')
    a = ap.parse_args()

    zona = [float(x) for x in a.zona.split('-')] if a.zona else None
    x = audio.leer(a.entrada, SR, None)
    picos, n = detectar(x, zona, a.umbral)
    print(f'{n} tramas sin voz analizadas')
    buenos = [p for p in picos if p['estable'] >= a.min_estable]
    for p in picos:
        marca = 'PITIDO' if p in buenos else 'suelto (no se toca)'
        print(f'  {p["hz"]:8.1f} Hz  +{p["sobre_db"]:4.1f} dB sobre sus vecinas · presente en {p["estable"] * 100:3.0f} % → {marca}')
    if not buenos:
        print('Sin pitidos tonales estables. No hace falta filtrar.')
        return 0
    fl = filtro(buenos, a.ancho, a.ganancia)
    print(f'Filtro: -af "{fl}"')
    if a.aplicar:
        ac = ['-c:a', 'pcm_s24le'] if a.aplicar.lower().endswith(('.mov', '.wav')) else ['-c:a', 'aac', '-b:a', '256k']
        vc = ['-c:v', 'copy'] if not a.aplicar.lower().endswith('.wav') else ['-vn']
        subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.entrada, '-af', fl] + vc + ac + [a.aplicar], check=True)
        y = audio.leer(a.aplicar, SR, None)
        for p in buenos:
            print(f'  {p["hz"]:8.1f} Hz: antes {p["sobre_db"]:+.1f} dB sobre sus vecinas → después {relativo(y, p["hz"], zona):+.1f} dB')
        print(f'→ {a.aplicar}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
