#!/usr/bin/env python3
"""Calculadora del método LTV (Sell Your AI). Solo librería estándar.

Ejemplo:
  python3 ltv.py --implantacion 1900 --mensualidad 290 --meses 12 \
      --horas-desarrollo 30 --horas-mes 2 --herramientas 25 --tarifa 45 --objetivo 20000
Salida en texto; con --json devuelve los números para montar el pacto.
"""
import argparse, json, math


def redondea5(x):
    return int(5 * math.ceil(x / 5))


def calcula(a):
    tarifa = redondea5(a.tarifa) if a.tarifa else redondea5(a.objetivo / max(a.horas_facturables, 1))
    ingreso = a.implantacion + a.mensualidad * a.meses
    coste_horas = (a.horas_desarrollo + a.horas_mes * a.meses) * tarifa
    coste_herr = a.herramientas * a.meses
    coste = coste_horas + coste_herr
    margen = ingreso - coste
    margen_pct = (margen / ingreso * 100) if ingreso else 0
    # mensualidad mínima: herramientas + horas incluidas, con un 50 % de margen encima
    mens_min = redondea5((a.herramientas + a.horas_mes * tarifa) / 0.5)
    implant_min = redondea5(a.horas_desarrollo * tarifa / 0.6)  # 40 % de margen sobre el desarrollo
    ltv_mes = ingreso / a.meses if a.meses else 0
    # clientes para el objetivo recurrente: solo cuentan las mensualidades
    clientes_obj = math.ceil(a.objetivo / a.mensualidad) if a.mensualidad else None
    precios = [
        {"puerta": "Ajuste", "regla": "Cambia algo que ya existe", "precio": f"Incluido · hasta {a.horas_mes:g} h/mes"},
        {"puerta": "Mejora pequeña", "regla": "Añade algo · hasta 2 h", "precio": f"{2 * tarifa} €"},
        {"puerta": "Mejora mediana", "regla": "Añade algo · hasta 6 h", "precio": f"{6 * tarifa} €"},
        {"puerta": "Nuevo", "regla": "Crea una pieza nueva", "precio": "Propuesta aparte"},
    ]
    avisos = []
    if a.mensualidad < mens_min:
        avisos.append(f"La mensualidad ({a.mensualidad:g} €) no cubre herramientas + {a.horas_mes:g} h incluidas con margen: mínimo {mens_min} €.")
    if a.implantacion < implant_min:
        avisos.append(f"La implantación ({a.implantacion:g} €) está por debajo de lo que valen {a.horas_desarrollo:g} h de desarrollo con margen: mínimo {implant_min} €.")
    if margen_pct < 40:
        avisos.append(f"Margen anual del {margen_pct:.0f} %: este cliente te come el tiempo. Sube precios o recorta lo incluido.")
    return {
        "tarifa": tarifa, "ltv": round(ingreso), "ltv_mes": round(ltv_mes), "coste": round(coste),
        "margen": round(margen), "margen_pct": round(margen_pct), "mensualidad_minima": mens_min,
        "implantacion_minima": implant_min, "clientes_para_objetivo": clientes_obj,
        "objetivo": a.objetivo, "precios_cambios": precios, "avisos": avisos,
        "recargo_urgencia_pct": a.urgencia,
    }


def main():
    p = argparse.ArgumentParser(description="Método LTV: lo que te deja un cliente al año y qué cobrar por cada cambio")
    p.add_argument("--implantacion", type=float, required=True, help="€ de implantación (pago único)")
    p.add_argument("--mensualidad", type=float, required=True, help="€ al mes de mantenimiento")
    p.add_argument("--meses", type=int, default=12, help="meses que se queda el cliente (por defecto 12)")
    p.add_argument("--horas-desarrollo", type=float, required=True, help="horas reales para montarlo")
    p.add_argument("--horas-mes", type=float, default=2, help="horas de ajustes incluidas al mes")
    p.add_argument("--herramientas", type=float, default=0, help="€ al mes de herramientas que pagas tú")
    p.add_argument("--tarifa", type=float, default=0, help="€/hora; si no la das se saca del objetivo")
    p.add_argument("--objetivo", type=float, default=20000, help="€/mes recurrentes que quieres facturar")
    p.add_argument("--horas-facturables", type=float, default=120, help="horas que puedes facturar al mes")
    p.add_argument("--urgencia", type=int, default=30, help="%% de recargo por urgencia")
    p.add_argument("--json", action="store_true")
    a = p.parse_args()
    r = calcula(a)
    if a.json:
        print(json.dumps(r, ensure_ascii=False, indent=2)); return
    print(f"Tarifa usada: {r['tarifa']} €/h")
    print(f"LTV ({a.meses} meses): {r['ltv']} €  ·  {r['ltv_mes']} €/mes de media")
    print(f"Coste (tu tiempo + herramientas): {r['coste']} €  ·  margen {r['margen']} € ({r['margen_pct']} %)")
    print(f"Mínimos: implantación {r['implantacion_minima']} €  ·  mensualidad {r['mensualidad_minima']} €")
    if r["clientes_para_objetivo"]:
        print(f"Para {a.objetivo:g} €/mes recurrentes con esta mensualidad: {r['clientes_para_objetivo']} clientes")
    print("\nTus precios de cambios:")
    for x in r["precios_cambios"]:
        print(f"  {x['puerta']:<15} {x['regla']:<28} {x['precio']}")
    print(f"  Urgencia: +{a.urgencia} %")
    for av in r["avisos"]:
        print("! " + av)


if __name__ == "__main__":
    main()
