"""Fuentes: encontrar una negrita por defecto en Mac/Linux/Windows y listar las fuentes instaladas (para tipografia/)."""
import os
from pathlib import Path

CARPETAS = ['/System/Library/Fonts', '/System/Library/Fonts/Supplemental', '/Library/Fonts', '~/Library/Fonts',
            '/usr/share/fonts', '/usr/local/share/fonts', '~/.fonts', '~/.local/share/fonts', 'C:/Windows/Fonts']

POR_DEFECTO = ['/System/Library/Fonts/HelveticaNeue.ttc#1', '/System/Library/Fonts/Supplemental/Arial Bold.ttf',
               '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf']


def partir(spec):
    """«ruta.ttc#1» → (ruta, 1)."""
    if '#' in spec:
        r, i = spec.rsplit('#', 1)
        return os.path.expanduser(r), int(i)
    return os.path.expanduser(spec), 0


def cargar(spec, tam):
    from PIL import ImageFont
    r, i = partir(spec)
    return ImageFont.truetype(r, tam, index=i)


def por_defecto():
    for s in POR_DEFECTO:
        if os.path.exists(partir(s)[0]):
            return s
    raise RuntimeError('No encuentro ninguna fuente negrita: pásala con --fuente /ruta/a/fuente.ttf')


def instaladas(extra=None, filtro=None):
    """Lista [(spec, familia, estilo)] de todas las fuentes (cada cara de los .ttc por separado)."""
    from PIL import ImageFont
    carpetas = list(CARPETAS) + list(extra or [])
    vistos, out = set(), []
    for c in carpetas:
        c = Path(os.path.expanduser(c))
        if not c.is_dir():
            continue
        for f in sorted(c.rglob('*')):
            if f.suffix.lower() not in ('.ttf', '.otf', '.ttc') or f.resolve() in vistos:
                continue
            vistos.add(f.resolve())
            for i in range(32 if f.suffix.lower() == '.ttc' else 1):
                try:
                    fo = ImageFont.truetype(str(f), 20, index=i)
                except Exception:
                    break
                fam, est = fo.getname()
                nombre = f'{fam} {est}'
                if filtro and not any(x.lower() in nombre.lower() for x in filtro):
                    continue
                out.append((f'{f}#{i}' if f.suffix.lower() == '.ttc' else str(f), fam, est))
    return out
