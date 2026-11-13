# Paso a 2027: facturar desde la app (fase 7)
_Preparado por Claude el 13/11/2026. Nada activado: la app normal **no emite facturas** hasta que Fernando escriba «Autorizo» para encenderla._
_Guion de la prueba de diciembre: `docs/GUION_PRUEBA_DICIEMBRE.md`._

## ⚠️ Lo primero: la fecha de Verifactu NO está en el BOE (13/11/2026)
- Hacienda **anunció** el 5/10/2026 pasar Verifactu a **octubre de 2028**, pero a mediados de noviembre **el BOE sigue diciendo 1/1/2027 para las sociedades** (lo dicen varias asesorías que revisaron el BOE; ver fuentes abajo).
- Si el aplazamiento **no sale en el BOE antes de fin de año**, facturar con un programa propio el 1/1/2027 exige que ese programa **ya cumpla Verifactu entero** (huella, QR, envío a Hacienda, pruebas y declaración responsable firmada). Eso **no da tiempo**.
- Además, la regla interna dice que la app **no emite facturas reales sin la declaración firmada** (`docs/REGLAS_INTERNAS.md`). Para empezar el 1/1/2027 sin declaración hace falta que **Fernando y Jorge decidan cambiar esa regla**, y solo si el aplazamiento está publicado.

### Decisión del 22/12/2026 (Fernando con Jorge): ¿se factura con la app el 1/1/2027?
Se enciende **solo si están las 5 cosas**:
1. ✅ El aplazamiento de Verifactu **publicado en el BOE**, y Jorge lo confirma **por escrito**.
2. ✅ Jorge da por escrito el visto bueno a facturar con la app desde el 1/1/2027 (preparada para Verifactu, con la declaración antes de oct. 2028).
3. ✅ La **prueba completa de diciembre** sale bien (guion) y los fallos están arreglados.
4. ✅ Resuelto el tema de los **clientes «sin IVA»** con Jorge (todas las ventas facturadas). Sin esto **no se puede facturar desde la app**.
5. ✅ **Clientes con datos completos** (nombre, NIF válido, dirección, CP, localidad): la app no deja facturar a quien le falte algo.

**Si falta alguna → Plan B**: enero se sigue facturando en **Golden** como siempre, la app sigue en paralelo (pedidos, albaranes, caja, banco) y se vuelve a decidir a final de enero. **Recomendación de Claude: tener el Plan B preparado desde ya** (renovar Golden al menos un trimestre más).

---

## Lista de lo que falta, por persona y fecha

### 🤖 Claude
| Cuándo | Qué |
|---|---|
| ✔️ 13/11 | SQL de la fase 7 preparado y probado en una base de ensayo (ver «Lo que queda listo»). Cambio en la app: el botón «🧾 Facturas» sale en la normal **solo** cuando la base lo diga (hoy, no). App naranja v287. |
| ✔️ 13/11 | Tablas de facturas creadas **apagadas** en la base real («Autorizo»): siguiente **2027-0001**, no se puede emitir nada. |
| 16–30/11 (una por sesión) | Mejoras que pide la prueba: **marcar la factura como cobrada** al confirmar la transferencia en el Banco (hoy se marca a mano); **IBAN** en la factura cuando es por transferencia; **unidad buena** en la factura (manojo, caja, bandeja… en vez de «ud»); **bloquear el efectivo** también al cobrar en la entrega si llega a 1.000 €; «**Cambiar mi contraseña**». |
| Cada lunes hasta el 22/12 | Mirar si el aplazamiento de Verifactu ha salido en el BOE y avisar a Fernando. |
| Día de la prueba (15–18/12) | Preparar el **fichero del banco de prueba** con el importe exacto de la factura de transferencia; acompañar la prueba y apuntar fallos. |
| 18–22/12 | Arreglar los fallos de la prueba en la naranja; «Autorizo publicar» para la normal. |
| 30/12 | Comprobar en la base real (`sif_preparado`): apagada, siguiente **2027-0001** / **R2027-0001**, 0 facturas, empresa completa, 0 clientes activos sin datos. |
| 1–4/1/2027 | **Solo con la decisión del 22/12 en «sí» y «Autorizo» de Fernando**: encender la facturación (un SQL de una línea, se enseña antes). Si no: nada, Plan B. |
| 1.ª semana de enero | Revisar con Carmen las primeras facturas; listados de enero para Jorge (1–10/2). |
| 2027–2028 | Fase 8 (Verifactu): huella encadenada, QR, envío a Hacienda, pruebas. La declaración la firma Fernando o Julián, **nunca Claude**. |

### 👤 Fernando
| Cuándo | Qué |
|---|---|
| ✔️ 13/11 | «Autorizo» dado; Claude lo aplicó en la base real y en la de pruebas. |
| Antes del 20/11 | 🔴 Sacar de Golden la **lista de clientes en Excel** (código, nombre, NIF, dirección, CP, localidad) para cargar los NIF que faltan. |
| Antes del 30/11 | 🔴 Decidir con Jorge los **clientes «sin IVA»** (todas las ventas facturadas; si se quiere, bajar el precio). Sin esto no se factura desde la app. |
| Antes del 30/11 | Hablar con **Golden**: que siga disponible en enero (Plan B) y **cómo guardar todo el histórico** de facturas (hay que conservarlas 4–6 años aunque se deje Golden). |
| Al arrancar la app de verdad | Supabase **Pro** (copias) y el **último nº de albarán** de Golden. |
| 15–18/12 | Estar en la **prueba completa** (guion) o mirarla con Carmen. |
| 22/12 | **Decisión final** con Jorge (las 5 cosas de arriba). |
| Cuando toque (antes de oct. 2028) | Escritura o nota simple (¿administradores solidarios o mancomunados?), certificado de representante (FNMT) y **firmar la declaración responsable**. Eso lo firma Fernando o Julián; Claude solo prepara el programa y las pruebas. |

### 👩‍💼 Carmen (oficina)
| Cuándo | Qué |
|---|---|
| Ya | Clientes → «🧾 Faltan datos para facturar»: completar NIF, dirección, CP y localidad (objetivo: **0 antes del 15/12**). |
| Ya | Compras → «🧾 NIF e IVA»: leer y revisar las facturas de proveedores; poner a mano los NIF que no vengan. |
| Desde el arranque | Apuntar la caja en la app (deja el Debe/Haber) y subir el **primer fichero real del banco**. |
| 15–18/12 | Hacer la **prueba completa** en la app naranja con el guion. |
| Hasta el 31/12 | Facturar **todo diciembre en Golden**. Los albaranes de 2026 **no se pueden** facturar en la app (la base lo impide). |
| Enero | Si se enciende: facturas de enero en la app (la primera, **2027-0001**). Si no: Golden, como siempre. |

### 🧮 Jorge (contable) — mejor por escrito, antes del 15/12
1. ¿Ha salido en el BOE el aplazamiento de Verifactu? ¿Nos da el visto bueno para facturar con la app desde el 1/1/2027 sin la declaración (que se firmaría antes de oct. 2028)?
2. Clientes «sin IVA»: cómo dejarlo todo facturado.
3. ¿Qué es «una operación» para el límite de 1.000 € en efectivo: cada albarán o la factura del mes? (La app usa la factura: lo más prudente.)
4. ¿Factura por entrega o una al mes por cliente? (La app hace la mensual, con todos los albaranes del mes.)
5. Las facturas de diciembre que se hagan en Golden: ¿con fecha 31/12/2026 aunque se hagan en enero?
6. Series: **2027-0001** (ordinarias) y **R2027-0001** (rectificativas), ¿bien?
7. Formato de los informes: ventas y compras (Excel, PDF, CSV), caja y banco (hoy CSV): ¿le valen?
8. Golden: cómo guardar el histórico al dejarlo.

---

## Lo que queda listo (y apagado) para el 1/1/2027

### En la base de datos real — SQL para «Autorizo»
Son dos archivos, en este orden. **No borran ni cambian** pedidos, albaranes, clientes ni facturas.
1. `supabase/migrations/20261113a_facturas_emitidas.sql` (el de la fase 2, el mismo que ya está en pruebas): las tablas de facturas (`sif_*`), la numeración sin huecos, las rectificativas y la regla de que **una factura no se borra ni se cambia**. En la real **nace apagado** (`emision_real_activa = false`).
2. `supabase/migrations/20261116a_facturacion_2027.sql` (nuevo):
   - **Fecha de inicio 1/1/2027**: aunque alguien encendiera la facturación, la base no deja emitir antes.
   - **Albaranes de 2026 → Golden**: la app no deja facturarlos.
   - **Contadores de 2027 preparados**: la primera factura será **2027-0001** y la primera rectificativa **R2027-0001**.
   - `sif_preparado()`: comprobación de que todo está listo (encendido o no, siguiente número, clientes sin datos…).
   - Versión del programa de facturación: **SIF 0.2.0 (sin declaración)**.

Probado por Claude el 13/11/2026 en una base de ensayo con la misma estructura: apagada → no emite; encendida en 2026 → no emite; en 2027 → albarán de diciembre rechazado («se factura en Golden»), albarán de enero → **2027-0001**, rectificativa → **R2027-0001**; borrar una factura → imposible. En la base de pruebas sigue facturando con la serie PRUEBA (también diciembre).

### En la app
- El botón «🧾 Facturas (desde la app)» sale en la **normal** solo cuando la base esté **encendida** y ya sea 1/1/2027. Hoy no sale. En la naranja sigue igual.
- Ojo: en el **Modo prácticas** (morado) **no salen** Facturas, Caja ni Banco. La prueba de diciembre se hace en la **app naranja**.

### Encender (solo el día que se decida, con «Autorizo»)
```sql
update public.sif_config set emision_real_activa = true where id;   -- y comprobar: select public.sif_preparado();
```

## Fuentes (aplazamiento de Verifactu, consultadas el 13/11/2026)
- https://infoemplea2.com/hacienda-preve-aplazar-verifactu-a-octubre-de-2028-pero-el-boe-mantiene-los-plazos-de-2027/
- https://erpia.es/verifactu-aplazamiento
- https://invocash.es/blog/aplazamiento-de-verifactu-a-octubre-de-2028-que-sabemos-y-que-no/
- https://sapi.es/blog/verifactu-se-aplaza-a-octubre-de-2028-nuevas-fechas-que-dice-el-boe-y-que-hacer-ahora
