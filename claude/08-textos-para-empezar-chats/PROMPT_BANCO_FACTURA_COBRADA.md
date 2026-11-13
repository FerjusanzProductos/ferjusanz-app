# Texto para empezar el chat: factura cobrada al confirmar en el Banco

Copiar y pegar en un chat nuevo de Claude Code:

---
Claude, una sola tarea: **que al confirmar una transferencia en «🏦 Banco» la factura del cliente quede marcada como COBRADA sola** (hoy hay que marcarla a mano en «📄 Facturas de clientes»).

Lee primero `docs/ESTADO_ACTUAL.md`, `docs/REGLAS_INTERNAS.md`, `docs/FACTURACION_2027.md` y `docs/GUION_PRUEBA_DICIEMBRE.md` (paso 6).

Lo que quiero:
- Al confirmar un movimiento del banco con su factura, que la factura salga cobrada (y si el importe no cuadra, que avise en vez de marcarla).
- Si se deshace o corrige la confirmación, que vuelva a quedar pendiente, con registro de quién y cuándo.
- Primero en la app naranja para que lo pruebe.

Antes de cambiar la base de datos, enséñame el SQL y explícamelo. No publiques en la normal hasta que escriba «Autorizo publicar».
---
