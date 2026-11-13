# Guion de la prueba completa de facturación (diciembre 2026)
_Para la oficina (Carmen) con Fernando. Fecha propuesta: **entre el 15 y el 18 de diciembre**. Tiempo: unas 2 horas._

**Dónde**: en la **app naranja** (pruebas): https://ferjusanz-pruebas.fernandosanzalba.workers.dev
- No en el Modo prácticas morado: allí no salen Facturas, Caja ni Banco.
- En la naranja **no se envía nada a nadie** y las facturas salen «PRUEBA-…» y «SIN VALOR FISCAL».
- Entrar con un usuario de pruebas de **oficina o admin** (los `…@pruebas.invalid`; la contraseña la da Fernando en persona, nunca por el chat).

Ir marcando cada casilla. Si algo no sale como dice, **apuntarlo en la tabla del final** (con captura) y seguir.

---

## 0. Antes de empezar
- [ ] La cabecera es **naranja** y pone PRUEBAS.
- [ ] Más → «🏢 Datos de la empresa»: FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., B87446670, C/ Carare, 2 – 28033 Madrid.
- [ ] Elegir **3 clientes** «(en pruebas)» con datos completos (NIF, dirección, CP, localidad): los llamamos **A**, **B** y **C**. Y **1 cliente sin NIF** (lo llamamos **D**).

## 1. Pedidos
- [ ] «✍️ Apuntar pedido» para **A**: 3 o 4 productos, total pequeño (**menos de 200 €**). Uno de ellos a propósito «No hay».
- [ ] Pedido para **B**: unos 300 € (se pagará por **transferencia**).
- [ ] Pedido para **C**: **más de 1.000 €** (p. ej. muchos kg de naranja de zumo) para probar el límite del efectivo.
- [ ] Pedido para **D** (sin NIF): cualquiera, pequeño.

## 2. Preparar y repartir
- [ ] «📋 Preparar»: poner pesos reales y comprobar que todos los productos tienen **precio** (si falta, sale en rojo).
- [ ] «🚚 Hoja de carga»: salen los 4 pedidos.
- [ ] Marcar los 4 como **Entregados** (Modo reparto o «✅ Entregas»).
  - [ ] **A**: cobro **al contado en EFECTIVO**.
  - [ ] **B**, **C** y **D**: **pendiente** de cobro.
- [ ] Abrir el **albarán** de A: el «No hay» sale como **«No servido»**, sin precio. La copia **rosa** se ve en pantalla.

## 3. Facturas
Más → «🧾 Facturas (desde la app) · PRUEBAS» → pestaña «📥 Por facturar».
- [ ] **A**: elegir su albarán → mirar la vista previa (cliente, NIF, líneas, IVA por tipo, total) → forma de pago **Efectivo** → Emitir. Sale **PRUEBA-…** Apuntar el número: ________
- [ ] Abrir el **PDF** de la factura de A: sello de la empresa, datos del cliente, código y lote de cada producto, desglose por IVA, forma de pago, «SIN VALOR FISCAL». El «No servido» **no** aparece.
- [ ] **B**: Transferencia con plazo (30 días) → Emitir. Número: ________ Total: ________ € (**darle este total a Claude** para el fichero del banco).
- [ ] **C** (más de 1.000 €): intentar **Efectivo** → la app **no debe dejar** (Ley 7/2012). Emitir con **Transferencia**. Número: ________
- [ ] **D** (sin NIF): la app **no debe dejar** facturar y debe decir qué falta.
- [ ] Intentar facturar otra vez el albarán de A: **no debe dejar** (ya facturado).

## 4. Rectificativa (corregir una factura)
- [ ] En «🧾 Emitidas», abrir la factura de **B** → Rectificar → cambiar el **precio** de una línea → motivo «Precio equivocado en …» → Emitir. Sale **PRUEBA-R…** con solo la **diferencia**. Número: ________
- [ ] La factura original de B sigue ahí, sin cambios (**una factura nunca se borra**).

## 5. Caja (efectivo)
Más → «💵 Caja (efectivo) · PRUEBAS».
- [ ] El cobro en efectivo de **A** ya está como **entrada**, solo (no hay que apuntarlo).
- [ ] Apuntar una **salida** de prueba: «Gasolina furgoneta», 40 €, **sin** justificante.
- [ ] Después, **añadir el justificante** (una foto cualquiera): queda marcado con fecha y quién.
- [ ] **Corregir** el importe de la salida (con motivo) y ver que queda registrado el cambio. No hay botón de borrar: se **anula** con motivo.

## 6. Banco (transferencia)
Más → «🏦 Banco · PRUEBAS».
- [ ] Subir el **fichero de prueba** que prepara Claude ese día (lleva la transferencia de **B** y la de **C**).
- [ ] La app **propone** cliente y factura de cada movimiento. Confirmar los correctos y corregir el que falle.
- [ ] Subir el mismo fichero otra vez: **no debe duplicar** movimientos.
- [ ] Al confirmar la de **B** (importe exacto): sale «factura marcada como COBRADA». Más → «📄 Facturas de clientes»: la de B sale **Cobrada 🏦**, con la fecha del banco.
- [ ] Si la de **C** no llega entera (importe distinto): la app **avisa** «el importe no cuadra» y la factura sigue **pendiente**.
- [ ] En el Banco, abrir el de B → «↩️ Dejar sin confirmar» con motivo: la factura vuelve a **Pendiente** y dice quién, cuándo y el motivo. Volver a confirmarlo.

## 7. Listados para Jorge
Más → «📤 Informes para Jorge», mes de **diciembre**.
- [ ] **VENTAS**: salen las facturas PRUEBA de A, B, C y la rectificativa, **una fila por tipo de IVA**, con fecha, nº, nombre, NIF, CP, concepto, base, % IVA, cuota y total. Sale el aviso de que son de prueba («no mandar»).
- [ ] Ningún aviso rojo ⛔ de IVA (si sale, apuntarlo).
- [ ] **COMPRAS**: salen las facturas de proveedores con NIF e IVA.
- [ ] **Caja**: la entrada de A y la salida de gasolina corregida.
- [ ] **Banco**: los movimientos confirmados con cliente, NIF y factura.
- [ ] Descargar Excel y PDF: se abren bien en el móvil.
- [ ] **No** pulsar «📧 Enviar a Jorge» (en la naranja no envía, pero es la costumbre buena).

## 8. Cierre
- [ ] Rellenar la tabla de abajo y pasársela a Claude (foto o texto).
- [ ] Fernando decide si hace falta **repetir** alguna parte cuando Claude lo arregle.

| Paso | Qué pasó (fallo o duda) | Captura |
|---|---|---|
| | | |
| | | |
| | | |
