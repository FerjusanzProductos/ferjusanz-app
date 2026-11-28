#!/usr/bin/env python3
"""ESTRUCTURA · convierte la transcripción en el esqueleto del reel: gancho → desarrollo → prueba → CTA.

Algoritmo (heurística de texto + pausas, explicada para que la puedas corregir):
  1. Frases: se parte palabras.json por pausas > 0,35 s o por punto/interrogación/exclamación.
  2. Bloques: frases seguidas se juntan en un bloque mientras la pausa entre ellas sea < 0,6 s, no aparezca un
     marcador de cambio de idea al principio de la frase («primero», «además», «pero», «la clave», «el truco»,
     «mira»…) ni un marcador de paso en sus 6 primeras palabras («el paso número dos», «lo segundo»…) y el bloque
     no pase de 12 s. El gancho siempre es un bloque aparte: las frases que empiezan antes de 3 s.
  3. Tipo de cada bloque:
       - CTA:        desde la primera frase con «comenta/responde/escribe/sígueme/guarda/link/te lo mando…» que
                     cae en el último 30 % del vídeo (más la frase de antes si es un «si quieres…») hasta el final.
       - gancho:     las frases que empiezan antes de 3 s (como mínimo la primera).
       - prueba:     bloques con cifras, €, $, %, o palabras de resultado («clientes», «facturo», «resultado»,
                     «he conseguido», «captura», «mira esto», «casos»…).
       - desarrollo: el resto. Si lleva marcador de paso se numera (paso 1, paso 2…).
  4. Resumen: % de tiempo de cada tipo, número de pasos y el esqueleto en una línea, para copiar las
     proporciones de la referencia en tu guion.

Uso:
  python3 estructura.py palabras.json [--duracion 80.5] [--salida estructura.json]

Nota honesta: el tipo sale de palabras clave, no de entender el texto. Claude debe leer el resultado y corregir
lo que no cuadre (por ejemplo, una «prueba» que en realidad es una promesa).
"""
import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import palabras as P  # noqa: E402

MARCADORES = r'^(primero|lo primero|paso|segundo|el segundo|tercero|el tercero|número|numero|por último|y por último|' \
             r'además|pero|la clave|el truco|mira|ahora|entonces|resultado|así que|y lo mejor|lo más)\b'
PASO = r'\b(primero|paso|segundo|tercero|cuarto|número (uno|dos|tres|cuatro|1|2|3|4)|por último)\b|^(y )?(dos|tres|cuatro)\b'
CTA = r'\b(comenta|comentad|coment[aá]|responde|respóndeme|escribe|escríbeme|sígueme|seguirme|guarda|guárdalo|comparte|' \
      r'link|enlace|te lo mando|te lo envío|te lo paso|te la mando|te la envío|en mi bio|deja (un|tu)|pon (un|la))\b'
PREVIA = r'\b(si quieres|si te interesa|si esto te|si te ha|si te gustaría|si necesitas)\b'
PRUEBA = r'\d|€|\$|%|\b(clientes?|factur\w*|resultados?|he conseguido|conseguí|ganado|gané|ventas|casos?|captura|' \
         r'mira esto|euros|dólares|seguidores|visitas|leads?)\b'


def bloques(W, pausa_bloque=0.6, gancho_s=3.0, max_bloque=12.0):
    F = P.frases(W)
    B = []
    for k, f in enumerate(F):
        t = f['texto'].lower()
        inicio = ' '.join(t.split()[:6])
        nuevo = (not B or f['ini'] - F[k - 1]['fin'] >= pausa_bloque or re.search(MARCADORES, t) or re.search(PASO, inicio)
                 or (F[k - 1]['ini'] < gancho_s <= f['ini']) or f['fin'] - B[-1]['ini'] > max_bloque)
        if nuevo:
            B.append(dict(ini=f['ini'], fin=f['fin'], frases=[f['texto']]))
        else:
            B[-1]['fin'] = f['fin']
            B[-1]['frases'].append(f['texto'])
    for b in B:
        b['texto'] = ' '.join(b.pop('frases'))
    return B, F


def clasificar(B, F, gancho_s=3.0):
    cta_ini = None
    fin = F[-1]['fin'] if F else 0
    con_cta = [k for k, f in enumerate(F) if re.search(CTA, f['texto'].lower())]
    finales = [k for k in con_cta if F[k]['ini'] >= 0.7 * fin] or con_cta[-1:]
    if finales:
        k = finales[0]  # la primera frase de CTA del último 30 %, más su «si quieres…» de antes
        if k > 0 and re.search(PREVIA, F[k - 1]['texto'].lower()) and F[k]['ini'] - F[k - 1]['fin'] < 1.5:
            k -= 1
        cta_ini = F[k]['ini']
    if cta_ini is not None:  # el CTA arranca en su frase, aunque el bloque empezara antes
        nb = []
        for b in B:
            if b['ini'] < cta_ini < b['fin']:
                pre = [f for f in F if b['ini'] <= f['ini'] < cta_ini]
                post = [f for f in F if cta_ini <= f['ini'] <= b['fin']]
                nb.append(dict(ini=b['ini'], fin=pre[-1]['fin'], texto=' '.join(f['texto'] for f in pre)))
                nb.append(dict(ini=cta_ini, fin=b['fin'], texto=' '.join(f['texto'] for f in post)))
            else:
                nb.append(b)
        B = nb
    paso = 0
    for i, b in enumerate(B):
        t = b['texto'].lower()
        if cta_ini is not None and b['ini'] >= cta_ini:
            b['tipo'], b['motivo'] = 'cta', 'frase de llamada a la acción'
        elif b['ini'] < gancho_s:
            b['tipo'], b['motivo'] = 'gancho', f'empieza antes de {gancho_s:g} s'
        elif re.search(PRUEBA, t):
            b['tipo'], b['motivo'] = 'prueba', 'cifras o palabras de resultado: ' + ', '.join(sorted(set(m.group(0) for m in re.finditer(PRUEBA, t))))[:80]
        else:
            b['tipo'], b['motivo'] = 'desarrollo', 'resto'
        if re.search(PASO, t) and b['tipo'] in ('desarrollo', 'prueba'):
            paso += 1
            b['paso'] = paso
        b['ini'], b['fin'] = round(b['ini'], 2), round(b['fin'], 2)
    return B


def main():
    ap = argparse.ArgumentParser(description='Bloques del reel (gancho, desarrollo, prueba, CTA) desde palabras.json.')
    ap.add_argument('palabras')
    ap.add_argument('--duracion', type=float, default=None, help='duración del vídeo (para el %% de cada parte)')
    ap.add_argument('--salida', default='estructura.json')
    a = ap.parse_args()
    W = P.cargar(a.palabras)
    if not W:
        sys.exit('palabras.json vacío')
    B, F = bloques(W)
    B = clasificar(B, F)
    D = a.duracion or W[-1]['e']
    tiempo = {}
    for b in B:
        tiempo[b['tipo']] = tiempo.get(b['tipo'], 0) + b['fin'] - b['ini']
    pct = {k: round(100 * v / D, 1) for k, v in tiempo.items()}
    esq, prev = [], None
    for b in B:
        etq = b['tipo'].upper() + (f" {b['paso']}" if 'paso' in b else '')
        if etq != prev:
            esq.append(f"{etq} ({b['ini']:.0f}s)")
        prev = etq
    r = dict(duracion=round(D, 2), bloques=B, porcentaje=pct, pasos=max([b.get('paso', 0) for b in B]), esqueleto=' → '.join(esq))
    json.dump(r, open(a.salida, 'w'), ensure_ascii=False, indent=1)
    for b in B:
        extra = f" · paso {b['paso']}" if 'paso' in b else ''
        print(f"{b['ini']:6.2f}-{b['fin']:6.2f}  {b['tipo'].upper():10s}{extra}  {b['texto'][:110]}")
    print('\n% del tiempo:', ', '.join(f'{k} {v} %' for k, v in pct.items()))
    print('esqueleto:', r['esqueleto'])
    print(f'→ {a.salida}')


if __name__ == '__main__':
    main()
