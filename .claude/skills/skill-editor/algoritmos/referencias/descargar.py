#!/usr/bin/env python3
"""REFERENCIAS · baja el reel que quieres copiar y lo deja listo para analizar.

Algoritmo:
  1. URL (Instagram, TikTok, YouTube Shorts…) → yt-dlp baja el mejor MP4 (vídeo+audio). Si le pasas un archivo
     local, se lo salta y trabaja con ese archivo.
  2. ffprobe: duración, resolución, fps → ficha.json.
  3. Hoja de fotogramas: 16 fotogramas repartidos (hoja.jpg) + otra hoja solo de los 3 primeros segundos
     (hoja_gancho.jpg, 8 fotogramas = uno cada 0,375 s) porque ahí está casi todo lo que hay que copiar.
  4. Transcripción palabra a palabra con faster-whisper (palabras.json + palabras.txt). Modelo `small` por defecto:
     para analizar la referencia basta y va 5-8× más rápido que large-v3.

Uso:
  python3 descargar.py URL_O_ARCHIVO --carpeta referencias/mi-ref [--modelo small] [--sin-transcribir]
  python3 descargar.py URL --cookies-desde-navegador chrome      # si Instagram pide sesión

Notas honestas:
- Instagram cambia a menudo y a veces exige sesión: con --cookies-desde-navegador yt-dlp usa la de tu navegador.
  Úsalo solo con contenido que tengas derecho a analizar.
- El vídeo se queda en tu carpeta; no se sube a ningún sitio.
"""
import argparse
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from comun import video  # noqa: E402


def bajar(url, carpeta, cookies=None):
    if not shutil.which('yt-dlp'):
        sys.exit('Falta yt-dlp: brew install yt-dlp   (o pip install yt-dlp)')
    destino = carpeta / 'video.%(ext)s'
    cmd = ['yt-dlp', '-f', 'bv*[ext=mp4]+ba[ext=m4a]/b[ext=mp4]/bv*+ba/b', '--merge-output-format', 'mp4',
           '--no-playlist', '-o', str(destino), url]
    if cookies:
        cmd[1:1] = ['--cookies-from-browser', cookies]
    r = subprocess.run(cmd)
    if r.returncode != 0:
        sys.exit('yt-dlp no pudo bajar el vídeo. Prueba con --cookies-desde-navegador chrome o baja el MP4 a mano y pásame el archivo.')
    mp4 = carpeta / 'video.mp4'
    if not mp4.exists():
        otros = sorted(carpeta.glob('video.*'))
        if not otros:
            sys.exit('yt-dlp terminó pero no encuentro el vídeo.')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(otros[0]), '-c', 'copy', str(mp4)], check=True)
    return mp4


def main():
    ap = argparse.ArgumentParser(description='Baja (o toma) un reel de referencia y saca ficha, hojas de fotogramas y transcripción.')
    ap.add_argument('origen', help='URL del reel o ruta a un MP4 local')
    ap.add_argument('--carpeta', default='referencia', help='carpeta de salida')
    ap.add_argument('--modelo', default='small', help='modelo de faster-whisper (small por defecto)')
    ap.add_argument('--idioma', default=None)
    ap.add_argument('--sin-transcribir', action='store_true')
    ap.add_argument('--cookies-desde-navegador', default=None, metavar='NAVEGADOR', help='chrome, safari, firefox…')
    a = ap.parse_args()

    carpeta = Path(a.carpeta).expanduser()
    carpeta.mkdir(parents=True, exist_ok=True)
    if os.path.exists(os.path.expanduser(a.origen)):
        mp4 = Path(a.origen).expanduser().resolve()
        print(f'Archivo local: {mp4}')
    else:
        mp4 = bajar(a.origen, carpeta, a.cookies_desde_navegador)
        print(f'Bajado: {mp4}')

    inf = video.info(mp4)
    ficha = {'origen': a.origen, 'video': str(mp4), 'duracion': round(inf['duracion'], 2),
             'ancho': inf.get('ancho'), 'alto': inf.get('alto'), 'fps': round(inf.get('fps', 0), 3),
             'vertical': bool(inf.get('alto', 0) > inf.get('ancho', 1)), 'audio': inf['audio']}
    ficha['hoja'] = video.hoja(mp4, carpeta / 'hoja.jpg', n=16, ancho=270, columnas=8)
    ficha['hoja_gancho'] = video.hoja(mp4, carpeta / 'hoja_gancho.jpg', n=8, ancho=270, columnas=8, desde=0, hasta=min(3, inf['duracion']))
    print(f"{ficha['duracion']} s · {ficha['ancho']}×{ficha['alto']} · {ficha['fps']} fps → hoja.jpg, hoja_gancho.jpg")

    if not a.sin_transcribir and inf['audio']:
        from comun.transcribir import transcribir, guardar
        print(f'Transcribiendo con faster-whisper {a.modelo}…')
        W, F, idioma = transcribir(mp4, a.modelo, a.idioma)
        guardar(W, F, idioma, str(carpeta / 'palabras.json'))
        ficha['idioma'] = idioma
        ficha['palabras'] = len(W)
        ficha['palabras_por_segundo'] = round(len(W) / max(inf['duracion'], 0.1), 2)
        print(f'{len(W)} palabras ({ficha["palabras_por_segundo"]}/s) → palabras.json, palabras.txt')

    with open(carpeta / 'ficha.json', 'w') as f:
        json.dump(ficha, f, ensure_ascii=False, indent=2)
    print(f'Listo → {carpeta}/ficha.json')


if __name__ == '__main__':
    main()
