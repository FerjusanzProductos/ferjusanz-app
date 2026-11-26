# Gastos de la cuenta CaixaBank 4501 → gastos_fijos (Tito, 26/11/2026: «Ordena y organiza todo»).
# Lee el Excel de «Extraer movimientos» de la app de CaixaBank/AgroBank y saca, por mes, lo que NO es mercancía ni nómina
# (eso ya está en Golden y en gastos_personal). Importes SIN IVA (se quita el IVA que lleva cada tipo de gasto).
# Uso: python3 -I scripts/banco/gastos-banco.py <excel> > consulta.sql   (luego se lanza por la API de Supabase)
import openpyxl, datetime, re, sys, collections, json

def leer(ruta):
    ws = openpyxl.load_workbook(ruta, data_only=True).active
    out = []
    for r in ws.iter_rows(min_row=4, values_only=True):
        if r[0] is None or r[1] is None: continue
        c, f, i = str(r[0]).strip(), r[1], float(r[2])
        # El Excel del banco trae las fechas como texto dd/mm/aaaa, pero las que tienen día ≤ 12 llegan como fecha con día y mes cambiados.
        f = f"{f.year}-{f.day:02d}-{f.month:02d}" if isinstance(f, datetime.datetime) else '-'.join(reversed(str(f).split('/')))
        out.append((c, f, i))
    return out

# (patrón, grupo, concepto, IVA, en_resultado). Orden: el primero que encaje. grupo None = no es gasto de la cuenta de resultados ni se lista.
R = [
    # Mercancía (ya está en el coste de Golden) y cobros: fuera
    (r'^(PAGARE|FRUTAS|FRUTS|PATATAS|EUROPATATAS|PALACIOS ROCA|COMERCIO DE PATAT|GREEN SELECT|HIJOS DE SINFOROS|MANGUAN|EJ GALVEZ|MORENO HUERTA|CENTRIMERCA|HERMANOS BONILLA|RIEGO FRESH|FRUITS CMR|JOSE M NADADOR|EUROPEA DE FRUTAS|RIAZA|IBERICA DE PATATA|CIA FRU VER|TORRES HNOS|FACTURA (MARZO|ABRIL|MAYO|JUNIO|JULIO|AGOSTO)|FACTURAS (MAYO|F)|FAC\.|Alb\. n|MITAD FACTURA|SEGUNDA MITAD|PAGO FACTURA)', None, '', 0, 0),
    (r'^MERCAMADRID$', None, '', 0, 0),        # compras con tarjeta en los puestos (variable); el abono de parking va aparte abajo
    (r'^(Nomina|Sueldo|sueldo|TGSS|I\.R\.P\.F)', None, '', 0, 0),   # ya en gastos_personal (coste empresa)
    (r'^Liquidacion/Finiq', 'Personal (otros)', 'Finiquito', 0, 1),
    (r'^EUROPREVEN', 'Personal (otros)', 'Prevención de riesgos laborales (Europreven)', 21, 1),
    (r'^PREVENTIA', 'Personal (otros)', 'Formación (Preventia)', 0, 1),
    (r'^TELEFURGO', 'Furgonetas', 'Alquiler de furgonetas (Telefurgo)', 21, 1),
    (r'^TRANSOLVER', 'Furgonetas', 'Leasing (Transolver)', 21, 1),
    (r'^(kinto|Pago Leasing Fern)', 'Furgonetas', 'Renting Toyota (Kinto)', 21, 1),
    (r'^pago de furgoneta', 'Furgonetas', 'Pago de furgoneta', 21, 1),
    (r'^(FACTURA TOYOTA|AUTOS SANCHEZ|ACR HORTALEZA)', 'Furgonetas', 'Taller', 21, 1),
    (r'^AGUILA NEUMATICOS', 'Furgonetas', 'Neumáticos (Águila)', 21, 1),
    (r'^ITV', 'Furgonetas', 'ITV', 21, 1),
    (r'^Castellana de Aut', 'Furgonetas', 'Peajes', 21, 1),
    (r'^(HNOS LLORENTE|GASOLINERA|E\.? ?S\.|ES AUTOVIA|ESTACION|MOEVE|CEPSA|SEMUTRANSA)', 'Furgonetas', 'Gasoil', 21, 1),
    (r'^MERCAMADRID PUNTO', 'Mercamadrid', 'Entradas a Mercamadrid', 21, 1),
    (r'^MERCAMADRID@68.40', 'Mercamadrid', 'Abono de parking (90 días)', 21, 1),
    (r'^DELOLEGAL', 'Gestoría y servicios', 'Delolegal (cuota mensual)', 21, 1),
    (r'^PECO ROJO', 'Gestoría y servicios', 'Peco Rojo Consultores', 21, 1),
    (r'^FISCONSA', 'Gestoría y servicios', 'Fisconsa', 21, 1),
    (r'^GOLDEN SOFT', 'Gestoría y servicios', 'Golden Soft', 21, 1),
    (r'^SEVIAM', 'Gestoría y servicios', 'Seviam Negocios (2 cuotas al mes)', 21, 1),
    (r'^VODAFONE', 'Oficina', 'Teléfonos (Vodafone)', 21, 1),
    (r'^(GOOGLE|TikTok|TIKTOK)', 'Oficina', 'Google y TikTok', 21, 1),
    (r'^(FERRETERIA|LAUDELAN|MANTENIMIENTO|COMPRA CON TARJETA|ESTANCO)', 'Oficina', 'Compras pequeñas con tarjeta', 21, 1),
    (r'^(Alquiler despacho|Parte proporciona)', None, '', 0, 0),   # ya en gastos_fijos (alquiler y luz, de sus facturas)
    (r'^AXA', 'Seguros', 'AXA Seguros Generales', 0, 1),
    (r'^(RESTAURANTE|BURGER|NARCEA|MACHUPICHU|ASADOR|BAR |LA BARRIKA|CASTILLEJO|ALDEA DEL FRESNO|SANSE I)', 'Comidas', 'Desayunos y comidas', 10, 1),
    (r'^MASTER CORPORATE', 'Tarjeta de empresa', 'Recibo de la tarjeta Mastercard (sin detalle)', 0, 1),
    (r'^(PRECIO|CUOTA T\.|LIQUIDACION CTA|PAGO TIMBRES|T\.PlanaMyCommerce|PR\.)', 'Banco', 'Comisiones, intereses y datáfono', 0, 1),
    (r'^(ITP|PAGO AYTO)', 'Impuestos y tasas', 'ITP y Ayuntamiento', 0, 1),
    (r'^DIF\.INGRESO CAJERO', 'Descuadres', 'Descuadre al ingresar efectivo en el cajero', 0, 1),
    # Pagos que no son gasto del año: se enseñan aparte
    (r'^LUBRIMATIC', 'Fuera de resultados', 'Lubrimatic: deuda de 2025 (C.B.)', 0, 0),
    (r'^(traspaso a Fernan|Fernando Sanz|TRASFE A FERNANDO|Julian Sanz)', 'Fuera de resultados', 'Pagos a los socios fuera de nómina', 0, 0),
    (r'^(IMPUESTOS|pago hacienda|I\.V\.A\.)', 'Fuera de resultados', 'Hacienda (IVA y otros pagos)', 0, 0),
    (r'^(DETIR)', 'Fuera de resultados', 'Facturas anticipadas devueltas', 0, 0),
    (r'^(FERJUSANZ|PAGO TRASPASOS)', 'Fuera de resultados', 'Traspasos a otra cuenta', 0, 0),
]

def clasificar(c, i):
    clave = 'MERCAMADRID@68.40' if c == 'MERCAMADRID' and round(i, 2) == -68.40 else c
    for pat, g, con, iva, res in R:
        if re.search(pat, clave): return g, con, iva, res
    return 'Por identificar', c, 0, 1

if __name__ == '__main__':
    movs = leer(sys.argv[1])
    agg = collections.defaultdict(lambda: [0.0, 0, 0, 0])   # (mes, grupo, concepto) -> [con IVA, n, iva, res]
    for c, f, i in movs:
        g, con, iva, res = clasificar(c, i)
        if g is None: continue
        if i > 0 and g != 'Banco': continue                 # devoluciones sueltas de gasolineras, etc.
        x = agg[(f[:7], g, con)]; x[0] += -i; x[1] += 1; x[2] = iva; x[3] = res
    q = lambda s: "'" + s.replace("'", "''") + "'"
    vals = []
    for (m, g, con), (t, n, iva, res) in sorted(agg.items()):
        if abs(t) < 0.005: continue
        base = round(t / (1 + iva / 100), 2)
        nota = f"Banco 4501: {n} cargo{'s' if n > 1 else ''}, {t:.2f} € con IVA".replace('.', ',') + ('' if iva == 0 else f" (sin el {iva} % de IVA)")
        vals.append(f"({q(con)},{q(g)},{base},'{m}-01','{m}-01',{q(nota)},{'true' if res else 'false'})")
    print("begin; delete from gastos_fijos where nota like 'Banco 4501:%';")
    print("insert into gastos_fijos (concepto, grupo, importe_mes, desde, hasta, nota, en_resultado) values\n" + ',\n'.join(vals) + ';')
    print("commit;")
    resumen = collections.defaultdict(float)
    for (m, g, con), (t, n, iva, res) in agg.items(): resumen[(g, con)] += t
    json.dump(sorted([[g, con, round(t, 2)] for (g, con), t in resumen.items()], key=lambda x: -x[2]), sys.stderr, ensure_ascii=False, indent=0)
