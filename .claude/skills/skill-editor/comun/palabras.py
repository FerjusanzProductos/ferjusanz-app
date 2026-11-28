"""Trabajar con palabras.json ([{w, s, e}]): cargar, normalizar, partir en frases y llevarlas a la línea de tiempo montada."""
import json
import re
import unicodedata


def cargar(ruta):
    with open(ruta) as f:
        return json.load(f)


def guardar(W, ruta):
    with open(ruta, 'w') as f:
        json.dump(W, f, ensure_ascii=False)


def norm(w):
    """minúsculas, sin tildes ni signos: «¿Comenta,» → «comenta»."""
    w = unicodedata.normalize('NFD', w.lower())
    w = ''.join(c for c in w if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9ñ]+', '', w)


def frases(W, pausa=0.35, max_palabras=25):
    """Parte en frases por pausas > `pausa` s o por puntuación final (. ? !). Devuelve [{ini, fin, texto, i0, i1}]."""
    F, cur = [], []
    for i, w in enumerate(W):
        if cur and (w['s'] - W[i - 1]['e'] > pausa or len(cur) >= max_palabras):
            F.append(cur)
            cur = []
        cur.append(i)
        if re.search(r'[.?!…]$', w['w']):
            F.append(cur)
            cur = []
    if cur:
        F.append(cur)
    return [dict(ini=W[c[0]]['s'], fin=W[c[-1]]['e'], texto=' '.join(W[k]['w'] for k in c), i0=c[0], i1=c[-1]) for c in F]


def a_montaje(W, tramos, encajar=0.45):
    """Lleva palabras del crudo a la línea de tiempo del montaje (tramos = [[ini, fin]] que se conservan, en orden).

    - Las palabras a caballo de un corte se recortan al tramo.
    - Whisper a veces coloca una palabra en el silencio de antes (p. ej. «son» 0,4 s antes de que suene). Si una
      palabra cae fuera de todo tramo pero termina a menos de `encajar` s del inicio del tramo siguiente, se encaja
      al principio de ese tramo en vez de perderla.
    - El resto de palabras fuera de tramo (trabas quitadas, tomas descartadas) se descartan.
    Para subtítulos clavados lo mejor sigue siendo volver a transcribir el montaje final."""
    out, base, bases = [], 0.0, []
    for a, b in tramos:
        bases.append(base)
        base += b - a
    for w in W:
        dentro = False
        for (a, b), bs in zip(tramos, bases):
            if w['e'] <= a or w['s'] >= b:
                continue
            s, e = max(w['s'], a), min(w['e'], b)
            if e - s < 0.03:
                continue
            out.append(dict(w=w['w'], s=round(bs + s - a, 3), e=round(bs + e - a, 3)))
            dentro = True
            break
        if not dentro:
            for (a, b), bs in zip(tramos, bases):
                if 0 <= a - w['e'] < encajar:
                    d = min(w['e'] - w['s'], 0.25)
                    out.append(dict(w=w['w'], s=round(bs, 3), e=round(bs + d, 3), encajada=True))
                    break
    out.sort(key=lambda x: x['s'])
    for i in range(len(out) - 1):  # sin solapes tras encajar
        if out[i]['e'] > out[i + 1]['s']:
            out[i + 1]['s'] = out[i]['e']
            out[i + 1]['e'] = max(out[i + 1]['e'], out[i + 1]['s'] + 0.05)
    return out
