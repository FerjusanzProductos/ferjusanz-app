#!/usr/bin/env python3
"""CORTES · apretar: quita los silencios SIN comerse ninguna palabra (ni el principio ni la cola).

Por qué por energía y no por la transcripción: los tiempos de Whisper fallan justo en las pausas (alargan o
recortan la palabra 50-150 ms). La cola de una «s» o de una vocal que se apaga cae entre −40 y −55 dB y un
silencedetect a −35 dB la toma por silencio y la corta. Aquí se mide el audio de verdad.

Algoritmo (números probados en reels reales):
  1. Audio mono 16 kHz con paso alto a 90 Hz (fuera el retumbe) → nivel RMS por ventanas de 10 ms.
  2. Ruido de fondo = percentil 10 del nivel dentro de las tomas. Umbral de voz = ruido + MARGEN (10 dB).
  3. Ventanas por encima del umbral = voz, quitando antes los chasquidos sueltos de < 50 ms (clics, roces del
     cable) para que no «puenteen» un silencio. Se unen los trozos separados por menos de HUECO s (una respiración
     corta dentro de la frase se queda) y se tiran los de menos de 80 ms.
  4. Cada trozo se abre PRE s antes y se cierra COLA s después:
        modo normal   PRE 0,06 · COLA 0,15 · HUECO 0,22
        modo ajustado PRE 0,04 · COLA 0,12 · HUECO 0,15   (más ritmo, para reels rápidos)
     Nunca se sale de la toma. Así cada corte deja como mucho PRE+COLA ≈ 0,16-0,21 s de silencio: por debajo de
     la regla de 0,25 s.
  5. El último trozo conserva RESPIRO s (1 s) para que el CTA no se corte en seco.
  6. COMPROBACIÓN automática: los 30 ms antes de cada final de corte (y los 30 ms después de cada inicio) deben
     estar por debajo de −40 dB (o de ruido+6 dB si la grabación es más ruidosa). Si no, el corte se alarga en
     pasos de 10 ms hasta 0,30 s. Si aun así suena voz, lo avisa con su tiempo para mirarlo a mano.

Entrada: el vídeo/audio y, opcionalmente, tramos.json = [[ini, fin], …] con las tomas buenas (por ejemplo, la
salida de trabas.py). Sin tramos, usa el archivo entero.
Salida: tramos2.json = [[ini, fin], …] listo para cortar.py.

Uso:
  python3 apretar.py crudo.mov [--tramos tramos.json] [--modo normal|ajustado] [--salida tramos2.json]
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import audio, video  # noqa: E402

MODOS = {'normal': dict(pre=0.06, cola=0.15, hueco=0.22), 'ajustado': dict(pre=0.04, cola=0.12, hueco=0.15)}


def apretar(db, tramos, pre, cola, hueco, margen=10.0, respiro=1.0, minimo=0.08, corte_db=-40.0):
    V = audio.VENTANA
    idx = lambda t: int(round(t / V))  # noqa: E731
    zona = np.concatenate([db[idx(x):idx(y)] for x, y in tramos])
    ruido = audio.ruido_fondo(zona)
    th = ruido + margen
    voz = audio.mascara_voz(db, th)  # fuera clics y roces de < 50 ms antes de unir trozos
    NT = []
    for n, (x, y) in enumerate(tramos):
        segs = audio.tramos_de_voz(voz[idx(x):idx(y)], V, desde=idx(x) * V)
        m = []
        for s in segs:
            if m and s[0] - m[-1][1] < hueco:
                m[-1][1] = s[1]
            else:
                m.append(list(s))
        m = [s for s in m if s[1] - s[0] > minimo]
        for k, s in enumerate(m):
            a0, b0 = max(x, s[0] - pre), min(y, s[1] + cola)
            if n == len(tramos) - 1 and k == len(m) - 1:
                b0 = min(y, s[1] + respiro)
            NT.append([a0, b0, x, y])
    # comprobación de bordes: los 30 ms junto a cada corte, en silencio
    lim = max(corte_db, ruido + 6)
    nivel = lambda t0, t1: float(db[max(0, idx(t0)):max(idx(t0) + 1, idx(t1))].max())  # noqa: E731
    avisos = []
    for k, (a0, b0, x, y) in enumerate(NT):
        if k < len(NT) - 1:
            ext = 0.0
            while nivel(b0 - 0.03, b0) > lim and ext < 0.30 and b0 + 0.01 <= y:
                b0 += 0.01
                ext += 0.01
            if nivel(b0 - 0.03, b0) > lim:
                avisos.append(('final', round(b0, 2), round(nivel(b0 - 0.03, b0), 1)))
        if k > 0:
            ext = 0.0
            while nivel(a0, a0 + 0.03) > lim and ext < 0.30 and a0 - 0.01 >= x:
                a0 -= 0.01
                ext += 0.01
            if nivel(a0, a0 + 0.03) > lim:
                avisos.append(('inicio', round(a0, 2), round(nivel(a0, a0 + 0.03), 1)))
        NT[k][0], NT[k][1] = a0, b0
    # unir solapes que hayan salido al alargar
    out = []
    for a0, b0, _, _ in NT:
        if out and a0 <= out[-1][1] + 1e-6:
            out[-1][1] = max(out[-1][1], b0)
        else:
            out.append([a0, b0])
    return [[round(a, 3), round(b, 3)] for a, b in out], ruido, th, lim, avisos


def main():
    ap = argparse.ArgumentParser(description='Quita silencios por energía sin comer palabras → tramos2.json')
    ap.add_argument('entrada', help='vídeo o audio con la voz (mejor el del micro bueno)')
    ap.add_argument('--tramos', help='tramos.json con las tomas buenas [[ini, fin], …] (por defecto, todo)')
    ap.add_argument('--modo', choices=list(MODOS), default='normal')
    ap.add_argument('--margen', type=float, default=10.0, help='dB sobre el ruido de fondo para considerar voz (10)')
    ap.add_argument('--respiro', type=float, default=1.0, help='segundos que se dejan tras la última palabra (1,0)')
    ap.add_argument('--salida', default='tramos2.json')
    a = ap.parse_args()

    dur = video.info(a.entrada)['duracion']
    tramos = json.load(open(a.tramos)) if a.tramos else [[0.0, dur]]
    tramos = [[max(0.0, x), min(dur, y)] for x, y in tramos]
    db = audio.db_ventanas(audio.leer(a.entrada, 16000, 'highpass=f=90'), 16000)
    p = MODOS[a.modo]
    NT, ruido, th, lim, avisos = apretar(db, tramos, p['pre'], p['cola'], p['hueco'], a.margen, a.respiro)
    json.dump(NT, open(a.salida, 'w'))
    antes = sum(y - x for x, y in tramos)
    despues = sum(y - x for x, y in NT)
    print(f'ruido de fondo {ruido:.1f} dB → umbral de voz {th:.1f} dB · bordes en silencio si < {lim:.1f} dB')
    print(f'{len(tramos)} toma(s) → {len(NT)} tramos · {antes:.2f} s → {despues:.2f} s (fuera {antes - despues:.2f} s) → {a.salida}')
    if avisos:
        for tipo, t, nv in avisos:
            print(f'  AVISO: corte de {tipo} en {t:.2f} s con voz sonando ({nv} dB): míralo a mano')
        return 1
    print('Comprobación: ningún corte con voz sonando en los 30 ms del borde.')
    ultima = float(np.where(audio.mascara_voz(db[:int(NT[-1][1] / audio.VENTANA)], th))[0][-1] + 1) * audio.VENTANA
    if NT[-1][1] - ultima < a.respiro - 0.05:
        print(f'AVISO: tras la última palabra solo quedan {NT[-1][1] - ultima:.2f} s en el crudo (se piden {a.respiro} s). '
              f'Añádelo al final con cta/cta.py --arreglar.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
