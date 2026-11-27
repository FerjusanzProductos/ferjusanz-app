# En qué puesto salimos en Google

## Google Maps (27/11/2026, buscando desde el centro de Madrid, con Playwright)
_Ficha con 3 reseñas de 5,0. «No sale» = no está entre los resultados que enseña Maps._

| Búsqueda | Ferjusanz | El 1.º |
|---|---|---|
| proveedor de patatas Madrid | **23.º** de 40 | Guillén Hnos Fabrica De Patatas Fritas |
| mayorista de patatas Madrid | no sale de 15 | Comercio de Patatas y Cebollas |
| distribuidor de patatas Madrid | **13.º** de 29 | Comercio de Patatas y Cebollas |
| patatas para hostelería Madrid | no sale de 36 | La Maruca - López de Hoyos |
| patata pelada Madrid | no sale de 15 | Tortillas Etiqueta Negra |
| proveedor de fruta Madrid | no sale de 36 | confituras |
| mayorista de fruta Madrid | **44.º** de 51 | El Abuelo Pedro |
| distribuidor de fruta Madrid | **23.º** de 36 | confituras |
| proveedor de verdura Madrid | **31.º** de 36 | El Abuelo Pedro |
| mayorista de verdura Madrid | **30.º** de 40 | El Abuelo Pedro |
| proveedor de fruta y verdura Madrid | **36.º** de 36 | El Abuelo Pedro |
| mayorista de frutas y hortalizas Madrid | **32.º** de 38 | El Abuelo Pedro |
| proveedor fruta y verdura hostelería Madrid | **17.º** de 31 | Frutería Silvestre | Frutería a Domicilio en Madrid |
| proveedor fruta colegios Madrid | **15.º** de 29 | Frutas Ibérika. Distribución de Frutas y Verduras en Madrid |
| proveedor fruta residencias Madrid | **7.º** de 30 | Frutas Ibérika. Distribución de Frutas y Verduras en Madrid |
| proveedor de huevos Madrid | no sale de 40 | Granja Jaeña Venta Directa Huevos |
| mayorista de huevos Madrid | **32.º** de 40 | Granja Jaeña Venta Directa Huevos |
| mayorista Mercamadrid | no sale de 12 | Mercamadrid, S.A. |
| mayorista setas y champiñones Madrid | no sale de 0 | — |
| mayorista legumbres Madrid | **16.º** de 36 | Todo a Granel |
| proveedor de fruta Segovia | no sale de 46 | Frutas Hernández Segovia |
| mayorista de patatas Segovia | no sale de 15 | Segoviana de Patatas |

Cómo se repite: `cd scripts/seo && node pos.cjs terms.txt` (Playwright; deja `pos.json`).

## Google normal (web)
No se puede mirar desde Claude: Google pide captcha a las búsquedas automáticas, y Bing y DuckDuckGo están cerrados en la red del entorno. Lo bueno es **Search Console** (posición real de cada búsqueda): Tito lo exporta a una Hoja de Google y Claude la lee con el conector de Google Sheets.
