# Preguntas para Golden Soft y para Carmen
_11/11/2026. Para saber qué puede hacer nuestro Golden antes de conectarlo con la app. Ver `docs/AUDITORIA_FACTURACION.md`._

## 1. Carmen (mirando Golden, sin cambiar nada)
1. Nombre exacto del programa y versión (normalmente en «Ayuda» → «Acerca de»). ¿Es «Facturación .Net»? ¿Contabilidad también en Golden?
2. ¿Las facturas que salen de Golden llevan un **código QR** y la frase «VERI*FACTU» o «Factura verificable en la sede electrónica de la AEAT»?
3. ¿Qué es cada serie: **P** (Serie PC), **F1** (Facturas Fernando), **D** (FSH con IVA), **R** (rectificativas), **BOR** (borradores)? ¿Cuál se usa para qué clientes?
4. ¿Se factura cada albarán o se juntan los de la semana / quincena / mes? ¿Depende del cliente?
5. ¿En Golden hay alguna opción de **Importar** (menús «Utilidades», «Importar», «Enlaces»…)? Hacer una foto de los menús.
6. ¿Cómo se le mandan los datos a Jorge (ficheros, copia de Golden, él entra a Golden…)?
7. ¿Teléfono o correo del soporte de Golden y número de cliente/licencia? (El número de licencia, no contraseñas.)

## 2. Mensaje para el soporte de Golden Soft (lo envía Fernando o Carmen)
> Buenos días. Somos FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., clientes de Golden. Usamos además una aplicación propia para pedidos, pesos y albaranes, y queremos que **Golden siga siendo el único programa que emite las facturas**. Nos gustaría saber:
> 1. Qué versión tenemos y si está **actualizada y adaptada a VERI*FACTU** (y si lo tenemos activado o en qué modalidad).
> 2. Si Golden puede **importar albaranes o pedidos** (o facturas en borrador) desde un fichero **Excel, CSV, ASCII o XML**, y con qué formato exacto (¿tienen una plantilla o un manual?).
> 3. Si puede **importar clientes** y **cobros/vencimientos**.
> 4. Si puede **exportar** facturas emitidas, cobros, vencimientos y libros de IVA (ventas y compras) a Excel/CSV.
> 5. Si tienen **API** o conector oficial para integrar otra aplicación.
> 6. Si las facturas importadas pasan por la numeración, el registro VERI*FACTU y el envío a Hacienda de Golden igual que las tecleadas.
> 7. Coste de cada módulo o servicio necesario.
> Gracias.

## 3. Lo que haremos con las respuestas
- Si Golden **importa**: la app preparará el fichero con los albaranes pendientes de cada cliente (prefactura sin número fiscal) y Carmen lo carga en Golden. Golden numera, registra y envía a Hacienda.
- Si **no importa**: la app enseñará a Carmen la prefactura lista para teclear, en el mismo orden que la pantalla de Golden.
- En los dos casos, la app recoge el número de factura de Golden y marca los albaranes como facturados para que no se facturen dos veces.
