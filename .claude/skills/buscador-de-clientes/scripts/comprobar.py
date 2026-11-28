#!/usr/bin/env python3
"""Comprueba la carpeta de un proyecto del buscador de clientes.

Uso:
  python3 comprobar.py ~/Buscador-de-clientes/<proyecto>          # revisa
  python3 comprobar.py ~/Buscador-de-clientes/<proyecto> --crear  # crea los CSV vacíos si faltan

Avisa de: citas sin enlace, emails sin la URL donde los publica el negocio, duplicados,
gente que está en no-contactar.csv, mensajes sin línea de baja o demasiado largos,
y más de 20 envíos el mismo día.
"""
import csv
import sys
from collections import Counter
from pathlib import Path

COLUMNAS = ["nombre", "red", "url_perfil", "web", "encaje", "problema_cita", "problema_url",
            "sueno_cita", "sueno_url", "objecion_cita", "objecion_url", "email", "fuente_email",
            "otro_canal", "asunto", "mensaje", "estado", "fecha_envio", "notas"]
BAJA = ["no quieres que te vuelva a escribir", "darte de baja", "baja"]
MAX_PALABRAS = 90
MAX_DIA = 20


def leer(ruta):
    with open(ruta, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    carpeta = Path(sys.argv[1]).expanduser()
    clientes = carpeta / "clientes.csv"
    bajas = carpeta / "no-contactar.csv"

    if "--crear" in sys.argv:
        carpeta.mkdir(parents=True, exist_ok=True)
        (carpeta / "perfiles").mkdir(exist_ok=True)
        if not clientes.exists():
            clientes.write_text(",".join(COLUMNAS) + "\n", encoding="utf-8")
        if not bajas.exists():
            bajas.write_text("email_o_perfil,motivo,fecha\n", encoding="utf-8")
        print(f"Carpeta lista: {carpeta}")
        return

    if not clientes.exists():
        print(f"No encuentro {clientes}. Usa --crear.")
        sys.exit(1)

    filas = leer(clientes)
    faltan = [c for c in COLUMNAS if filas and c not in filas[0]]
    avisos = []
    if faltan:
        avisos.append(f"Faltan columnas: {', '.join(faltan)}")

    bloqueados = set()
    if bajas.exists():
        for b in leer(bajas):
            v = (b.get("email_o_perfil") or "").strip().lower()
            if v:
                bloqueados.add(v)

    vistos = Counter()
    envios_dia = Counter()
    for i, f in enumerate(filas, start=2):
        nombre = f.get("nombre") or f"fila {i}"
        g = lambda k: (f.get(k) or "").strip()
        for cita, url in (("problema_cita", "problema_url"), ("sueno_cita", "sueno_url"),
                          ("objecion_cita", "objecion_url")):
            if g(cita) and not g(url).startswith("http"):
                avisos.append(f"{nombre}: «{cita}» sin enlace a la fuente")
        if not (g("problema_cita") or g("sueno_cita") or g("objecion_cita")):
            avisos.append(f"{nombre}: ninguna cita literal (¿descartar?)")
        if g("email") and not g("fuente_email").startswith("http"):
            avisos.append(f"{nombre}: email sin la URL donde lo publica el negocio")
        for clave in (g("email").lower(), g("url_perfil").lower()):
            if clave:
                vistos[clave] += 1
                if clave in bloqueados:
                    avisos.append(f"{nombre}: está en no-contactar.csv (no escribir)")
        msg = g("mensaje")
        if msg:
            if not any(p in msg.lower() for p in BAJA):
                avisos.append(f"{nombre}: el mensaje no ofrece la baja")
            n = len(msg.split())
            if n > MAX_PALABRAS:
                avisos.append(f"{nombre}: mensaje de {n} palabras (máximo {MAX_PALABRAS})")
        if g("estado") == "enviado" and g("fecha_envio"):
            envios_dia[g("fecha_envio")[:10]] += 1

    for clave, n in vistos.items():
        if n > 1:
            avisos.append(f"Duplicado {n} veces: {clave}")
    for dia, n in envios_dia.items():
        if n > MAX_DIA:
            avisos.append(f"{dia}: {n} envíos (máximo {MAX_DIA} al día)")

    estados = Counter((f.get("estado") or "pendiente").strip() or "pendiente" for f in filas)
    con_email = sum(1 for f in filas if (f.get("email") or "").strip())
    print(f"{len(filas)} clientes · {con_email} con email publicado · "
          + " · ".join(f"{k}: {v}" for k, v in estados.items()))
    if avisos:
        print(f"\n{len(avisos)} avisos:")
        for a in avisos:
            print(f"- {a}")
        sys.exit(2)
    print("Todo en orden.")


if __name__ == "__main__":
    main()
