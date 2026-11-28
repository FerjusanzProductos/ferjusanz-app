#!/usr/bin/env python3
"""ZOOMS · «punch-in» suave en las palabras clave. DESACTIVADO POR DEFECTO.

Aviso: muchos creadores NO quieren zooms (marean y se ven a plantilla). Si la referencia no los usa, no los
pongas. Este script sin --activar solo enseña el plan (qué palabras y cuándo) y no toca el vídeo.

Algoritmo:
  1. Palabras clave: las que le pases con --claves «palabra1,palabra2», o con --auto N las N más «fuertes»:
     cifras, palabras en MAYÚSCULAS y palabras largas (≥ 8 letras), separadas al menos --separacion s (4 s)
     para que no haya zoom encima de zoom.
  2. Cada zoom: sube de 1,00 a --zoom (1,08 = 8 %) en --subida s (0,20) con curva suave (smoothstep), se mantiene
     hasta 0,4 s después del final de la palabra (máximo --max s, 1,2) y baja igual de suave.
  3. Centro del zoom en la cara (detector de OpenCV) o en --centro x,y (0-1), para que la cara no se salga.
  4. ffmpeg zoompan fotograma a fotograma (d=1), mismo tamaño y fps que el original; audio sin tocar.
     Con --fino escala ×2 antes para que el movimiento no «tiemble» (más lento).

Uso:
  python3 zooms.py montado.mp4 --palabras palabras_montaje.json --auto 4                 # solo el plan
  python3 zooms.py montado.mp4 --palabras palabras_montaje.json --auto 4 --activar --salida con_zooms.mp4
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import cara, palabras as P, video  # noqa: E402


def elegir(W, claves=None, n=4, separacion=4.0):
    if claves:
        cs = {P.norm(c) for c in claves}
        return [w for w in W if P.norm(w['w']) in cs]

    def fuerza(w):
        t = w['w'].strip('.,¿?¡!«»"')
        return (3 if re.search(r'\d', t) else 0) + (2 if t.isupper() and len(t) > 2 else 0) + (1 if len(P.norm(t)) >= 8 else 0)
    cand = sorted([w for w in W if fuerza(w) > 0], key=lambda w: (-fuerza(w), w['s']))
    out = []
    for w in cand:
        if all(abs(w['s'] - o['s']) >= separacion for o in out):
            out.append(w)
        if len(out) >= n:
            break
    return sorted(out, key=lambda w: w['s'])


def expresion(eventos, Z, subida, fps):
    t = f'(in/{fps:.4f})'
    partes = []
    for s, e in eventos:
        u = f'clip(({t}-{s:.3f})/{subida},0,1)'
        v = f'clip(({e:.3f}-{t})/{subida},0,1)'
        su = f'({u}*{u}*(3-2*{u}))'
        sv = f'({v}*{v}*(3-2*{v}))'
        partes.append(f'min({su},{sv})')
    env = '0'
    for p in partes:  # max() de ffmpeg solo admite dos argumentos: se anida
        env = p if env == '0' else f'max({p},{env})'
    return f'1+{Z - 1:.4f}*{env}'


def main():
    ap = argparse.ArgumentParser(description='Punch-in suave en palabras clave (DESACTIVADO por defecto: usa --activar).')
    ap.add_argument('video')
    ap.add_argument('--palabras', required=True)
    ap.add_argument('--claves', help='palabras separadas por comas')
    ap.add_argument('--auto', type=int, default=4, help='nº de zooms automáticos si no das --claves (4)')
    ap.add_argument('--zoom', type=float, default=1.08)
    ap.add_argument('--subida', type=float, default=0.20)
    ap.add_argument('--max', type=float, default=1.2, help='duración máxima de cada zoom en s')
    ap.add_argument('--separacion', type=float, default=4.0)
    ap.add_argument('--centro', help='x,y del centro del zoom en 0-1 (por defecto, la cara)')
    ap.add_argument('--fino', action='store_true', help='escala ×2 antes (sin temblor, más lento)')
    ap.add_argument('--activar', action='store_true', help='sin esto solo enseña el plan')
    ap.add_argument('--salida', default=None)
    a = ap.parse_args()

    W = P.cargar(a.palabras)
    sel = elegir(W, a.claves.split(',') if a.claves else None, a.auto, a.separacion)
    ev = [(max(0.0, w['s'] - a.subida * 0.5), min(w['s'] + a.max, w['e'] + 0.4)) for w in sel]
    print('AVISO: los zooms están DESACTIVADOS por defecto. Ponlos solo si la referencia los usa y el creador los quiere.')
    for (s, e), w in zip(ev, sel):
        print(f'  zoom {s:6.2f}-{e:6.2f} s en «{w["w"]}»')
    if not a.activar:
        print('Plan mostrado, vídeo sin tocar. Para aplicarlo: --activar --salida con_zooms.mp4')
        return 0
    if not ev:
        sys.exit('No hay palabras para hacer zoom.')
    inf = video.info(a.video)
    W0, H0, fps = inf['ancho'], inf['alto'], inf['fps']
    if a.centro:
        cx, cy = [float(v) for v in a.centro.split(',')]
    else:
        c = cara.detectar(a.video, [s + 0.1 for s, _ in ev]) or cara.supuesta(W0, H0)
        cx, cy = (c[0] + c[2]) / 2 / W0, (c[1] + c[3]) / 2 / H0
        print(f'centro del zoom en la cara: x={cx:.2f} y={cy:.2f}')
    z = expresion(ev, a.zoom, a.subida, fps)
    k = 2 if a.fino else 1
    pre = f'scale={W0 * k}:{H0 * k}:flags=lanczos,' if k > 1 else ''
    vf = (f"{pre}zoompan=z='{z}':x='(iw-iw/zoom)*{cx:.4f}':y='(ih-ih/zoom)*{cy:.4f}':d=1:s={W0}x{H0}:fps={fps:.4f},"
          f"setsar=1,format=yuv420p")
    salida = a.salida or str(Path(a.video).with_suffix('')) + '_zooms.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.video, '-vf', vf, '-c:v', 'libx264', '-crf', '17',
                    '-preset', 'medium', '-threads', '2', '-c:a', 'copy', salida], check=True)
    d0, d1 = inf['duracion'], video.info(salida)['duracion']
    print(f'{len(ev)} zooms → {salida} ({d1:.2f} s; original {d0:.2f} s)')
    json.dump([dict(ini=s, fin=e, palabra=w['w']) for (s, e), w in zip(ev, sel)], open(str(Path(salida).with_suffix('')) + '.json', 'w'),
              ensure_ascii=False)
    return 0


if __name__ == '__main__':
    sys.exit(main())
