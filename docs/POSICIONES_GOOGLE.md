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

## Google normal (web) — Search Console, últimos 3 meses (exportado por Tito el 27/11/2026)
Claude no puede buscar en Google (captcha; Bing y DuckDuckGo cerrados en la red). Tito exporta Search Console (Rendimiento → Exportar → Excel u Hojas, con «Sitio para ordenador») y lo manda por el chat.
_Casi todo es todavía de la web antigua de WordPress: la nueva está en el dominio desde el 23/11/2026. Volver a exportar a mediados de diciembre para ver la nueva._

- Total: 51 clics y 5.797 veces vistos; puesto medio 34. En el móvil, puesto 18; en ordenador, 38.
- Salimos 1.º solo buscando «ferjusanz». En 1.ª página (puesto ≤ 8): catálogo de precios de frutas y verduras (5-7), distribuidor hortofrutícola Madrid reparto (4), reparto fruta y verdura restaurantes Madrid (5), mejor proveedor frutas y verduras restaurantes Madrid (5), mayorista de cebollas Madrid centro (3), venta de patatas Madrid centro (5).
- Casi en 1.ª (8-20): frutas de invierno España (9-14), catálogo de verduras (11), mayorista frutas y verduras hostelería Madrid (11), proveedor verduras cocina profesional Madrid (14), patatas rojas (18).
- Lejos (puesto 30-50) en las grandes: distribuidor/proveedor/mayorista de frutas y verduras (~100 veces vistas cada una), colegios, residencias, hostelería, tipos de patatas.
- Huevos, setas, legumbres: casi nadie nos ve (menos de 20 veces). Segovia: nada.
- Por temas: patata 618 veces vistas (puesto 41); hostelería 308 (43); colegios 151 (32); residencias 90 (37); fruterías 66 (38).
- Arreglado el 27/11: el PDF viejo «LISTA-DE-PRECIOS-DE-VERDURAS.pdf» (366 veces visto, 2.º en clics) daba error; ahora lleva a `/calcular-tarifa/`. Las demás direcciones viejas que salen siguen funcionando.
- Artículos que salen de aquí: **tanda S** en el punto 3 de `docs/PLAN_MARKETING.md`.
