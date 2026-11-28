#!/usr/bin/env python3
"""CTA · encuentra la llamada a la acción («comenta PALABRA») y comprueba que el final respira.

Algoritmo:
  1. En palabras.json busca la primera aparición, dentro del último 30 % del vídeo, de un verbo de CTA: comenta, responde, escribe/escríbeme, pon,
     deja, manda, envía. La PALABRA clave es la primera palabra de las 6 siguientes que esté escrita en
     MAYÚSCULAS o entre comillas; si no hay, la primera que no sea de relleno («me», «aquí», «abajo», «la palabra»,
     «en los comentarios»…). Heurística: Whisper no sabe que es una palabra clave, así que confírmala.
     Si no hay «comenta PALABRA», busca un CTA de otro tipo (sígueme, guárdalo, compártelo, link en la bio).
  2. Respiro final, medido en el AUDIO (no en Whisper): última ventana de 10 ms con voz (> ruido de fondo + 10 dB,
     sin contar clics de menos de 50 ms)
     y lo que queda hasta el final del vídeo. Regla: ≥ 1,0 s (que no se corte en seco) y ≤ 2,0 s (que no sobre
     cola muerta).
  3. --arreglar SALIDA deja el respiro EXACTO en --respiro s (1,0): si sobra, recorta (vídeo y audio a la vez);
     si falta, congela el último fotograma y añade silencio.

Uso:
  python3 cta.py reel.mp4 --palabras palabras.json [--respiro 1.0] [--arreglar reel_ok.mp4]
  python3 cta.py montado.mp4 --arreglar montado_ok.mp4      # solo el respiro
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import audio, palabras as P, video  # noqa: E402

VERBOS = {'comenta', 'comentad', 'comentame', 'comentar', 'responde', 'respondeme', 'responder', 'escribe', 'escribeme',
          'escribir', 'pon', 'ponme', 'poner', 'deja', 'dejame', 'manda', 'mandame', 'envia', 'enviame'}
RELLENO = {'me', 'te', 'aqui', 'abajo', 'la', 'el', 'una', 'un', 'palabra', 'en', 'los', 'comentarios', 'comentario',
           'y', 'que', 'por', 'privado', 'mensaje', 'directo', 'dm', 'solo', 'simplemente', 'ahora', 'este', 'video',
           'reel', 'post', 'si', 'quieres', 'lo', 'de', 'tu', 'con', 'mas'}


def buscar_cta(W):
    n = [P.norm(w['w']) for w in W]
    fin = W[-1]['e'] if W else 0
    usos = [i for i in range(len(W)) if n[i] in VERBOS]
    finales = [i for i in usos if W[i]['s'] >= 0.7 * fin] or usos[-1:]
    for i in finales[:1]:  # la primera vez que lo pide en el último 30 % del vídeo
            sig = list(range(i + 1, min(len(W), i + 7)))
            clave = next((k for k in sig if re.search(r'[«"“]|^[A-ZÁÉÍÓÚÑ]{3,}', W[k]['w']) and n[k] not in RELLENO), None)
            if clave is None:
                clave = next((k for k in sig if n[k] and n[k] not in RELLENO and n[k] not in VERBOS), None)
            return dict(ini=W[i]['s'], verbo=W[i]['w'], veces=len(finales), palabra=(re.sub(r'[^\wÁÉÍÓÚÑáéíóúñ]', '', W[clave]['w']).upper() if clave is not None else None),
                        frase=' '.join(w['w'] for w in W[i:min(len(W), i + 8)]))
    otros = r'\b(sígueme|sigueme|guárdalo|guardalo|guarda|compártelo|compartelo|comparte|link|enlace|bio)\b'
    for i in range(len(W) - 1, -1, -1):
        if re.search(otros, W[i]['w'].lower()):
            j = i
            while j > 0 and W[i]['s'] - W[j - 1]['s'] < 4 and not re.search(r'[.?!]$', W[j - 1]['w']):
                j -= 1
            return dict(ini=W[j]['s'], verbo=W[i]['w'], palabra=None, frase=' '.join(w['w'] for w in W[j:min(len(W), i + 6)]))
    return None


def ultima_voz(ruta):
    db = audio.db_ventanas(audio.leer(ruta, 16000, 'highpass=f=90'), 16000)
    th = audio.ruido_fondo(db, 5) + 10  # misma regla que comun/revisar.py
    v = np.where(audio.mascara_voz(db, th))[0]  # un clic al final no cuenta como voz
    return (int(v[-1]) + 1) * audio.VENTANA if len(v) else 0.0


def main():
    ap = argparse.ArgumentParser(description='Localiza el CTA y comprueba (o arregla) el respiro final.')
    ap.add_argument('video')
    ap.add_argument('--palabras', help='palabras.json (sin él solo mide y arregla el respiro)')
    ap.add_argument('--respiro', type=float, default=1.0)
    ap.add_argument('--maximo', type=float, default=2.0, help='respiro máximo antes de considerarlo cola muerta (2,0)')
    ap.add_argument('--arreglar', metavar='SALIDA')
    ap.add_argument('--salida', default=None, help='cta.json (opcional)')
    a = ap.parse_args()

    inf = video.info(a.video)
    D = inf['duracion']
    c = buscar_cta(P.cargar(a.palabras)) if a.palabras else None
    fin_voz = ultima_voz(a.video)
    resp = D - fin_voz
    ok = a.respiro <= resp <= a.maximo
    if not a.palabras:
        pass
    elif c:
        print(f"CTA en {c['ini']:.2f} s ({D - c['ini']:.1f} s antes del final): «{c['frase']}»")
        if c['palabra']:
            print(f"palabra clave: {c['palabra']}  (confírmala: es una heurística)"
                  + (f" · la pide {c['veces']} veces" if c.get('veces', 1) > 1 else ''))
        else:
            print(f"CTA sin palabra clave (tipo «{c['verbo']}»): no hay «comenta PALABRA»")
    else:
        print('No encuentro CTA tipo «comenta/responde PALABRA».')
    print(f'última voz en {fin_voz:.2f} s · vídeo {D:.2f} s · respiro {resp:.2f} s → '
          + ('OK' if ok else ('CORTO: el final se corta en seco' if resp < a.respiro else 'LARGO: sobra cola muerta')))
    if a.salida:
        json.dump(dict(cta=c, ultima_voz=round(fin_voz, 3), duracion=round(D, 3), respiro=round(resp, 3), ok=ok),
                  open(a.salida, 'w'), ensure_ascii=False, indent=1)
    if a.arreglar:
        objetivo = fin_voz + a.respiro + 0.03  # 30 ms de margen para que la revisión no lo dé por corto
        ac = ['-c:a', 'pcm_s24le'] if a.arreglar.lower().endswith('.mov') else ['-c:a', 'aac', '-b:a', '256k']
        if objetivo <= D:
            vf, af = [], []
        else:
            vf = ['-vf', f'tpad=stop_mode=clone:stop_duration={objetivo - D + 0.1:.3f}']
            af = ['-af', 'apad']
        subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.video] + vf + af +
                       ['-t', f'{objetivo:.3f}', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium', '-threads', '2',
                        '-pix_fmt', 'yuv420p'] + ac + [a.arreglar], check=True)
        print(f'respiro ajustado a {a.respiro:.2f} s → {a.arreglar} ({objetivo:.2f} s)')
        return 0
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())
