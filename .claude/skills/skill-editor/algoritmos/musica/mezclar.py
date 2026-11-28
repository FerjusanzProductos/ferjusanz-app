#!/usr/bin/env python3
"""MÚSICA · mezcla tu voz con una canción como un editor: la música debajo, se aparta cuando hablas, y el
resultado a −14 LUFS (lo que usa Instagram) sin saturar.

Algoritmo:
  1. Mide la sonoridad integrada (EBU R128, filtro ebur128) de la voz (el vídeo) y del trozo de canción que se va a
     usar (desde --desde, la duración del vídeo).
  2. Ganancia de la canción = (voz − BAJO) − canción, con BAJO = 18,5 LU por defecto: la música queda 18,5 LU por
     debajo de la voz (se oye, pero nunca compite; súbela bajando --bajo, p. ej. 15).
  3. Si la canción (desde --desde) es más corta que el vídeo, se enlaza consigo misma en bucle con un fundido
     cruzado de --cruce s (2 s) hasta cubrir todo el vídeo.
  4. Ducking: sidechaincompress con la voz como llave (umbral 0,03 · ratio 2,5 · ataque 20 ms · suelta 400 ms):
     cuando hablas, la música baja unos dB más; en las pausas vuelve. Suave, sin bombeo.
  5. Fundido de entrada 0,4 s y de salida 1,5 s al final del vídeo.
  6. Mezcla (amix sin normalizar) → se mide → ganancia para llegar a --objetivo (−14 LUFS) → limitador alimiter
     a 0,8 (≈ −1,9 dBFS de pico) para que nada sature al subir; si el limitador la deja a más de 0,3 LU del
     objetivo, se corrige una vez. Vídeo sin recomprimir, audio AAC 256k.
  7. Comprueba: sonoridad final y pico.

Uso:
  python3 mezclar.py montado.mp4 cancion.mp3 [--desde 12] [--bajo 18.5] [--salida final.mp4] [--sin-musica-tambien]
"""
import argparse
import math
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import audio, video  # noqa: E402


def dur_audio(ruta):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(ruta)],
                       capture_output=True, text=True)
    return float(r.stdout.strip())


def normalizar(entrada, salida, objetivo, video_de=None):
    """Lleva `entrada` a `objetivo` LUFS con limitador. Como el limitador baja un poco la sonoridad, mide el
    resultado y, si se ha quedado a más de 0,3 LU, repite una vez con la ganancia corregida."""
    I = audio.loudness(entrada)
    g = objetivo - I
    for _ in range(2):
        cmd = ['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', str(video_de or entrada)]
        if video_de:
            cmd += ['-i', str(entrada), '-map', '0:v', '-map', '1:a']
        cmd += ['-c:v', 'copy', '-af', f'volume={g:.2f}dB,alimiter=limit=0.8:level=disabled', '-c:a', 'aac', '-b:a', '256k',
                '-ar', '48000', '-movflags', '+faststart', str(salida)]
        subprocess.run(cmd, check=True)
        r = audio.loudness(salida)
        if abs(r - objetivo) <= 0.3:
            break
        g += objetivo - r


def main():
    ap = argparse.ArgumentParser(description='Voz + canción: N LU por debajo, ducking, fundidos, bucle si hace falta, −14 LUFS.')
    ap.add_argument('video', help='vídeo montado con la voz')
    ap.add_argument('cancion')
    ap.add_argument('--desde', type=float, default=0.0, help='segundo de la canción por el que empieza (0)')
    ap.add_argument('--bajo', type=float, default=18.5, help='LU que la música queda por debajo de la voz (18,5)')
    ap.add_argument('--cruce', type=float, default=2.0, help='fundido cruzado del bucle en s (2)')
    ap.add_argument('--fundido-entrada', type=float, default=0.4)
    ap.add_argument('--fundido-salida', type=float, default=1.5)
    ap.add_argument('--objetivo', type=float, default=-14.0, help='LUFS finales (−14)')
    ap.add_argument('--sin-ducking', action='store_true')
    ap.add_argument('--salida', default=None)
    ap.add_argument('--sin-musica-tambien', action='store_true', help='además, una versión solo voz a −14 LUFS')
    a = ap.parse_args()

    D = video.info(a.video)['duracion']
    salida = a.salida or os.path.splitext(a.video)[0] + '_musica.mp4'
    LV = audio.loudness(a.video)
    largo = dur_audio(a.cancion) - a.desde
    if largo <= a.cruce + 1:
        sys.exit('La canción (desde --desde) es demasiado corta.')
    tmp = Path(tempfile.mkdtemp(prefix='mezcla_'))
    try:
        # 1) pista de música del largo del vídeo (en bucle con fundido cruzado si hace falta)
        mus = tmp / 'musica.wav'
        if largo >= D:
            subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-ss', str(a.desde), '-t', f'{D:.3f}', '-i', a.cancion,
                            '-ac', '2', '-ar', '48000', str(mus)], check=True)
            vueltas = 1
        else:
            vueltas = 1 + math.ceil((D - largo) / (largo - a.cruce))
            cmd = ['ffmpeg', '-v', 'error', '-nostdin', '-y']
            for _ in range(vueltas):
                cmd += ['-ss', str(a.desde), '-i', a.cancion]
            fc = ''.join(f'[{k}:a]aresample=48000,aformat=channel_layouts=stereo[m{k}];' for k in range(vueltas))
            prev = 'm0'
            for k in range(1, vueltas):
                fc += f'[{prev}][m{k}]acrossfade=d={a.cruce}:c1=tri:c2=tri[x{k}];'
                prev = f'x{k}'
            fc += f'[{prev}]atrim=0:{D:.3f}[o]'
            subprocess.run(cmd + ['-filter_complex', fc, '-map', '[o]', str(mus)], check=True)
        LM = audio.loudness(mus)
        G = (LV - a.bajo) - LM
        fo = max(0.0, D - a.fundido_salida)
        # 2) mezcla
        mchain = f'[1:a]volume={G:.2f}dB,afade=t=in:d={a.fundido_entrada},afade=t=out:st={fo:.3f}:d={a.fundido_salida}'
        if a.sin_ducking:
            fc = f'{mchain}[md];[0:a]aresample=48000[v];[v][md]amix=inputs=2:duration=first:normalize=0[a]'
        else:
            fc = (f'{mchain}[m];[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit[v][sc];'
                  f'[m][sc]sidechaincompress=threshold=0.03:ratio=2.5:attack=20:release=400[md];'
                  f'[v][md]amix=inputs=2:duration=first:normalize=0[a]')
        mezcla = tmp / 'mezcla.wav'
        subprocess.run(['ffmpeg', '-v', 'error', '-nostdin', '-y', '-i', a.video, '-i', str(mus), '-filter_complex', fc,
                        '-map', '[a]', '-c:a', 'pcm_s24le', str(mezcla)], check=True)
        # 3) a −14 LUFS con limitador, vídeo sin tocar
        normalizar(mezcla, salida, a.objetivo, video_de=a.video)
        print(f'voz {LV:.1f} LUFS · canción {LM:.1f} LUFS → ganancia música {G:+.1f} dB (queda {a.bajo} LU por debajo)'
              + (f' · bucle de {vueltas} vueltas con cruce de {a.cruce} s' if vueltas > 1 else ''))
        print(f'final: {audio.loudness(salida):.1f} LUFS · pico {audio.pico_db(salida):.1f} dBFS → {salida}')
        if a.sin_musica_tambien:
            sm = os.path.splitext(salida)[0] + '_sin-musica.mp4'
            normalizar(a.video, sm, a.objetivo)
            print(f'solo voz: {audio.loudness(sm):.1f} LUFS → {sm}')
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    main()
