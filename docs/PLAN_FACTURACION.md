# Plan: facturar desde la app (y dejar Golden Soft)
_Recogido de lo que habló Fernando con **Jorge Ruiz Onetti** (contable), 12–13/11/2026. Varias sesiones: **una fase por sesión**._

## Decisión y fechas
- **Se puede facturar desde la app** (Jorge). Según Jorge, **Verifactu no sería obligatorio hasta octubre de 2028** y probablemente se retrase más (en la UE se va a factura electrónica). ⚠️ Pedir a Jorge que lo confirme por escrito cuando haya norma publicada; **la app se hará preparada para Verifactu** igualmente (numeración sin huecos, sin borrar facturas, registro de cada factura) para no rehacerla.
- **Hasta el 31/12/2026: Golden Soft y la app en paralelo.**
- **Desde el 1/1/2027: se factura en la app** y se deja Golden. La numeración de la app empieza en 2027.
- Jorge sigue haciendo los **libros de registro** (emitidas y recibidas) con lo que le mandemos. Control **mensual** y **trimestral**.

## 1. Requisitos de cada factura emitida
1. **Emisor (nosotros), siempre completo**: FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · NIF **B87446670** · dirección completa con CP **28033** (Madrid) · teléfono de la empresa · correo **ferjusanz@hotmail.com**. ✔️ Confirmado por Fernando (12/11/2026): C/ Carare, 2 – 28033 Madrid (también domicilio fiscal) y 91 763 21 86.
2. **Receptor (cliente), siempre completo**: nombre o razón social, NIF/CIF, dirección con CP, teléfono y correo. La app **no deja emitir** la factura si falta nombre, NIF o dirección con CP (avisa de lo que falte).
3. **Fecha de factura** = fecha en que se **emite** (la pone la app sola).
4. **Número correlativo por año**, sin huecos, que lleve el año: p. ej. **2027-0001**, 2027-0002… Cada 1 de enero empieza de cero. **Una factura nunca se borra**: si está mal se hace una **rectificativa** (serie propia, p. ej. **R2027-0001**) que dice a qué factura corrige y por qué.
5. **Concepto**: «Venta de fruta», «Venta de verdura», «Venta de patata» (y huevos), según lo vendido.
6. **Importes**: en **cada producto**: base, % de IVA, cuota de IVA y total. Al final, **resumen por cada tipo de IVA** (base, cuota) y total de la factura.
7. **Firmada o sellada**: el PDF lleva el sello de la empresa. **Sello = la cabecera de los albaranes de papel tal cual** (Fernando, 12/11/2026): FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., «Mayoristas de patatas, frutas y verduras», teléfonos, móviles (609 100 690 y 616 439 157; **sin el 609 567 354**, que es el de Fernando y no es administrador), Carare, 2 - 28033 Madrid y correo. La app lo dibuja con los datos de la empresa.
8. **Forma de pago**: efectivo, transferencia, tarjeta… **Efectivo (Ley 7/2012, art. 7)**: si la operación llega a **1.000 € o más**, con empresa o autónomo, **no se puede pagar nada en efectivo**, ni una parte (corregido 12/11/2026; antes decía «máximo 1.000 €»). La app bloquea el efectivo en esas operaciones y suma los pagos parciales. ⚠️ Jorge: qué cuenta como «operación» en una factura mensual.
- **Siempre controladas** las facturas emitidas y las recibidas.
- **Datos del Registro Mercantil, obligatorios** (art. 24 del Reglamento del Registro Mercantil), dados por Fernando el 12/11/2026: Registro Mercantil de Madrid, Tomo 34.358, Folio 101, Sección 8.ª, Hoja M-618046, Inscripción 1.ª. Domicilio: **C/ Carare, 2 — 28033 Madrid**. ⚠️ Comprobar con nota simple o escritura y que Jorge confirme el domicilio fiscal. Van en la fase 1 (ficha de empresa).

## 2. Listados para Jorge (compras y ventas, mismo formato)
Dos listados: **VENTAS** (facturas emitidas) y **COMPRAS** (facturas recibidas). Columnas, en este orden:

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| Fecha factura | Nº factura | Nombre cliente/proveedor | CIF/NIF | Código postal | Concepto | Base imponible | Tipo de IVA (%) | Cuota de IVA | Total |

- **Una fila por cada tipo de IVA** de cada factura (si una factura lleva 4 % y 10 %, salen dos filas). Totales por tipo de IVA al final. Vale para todo.
- Las **facturas de proveedores** guardan NIF, CP y el desglose de IVA desde la fase 3 (13/11/2026; en pruebas).
- **Concepto en COMPRAS: «Compra de mercaderías»** (confirmado por Jorge, 13/11/2026).
- En Excel. Mensual y trimestral.
- **Formatos (Fernando, 12/11/2026)**: **Excel** (para editar u ordenar si hace falta), **CSV** y **PDF** (para verlas). Los tres en cada listado.

## 3. Banco (Norma 43)
- Jorge registra el banco con el formato **Norma 43** (el banco lo da también en Excel; **un movimiento por línea**).
- Problema: cuando alguien paga **no se sabe de quién es ni el concepto**.
- La app debe: **leer el fichero Norma 43 / Excel del banco**, y en cada movimiento poner **nombre, NIF y CP** del cliente o proveedor y la factura que paga (proponer sola el emparejamiento por importe y nombre, y que la oficina lo confirme).

## 4. Caja (efectivo)
- Hoy Carmen manda «Debe = lo que entra en caja / Haber = lo que sale de caja». Jorge **solo quiere**:
  - **Entra efectivo**: fecha, cuánto, **de quién** (y qué factura).
  - **Sale efectivo**: fecha, cuánto, **a quién** (y qué factura o justificante).
- A veces el justificante llega **después** (gasolina, etc.): se debe poder apuntar la salida y **enlazar la factura más tarde**, quedando marcado lo que cambió.

## 5. Otros
- **Fichajes**: ya están en la app (se le pasan a Jorge en «Informes para Jorge»).
- Pregunta 4 de la reunión: queda resuelta con este plan.

## 6. Clientes «sin IVA» — ⚠️ decisión pendiente de Fernando
- Jorge recomendó separar aplicaciones; Fernando teme que se pierdan pedidos o que los empleados se líen, y propone que esos pedidos no lleguen a Jorge ni a facturación.
- **Claude no puede montar en la app una parte de ventas que no se factura ni llega al contable**: una venta sin factura ni IVA declarado es un riesgo fiscal serio, y la ley antifraude (Ley 11/2021) **prohíbe los programas de facturación que permiten ocultar ventas** (multas de hasta 50.000 € al usuario por cada ejercicio).
- **Recomendación de Claude**: una sola app y **todas las ventas facturadas**. Si a esos clientes se les quiere mantener el precio, se baja el **precio de venta** (y la factura sale con su base y su IVA). Hablarlo con Jorge.

## Fases (una por sesión)
1. **Datos fiscales**: ficha de la empresa (emisor) y ficha de clientes completa (NIF, dirección, CP, teléfono, correo); lista de clientes a los que les falta algo. ✔️ Hecho en PRUEBAS (v252, 12/11/2026): «🏢 Datos de la empresa» con sello y «🧾 Clientes sin datos para facturar». Publicado en la normal (v255) y tabla `empresa` creada en las dos bases (12/11/2026). ✔️ Terminada.
2. **Facturas emitidas** en PRUEBAS: numeración 2027-NNNN, rectificativas, concepto, desglose por producto y por tipo de IVA, forma de pago con el límite de efectivo, PDF con sello. Desde los albaranes entregados. ✔️ Hecho en PRUEBAS (v259, 12/11/2026), falta que lo pruebe Fernando. Ver `docs/HISTORIAL.md`.
3. **Facturas recibidas**: guardar NIF, CP y desglose de IVA del proveedor (el lector ya lee la factura). ✔️ Hecho en PRUEBAS (v263, 13/11/2026); código publicado en la normal (v264) pero oculto hasta crear las tablas en la base real.
4. **Listados para Jorge** (ventas y compras, 10 columnas, mensual y trimestral) dentro de «Informes para Jorge». ✔️ Hecho en PRUEBAS (v267, 13/11/2026): Excel (.xlsx), PDF y CSV; ventas de Golden en 2026 y de la app desde 2027. ✔️ Publicado en la normal (v268) con comprobación del tipo de IVA en cada fila.
5. **Caja**: entradas y salidas de efectivo, de quién / a quién, con justificante que puede llegar después. ✔️ Hecho en PRUEBAS (v273): Más → «💵 Caja (efectivo)», apuntes que no se borran (corregir/anular con motivo y registro de cambios), cobros en efectivo de albaranes automáticos, informe «💵 Caja» en «Informes para Jorge». SQL ya en la base de pruebas (13/11/2026); falta que lo prueben Fernando y Carmen.
6. **Banco**: importar Norma 43 / Excel y emparejar cada movimiento con cliente o proveedor. ✔️ Hecho en PRUEBAS (v279, 13/11/2026): Más → «🏦 Banco», propuesta automática por nombre e importe, confirmar o corregir con registro de cambios, sin duplicados, informe «🏦 Banco» para Jorge. SQL ya en la base de pruebas (13/11/2026). Publicado en la normal (v285); falta el SQL en la base real y probarlo con un fichero real del banco.
7. **Paso a 2027**: prueba completa en Modo prácticas en diciembre, «Autorizo publicar» y empezar el 1/1/2027.
8. Verifactu cuando sea obligatorio (Registro Mercantil pasa a la fase 1).

**Antes de la fase 2 (revisión del 12/11/2026)**: separar la base de datos de pruebas de la normal, contadores de prueba aparte (serie «PRUEBA» con marca «SIN VALOR FISCAL») y copias de seguridad comprobadas. Ver `docs/PENDIENTES.md`, apartado «Facturación 2027: lo que falta».
