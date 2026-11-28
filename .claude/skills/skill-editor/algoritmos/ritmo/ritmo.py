#!/usr/bin/env python3
"""RITMO · mide cada cuánto cambia la imagen y a qué velocidad se habla, para copiar el ritmo de la referencia.

Algoritmo:
  1. Cambios de plano (comun/video.cambios_de_plano): a fps completos, fracción de píxeles que cambian > 8 % de
     brillo respecto al fotograma anterior, en el cuadro entero y en seis franjas (agrupadas en arriba/medio/abajo). Corte =
     pico > 8 % de la franja y > 4× la mediana de sus ±15 fotogramas vecinos. Las franjas sirven para los reels de
     pantalla dividida, donde solo cambia el panel de arriba y la persona sigue igual.
     (Equivalente a scdet/select=scene de ffmpeg, pero por franjas: con el cuadro entero, en pantalla dividida casi
     no detecta nada.)
  2. Con los cortes: número, cortes por segundo, duración media y mediana de plano, el plano más largo y una
     curva por ventanas de 5 s (dónde acelera y dónde respira).
  3. Si le das palabras.json: palabras por segundo y pausas > 0,25 s que siguen en el vídeo (en un reel bien
     apretado no debería quedar ninguna fuera del final).

Uso:
  python3 ritmo.py video.mp4 [--palabras palabras.json] [--salida ritmo.json] [--umbral 0.08]

Nota honesta: es un detector por diferencia de imagen. Un fundido lento o una animación que entra poco a poco
puede no contar como corte; un latigazo de cámara puede contar como uno. Mira la lista con la hoja de fotogramas.
"""
import argparse
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import palabras as P, video  # noqa: E402


def medir(ruta, palabras=None, umbral=0.08):
    inf = video.info(ruta)
    D = inf['duracion']
    C = video.cambios_de_plano(ruta, umbral=umbral)
    bordes = [0.0] + [c['t'] for c in C] + [D]
    planos = np.diff(bordes)
    curva = []
    for t0 in np.arange(0, D, 5.0):
        n = sum(1 for c in C if t0 <= c['t'] < t0 + 5)
        curva.append(dict(desde=round(float(t0), 1), cortes=n))
    r = dict(duracion=round(D, 2), cortes=len(C), cortes_por_segundo=round(len(C) / D, 3),
             segundos_por_corte=round(D / max(len(C), 1), 2), plano_medio=round(float(planos.mean()), 2),
             plano_mediano=round(float(np.median(planos)), 2), plano_mas_largo=round(float(planos.max()), 2),
             zonas={z: sum(1 for c in C if z in c['zonas']) for z in ('todo', 'arriba', 'medio', 'abajo')},
             lista_cortes=C, curva_5s=curva)
    if palabras:
        W = P.cargar(palabras)
        if W:
            habla = W[-1]['e'] - W[0]['s']
            pausas = [dict(ini=W[i]['e'], fin=W[i + 1]['s'], dur=round(W[i + 1]['s'] - W[i]['e'], 2))
                      for i in range(len(W) - 1) if W[i + 1]['s'] - W[i]['e'] > 0.25]
            r.update(palabras=len(W), palabras_por_segundo=round(len(W) / max(habla, 0.1), 2),
                     primera_palabra=W[0]['s'], pausas_mayores_025=pausas)
    return r


def main():
    ap = argparse.ArgumentParser(description='Cortes por segundo, duración de plano y velocidad de habla.')
    ap.add_argument('video')
    ap.add_argument('--palabras', help='palabras.json del mismo vídeo')
    ap.add_argument('--umbral', type=float, default=0.08, help='fracción de píxeles que cambian para contar corte (0,08)')
    ap.add_argument('--salida', default='ritmo.json')
    a = ap.parse_args()
    r = medir(a.video, a.palabras, a.umbral)
    json.dump(r, open(a.salida, 'w'), ensure_ascii=False, indent=1)
    print(f"{r['duracion']} s · {r['cortes']} cortes · 1 corte cada {r['segundos_por_corte']} s · "
          f"plano medio {r['plano_medio']} s (mediana {r['plano_mediano']}, el más largo {r['plano_mas_largo']} s)")
    print('por zonas:', ', '.join(f'{k} {v}' for k, v in r['zonas'].items()))
    print('cortes cada 5 s:', ' '.join(str(c['cortes']) for c in r['curva_5s']))
    if 'palabras_por_segundo' in r:
        print(f"habla: {r['palabras_por_segundo']} palabras/s · primera palabra en {r['primera_palabra']} s · "
              f"pausas > 0,25 s (según Whisper): {len(r['pausas_mayores_025'])}")
    print(f'→ {a.salida}')


if __name__ == '__main__':
    main()
