#!/usr/bin/env python3
"""CORTES · cortar: monta los tramos con corte EXACTO a fotograma, vídeo y audio juntos, sin deriva.

Algoritmo:
  - Cada tramo [ini, fin] se convierte a número de fotograma: f = round(t · fps). El vídeo se corta por fotograma
    (trim=start_frame/end_frame) y el audio por número de muestra s = round(f · sr / fps) (a 30 fps y 48 kHz son
    1600 muestras por fotograma). Así cada tramo de vídeo y de audio mide EXACTAMENTE lo mismo y, tras 40 cortes,
    la boca sigue clavada a la voz (si cortas por segundos, cada corte arrastra hasta medio fotograma de error).
  - Fundido de audio de 8 ms al entrar y 12 ms al salir en cada tramo: quita el «clic» del corte sin oírse.
  - Opcional: --vertical reencuadra a 1080×1920 (recorte 9:16 centrado o en --x), --espejo voltea en horizontal
    (cámara frontal) y --palabras lleva palabras.json a la nueva línea de tiempo (para subtítulos/zooms).

Uso:
  python3 cortar.py crudo.mov tramos2.json montado.mp4 [--vertical] [--x 0.5] [--espejo]
                    [--audio voz_micro.wav] [--palabras palabras.json --palabras-salida palabras_montaje.json]

--audio: usa ese audio (ya sincronizado con sincronia.py) en vez del de la cámara.
"""
import argparse
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import palabras as P, video  # noqa: E402
import subprocess  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description='Corta y une tramos con exactitud de fotograma (vídeo+audio).')
    ap.add_argument('entrada')
    ap.add_argument('tramos', help='tramos2.json [[ini, fin], …]')
    ap.add_argument('salida', help='.mp4 (audio AAC) o .mov (audio PCM sin pérdida)')
    ap.add_argument('--audio', help='audio alternativo ya sincronizado (micro externo)')
    ap.add_argument('--vertical', action='store_true', help='reencuadrar a 1080×1920')
    ap.add_argument('--x', type=float, default=0.5, help='centro horizontal del recorte vertical, 0-1 (0,5 = centro)')
    ap.add_argument('--espejo', action='store_true')
    ap.add_argument('--crf', type=int, default=17)
    ap.add_argument('--hilos', type=int, default=2)
    ap.add_argument('--palabras', help='palabras.json del crudo para llevarlo al montaje')
    ap.add_argument('--palabras-salida', default=None)
    a = ap.parse_args()

    inf = video.info(a.entrada)
    fps = inf['fps_frac']
    sr = 48000
    T = json.load(open(a.tramos))
    post = []
    if a.vertical:
        w, h = inf['ancho'], inf['alto']
        cw = min(w, int(h * 9 / 16) // 2 * 2)
        ch = min(h, int(cw * 16 / 9) // 2 * 2)
        cx = int(max(0, min(w - cw, a.x * w - cw / 2)))
        post.append(f'crop={cw}:{ch}:{cx}:{(h - ch) // 2},scale=1080:1920:flags=lanczos,setsar=1')
    if a.espejo:
        post.append('hflip')
    asrc = '1:a' if a.audio else '0:a'
    fc, real = '', []
    for i, (t0, t1) in enumerate(T):
        f0, f1 = int(round(t0 * fps)), int(round(t1 * fps))
        if f1 <= f0:
            continue
        s0, s1 = int(round(f0 * sr / fps)), int(round(f1 * sr / fps))
        d = float((f1 - f0) / fps)
        fc += (f'[0:v]trim=start_frame={f0}:end_frame={f1},setpts=PTS-STARTPTS[v{i}];'
               f'[{asrc}]aresample={sr},atrim=start_sample={s0}:end_sample={s1},asetpts=PTS-STARTPTS,'
               f'afade=t=in:d=0.008,afade=t=out:st={max(0.0, d - 0.012):.4f}:d=0.012[a{i}];')
        real.append((i, float(f0 / fps), float(f1 / fps)))
    n = len(real)
    fc += ''.join(f'[v{i}][a{i}]' for i, _, _ in real) + f'concat=n={n}:v=1:a=1[vc][a]'
    fc += f';[vc]{",".join(post) if post else "null"},format=yuv420p[v]'
    cmd = ['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.entrada]
    if a.audio:
        cmd += ['-i', a.audio]
    acodec = ['-c:a', 'pcm_s24le'] if a.salida.lower().endswith('.mov') else ['-c:a', 'aac', '-b:a', '256k', '-movflags', '+faststart']
    cmd += ['-filter_complex', fc, '-map', '[v]', '-map', '[a]', '-c:v', 'libx264', '-crf', str(a.crf), '-preset', 'medium',
            '-threads', str(a.hilos), '-filter_complex_threads', str(a.hilos)] + acodec + [a.salida]
    subprocess.run(cmd, check=True)
    total = sum(t1 - t0 for _, t0, t1 in real)
    print(f'{n} tramos · {total:.2f} s → {a.salida}')
    if a.palabras:
        W = P.a_montaje(P.cargar(a.palabras), [[t0, t1] for _, t0, t1 in real])
        dest = a.palabras_salida or str(Path(a.salida).with_suffix('')) + '_palabras.json'
        P.guardar(W, dest)
        print(f'{len(W)} palabras llevadas al montaje → {dest}')


if __name__ == '__main__':
    main()
