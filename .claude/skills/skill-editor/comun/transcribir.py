#!/usr/bin/env python3
"""Transcripción palabra a palabra en local con faster-whisper (gratis, sin claves, nada sale de tu Mac).

Uso:
  python3 comun/transcribir.py VIDEO [--salida palabras.json] [--idioma es] [--modelo small|medium|large-v3]
                                     [--pista "nombres raros, marcas"] [--desde 12.5 --hasta 20]

Salida: palabras.json = [{"w": palabra, "s": inicio, "e": fin}, ...] y palabras.txt con las frases numeradas
[t] y el índice de palabras de cada una (para decidir qué quitar).

Notas honestas:
- Los tiempos de Whisper son buenos para subtítulos (±50-100 ms) pero NO para cortar: en las pausas se equivoca.
  Por eso los cortes (algoritmos/cortes/apretar.py) se deciden por energía del audio, no por estos tiempos.
- large-v3 es el más fiel y el más lento (en CPU ≈ 1× tiempo real). small va 5-8× más rápido y basta para
  analizar una referencia. Con 16 GB de RAM: un modelo cargado a la vez.
"""
import argparse
import json
import os
import subprocess
import sys
import tempfile


def transcribir(entrada, modelo='medium', idioma=None, pista='', desde=None, hasta=None, hilos=2):
    """Devuelve (palabras, frases, idioma). palabras = [{w,s,e}], frases = [(inicio, texto, n_palabras)]."""
    from faster_whisper import WhisperModel
    fd, wav = tempfile.mkstemp(suffix='.wav')
    os.close(fd)
    cmd = ['ffmpeg', '-v', 'error', '-nostdin', '-y']
    if desde is not None:
        cmd += ['-ss', str(desde)]
    if hasta is not None:
        cmd += ['-to', str(hasta)]
    subprocess.run(cmd + ['-i', str(entrada), '-vn', '-ac', '1', '-ar', '16000', wav], check=True)
    try:
        m = WhisperModel(modelo, device='cpu', compute_type='int8', cpu_threads=hilos)
        segs, inf = m.transcribe(wav, language=idioma, beam_size=5, word_timestamps=True,
                                 initial_prompt=pista or None, vad_filter=False)
        off = desde or 0.0
        W, F = [], []
        for s in segs:
            ws = [dict(w=w.word.strip(), s=round(w.start + off, 3), e=round(w.end + off, 3)) for w in (s.words or []) if w.word.strip()]
            if ws:
                F.append((round(s.start + off, 2), s.text.strip(), len(ws)))
                W += ws
        return W, F, inf.language
    finally:
        os.remove(wav)


def guardar(W, F, idioma, salida):
    with open(salida, 'w') as f:
        json.dump(W, f, ensure_ascii=False)
    txt, i = [], 0
    for t, texto, n in F:
        txt.append(f'[{t:7.2f}] {texto}   (palabras {i}-{i + n - 1})')
        i += n
    with open(os.path.splitext(salida)[0] + '.txt', 'w') as f:
        f.write(f'idioma: {idioma}\n' + '\n'.join(txt) + '\n')
    return txt


def main():
    ap = argparse.ArgumentParser(description='Transcribe palabra a palabra con faster-whisper (local).')
    ap.add_argument('entrada', help='vídeo o audio')
    ap.add_argument('--salida', default='palabras.json')
    ap.add_argument('--idioma', default=None, help='es, en… (por defecto lo detecta)')
    ap.add_argument('--modelo', default='medium', help='tiny, base, small, medium, large-v3 (por defecto medium)')
    ap.add_argument('--pista', default='', help='palabras raras para que las escriba bien (marcas, nombres)')
    ap.add_argument('--desde', type=float, default=None)
    ap.add_argument('--hasta', type=float, default=None)
    ap.add_argument('--hilos', type=int, default=2, help='hilos de CPU (2 = amable con 16 GB de RAM)')
    a = ap.parse_args()
    W, F, idioma = transcribir(a.entrada, a.modelo, a.idioma, a.pista, a.desde, a.hasta, a.hilos)
    txt = guardar(W, F, idioma, a.salida)
    print('\n'.join(txt))
    print(f'\n{len(W)} palabras · idioma {idioma} → {a.salida}')


if __name__ == '__main__':
    sys.exit(main())
