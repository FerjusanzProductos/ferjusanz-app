#!/usr/bin/env python3
"""TRABAS · encuentra repeticiones, palabras cortadas, muletillas y tomas repetidas con DOBLE transcripción.

El problema: Whisper «limpia» lo que oye. Si dices «y, y unos, unos pocos», escribe «y unos pocos» y la traba
desaparece del texto (pero sigue en el audio). Solución: transcribir dos veces y comparar.

Algoritmo:
  1. El audio se trocea en bloques de ~6 s cortando en el punto más silencioso entre 4,5 y 6,5 s (así ninguna
     palabra queda partida y Whisper no arrastra contexto que le haga «corregir»).
  2. Pasada LITERAL: cada bloque con un initial_prompt lleno de titubeos («Eh, bueno… y, y unos, unos pocos…
     que, que, mmm…»). Le enseña a Whisper que aquí se escriben las trabas tal cual.
     Pasada LIMPIA: el mismo bloque sin prompt. Las dos con condition_on_previous_text=False y sin VAD.
  3. Sobre la literal se marcan:
       - repetición:  la misma palabra dos veces seguidas («que que») → fuera la primera.
       - repetición:  también de dos palabras («de tu… de tu competencia»).
       - cortada:     palabra corta (≤ 0,2 s o con guion) seguida de otra que empieza igual («pro- programa»),
                      o palabra abandonada con guion («el mon- … es un truco»).
       - muletilla:   eh, em, mmm, ehm, ah sueltas.
       - reinicio:    un arranque de ≥ 3 palabras que se repite en los 12 s siguientes («te voy a… te voy a
                      enseñar») → fuera el primer intento entero (la toma buena es la última).
  4. Comparación literal↔limpia (difflib): palabras que solo aparecen en la literal = «solo_literal»: casi siempre
     titubeos. Se listan para revisar, y solo se quitan solas si además son muletilla o repetición.
  5. Antialucinaciones: los bloques sin voz no se transcriben (con el prompt de titubeos Whisper se inventa
     «no, no, no…» en el silencio), se tiran las palabras sin voz debajo y las rachas de ≥ 5 palabras iguales.
     Cada borde de corte se mueve al punto más silencioso a ±120 ms (el tiempo de Whisper no es exacto).
  6. Salida trabas.json con la lista y `tramos` = islas de habla (palabras válidas separadas < 2 s, ±0,3 s) menos
     lo que se quita; también en trabas_tramos.json, listo para cortes/apretar.py --tramos.

Uso:
  python3 trabas.py crudo.mov [--modelo medium|large-v3|small] [--salida trabas.json] [--idioma es]
  python3 trabas.py crudo.mov --reusar trabas.json      # vuelve a analizar sin transcribir otra vez

Notas honestas:
- Es una ayuda muy buena, no un oráculo: Whisper a veces se inventa o se come una repetición. Por eso cada
  traba lleva su tiempo y su texto, para escucharla en 2 s antes de aceptar el corte.
- large-v3 encuentra más trabas que medium; small se pierde bastantes. En CPU, large-v3 ≈ 2× tiempo real
  por las dos pasadas.
"""
import argparse
import difflib
import re
import json
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import audio  # noqa: E402
from comun.palabras import norm  # noqa: E402

SR = 16000
PROMPT = 'Eh, bueno… y, y unos, unos pocos… que, que, mmm, o sea, eh. Pro- programa, te voy a… te voy a enseñar.'
MULETILLAS = {'eh', 'ehh', 'ehm', 'em', 'emm', 'mm', 'mmm', 'ah', 'aah', 'hm', 'hmm', 'uh', 'um'}


def bloques(a):
    e = audio.db_ventanas(a, SR, 0.02)
    dur = len(a) / SR
    cortes, t = [0.0], 0.0
    while t < dur - 7:
        lo, hi = int((t + 4.5) / 0.02), int((t + 6.5) / 0.02)
        k = lo + int(np.argmin(e[lo:hi]))
        t = k * 0.02
        cortes.append(t)
    cortes.append(dur)
    return list(zip(cortes, cortes[1:]))


def con_voz(db, th, s, f, minimo=0.05):
    v = db[int(s / 0.01):max(int(s / 0.01) + 1, int(f / 0.01))]
    return (v > th).mean() >= minimo if len(v) else False


def pasada(modelo, a, tramos, prompt, idioma, db, th):
    W = []
    for s, f in tramos:
        if not con_voz(db, th, s, f):
            continue  # bloque sin voz: con el prompt de titubeos Whisper alucina «no, no, no…» en el silencio
        seg = a[int(s * SR):int(f * SR)]
        out, _ = modelo.transcribe(seg, language=idioma, initial_prompt=prompt, condition_on_previous_text=False,
                                   word_timestamps=True, vad_filter=False, beam_size=5)
        for x in out:
            for w in (x.words or []):
                if w.word.strip():
                    W.append(dict(w=w.word.strip(), s=round(s + w.start, 3), e=round(s + w.end, 3)))
    return W


def limpiar(W, db, th):
    """Quita alucinaciones: palabras sin voz debajo y rachas de ≥ 5 palabras iguales seguidas."""
    W = [w for w in W if db[int(w['s'] / 0.01):max(int(w['s'] / 0.01) + 1, int(w['e'] / 0.01))].max(initial=-120) > th - 2]
    n = [norm(w['w']) for w in W]
    fuera, i = set(), 0
    while i < len(W):
        j = i
        while j + 1 < len(W) and n[j + 1] == n[i] and n[i]:
            j += 1
        if j - i + 1 >= 5:
            fuera.update(range(i, j + 1))
        i = j + 1
    return [w for k, w in enumerate(W) if k not in fuera], len(fuera)


def ajustar(t, db, radio=0.12):
    i0, i1 = max(0, int((t - radio) / 0.01)), min(len(db), int((t + radio) / 0.01) + 1)
    return round((i0 + int(np.argmin(db[i0:i1]))) * 0.01, 3) if i1 > i0 else t


def analizar(L, Lp):
    trabas = []
    n = [norm(w['w']) for w in L]
    for i, w in enumerate(L):
        if not n[i] and not re.search(r'[-—–]$', w['w']):
            continue
        if n[i] and n[i] in MULETILLAS:
            trabas.append(dict(tipo='muletilla', ini=w['s'], fin=L[i + 1]['s'] if i + 1 < len(L) else w['e'], texto=w['w'], quitar=True))
        elif re.search(r'[-—–]$', w['w']) and i + 1 < len(L):
            # palabra abandonada («el mon- … es un truco»): fuera el fragmento (y su artículo/preposición corta)
            k = i if n[i] else i - 1
            if k > 0 and len(n[k - 1]) <= 3 and L[k]['s'] - L[k - 1]['e'] < 0.3:
                k -= 1
            trabas.append(dict(tipo='cortada', ini=L[k]['s'], fin=L[i + 1]['s'], texto=' '.join(x['w'] for x in L[k:i + 2]), quitar=True))
        elif i + 1 < len(L) and n[i] == n[i + 1]:
            trabas.append(dict(tipo='repeticion', ini=w['s'], fin=L[i + 1]['s'], texto=f"{w['w']} {L[i + 1]['w']}", quitar=True))
        elif i + 3 < len(L) and n[i:i + 2] == n[i + 2:i + 4] and all(n[i:i + 2]):
            trabas.append(dict(tipo='repeticion', ini=w['s'], fin=L[i + 2]['s'],
                               texto=' '.join(x['w'] for x in L[i:i + 4]), quitar=True))
        elif (i + 1 < len(L) and n[i + 1].startswith(n[i]) and n[i] != n[i + 1] and len(n[i]) <= len(n[i + 1]) - 2
              and (w['e'] - w['s'] <= 0.2 or w['w'].endswith('-'))):
            trabas.append(dict(tipo='cortada', ini=w['s'], fin=L[i + 1]['s'], texto=f"{w['w']} {L[i + 1]['w']}", quitar=True))
    # reinicios: 3 palabras que se repiten en los 12 s siguientes
    i = 0
    while i < len(L) - 3:
        g = n[i:i + 3]
        hecho = False
        for j in range(i + 3, len(L) - 2):
            if L[j]['s'] - L[i]['s'] > 12:
                break
            if n[j:j + 3] == g and all(g):
                trabas.append(dict(tipo='reinicio', ini=L[i]['s'], fin=L[j]['s'],
                                   texto=' '.join(x['w'] for x in L[i:j]) + ' ‖ ' + ' '.join(x['w'] for x in L[j:j + 3]) + '…', quitar=True))
                i = j
                hecho = True
                break
        if not hecho:
            i += 1
    # solo en la literal
    sm = difflib.SequenceMatcher(a=n, b=[norm(w['w']) for w in Lp], autojunk=False)
    for op, a0, a1, _, _ in sm.get_opcodes():
        if op in ('delete', 'replace') and a1 > a0:
            trabas.append(dict(tipo='solo_literal', ini=L[a0]['s'], fin=L[a1 - 1]['e'],
                               texto=' '.join(x['w'] for x in L[a0:a1]), quitar=False))
    return sorted(trabas, key=lambda x: x['ini'])


def unir(iv):
    out = []
    for a, b in sorted(iv):
        if out and a <= out[-1][1] + 0.02:
            out[-1][1] = max(out[-1][1], b)
        else:
            out.append([a, b])
    return out


def main():
    ap = argparse.ArgumentParser(description='Detecta trabas con doble transcripción y propone tramos limpios.')
    ap.add_argument('entrada')
    ap.add_argument('--modelo', default='medium', help='small, medium (defecto), large-v3 (el que más encuentra)')
    ap.add_argument('--idioma', default='es')
    ap.add_argument('--salida', default='trabas.json')
    ap.add_argument('--hilos', type=int, default=2)
    ap.add_argument('--reusar', metavar='TRABAS_JSON', help='reutiliza las dos transcripciones de un trabas.json anterior (sin Whisper)')
    a = ap.parse_args()

    x = audio.leer(a.entrada, SR, None)
    db = audio.db_ventanas(audio.leer(a.entrada, SR, 'highpass=f=90'), SR)
    th = audio.ruido_fondo(db) + 10
    if a.reusar:
        prev = json.load(open(a.reusar))
        L, Lp = prev['literal'], prev['limpia']
        print(f'reutilizo las transcripciones de {a.reusar}')
    else:
        from faster_whisper import WhisperModel
        B = bloques(x)
        m = WhisperModel(a.modelo, device='cpu', compute_type='int8', cpu_threads=a.hilos)
        print(f'{len(B)} bloques ({sum(1 for s, f in B if con_voz(db, th, s, f))} con voz) · pasada literal…')
        L0 = pasada(m, x, B, PROMPT, a.idioma, db, th)
        L, _ = limpiar(L0, db, th)
        print('pasada limpia…')
        Lp0 = pasada(m, x, B, None, a.idioma, db, th)
        Lp, _ = limpiar(Lp0, db, th)
        al = len(L0) - len(L) + len(Lp0) - len(Lp)
        if al:
            print(f'{al} palabras alucinadas descartadas (sin voz debajo o rachas de palabras iguales)')
    T = analizar(L, Lp)
    vistos, T2 = set(), []
    for t in T:
        if t['quitar']:
            t['ini'], t['fin'] = ajustar(t['ini'], db), ajustar(t['fin'], db)
            if t['fin'] - t['ini'] < 0.05 or (t['ini'], t['fin']) in vistos:
                continue
            vistos.add((t['ini'], t['fin']))
        T2.append(t)
    T = T2
    quitar = unir([[t['ini'], t['fin']] for t in T if t['quitar'] and t['fin'] > t['ini']])
    dur = len(x) / SR
    # islas de habla: palabras válidas separadas < 2 s. Lo que queda fuera (silencio, ruido, voces de fondo
    # donde Whisper solo alucinaba) no entra en los tramos.
    islas = []
    for w in L:
        if islas and w['s'] - islas[-1][1] < 2.0:
            islas[-1][1] = w['e']
        else:
            islas.append([w['s'], w['e']])
    islas = [[max(0.0, a0 - 0.3), min(dur, b0 + 0.3)] for a0, b0 in islas]
    if islas:
        islas[-1][1] = min(dur, islas[-1][1] + 0.9)  # deja sitio para el respiro final
    tramos = []
    for a0, b0 in islas:
        c = a0
        for q0, q1 in quitar:
            if q1 <= c or q0 >= b0:
                continue
            if q0 > c:
                tramos.append([round(c, 3), round(q0, 3)])
            c = max(c, q1)
        if b0 > c:
            tramos.append([round(c, 3), round(b0, 3)])
    out = dict(modelo=a.modelo, literal=L, limpia=Lp, trabas=T, quitar=quitar, tramos=tramos)
    json.dump(out, open(a.salida, 'w'), ensure_ascii=False, indent=1)
    json.dump(tramos, open(str(Path(a.salida).with_suffix('')) + '_tramos.json', 'w'))
    for t in T:
        print(f"  {t['ini']:6.2f}-{t['fin']:6.2f}  {t['tipo']:12s} {'QUITAR ' if t['quitar'] else 'revisar'}  {t['texto']}")
    print(f'{sum(1 for t in T if t["quitar"])} trabas a quitar ({sum(b - a for a, b in quitar):.2f} s) · '
          f'{sum(1 for t in T if not t["quitar"])} para revisar · {len(tramos)} tramos → {a.salida}')


if __name__ == '__main__':
    main()
