# Cambiar el lema en los textos guardados (20/11/2026)
`tx.py`: las sustituciones del lema («patatas, frutas, verduras, huevos, setas, champiñones y legumbres»).
`db.py`: las aplica en la base (empresa.lema, listas_precios.subtitulo/presentacion, presentaciones.diapositivas, textos_comerciales.texto). No toca precios.
Uso: `python3 scripts/lema/db.py <carpeta-temporal> <ref>` (pruebas `pbeuxbwbpmlanbhhnpgy`, real `hvydnjaswdexttogsyen`). Ojo: hace `sys.path.insert` con la carpeta temporal; copia ahí `tx.py` antes.
