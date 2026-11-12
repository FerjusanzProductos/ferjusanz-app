# Texto para empezar el chat: facturación, fase 6 (banco, Norma 43)

Copiar y pegar en un chat nuevo de Claude Code:

---
Claude, una sola tarea: **fase 6 de facturación — banco (Norma 43), en PRUEBAS** (app naranja, con su propia base de datos).

Lee primero `docs/ESTADO_ACTUAL.md`, `docs/REGLAS_INTERNAS.md`, `docs/PENDIENTES.md` (apartados de facturación) y `docs/PLAN_FACTURACION.md` (apartado 3, Banco, y la fase 6). Mira cómo se hizo la fase 5 (caja) para seguir el mismo estilo.

Lo que quiero:
- **Subir el fichero del banco** (Norma 43, o el Excel que da el banco, un movimiento por línea) desde el móvil.
- Que la app **proponga sola** de quién es cada movimiento (cliente o proveedor, con nombre, NIF y CP) y qué factura paga, por importe y nombre; y que la oficina lo **confirme o corrija**.
- Que no se dupliquen movimientos si se sube dos veces el mismo fichero.
- Un **informe del banco para Jorge** (como el de caja) y añadirlo al envío «📧 Enviar a Jorge por correo».

Antes de cambiar la base de datos, enséñame el SQL y explícamelo. **No publiques en la normal** hasta que escriba «Autorizo publicar». Los movimientos del banco son datos reales: no borres ni cambies nada sin preguntarme.
---

Recordatorio: antes de esta fase, sigue pendiente pegar el SQL de la caja (`20261114a_caja_efectivo.sql`) en la base REAL.
