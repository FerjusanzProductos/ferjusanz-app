# Logo de FERJUSANZ (elegido por Fernando el 16/11/2026)

**Logo de diario: «Amanecer»**. Un sol naranja saliendo sobre el horizonte, con el nombre y lo que vendemos.
**Versión de gala: la etiqueta** granate y oro, con el mismo sol.

| Archivo | Para qué |
|---|---|
| `logo-principal` | Web, facturas, albaranes, presentaciones, correo (sobre fondo blanco o claro) |
| `logo-principal-fondo-oscuro` | Sobre fondo negro u oscuro: camión, fachada, vídeos |
| `logo-principal-una-tinta` | Todo en negro: impresión en blanco y negro, sellos, grabados |
| `perfil-whatsapp-google.png` | Foto de perfil de WhatsApp Business y de la ficha de Google (fondo negro, 1080×1080) |
| `etiqueta` | Tarjetas de visita, cabecera de la tarifa, presupuestos, letrero, portada del catálogo, Navidad. **No** para facturas en blanco y negro (pierde el dorado) |

Cada logo viene en tres formatos:
- **`.pdf`**: para la imprenta (vectorial, con la letra incrustada; se puede ampliar sin perder calidad).
- **`.png`**: para el móvil, la web y las redes (fondo transparente, 3040 px de ancho).
- **`.svg`**: para la web y la app (la letra va dentro; en Illustrator o Inkscape puede salir otra letra: para eso, el PDF).

## Reglas
- Colores: naranja del sol (#f9b233 → #ec6a1e → #c2311d), verde del horizonte #2f7d32, tinta #161210, granate #6b1216, oro (#f6dd9a → #d9a441 → #a8701c).
- Letra: Barlow Condensed (el nombre) y Barlow (la frase), las mismas de la web.
- **No** poner «Mercamadrid» en el logo (no tenemos nave ni puesto propio) ni «Productos hortofrutícolas» (largo y deja fuera los huevos). En las facturas sigue saliendo escrito el nombre completo de la sociedad, como siempre.
- Foto de perfil siempre sobre **negro** (sobre granate el sol se apaga).

## Rehacerlos
`codigo/hacer.mjs` dibuja todas las propuestas y `codigo/final.mjs` saca estos archivos. Necesitan un `fuentes.css` con las letras de `web/public/fuentes/` en base64 (ver HISTORIAL, 16/11/2026).
