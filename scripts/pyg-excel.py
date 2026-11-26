# Excel de la cuenta de resultados (Tito, 26/11/2026). Lee los datos de docs/pyg.html (los mismos del panel) → docs/pyg.xlsx, con gráficos.
# Uso: python3 -I scripts/pyg-excel.py
import json, re, collections, os
from openpyxl import Workbook
from openpyxl.chart import BarChart, Reference
from openpyxl.styles import Font, PatternFill, Alignment
from openpyxl.utils import get_column_letter

raiz = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
D = json.loads(re.search(r'const D = (.*);\n', open(os.path.join(raiz, 'docs/pyg.html'), encoding='utf-8').read()).group(1).replace('\\u003c', '<'))
M = D['meses']; NM = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
mes = lambda i: NM[int(M[i][5:7]) - 1] + ' ' + M[i][:4]
EUR = '#,##0 "€";[Red]-#,##0 "€"'; PCT = '0.0%'
verde = PatternFill('solid', fgColor='E3F1E8'); gris = PatternFill('solid', fgColor='EEF2EE')

v = collections.defaultdict(float); k = collections.defaultdict(float); vk = collections.defaultdict(float)
cli = collections.defaultdict(lambda: [0.0, 0.0, 0.0]); pro = collections.defaultdict(lambda: [0.0, 0.0, 0.0, 0.0]); cp = collections.defaultdict(lambda: [0.0, 0.0, 0.0])
for m, c, p, ve, co, vco, q, pe in D['v']:
    v[m] += ve; k[m] += co; vk[m] += vco
    x = cli[c]; x[0] += ve; x[1] += co; x[2] += vco
    y = pro[p]; y[0] += ve; y[1] += co; y[2] += vco; y[3] += q
    z = cp[(c, p)]; z[0] += ve; z[1] += co; z[2] += vco
pers = collections.defaultdict(float); persL = collections.defaultdict(lambda: collections.defaultdict(float))
for m, t, b, ss, est, nota in D['pe']: pers[m] += b + ss; persL[t][m] += b + ss
fij = collections.defaultdict(float); fijG = collections.defaultdict(lambda: collections.defaultdict(float))
for m, g, c, i, nota, una in D['fi']: fij[m] += i; fijG[g][m] += i

wb = Workbook()
def hoja(nombre, cab, filas, anchos=None, formatos=None):
    ws = wb.create_sheet(nombre) if wb.active.title != 'Sheet' else wb.active
    if ws.title == 'Sheet': ws.title = nombre
    ws.append(cab)
    for c in ws[1]: c.font = Font(bold=True); c.fill = gris; c.alignment = Alignment(wrap_text=True, vertical='center')
    for f in filas: ws.append(f)
    for j, a in enumerate(anchos or [], 1): ws.column_dimensions[get_column_letter(j)].width = a
    for j, fm in (formatos or {}).items():
        for r in range(2, ws.max_row + 1): ws.cell(r, j).number_format = fm
    ws.freeze_panes = 'B2'
    return ws

# 1. Resumen: la cuenta de resultados mes a mes
n = len(M)
filas = [['Ventas'] + [v[i] for i in range(n)], ['Coste de la mercancía'] + [-k[i] for i in range(n)], ['Margen bruto'] + [v[i] - k[i] for i in range(n)],
         ['Personal'] + [-pers[i] for i in range(n)], ['Gastos fijos (banco y facturas)'] + [-fij[i] for i in range(n)],
         ['Queda antes de impuestos'] + [v[i] - k[i] - pers[i] - fij[i] for i in range(n)]]
for f in filas: f.append(sum(f[1:]))
ws = hoja('Cuenta de resultados', ['Sin IVA'] + [mes(i) for i in range(n)] + ['Total'], filas, [34] + [12] * (n + 1), {j: EUR for j in range(2, n + 3)})
for r in (4, 7):
    for c in ws[r]: c.font = Font(bold=True); c.fill = verde
ws.append([]); ws.append(['Margen bruto sobre ventas'] + [(v[i] - k[i]) / v[i] if v[i] else None for i in range(n)] + [sum(v[i] - k[i] for i in range(n)) / sum(v.values())])
for c in ws[ws.max_row][1:]: c.number_format = PCT
ws.append([]); ws.append(['Datos: Golden (ventas y coste, meses cerrados), nóminas (enero a julio estimadas con la de agosto) y cuenta CaixaBank 4501 (desde marzo; enero y febrero, media). Falta: puesto de Mercamadrid y autónomos.'])
ch = BarChart(); ch.type = 'col'; ch.title = 'Margen bruto y lo que queda, mes a mes'; ch.y_axis.title = '€'; ch.height = 9; ch.width = 22
ch.add_data(Reference(ws, min_col=1, max_col=n + 1, min_row=4, max_row=4), from_rows=True, titles_from_data=True)
ch.add_data(Reference(ws, min_col=1, max_col=n + 1, min_row=7, max_row=7), from_rows=True, titles_from_data=True)
ch.set_categories(Reference(ws, min_col=2, max_col=n + 1, min_row=1, max_row=1)); ws.add_chart(ch, 'A14')
ch2 = BarChart(); ch2.type = 'col'; ch2.grouping = 'stacked'; ch2.overlap = 100; ch2.title = 'En qué se va el margen'; ch2.height = 9; ch2.width = 22
for r in (5, 6, 7): ch2.add_data(Reference(ws, min_col=1, max_col=n + 1, min_row=r, max_row=r), from_rows=True, titles_from_data=True)
ch2.set_categories(Reference(ws, min_col=2, max_col=n + 1, min_row=1, max_row=1)); ws.add_chart(ch2, 'A33')

# 2. Gastos por grupo y mes
gs = sorted(fijG, key=lambda g: -sum(fijG[g].values()))
ws = hoja('Gastos', ['Gasto (sin IVA)'] + [mes(i) for i in range(n)] + ['Total'],
          [[g] + [fijG[g].get(i, 0) for i in range(n)] + [sum(fijG[g].values())] for g in gs] + [['Personal'] + [pers[i] for i in range(n)] + [sum(pers.values())]],
          [30] + [11] * (n + 1), {j: EUR for j in range(2, n + 3)})
ch = BarChart(); ch.type = 'bar'; ch.title = 'Gastos del periodo'; ch.height = 10; ch.width = 18; ch.legend = None
ch.add_data(Reference(ws, min_col=n + 2, min_row=1, max_row=ws.max_row), titles_from_data=True); ch.set_categories(Reference(ws, min_col=1, min_row=2, max_row=ws.max_row))
ws.add_chart(ch, f'A{ws.max_row + 3}')
hoja('Gastos detalle', ['Mes', 'Grupo', 'Concepto', 'Importe sin IVA', 'De dónde sale'],
     [[mes(m), g, c, i, nota] for m, g, c, i, nota, una in sorted(D['fi'], key=lambda x: (x[0], x[1]))], [10, 22, 44, 14, 80], {4: EUR})
hoja('Pagos que no son gasto', ['Mes', 'Concepto', 'Importe', 'Nota'], [[mes(m), c, i, nota] for m, g, c, i, nota, una in sorted(D['fu'])], [10, 44, 14, 80], {3: EUR})
# 3. Personal
ts = sorted(persL, key=lambda t: -sum(persL[t].values()))
hoja('Personal', ['Persona (coste empresa)'] + [mes(i) for i in range(n)] + ['Total'], [[t] + [persL[t].get(i, 0) for i in range(n)] + [sum(persL[t].values())] for t in ts], [30] + [11] * (n + 1), {j: EUR for j in range(2, n + 3)})
# 4. Clientes y productos (año)
ws = hoja('Clientes', ['Cliente', 'Ventas', 'Coste', 'Margen', '% margen'],
          sorted([[(D['cli'][c] or '(sin nombre)'), x[0], x[1], x[2] - x[1], (x[2] - x[1]) / x[2] if x[2] else None] for c, x in cli.items()], key=lambda f: -f[1]), [40, 13, 13, 13, 10], {2: EUR, 3: EUR, 4: EUR, 5: PCT})
ch = BarChart(); ch.type = 'bar'; ch.title = '15 clientes que más dejan (margen)'; ch.height = 10; ch.width = 18; ch.legend = None
top = sorted(range(2, ws.max_row + 1), key=lambda r: -(ws.cell(r, 4).value or 0))[:15]
ws2 = wb.create_sheet('Top clientes'); ws2.append(['Cliente', 'Margen'])
for r in top: ws2.append([ws.cell(r, 1).value, ws.cell(r, 4).value])
ws2.column_dimensions['A'].width = 40
for r in range(2, ws2.max_row + 1): ws2.cell(r, 2).number_format = EUR
ch.add_data(Reference(ws2, min_col=2, min_row=1, max_row=ws2.max_row), titles_from_data=True); ch.set_categories(Reference(ws2, min_col=1, min_row=2, max_row=ws2.max_row)); ws2.add_chart(ch, 'D2')
hoja('Productos', ['Código', 'Producto', 'Ventas', 'Coste', 'Margen', '% margen', 'Cantidad'],
     sorted([[D['pro'][p][0], D['pro'][p][1], x[0], x[1], x[2] - x[1], (x[2] - x[1]) / x[2] if x[2] else None, x[3]] for p, x in pro.items()], key=lambda f: -f[2]), [10, 40, 13, 13, 13, 10, 12], {3: EUR, 4: EUR, 5: EUR, 6: PCT})
hoja('Cliente y producto', ['Cliente', 'Producto', 'Ventas', 'Coste', 'Margen'],
     sorted([[(D['cli'][c] or '(sin nombre)'), D['pro'][p][1], x[0], x[1], x[2] - x[1]] for (c, p), x in cp.items()], key=lambda f: (f[0], -f[2])), [40, 40, 13, 13, 13], {3: EUR, 4: EUR, 5: EUR})
comp = collections.defaultdict(float)
for m, p, val in D['co']: comp[p] += val
hoja('Compras a proveedores', ['Proveedor', 'Compras (Golden)'], sorted([[p, x] for p, x in comp.items()], key=lambda f: -f[1]), [44, 16], {2: EUR})
ws = hoja('Nos deben (todo)', ['Cliente', 'Debe en total', 'De hace más de 2 meses', 'Lo reciente (último mes)', 'Factura más antigua', 'Facturas'],
     [[c, t, v or 0, t - (v or 0), d, k] for c, t, v, d, k in D.get('dt', [])], [44, 14, 16, 16, 14, 10], {2: EUR, 3: EUR, 4: EUR})
ws.append([]); ws.append(['Total', sum(x[1] for x in D.get('dt', [])), sum(x[2] or 0 for x in D.get('dt', []))])
for c in ws[ws.max_row]: c.font = Font(bold=True)
ws.cell(ws.max_row, 2).number_format = EUR; ws.cell(ws.max_row, 3).number_format = EUR
ws.append(['Lo del último mes es normal: los clientes de pago mensual pagan la 1.ª semana del mes siguiente. Las notas «a cuenta» de Golden ya están restadas.'])
hoja('Nos deben (más de 2 meses)', ['Cliente', 'Pendiente', 'Desde'], [[c, x, d] for c, x, d in D['de']], [44, 14, 12], {2: EUR})
wb.save(os.path.join(raiz, 'docs/pyg.xlsx')); print('docs/pyg.xlsx', len(wb.sheetnames), 'hojas')
