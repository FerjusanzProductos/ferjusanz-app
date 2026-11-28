"""Dónde está la cara (para no taparla nunca). Usa el detector Haar de OpenCV si está instalado.

Heurística: el detector frontal de OpenCV acierta bien con caras de frente y bien iluminadas; con perfiles, gorras
muy caladas o poca luz puede fallar. Por eso todos los scripts aceptan la caja de la cara a mano (--cara) y,
si no hay OpenCV, suponen la cara en el tercio superior-central del plano, que es lo habitual en un reel.
"""
from pathlib import Path

import numpy as np

from comun import video

# OpenCV 5 ya no trae los .xml de Haar: usamos el de OpenCV que va en comun/modelos (licencia Intel/BSD en su cabecera)
HAAR = 'haarcascade_frontalface_default.xml'


def _cascada(cv2):
    rutas = [Path(__file__).parent / 'modelos' / HAAR]
    if hasattr(cv2, 'data') and getattr(cv2.data, 'haarcascades', None):
        rutas.insert(0, Path(cv2.data.haarcascades) / HAAR)
    for r in rutas:
        if r.exists():
            c = cv2.CascadeClassifier(str(r))
            if not c.empty():
                return c
    return None


def detectar(ruta, tiempos, anchos=((540, 6), (270, 4), (180, 4))):
    """Devuelve la caja de cara más grande (x0, y0, x1, y1) en píxeles del vídeo original, o None.
    Prueba varias escalas: los primerísimos planos (cara cortada por los bordes) solo salen a escala pequeña.
    Que devuelva None NO garantiza que no haya cara: el detector falla con perfiles y planos muy cerrados."""
    try:
        import cv2
    except ImportError:
        return None
    casc = _cascada(cv2)
    if casc is None:
        return None
    inf = video.info(ruta)
    cajas = []
    for t in tiempos:
        for ancho, vecinos in anchos:
            try:
                f = video.fotograma(ruta, t, ancho=ancho)
            except RuntimeError:
                break
            k = inf['ancho'] / ancho
            g = cv2.cvtColor(f, cv2.COLOR_RGB2GRAY)
            caras = casc.detectMultiScale(g, scaleFactor=1.1, minNeighbors=vecinos, minSize=(ancho // 12, ancho // 12))
            if len(caras):
                x, y, w, h = max(caras, key=lambda c: c[2] * c[3])
                cajas.append((x * k, y * k, (x + w) * k, (y + h) * k))
                break
    if not cajas:
        return None
    c = np.median(np.array(cajas), axis=0)
    return tuple(int(v) for v in c)


def supuesta(ancho, alto):
    """Caja por defecto si no hay detector: centro horizontal, entre el 18 % y el 45 % de la altura."""
    return (int(ancho * 0.3), int(alto * 0.18), int(ancho * 0.7), int(alto * 0.45))
