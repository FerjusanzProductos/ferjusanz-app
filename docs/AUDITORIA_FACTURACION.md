# Auditoría inicial: facturación, VERI*FACTU y Golden Soft
_11/11/2026 · Claude · Solo diagnóstico: **no se ha cambiado nada** en la app ni en la base de datos (solo consultas de lectura)._
_Leyenda: ✅ comprobado en el código o en la base · 📝 sacado de los documentos · ⚠️ por confirmar (Fernando, Carmen, Jorge o Golden Soft)._

> **No es asesoramiento fiscal.** Todo lo legal de este documento debe revisarlo Jorge (o un asesor fiscal). Ningún punto de este informe declara que algo «cumple VERI*FACTU».

---

## A. Qué tenemos ahora

### Quién factura hoy
- **El único emisor de facturas es Golden Soft.** ✅ La app no emite facturas: la regla interna dice «se factura siempre en Golden Soft, no desde la app» 📝 y en el código no hay ninguna función que cree facturas fiscales ✅.
- Carmen teclea en Golden mirando la **copia ROSA** del albarán (nombre interno + código de Golden). Es decir: **hoy se escribe dos veces** (app → Golden). 📝
- La app **todavía no se usa de verdad** (contador a cero): ahora mismo hay **0 albaranes, 0 cobros y 0 facturas de clientes** apuntados en la app ✅.

### Lo que la app ya tiene y se puede aprovechar
| Pieza | Estado | Comentario |
|---|---|---|
| Clientes (1.097 fichas, 177 activos) | ✅ existe | Tiene NIF, dirección, forma de pago, días de pago, correo, «recargo de equivalencia» y «sin IVA». |
| Productos (711) con IVA por producto | ✅ existe | 197 activos al 4 % y 11 al 10 %. **El IVA de 508 productos no tiene origen revisado** (solo 136 vienen de Golden y 38 puestos a mano). |
| Pedidos → preparación con **peso real** → entrega → albarán | ✅ existe | Peso pedido y peso real por línea, precio, IVA por línea, firma del cliente, lotes (trazabilidad). |
| Numeración de albaranes (serie F) | ✅ preparada | Contador `albaran_f_seq` sin estrenar; empezará donde diga Fernando. |
| «Albaranes facturados» (marcar que un albarán ya pasó a factura de Golden) | ✅ existe | Se pueden agrupar varios albaranes de un cliente y apuntar el número de factura de Golden. |
| Lista de «facturas de clientes» | ✅ existe | Es solo una **lista de control** (número, importe, pagada sí/no). **No es una factura fiscal**: se puede borrar y cambiar desde la app. |
| Cobros por albarán | ✅ existe | Con forma de pago, quién cobra y protección contra cobros repetidos (clave). |
| Copia del **historial de Golden** (2.257 facturas y 32.067 líneas, del 13/01 al 22/10/2026) | ✅ existe | Se usa para consultar y para «lo de siempre». **No se actualiza sola** (última factura: 22/10/2026). |
| Informes para Jorge (Excel mensual) | ✅ existe | Facturas emitidas (de Golden), recibidas, cobros y albaranes sin facturar. |
| Facturas de proveedores (101 recibidas, lector con IA) | ✅ existe | Sirve para costes; no es un libro de compras oficial. |
| Registro de cambios (quién y cuándo) | ✅ existe | Tabla `historial` (13.357 cambios) en 34 tablas, incluida la de albaranes. |
| Permisos por rol en la base (RLS) | ✅ activado | Pero hay **5 administradores** de 7 usuarios activos: demasiados para manejar facturas. |
| Copia de seguridad nocturna | 📝 existe | Solo los datos (esquema `public`) y usuarios. **No copia** fotos, PDF ni audios, ni la carpeta `copias`. ⚠️ No está comprobado que se ejecute ni que se pueda restaurar. |

### Lo que se ve en Golden (copia en la app) ⚠️ revisar con Jorge
Series de Golden: **P** («Serie PC», la principal), **F1** («Facturas Fernando»), **D** («FSH con IVA»), **R** (rectificativas) y **BOR** (borradores).
- Serie P: casi todo al **4 %** (fruta y verdura), algo al 10 % y 21 %, y **una línea al 2 %**.
- **Serie F1: 2.752 líneas al 0 % de IVA en 2026** (≈ 61.600 €). La fruta y la verdura van normalmente al 4 %; el 0 % solo se aplica en casos concretos (por ejemplo, ventas fuera de España). **Hay que preguntarle a Jorge por qué**: puede ser algo correcto, un error de configuración en Golden o un fallo al copiar los datos.

### Punto delicado: los clientes «sin IVA» (azul)
La app tiene clientes marcados «sin IVA» a los que se resta un «Descuento por productos» igual al IVA, y los documentos lo describen como «privado, no va a la gestoría» 📝.
**Esto hay que revisarlo con Jorge antes de montar nada de facturación.** Con VERI*FACTU, cada factura queda registrada, encadenada y comunicada a Hacienda, y la ley antifraude prohíbe los programas que permitan ocultar o alterar ventas (art. 29.2.j de la Ley General Tributaria, con multas de hasta 50.000 € al usuario y 150.000 € al fabricante del programa, art. 201 bis). Si es un descuento comercial real, debe ir en la factura y el IVA se calcula sobre el precio ya descontado. **Claude no va a programar nada que sirva para dejar ventas fuera de la contabilidad.**

---

## B. Qué nos falta para cumplir (si la app emitiera facturas)
Si **seguimos facturando en Golden**, a la app **no le hace falta casi nada de esto**: lo cumple (o debe cumplirlo) Golden.
Si **la app emitiera facturas**, faltaría **todo** lo siguiente:
1. Facturas con numeración correlativa por serie, imposible de duplicar entre dos personas a la vez, y bloqueadas contra cambios y borrados.
2. Facturas completas, simplificadas, rectificativas (y por sustitución), con todos los datos del Reglamento de facturación (RD 1619/2012).
3. Registros de facturación VERI*FACTU (alta y anulación), huella (hash) encadenada, QR y leyenda «VERI*FACTU», envío a la AEAT con certificado electrónico desde un servidor seguro, cola de envíos, reintentos y respuestas guardadas (RD 1007/2023, Orden HAC/1177/2024 y especificaciones técnicas de la AEAT).
4. **Declaración responsable** del fabricante del programa (seríamos nosotros).
5. Recargo de equivalencia si hay clientes minoristas que lo tengan (hoy ningún cliente lo tiene marcado ✅; ⚠️ confirmar con Jorge, p. ej. fruterías como «Frutas Pedro»).
6. Fichas de clientes fiscalmente completas: **92 de 177 clientes activos no tienen NIF** y hay **22 NIF repetidos** en varias fichas ✅.
7. Revisar el IVA de cada producto (ahora muchos sin revisar).
8. Copias de seguridad probadas, también de PDF y fotos; conservación de facturas 4 años (6 a efectos mercantiles) ⚠️ confirmar con Jorge.

### Fechas legales (comprobado el 11/11/2026)
- **Vigente en el BOE**: VERI*FACTU obligatorio para sociedades el **1/1/2027** (Real Decreto-ley 15/2025). ✅ según varias fuentes; ⚠️ confirmarlo en boe.es.
- **Anunciado, pero aún no publicado en el BOE**: Hacienda dijo el 5/10/2026 que lo retrasará a **octubre de 2028**. Hasta que salga en el BOE, **hay que contar con el 1/1/2027** (menos de 2 meses).
- **Factura electrónica entre empresas** (Ley «Crea y Crece»): obligación distinta de VERI*FACTU. ⚠️ fechas a confirmar con Jorge.
- **SII**: solo para empresas con más de 6 millones de facturación o inscritas en el REDEME. Por lo que se ve en Golden (≈ 0,76 M€ de ene. a oct.), **no parece aplicable**. ⚠️ confirmar con Jorge.

---

## C. Qué podemos aprovechar de Golden Soft
- Golden Soft (Madrid, desde 1985; ahora del grupo **TeamSystem**) dice en su web que su **Facturación .Net está adaptada a VERI*FACTU desde julio de 2025**. Es lo que dice el fabricante: ⚠️ hay que comprobar que **nuestra versión** está actualizada y el módulo activado.
- Golden también tiene **Contabilidad .Net** (libros, IVA, asientos) y otras empresas ya se conectan a él (p. ej. Inmatic para facturas y asientos). **No hay API pública documentada**: ⚠️ preguntar a Golden si su facturación **importa albaranes o facturas desde Excel/CSV/ASCII**.
- La app ya tiene la **copia del historial de Golden** (facturas y líneas). Se puede usar para conciliar: «¿este albarán ya está facturado en Golden?».

---

## D. Recomendación: la opción más segura, barata y sencilla
**Golden Soft sigue siendo el ÚNICO que emite facturas. La app NO emite facturas.**

| | Opción 1 (recomendada): Golden factura, la app prepara | Opción 2: la app factura con VERI*FACTU propio |
|---|---|---|
| Riesgo legal | Bajo: la responsabilidad del programa es de Golden | Alto: seríamos «fabricantes» del programa (declaración responsable, multas de hasta 150.000 €) |
| Tiempo | Semanas | Muchos meses + pruebas con la AEAT; **no llega al 1/1/2027** |
| Coste | Lo que ya se paga a Golden (+ posible módulo de importación) | Certificado, servidor, mantenimiento cada vez que cambie la norma, revisión legal |
| Carmen | Deja de teclear dos veces (si Golden importa) | Cambia de programa |
| Jorge | Sigue igual (Golden) | Habría que darle otro sistema |

Cómo sería la Opción 1:
1. Pedido → preparación (peso real) → entrega → **albarán en la app**.
2. Al cierre (diario, semanal, quincenal o mensual, según el cliente), la app hace una **«prefactura»** (borrador, sin número fiscal) agrupando los albaranes pendientes.
3. **Exportación a Golden** (si Golden lo permite) o pantalla de ayuda para Carmen con todo listo para teclear.
4. Golden emite la factura (numeración, VERI*FACTU, QR, envío a Hacienda).
5. La app recoge el número de factura de Golden y marca los albaranes como **facturados** (ya existe), para que **no se puedan facturar dos veces**.
6. Cobros y deudas en la app, enlazados a la factura de Golden. Jorge sigue recibiendo los libros de Golden + los Informes para Jorge.

---

## E. Qué necesito de vosotros
**De Fernando**
1. ¿Vamos con la Opción 1 (Golden factura, la app prepara)?
2. Hablar con Jorge del punto «clientes sin IVA» y de la serie F1 al 0 %.
3. ¿Cuándo se empieza a usar la app de verdad?

**De Carmen** (mirando Golden, sin tocar nada)
4. Nombre exacto y versión de Golden (Ayuda → Acerca de), y si es la «Facturación .Net».
5. ¿Está activado VERI*FACTU en Golden? ¿Sale un QR en las facturas?
6. ¿Golden permite **importar** (clientes, albaranes, facturas, cobros) desde Excel/CSV? ¿Y **exportar** facturas, cobros y libros?
7. ¿Para qué es cada serie (P, F1, D, R, BOR)? ¿Cada cuánto factura a cada cliente?
8. Teléfono o correo del soporte de Golden (para preguntarles lo de la importación).

**De Jorge**
9. Confirmar las fechas de VERI*FACTU y factura electrónica que nos afectan, y que el SII no aplica.
10. IVA de la serie F1 (0 %), la línea al 2 % y los clientes «sin IVA».
11. ¿Qué clientes llevan recargo de equivalencia?
12. ¿Qué formato quiere los datos (Excel, fichero de Golden…)? ¿Lleva él la contabilidad en Golden Contabilidad .Net?

---

## F. Riesgos si desarrollamos nuestro propio sistema de facturación
1. **Responsabilidad legal**: seríamos el fabricante del programa y respondemos de que cumpla (multas de hasta 150.000 € por ejercicio; al usuario hasta 50.000 €).
2. **Doble emisión**: si la app y Golden emiten a la vez, la misma venta puede salir en dos facturas declaradas.
3. **Plazo**: no da tiempo a tenerlo probado con la AEAT antes del 1/1/2027.
4. **Mantenimiento**: la AEAT cambia esquemas y validaciones; hay que estar al día siempre.
5. **Certificado electrónico**: guardarlo y usarlo con seguridad (nunca en el móvil ni en el navegador).
6. **Datos de partida flojos**: 92 clientes activos sin NIF, NIF repetidos, IVA de productos sin revisar.
7. **Una sola persona técnica (Claude) y sin pruebas automáticas**: la app es un único archivo de más de 1 MB.
8. **Copias**: falta copiar los PDF y fotos, y probar una restauración.
9. **Comparten base de datos** la app de pruebas y la normal: no sirve para probar facturas fiscales.

---

## Mejoras sin riesgo que se podrían hacer después (con tu autorización)
- Limpiar fichas de clientes: NIF que faltan y duplicados (solo avisos, sin borrar nada).
- Pantalla «Albaranes pendientes de facturar» con prefactura por cliente y periodo.
- Exportación a Golden (cuando sepamos qué formato acepta).
- Actualizar la copia del historial de Golden cada mes y avisar de albaranes sin factura y de facturas sin albarán.
- Copia de seguridad de PDF y fotos, y prueba de restauración.
- Reducir administradores y crear roles «Administración (Carmen)» y «Contabilidad (Jorge, solo lectura)».

## Fuentes consultadas (11/11/2026)
- Calendario VERI*FACTU vigente (RDL 15/2025) y anuncio de aplazamiento a 2028 (sin publicar en el BOE a mediados de octubre de 2026): noticias.juridicas.com, getquipu.com/blog/verifactu-se-retrasa, afiris.es/verifactu-aplazamiento, erpia.es/verifactu-aplazamiento. ⚠️ Comprobar en boe.es y sede.agenciatributaria.gob.es.
- Golden Soft y VERI*FACTU: goldensoft.com/facturacion-verifactu, goldensoft.com/blog-goldensoft/verifactu-entrada-en-vigor; compra por TeamSystem: muypymes.com (07/03/2025); integración contable: inmatic.ai/compatibilidad/golden-soft.
- Base de datos y código de la app: consultas de solo lectura a Supabase y revisión de `public/index.html` y `supabase/migrations/`.
