import re
L='huevos, setas, champiñones y legumbres'
def tx(s):
    s=s.replace("Mayoristas de patatas, frutas y verduras","Mayoristas de patatas, frutas, verduras, "+L)
    s=s.replace("Frutas y verduras frescas · ","Patatas, frutas, verduras, "+L+" · ")
    s=s.replace("Frutas y verduras al por mayor · Mercamadrid","Patatas, frutas, verduras, "+L+" al por mayor · Mercamadrid")
    s=s.replace("las patatas, las frutas, las verduras y los huevos","las patatas, las frutas, las verduras, los huevos, las setas, los champiñones y las legumbres")
    s=s.replace("mayoristas de frutas y verduras con puesto en Mercamadrid y cosechas propias.","mayoristas de patatas, frutas, verduras, "+L+": trabajamos con agricultores de confianza y tenemos puesto en Mercamadrid.")
    s=re.sub(r"(?<=[Pp]atatas, frutas, verduras) y huevos",", "+L,s)
    return s
