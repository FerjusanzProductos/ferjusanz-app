#!/usr/bin/env python3
"""Monta el pacto de alcance (HTML imprimible) a partir de un JSON.

  python3 pacto.py datos.json salida.html

Campos del JSON (los que falten se omiten):
  agencia, color (hex), logo (ruta o URL), cliente, fecha, proyecto (1 frase),
  entregables [str], fuera [str], terminado [str] (pruebas de «está terminado»),
  implantacion, plazo_dias, mensualidad, horas_mes, ajustes_gratis_dias,
  precios_cambios [{puerta, regla, precio}], urgencia_pct, aparte [str] (lo que paga aparte),
  canal (cómo trabajáis), firma (true = firma, false = basta con «De acuerdo»), tarifa
"""
import html, json, sys

e = lambda s: html.escape(str(s))
eur = lambda n: f"{n:,.0f}".replace(",", ".") if isinstance(n, (int, float)) else str(n)


def lista(items):
    return "<ul>" + "".join(f"<li>{e(i)}</li>" for i in items) + "</ul>" if items else ""


def main(src, out):
    d = json.load(open(src, encoding="utf-8"))
    c = d.get("color") or "#1a1a1a"
    logo = f'<img src="{e(d["logo"])}" alt="" class="logo">' if d.get("logo") else ""
    filas = "".join(
        f"<tr><td>{e(p['puerta'])}</td><td class='m'>{e(p['regla'])}</td><td class='r'>{e(p['precio'])}</td></tr>"
        for p in d.get("precios_cambios", []))
    dinero = []
    if d.get("implantacion"):
        t = f"Implantación: {eur(d['implantacion'])} €"
        if d.get("plazo_dias"): t += f", entregado en {d['plazo_dias']} días"
        dinero.append(t)
    if d.get("mensualidad"):
        t = f"Mantenimiento: {eur(d['mensualidad'])} €/mes"
        if d.get("horas_mes"): t += f", incluye hasta {d['horas_mes']} h de ajustes al mes (no se acumulan)"
        dinero.append(t)
    if d.get("ajustes_gratis_dias"):
        dinero.append(f"Ajustes sin coste durante los {d['ajustes_gratis_dias']} días siguientes a la entrega")
    if d.get("urgencia_pct"):
        dinero.append(f"Lo urgente (en menos de 48 h) lleva un {d['urgencia_pct']} % de recargo")
    firma = ("<div class='firmas'><div>Firma {a}</div><div>Firma {c}</div></div>"
             .format(a=e(d.get("agencia", "la agencia")), c=e(d.get("cliente", "el cliente")))
             if d.get("firma", True) else "<p class='m'>Basta con responder «De acuerdo» por escrito.</p>")
    tarifa = f"<p class='nota'>Tarifa de referencia: {e(d['tarifa'])} €/h.</p>" if d.get("tarifa") else ""
    sec = lambda t, body: f"<section><h2>{t}</h2>{body}</section>" if body else ""
    doc = f"""<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>Pacto de alcance · {e(d.get('cliente',''))}</title>
<style>
:root{{--c:{c}}}*{{box-sizing:border-box}}body{{margin:0;background:#f4f2ec;font:16px/1.55 -apple-system,"SF Pro Text",Inter,Helvetica,Arial,sans-serif;color:#1a1a1a}}
.hoja{{max-width:820px;margin:32px auto;background:#fff;padding:56px 64px;box-shadow:0 1px 3px rgba(0,0,0,.08)}}
.top{{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid var(--c);padding-bottom:18px}}
.logo{{max-height:46px}}.k{{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#888}}
h1{{font-size:40px;letter-spacing:-.02em;margin:28px 0 6px}}h2{{font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:var(--c);margin:34px 0 8px}}
ul{{margin:0;padding-left:20px}}li{{margin:4px 0}}.m{{color:#666}}.r{{text-align:right;font-weight:600;white-space:nowrap}}
table{{width:100%;border-collapse:collapse}}td,th{{padding:11px 0;border-bottom:1px solid #e6e3da;vertical-align:top}}
th{{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#888;text-align:left;font-weight:500}}th:last-child{{text-align:right}}
.nota{{font-size:13px;color:#888}}.firmas{{display:flex;gap:40px;margin-top:56px}}.firmas div{{flex:1;border-top:1px solid #1a1a1a;padding-top:8px;font-size:13px;color:#666}}
.print{{position:fixed;right:20px;bottom:20px;background:var(--c);color:#fff;border:0;padding:12px 18px;border-radius:999px;font-weight:600;cursor:pointer}}
@media(max-width:700px){{.hoja{{margin:0;padding:28px 18px}}h1{{font-size:30px}}}}@media print{{body{{background:#fff}}.hoja{{box-shadow:none;margin:0}}.print{{display:none}}}}
</style></head><body><div class="hoja">
<div class="top">{logo or f'<strong>{e(d.get("agencia",""))}</strong>'}<span class="k">{e(d.get('fecha',''))}</span></div>
<p class="k" style="margin-top:28px">Pacto de alcance · {e(d.get('cliente',''))}</p>
<h1>Qué compras y qué no.</h1><p class="m">{e(d.get('proyecto',''))}</p>
{sec("Lo que incluye", lista(d.get("entregables")))}
{sec("Lo que no incluye", lista(d.get("fuera")))}
{sec("Está terminado cuando", lista(d.get("terminado")))}
{sec("Precio y mantenimiento", lista(dinero))}
{sec("Precios de los cambios", f"<table><tr><th>Puerta</th><th>Regla</th><th>Precio</th></tr>{filas}</table>{tarifa}" if filas else "")}
{sec("Se paga aparte", lista(d.get("aparte")))}
{sec("Cómo trabajamos", f"<p>{e(d['canal'])}</p>" if d.get("canal") else "")}
{firma}
</div><button class="print" onclick="print()">Descargar en PDF</button></body></html>"""
    open(out, "w", encoding="utf-8").write(doc)
    print(out)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
