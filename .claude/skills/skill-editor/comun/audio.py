"""Audio a numpy y medidas básicas que usan casi todos los algoritmos.

- leer(): cualquier vídeo/audio → señal mono float32 (ffmpeg, sin archivos temporales).
- db_ventanas(): nivel RMS en dB por ventanas de 10 ms (100 valores por segundo).
- ruido_fondo(): percentil 10 de esos dB = el «suelo» de la grabación (lo que suena cuando no hablas).
- tramos_de_voz(): ventanas por encima de un umbral → lista [inicio, fin] en segundos.
- loudness(): sonoridad integrada en LUFS con el filtro ebur128 de ffmpeg.
"""
import re
import subprocess

import numpy as np

VENTANA = 0.01  # 10 ms → 100 ventanas por segundo


def leer(ruta, sr=16000, filtro='highpass=f=90', desde=None, duracion=None, pista=None):
    """Devuelve la señal mono (float32) a `sr` Hz. `filtro` es una cadena -af de ffmpeg (None = sin filtro)."""
    cmd = ['ffmpeg', '-v', 'error', '-nostdin']
    if desde is not None:
        cmd += ['-ss', str(desde)]
    if duracion is not None:
        cmd += ['-t', str(duracion)]
    cmd += ['-i', str(ruta)]
    if pista is not None:
        cmd += ['-map', f'0:a:{pista}']
    cmd += ['-vn', '-ac', '1', '-ar', str(sr)]
    if filtro:
        cmd += ['-af', filtro]
    cmd += ['-f', 'f32le', '-']
    r = subprocess.run(cmd, capture_output=True)
    if r.returncode != 0:
        raise RuntimeError(f'ffmpeg no pudo leer el audio de {ruta}: {r.stderr.decode(errors="ignore")[-400:]}')
    return np.frombuffer(r.stdout, np.float32).copy()


def db_ventanas(a, sr=16000, ventana=VENTANA):
    """Nivel RMS en dBFS por ventanas consecutivas de `ventana` segundos."""
    n = int(sr * ventana)
    k = len(a) // n
    if k == 0:
        return np.array([-120.0])
    x = a[:k * n].reshape(k, n).astype(np.float64)
    return 20 * np.log10(np.sqrt((x ** 2).mean(axis=1)) + 1e-9)


def ruido_fondo(db, percentil=10):
    """Suelo de ruido: el percentil bajo del nivel (las pausas entre frases)."""
    return float(np.percentile(db, percentil))


def tramos_de_voz(mascara, ventana=VENTANA, desde=0.0):
    """Convierte una máscara booleana por ventanas en [[ini, fin], ...] en segundos."""
    m = np.concatenate([[False], mascara.astype(bool), [False]])
    d = np.diff(m.astype(np.int8))
    ini = np.where(d == 1)[0]
    fin = np.where(d == -1)[0]
    return [[desde + i * ventana, desde + j * ventana] for i, j in zip(ini, fin)]


def loudness(ruta, desde=None, duracion=None):
    """Sonoridad integrada (LUFS) medida con ebur128. Devuelve float o None."""
    cmd = ['ffmpeg', '-hide_banner', '-nostdin']
    if desde is not None:
        cmd += ['-ss', str(desde)]
    if duracion is not None:
        cmd += ['-t', str(duracion)]
    cmd += ['-i', str(ruta), '-vn', '-af', 'ebur128', '-f', 'null', '-']
    err = subprocess.run(cmd, capture_output=True, text=True).stderr
    m = re.findall(r'^\s+I:\s+(-?[\d.]+) LUFS', err, re.M)
    return float(m[-1]) if m else None


def pico_db(ruta):
    """Pico de muestra en dBFS (volumedetect)."""
    err = subprocess.run(['ffmpeg', '-hide_banner', '-nostdin', '-i', str(ruta), '-vn', '-af', 'volumedetect', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    m = re.search(r'max_volume: (-?[\d.]+) dB', err)
    return float(m.group(1)) if m else None


def mascara_voz(db, umbral, minimo=0.05, ventana=VENTANA):
    """db > umbral, pero sin chasquidos: los trozos de «voz» de menos de `minimo` s (50 ms: clics, golpes al micro, roces)
    no cuentan. Es la misma regla que usa cortes/apretar.py."""
    v = db > umbral
    for a, b in tramos_de_voz(v, ventana):
        if b - a < minimo:
            v[int(round(a / ventana)):int(round(b / ventana))] = False
    return v
