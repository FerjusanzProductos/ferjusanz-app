# Texto para empezar el chat: facturación, fase 2 (facturas emitidas)

Copiar y pegar en un chat nuevo de Claude Code:

---
Claude, una sola tarea: **fase 2 de facturación — hacer las facturas desde la app, en PRUEBAS** (app naranja, con su propia base de datos).

Lee primero `docs/ESTADO_ACTUAL.md`, `docs/REGLAS_INTERNAS.md`, `docs/PENDIENTES.md` (apartados de facturación) y `docs/PLAN_FACTURACION.md` (fase 2).

Lo que quiero:
- Facturas **desde los albaranes entregados** (una factura puede juntar varios albaranes del mismo cliente).
- **Numeración 2027-0001**, seguida y sin huecos. En pruebas, serie aparte «PRUEBA» con la marca «SIN VALOR FISCAL».
- **Rectificativas** (serie propia, que digan a qué factura corrigen y por qué). Una factura emitida no se borra ni se cambia: se rectifica.
- **Concepto**, desglose **por producto** y **por tipo de IVA** (base, %, cuota y total de cada tipo).
- **Forma de pago** (contado, transferencia, efectivo…) con el **límite del efectivo** (1.000 € entre empresas o profesionales): que avise y no deje pasarlo.
- **PDF con el sello** y los datos de la empresa y del cliente (los de la fase 1), y avisar si al cliente le faltan NIF, dirección o CP.

Antes de cambiar la base de datos, enséñame el SQL y explícamelo. **No publiques en la normal** hasta que escriba «Autorizo publicar». No crees facturas reales: solo en pruebas.
---
