# Lee la «Observación» que la oficina escribe en Golden › Cobros (columna «Descripcion Corta» de Tesoreria, detrás de «Fra. P/20408, Cliente S.L.»).
# Ej.: «A cuenta ALB/5097( 259.31€)ALB/5473( 251.84€)» → [{tipo:'a cuenta', albaranes:['5097'], importe:259.31}, …]
# Entiende erratas («A cuenya», «A cuanta», «Acuenta», «lb/f-4189», «alb 3951», «ALB/ F 5993», «ALB/4571 Y 4534»). Lo que no entiende va a «aviso».
import re

KW = r'(?P<kw>paga(?:do)?\s+de\s+mas\s+a\s+cu[ae]n[a-z]a|paga(?:do)?\s+a\s+cu[ae]n[a-z]a|a\s*cu[ae]n[tyo]a|a\s+cuanta|paga(?:do)?|cobro|cobrado)'
ALB = r'(?P<alb>(?:a?lb|alb\.?)\s*[./]?\s*(?:f\s*[-/]?\s*)?|\bf\s*/\s*)(?P<n>\d{3,6})(?P<mas>(?:\s*(?:y|,)\s*\d{3,6})*)'
FEC = r'(?P<fec>\b\d{1,2}/\d{1,2}/\d{2,4}\b)'
IMP = r'(?P<imp>\(\s*\d+(?:[.,]\d{1,2})?\s*€?\s*\)|\d+[.,]\d{1,2}\s*€?|\d+\s*€|\d+(?=\s*\+)|(?<=\+)\s*\d+)'
TOK = re.compile('|'.join([KW, ALB, FEC, IMP]), re.I)
def quitar_prefijo(desc, serie, numero, nombre):
    d = ' '.join((desc or '').split())
    m = re.match(r'^Fra\.\s*' + re.escape(f'{serie}/{numero}') + r'\s*,?\s*', d)
    if not m: return d
    resto, nom = d[m.end():], ' '.join((nombre or '').split())
    if nom and resto.lower().startswith(nom.lower()): return resto[len(nom):].strip()
    if nom.lower().startswith(resto.lower()): return ''  # nombre de Golden cambiado después (más largo)
    k = TOK.search(resto)  # nombre viejo o con erratas: se quita hasta la primera palabra clave, albarán o importe
    return resto[k.start():].strip() if k and not re.search(r'\d', resto[:k.start()]) else resto

RELLENO = re.compile(r'\b(de|y|el|la|en|por|transferencia|tranferencia|efectivo|bizum|\+|,)\b|[+,\s()€.:;-]', re.I)

def leer(texto):
    """Devuelve (partes, aviso). Cada parte: tipo, albaranes, fecha (AAAA-MM-DD o None), importe (float o None)."""
    t = (texto or '').strip()
    if not t: return [], None
    partes, tipo, albs, fecha, sobra, pos = [], None, [], None, [], 0
    def cerrar(importe):
        nonlocal albs, fecha
        partes.append(dict(tipo=tipo or 'a cuenta', albaranes=albs, fecha=fecha, importe=importe)); albs, fecha = [], None
    for m in TOK.finditer(t):
        sobra.append(t[pos:m.start()]); pos = m.end()
        if m.group('kw'):
            k = m.group('kw').lower()
            if albs: cerrar(None)
            tipo = 'a cuenta' if 'cu' in k and 'n' in k else 'pagado'
        elif m.group('alb') is not None:
            if albs and not fecha: cerrar(None)  # dos albaranes seguidos sin importe en medio
            albs = albs + [m.group('n')] + re.findall(r'\d{3,6}', m.group('mas') or '')
        elif m.group('fec'):
            d, mes, a = m.group('fec').split('/'); a = ('20' + a) if len(a) == 2 else a
            fecha = f'{a}-{int(mes):02d}-{int(d):02d}'
        else:
            cerrar(round(float(re.sub(r'[^\d,.]', '', m.group('imp')).replace(',', '.')), 2))
    sobra.append(t[pos:])
    if albs: cerrar(None)
    resto = RELLENO.sub('', ''.join(sobra)).strip()
    aviso = None
    if not partes: aviso = 'No se ha entendido la nota.'
    elif resto: aviso = 'Hay palabras que no se han entendido: «' + ' '.join(''.join(sobra).split()) + '».'
    elif any(p['importe'] is None for p in partes): aviso = 'Algún albarán no lleva importe.'
    elif re.search(r'de\s+m[aá]s', t, re.I): aviso = 'Dice «de más»: puede que haya pagado más de lo debido.'
    return partes, aviso

if __name__ == '__main__':  # comprobación rápida: python3 -I scripts/golden/nota_golden.py
    p, a = leer('A cuenta ALB/5097( 259.31€)ALB/5473( 251.84€) ALB/5103( 136.56€)ALB/5346( 306.42€)')
    assert a is None and [x['albaranes'] for x in p] == [['5097'], ['5473'], ['5103'], ['5346']] and round(sum(x['importe'] for x in p), 2) == 954.13, (p, a)
    p, a = leer('A cuenya ALB/5286( 326.12€)'); assert a is None and p == [dict(tipo='a cuenta', albaranes=['5286'], fecha=None, importe=326.12)], (p, a)
    p, a = leer('Acuenta ALB/3637 09/06/2026( 211.98€)alb 3951(284.94€) ALB/4041(292.88€)lb/f-4189( 264.68€)')
    assert a is None and [x['albaranes'] for x in p] == [['3637'], ['3951'], ['4041'], ['4189']] and p[0]['fecha'] == '2026-06-09', (p, a)
    p, a = leer('Paga ALB/2395 (250.66€) ALB/2675( 301.76€)'); assert a is None and all(x['tipo'] == 'pagado' for x in p), p
    p, a = leer('A cuenta ALB/4571 Y 4534(317.79€)ALB/4385(223.62€)'); assert p[0]['albaranes'] == ['4571', '4534'] and a is None, (p, a)
    p, a = leer('Paga ALB/ F 5993( 122.14€) ALB/5829(314,87)'); assert [x['importe'] for x in p] == [122.14, 314.87] and a is None, (p, a)
    p, a = leer('Paga a cuenta 300€'); assert p == [dict(tipo='a cuenta', albaranes=[], fecha=None, importe=300.0)] and a is None, (p, a)
    p, a = leer('Paga de mas a cuenta 450€'); assert p[0]['importe'] == 450 and p[0]['tipo'] == 'a cuenta', (p, a)
    p, a = leer('algo raro sin numeros'); assert not p and a, (p, a)
    assert quitar_prefijo('Fra. P/20408, Aguila Rock S.L. A cuenta 5€', 'P', '20408', 'Aguila Rock S.L.') == 'A cuenta 5€'
    assert quitar_prefijo('Fra. P/20408, Aguila Rock S.L.', 'P', '20408', 'Aguila Rock S.L.') == ''
    assert quitar_prefijo('Fra. P/19934,  Javier Rodriguez Lopez PAGA A CUENTA 275.29€', 'P', '19934', ' Javier Rod21riguez Lopez') == 'PAGA A CUENTA 275.29€'
    assert quitar_prefijo('Fra. P/19982, Colegio Santa Maria', 'P', '19982', 'Colegio Santa Maria Las Rozas') == ''
    p, a = leer('A cuenta 91.52+100+100+52.99'); assert [x['importe'] for x in p] == [91.52, 100, 100, 52.99] and a is None, (p, a)
    print('ok')
