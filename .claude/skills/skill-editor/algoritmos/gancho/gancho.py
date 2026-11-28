#!/usr/bin/env python3
"""GANCHO · disecciona los primeros 3 segundos de un reel (donde se decide si la gente se queda).

Algoritmo:
  1. Palabras: las de palabras.json que empiezan antes de --segundos (3 s). Si no le das palabras.json,
     transcribe solo los primeros 5 s con faster-whisper small. Mide:
       - tiempo hasta la primera palabra (lo ideal: < 0,3 s; si tarda > 0,6 s, el gancho «arranca tarde»),
       - palabras por segundo dentro del gancho,
       - la primera frase completa (hasta la primera pausa > 0,35 s o punto) y cuándo termina.
  2. Cortes en los 3 s (mismo detector que ritmo/: fracción de píxeles que cambian, por franjas).
  3. Texto en pantalla (heurística, sin OCR): a 10 fps, mapa de bordes fuertes (salto de brillo > 25 % entre
     píxeles vecinos) por 24 franjas horizontales. Una franja con > 6 % de píxeles de borde «tiene texto o
     grafismo». Cambio de texto = la firma de franjas cambia o los bordes de esas franjas cambian > 35 %.
     Guarda hoja_gancho.jpg con el fotograma de cada segundo y de cada cambio: Claude la mira y LEE el texto.
  4. Tipo de gancho por palabras (heurística): pregunta, cifra, negación/polémica, historia en primera persona,
     orden directa («mira», «para»…). Puede ser varias a la vez.

Uso:
  python3 gancho.py reel.mp4 [--palabras palabras.json] [--segundos 3] [--carpeta salida/]
"""
import argparse
import json
import re
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import palabras as P, video  # noqa: E402

TIPOS = {
    'pregunta': r'^(qué|que|cómo|como|por qué|cuánto|cuánta|sabías|alguna vez|y si)\b|\?',
    'cifra': r'\d|\b(mil|millón|millones|cien|doble|triple)\b',
    'negacion_polemica': r'\b(no|nunca|deja de|para de|error|mentira|nadie|olvídate|prohibido)\b',
    'historia_yo': r'\b(acabo de|he |me |mi |yo )',
    'orden_directa': r'^(mira|para|escucha|atento|ojo|guarda|si eres|si tienes)\b',
}


def texto_en_pantalla(ruta, segundos, fps=10):
    arr, ts = video.fotogramas(ruta, fps=fps, ancho=270, desde=0, duracion=segundos)
    if len(arr) == 0:
        return [], []
    bandas = 24
    H = arr.shape[1]
    firmas, bordes = [], []
    for f in arr:
        g = np.zeros_like(f, dtype=bool)
        g[:, 1:] = np.abs(np.diff(f, axis=1)) > 0.25
        dens = np.array([g[int(b * H / bandas):int((b + 1) * H / bandas)].mean() for b in range(bandas)])
        firmas.append(dens > 0.06)
        bordes.append(g)
    eventos = []
    for k in range(len(arr)):
        bs = [b for b in range(bandas) if firmas[k][b]]
        if k == 0:
            cambio = bool(bs)
        else:
            m = np.zeros(H, bool)
            for b in set(bs) | set(b for b in range(bandas) if firmas[k - 1][b]):
                m[int(b * H / bandas):int((b + 1) * H / bandas)] = True
            e1, e0 = bordes[k][m], bordes[k - 1][m]
            dif = (e1 ^ e0).sum() / max(1, (e1 | e0).sum())
            cambio = (firmas[k] != firmas[k - 1]).sum() >= 2 or dif > 0.35
        if cambio:
            eventos.append(dict(t=round(ts[k], 2), franjas_y=[round((b + 0.5) / bandas, 2) for b in bs]))
    # funde eventos a menos de 0,3 s (animaciones de entrada)
    out = []
    for e in eventos:
        if out and e['t'] - out[-1]['t'] < 0.3:
            out[-1] = e
        else:
            out.append(e)
    return out, ts


def main():
    ap = argparse.ArgumentParser(description='Analiza los primeros segundos de un reel: palabras, cortes, texto en pantalla, tipo de gancho.')
    ap.add_argument('video')
    ap.add_argument('--palabras', help='palabras.json (si no, transcribe los primeros 5 s con small)')
    ap.add_argument('--segundos', type=float, default=3.0)
    ap.add_argument('--carpeta', default='.', help='dónde guardar gancho.json y hoja_gancho.jpg')
    a = ap.parse_args()
    S = a.segundos
    out_dir = Path(a.carpeta)
    out_dir.mkdir(parents=True, exist_ok=True)

    if a.palabras:
        W = P.cargar(a.palabras)
    else:
        from comun.transcribir import transcribir
        W, _, _ = transcribir(a.video, 'small', None, '', 0, S + 2)
    Wg = [w for w in W if w['s'] < S]
    F = P.frases(W)
    texto = ' '.join(w['w'] for w in Wg)
    primera = F[0] if F else None
    tipos = [k for k, rx in TIPOS.items() if re.search(rx, (primera['texto'] if primera else texto).lower())]
    cortes = video.cambios_de_plano(a.video, desde=0, duracion=S)
    texto_ev, _ = texto_en_pantalla(a.video, S)

    # hoja: un fotograma por segundo + uno por cada cambio de texto
    tiempos = sorted(set([0.05] + [float(t) for t in np.arange(1, S + 0.01, 1.0)] + [e['t'] + 0.15 for e in texto_ev]))[:12]
    video.hoja_tiempos(a.video, [min(t, S) for t in tiempos], out_dir / 'hoja_gancho.jpg', ancho=270, columnas=6)

    r = dict(segundos=S, palabras=Wg, texto=texto, n_palabras=len(Wg),
             primera_palabra=round(W[0]['s'], 2) if W else None,
             palabras_por_segundo=round(len(Wg) / S, 2),
             primera_frase=primera, tipo=tipos, cortes=cortes, n_cortes=len(cortes),
             texto_en_pantalla=texto_ev, hoja='hoja_gancho.jpg', tiempos_hoja=[round(t, 2) for t in tiempos])
    json.dump(r, open(out_dir / 'gancho.json', 'w'), ensure_ascii=False, indent=1)
    print(f'Primeros {S:g} s: «{texto}»')
    if W:
        aviso = '  ← arranca tarde' if W[0]['s'] > 0.6 else ''
        print(f'primera palabra en {W[0]["s"]:.2f} s{aviso} · {len(Wg)} palabras ({r["palabras_por_segundo"]}/s)')
    if primera:
        print(f'primera frase ({primera["ini"]:.2f}-{primera["fin"]:.2f} s): «{primera["texto"]}»')
    print(f'tipo de gancho (heurística): {", ".join(tipos) or "sin clasificar"}')
    print(f'cortes en el gancho: {len(cortes)} {[c["t"] for c in cortes]}')
    print(f'cambios de texto/grafismo en pantalla: {len(texto_ev)} {[e["t"] for e in texto_ev]}')
    print(f'→ {out_dir}/gancho.json · {out_dir}/hoja_gancho.jpg (míralo para leer el texto exacto)')


if __name__ == '__main__':
    main()
