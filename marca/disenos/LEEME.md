# Diseños de imprenta y redes (24/11/2026)

Hechos con el logo, las letras (Barlow) y fotos reales de `public/pres/`. Se rehacen con `node marca/disenos/hacer.mjs` (desde la raíz).

| Archivo | Para qué |
|---|---|
| `tarjeta-visita.pdf` | Imprenta: 85 × 55 mm con 3 mm de sangrado. Anverso: la etiqueta granate y oro. Reverso: datos, el móvil de Tito (609 567 354) y un QR que lo llama (Tito, 25/11/2026) |
| `folleto-A5.pdf` | Imprenta: A5 a dos caras, para repartir a cocinas |
| `ofertas-A4.pdf` | Cartel de ofertas para imprimir. **Sale de `web/ofertas.json`**: al cambiar las ofertas de la web, volver a lanzar el script |
| `ofertas-whatsapp.png` | Las mismas ofertas en 1080 × 1350 (WhatsApp, Instagram, estados) |
| `google-ofertas.png` | Publicación de ofertas para la ficha de Google (1200 × 900) |
| `post-*.png` | Tres publicaciones de Instagram (patata pelada, manzana del colegio, un solo proveedor) |
| `vistas/` | PNG de cada página de los PDF, para verlos en el móvil |

## Reglas que cumplen (no cambiarlas sin mirar `docs/FICHA_GOOGLE.md`)
- El móvil de Tito (609 567 354) solo va en la tarjeta de visita (y en `/tarjeta/` de la web), nunca en la ficha de Google ni en lo demás.
- Mismo nombre, teléfono (609 100 690), web y horario que la ficha de Google y la web: Google compara esos datos.
- Sin dirección (la ficha la oculta), sin «puesto en Mercamadrid» (no hay puesto propio), sin «cosecha propia».
- Sin QR de reseñas todavía (la ficha aún no es nuestra) y nunca regalos a cambio de reseñas.
- Precios solo en las ofertas de la semana, con «+ 4 % de IVA».
- Las fotos para la **ficha de Google** van sin texto encima (fotos reales); las imágenes con texto, solo en «Publicaciones».

## Canva (24/11/2026)
Subidos a Canva el logo, la etiqueta y 8 fotos reales. Hechos con su IA: tarjeta (https://canva.link/su4b4ps4wosrixt), folleto (https://canva.link/mce5o41u1srnxco, erratas y botón de WhatsApp corregidos el 24/11), cartel de ofertas (https://canva.link/cftqzer5ibshp4y, es una imagen plana: no se pueden comprobar los precios, no usar) y presentación de 7 diapositivas (https://canva.link/jdth1mbcpl25awd). El plan gratis de Canva se quedó sin créditos de IA tras 4 diseños.

## Precios de VistaPrint consultados (24/11/2026, vistaprint.es, IVA incluido, sin pedir nada)
- Tarjetas de visita mate, gramaje premium, a color por las dos caras: 250 → 32,09 €; 500 → 40,89 €.
- Folleto A5 mate, papel estándar, a color por las dos caras: 250 → 45,59 €; 500 → 57,21 €.
- Las fotos de `public/pres/` son pequeñas (560 px): para el folleto impreso quedan bien en recuadros, pero antes de un pedido grande conviene usar fotos nuevas del móvil.

- Al rehacer los diseños, copiar a `public/marca/` los que use la app (tarjeta, folleto, ofertas y publicaciones; las vistas en JPG de 1080 px) y publicar la app.
