# Texto para empezar el chat: facturación, fase 3 (facturas recibidas)

Copiar y pegar en un chat nuevo de Claude Code:

---
Claude, una sola tarea: **fase 3 de facturación — facturas recibidas (de proveedores), en PRUEBAS** (app naranja, con su propia base de datos).

Lee primero `docs/ESTADO_ACTUAL.md`, `docs/REGLAS_INTERNAS.md`, `docs/PENDIENTES.md` (apartados de facturación) y `docs/PLAN_FACTURACION.md` (fase 3 y apartado 2, listados para Jorge).

Lo que quiero:
- Que cada factura de proveedor guarde **NIF, código postal y el desglose de IVA** (base, %, cuota y total de cada tipo), además de fecha, nº y total.
- Que el **lector de facturas** lo rellene solo y que la oficina pueda corregirlo.
- Que avise si al proveedor le falta NIF o CP, o si la suma del desglose no cuadra con el total.
- Dejarlo listo para la fase 4 (listado de COMPRAS para Jorge: una fila por tipo de IVA).

Antes de cambiar la base de datos, enséñame el SQL y explícamelo. **No publiques en la normal** hasta que escriba «Autorizo publicar». Las facturas de proveedores son datos reales: no borres ni cambies ninguna sin preguntarme.
---
