# Funcionalidades de la app FERJUSANZ
_Sacadas del historial de GitLab y de los documentos (📝). Versión normal v188. Si algo no cuadra con la app, avisar y corregir aquí._

## Inicio
- Menú corto: lo de cada día en grande arriba y el resto en rejilla, ordenado por uso. Los círculos antiguos siguen disponibles.
- Panel **«Lo de hoy»**: lo pendiente de cada persona (reparto, previstos, preparar, incidencias, deudas de más de 30 días, facturas, móviles nuevos, copia). Solo lee datos.
- **Lupa**: encuentra apartados, ayuda, reglas de productos, equipo, listas, presentaciones y leads.
- Versión visible, botón para cargar la versión nueva (aviso en rojo si el móvil va atrasado) y actualización sola cuando no molesta.
- **Letra grande A+** (115 / 130 / 150 %).
- **🆘 Ayuda**: la persona atascada recibe al momento pasos guiados (IA con la guía de la app) y «Hazlo conmigo» la lleva a la pantalla y le marca el botón. Si no se resuelve, avisa a Fernando por WhatsApp con un enlace a su misma pantalla, la nota, los últimos errores y un audio de hasta 1 minuto. Las peticiones salen en una lista y en «Lo de hoy».

## Pedidos
- **Pedidos fijos** (con repartidor y tipo) que generan **previstos** cada madrugada, 2 semanas por delante. Se confirman ✅ o se quitan ❌ el día antes.
- **Calendario**: los fijos se ven en cualquier fecha futura.
- **Semana**: mover pedidos a otro día con el dedo («solo esta vez» o «siempre») y ordenar el reparto.
- Al apuntar pedidos se reconocen los productos según las reglas internas.
- «Contador a cero» mientras se está en pruebas (`supabase/contador_a_cero.sql`).

## Preparar, carga y compra
- Preparar con **pesos reales**, la etiqueta «📄 Papel» para los clientes que lo quieren impreso y el botón 🗓.
- **Hoja de compra**, con un total de tomate por volumen, y **hoja de carga**: lo único que se imprime.
- **Trazabilidad por lotes**: propone siempre el lote más antiguo, reparte si no llega y deja confirmarlo todo de una vez. El origen consta en el lote (p. ej. melón de Brasil).

## Albaranes y clientes
- Albarán con el nombre comercial para el cliente («Patata esp. freír») y **copia ROSA** en pantalla con el nombre interno y el código para Golden.
- **Envío al entregar**: correo automático desde el Gmail de la empresa y botón de WhatsApp desde el móvil del repartidor. Si no hay móvil, el repartidor lo escribe y queda apuntado.
- **Clientes sin IVA en azul** y con IVA en dorado (solo en las pantallas internas). Línea «Descuento por productos» igual al IVA. Cambio desde Preparar, la ficha o al confirmar previstos.
- **Portal de clientes privado**: albaranes con el descuento restado, «Guardarlo en mi WhatsApp» y recuadro para dejar móvil y correo (la oficina lo revisa y lo pasa a la ficha). QR.
- «Móviles y correos de clientes».

## Compras y facturas de proveedor
- **Lector de facturas** (también escaneadas, con OCR): une líneas partidas, coloca cada fila por la posición de las palabras y prioriza la base imponible.
- Reglas por familia (`fcReglaPatata`, `fcReglaTomate`, `fcReglaCebolla`, `REGLAS_FAM`) y abreviaturas (PIM., TTES., NAR., A.P., P.P.…).
- Función `recibir-factura` y «Leer con IA».
- **Coste del día**: la ganancia compara cada venta con la compra del mismo día y se corrige sola al llegar la factura.
- **⚠️ Raros** (Precios de compra, desde v202): precios de las facturas de proveedor que se apartan de la mediana de los 60 días anteriores (misma unidad); marca en morado los que parecen unidad o producto mal apuntado. Función `panelPreciosRaros` / `precioRaroCalc`. Solo lee.

## Precios, tarifas y listas
- **Tarifas**: pestañas por lista, buscador, ▲▼ por precio, precio a mano y ganancia por kg o por unidad real (caja, bandeja, pieza), en orden alfabético. Productos sin compra enlazada se pueden enlazar.
- **Listas de precios**: envío por WhatsApp o PDF con un diseño elegante. Se permiten productos regalados (por ejemplo perejil a 0,00) avisando.
- Aprobación de precios por WhatsApp (Harvey 2).

## Comercial: Harvey
- **Harvey 1**: escribe mensajes, guiones, ofertas y respuestas a quejas. Consulta clientes, deudas, pedidos, ventas, prospectos y quejas (solo lectura). Alta de cliente provisional con confirmación. No envía nada solo.
- **Harvey 2**: «Hoy, a quién escribir», pedido pegado convertido en borrador, borradores diarios de tarifas para clientes nuevos, ofertas para recuperar clientes (compra + 0,25 €), productos dejados, hora de contacto, pestaña Actividad, venta con visita, confirmar pedidos, presentaciones y listas.
- Mensajes cortos y naturales («mañana», «hoy»): ⚠️ solo en pruebas.

## Secretaría, guía y formación
- Guía «Cómo se pone cada producto» (proveedor → app → albarán → Golden) con fotos y aviso de bienvenida.
- `guia.html`, página de ejemplos con fotos y vídeo (cobro sin IVA, portal) y **Modo prácticas** (desde Mi perfil).

## Solo en la app de pruebas (sin publicar)
- **📈 Suben** (Precios de compra, v203): productos cuya última compra supera la media de los 14 días anteriores y cuánto margen se pierde frente al precio de venta de Golden. Funciones `subidasCalc`, `ventaGolden`, `panelSuben`. Solo lee.
- **Informes para Jorge**: Excel del mes con facturas emitidas y recibidas, cobros, albaranes sin facturar y jornada. Comprueba Golden y las facturas sin revisar, enseña el resumen antes de compartir y tiene una lista de cierre de mes y tarea en Secretaría (días 1 a 10).

## Sistema
- Funciona sin conexión (`sw.js`). App de pruebas inconfundible (naranja, «Ferjusanz PRUEBAS»).
- Arreglos de pantalla: «modo ordenador» del móvil en Android y tamaño correcto en iPhone.
- Copia nocturna de la base de datos en GitLab.
