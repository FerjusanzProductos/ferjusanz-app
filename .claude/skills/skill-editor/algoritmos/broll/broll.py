#!/usr/bin/env python3
"""B-ROLL · mete clips o imágenes en los momentos que digas SIN TAPAR NUNCA LA CARA.

Algoritmo:
  1. Cada inserto: archivo (vídeo o imagen), inicio y fin en el vídeo base, y modo:
       - dividida (por defecto): pantalla dividida. Lienzo negro 1080×1920; el b-roll arriba, en la caja
         --caja (por defecto x0 y250 1080×700: debajo del nombre de la cuenta) y la persona abajo, en un recorte de
         1080×960 centrado en su cara, desde y=960. Así se ve el b-roll y la cara a la vez.
       - completo: el b-roll ocupa toda la pantalla. Si en ese tramo se detecta cara, pasa a dividida y avisa
         (salvo --forzar). Ojo: que no se detecte cara no garantiza que no la haya (el detector falla con
         primerísimos planos y perfiles), así que usa completo solo cuando sepas que ahí no sale nadie.
  2. Cara: detector Haar de OpenCV en 3 fotogramas del tramo (comun/cara.py); si no hay OpenCV, se supone en el
     tercio superior-central. Puedes darla a mano con --cara x0,y0,x1,y1 (píxeles del vídeo base).
  3. El b-roll se recorta para llenar su caja sin deformarse (cover), arranca en su segundo 0 cuando entra y, si
     es más corto que el hueco, se congela en su último fotograma. Las imágenes se quedan quietas todo el tramo.
  4. Todo en una sola pasada de ffmpeg; el audio del base no se toca.

Uso:
  python3 broll.py base_vertical.mp4 --inserto captura.png@3.2-6.0 --inserto clip.mp4@10-13:completo --salida con_broll.mp4
  python3 broll.py base.mp4 --insertos insertos.json   # [{"archivo": "...", "ini": 3.2, "fin": 6.0, "modo": "dividida"}]

Requisito: el vídeo base en vertical 1080×1920 (cortes/cortar.py --vertical lo deja así).
"""
import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import cara, video  # noqa: E402

IMG = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')


def leer_insertos(a):
    out = []
    if a.insertos:
        out += json.load(open(a.insertos))
    for s in a.inserto or []:
        archivo, resto = s.rsplit('@', 1)
        modo = 'dividida'
        if ':' in resto:
            resto, modo = resto.split(':', 1)
        ini, fin = [float(x) for x in resto.split('-')]
        out.append(dict(archivo=archivo, ini=ini, fin=fin, modo=modo))
    return sorted(out, key=lambda x: x['ini'])


def main():
    ap = argparse.ArgumentParser(description='Inserta b-roll sin tapar la cara (pantalla dividida si hace falta).')
    ap.add_argument('base', help='vídeo vertical 1080×1920')
    ap.add_argument('--inserto', action='append', help='archivo@ini-fin[:modo]  (modo: dividida o completo)')
    ap.add_argument('--insertos', help='JSON con la lista de insertos')
    ap.add_argument('--caja', default='0,250,1080,700', help='caja del b-roll en dividida: x,y,ancho,alto (0,250,1080,700)')
    ap.add_argument('--cara', help='caja de la cara x0,y0,x1,y1 en el base (si no, se detecta)')
    ap.add_argument('--forzar', action='store_true', help='permite modo completo aunque haya cara')
    ap.add_argument('--salida', default=None)
    a = ap.parse_args()

    inf = video.info(a.base)
    W, H, fps, D = inf['ancho'], inf['alto'], inf['fps'], inf['duracion']
    if (W, H) != (1080, 1920):
        sys.exit(f'El base es {W}×{H}: pásalo antes a vertical 1080×1920 (cortes/cortar.py --vertical).')
    bx, by, bw, bh = [int(v) for v in a.caja.split(',')]
    I = leer_insertos(a)
    if not I:
        sys.exit('No hay insertos.')
    # 1) decidir el modo de cada inserto (la cara manda)
    for k, ins in enumerate(I, 1):
        ins['ini'], ins['fin'] = max(0.0, ins['ini']), min(D, ins['fin'])
        dur = ins['fin'] - ins['ini']
        if a.cara:
            c = tuple(int(v) for v in a.cara.split(','))
        else:
            c = cara.detectar(a.base, [ins['ini'] + dur * f for f in (0.2, 0.5, 0.8)])
        modo = ins.get('modo', 'dividida')
        if modo not in ('dividida', 'completo'):
            sys.exit(f'modo desconocido «{modo}»: usa dividida o completo')
        if modo == 'completo' and c and not a.forzar:
            print(f'  inserto {k}: hay cara en {ins["ini"]:.1f}-{ins["fin"]:.1f} s → pantalla dividida (usa --forzar si de verdad quieres taparla)')
            modo = 'dividida'
        elif modo == 'completo' and not c:
            print(f'  inserto {k}: no detecto cara en {ins["ini"]:.1f}-{ins["fin"]:.1f} s; va a pantalla completa (comprueba en la hoja que no tapa a nadie)')
        ins['modo'], ins['cara'] = modo, c or cara.supuesta(W, H)
    # 2) grafo de ffmpeg
    cmd = ['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.base]
    div = [k for k, ins in enumerate(I, 1) if ins['modo'] == 'dividida']
    fc = f'[0:v]split={len(div) + 1}[b0]' + ''.join(f'[b{k}]' for k in div) + ';'
    actual = 'b0'
    for k, ins in enumerate(I, 1):
        ini, fin, modo, c = ins['ini'], ins['fin'], ins['modo'], ins['cara']
        dur = fin - ini
        es_img = ins['archivo'].lower().endswith(IMG)
        if es_img:
            cmd += ['-loop', '1', '-t', f'{dur:.3f}', '-i', ins['archivo']]
        else:
            cmd += ['-i', ins['archivo']]
        src = (f'[{k}:v]fps={fps:.4f},' + ('' if es_img else f'tpad=stop_mode=clone:stop_duration={dur:.3f},trim=0:{dur:.3f},')
               + f'setpts=PTS-STARTPTS+{ini:.3f}/TB')
        if modo == 'completo':
            fc += f'{src},scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,setsar=1[i{k}];'
            fc += f"[{actual}][i{k}]overlay=0:0:enable='between(t,{ini:.3f},{fin:.3f})':eof_action=pass[o{k}];"
        else:
            cy = (c[1] + c[3]) / 2
            y0 = int(max(0, min(H - 960, cy - 960 * 0.42)))  # la cara un poco por encima del centro del recorte
            fc += f'{src},scale={bw}:{bh}:force_original_aspect_ratio=increase,crop={bw}:{bh},setsar=1[i{k}];'
            fc += (f'[b{k}]crop=1080:960:0:{y0},pad=1080:1920:0:960:black[p{k}];[p{k}][i{k}]overlay={bx}:{by}:eof_action=pass[d{k}];'
                   f"[{actual}][d{k}]overlay=0:0:enable='between(t,{ini:.3f},{fin:.3f})'[o{k}];")
        actual = f'o{k}'
        print(f'  inserto {k}: {os.path.basename(ins["archivo"])} {ini:.2f}-{fin:.2f} s · {modo}'
              + (f' · cara en y {c[1]}-{c[3]}' if modo == 'dividida' else ''))
    fc += f'[{actual}]format=yuv420p[v]'
    salida = a.salida or str(Path(a.base).with_suffix('')) + '_broll.mp4'
    subprocess.run(cmd + ['-filter_complex', fc, '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-crf', '17', '-preset', 'medium',
                          '-threads', '2', '-c:a', 'copy', '-t', f'{D:.3f}', salida], check=True)
    print(f'{len(I)} insertos → {salida}')


if __name__ == '__main__':
    main()
