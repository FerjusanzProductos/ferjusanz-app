# FERJUSANZ como productor de su propio programa de facturación (Verifactu)
_Preparado por Claude el 12/11/2026, solo documentación y diagnóstico. **No se ha firmado nada, no se ha activado la facturación real y no se ha tocado la app ni la base de datos.**_

> ⚠️ **Fuentes**: este entorno no ha podido abrir el BOE ni la sede de la AEAT (la red los bloquea y no se autorizó el acceso).
> Lo que se dice aquí del **art. 13 del RD 1007/2023** y del **art. 15 de la Orden HAC/1177/2024** sale del conocimiento de Claude
> y de búsquedas en webs de asesorías. **Antes de firmar, Jorge (o un asesor) debe cotejarlo con el texto del BOE:**
> RD 1007/2023 → BOE-A-2023-24840 · Orden HAC/1177/2024 → BOE-A-2024-22138.
> Lo único comprobado de verdad por Claude: las huellas de ejemplo de la AEAT (ver `pruebas/sif/huella.mjs`, 6 de 6 bien).

Documentos de esta carpeta:
| Archivo | Qué es |
|---|---|
| `LEEME.md` (este) | Diagnóstico, respuestas a los 9 puntos y qué hace falta para 2027 |
| `DECLARACION_RESPONSABLE_BORRADOR.md` | Borrador de la declaración (**sin firmar, sin valor**) |
| `PRUEBAS_TECNICAS.md` | Pruebas para comprobar cada requisito (ninguna aprobada aún, salvo la de referencia) |
| `../../pruebas/sif/huella.mjs` | Prueba automática de huella, encadenamiento y QR con los ejemplos de la AEAT |

---

## 0. Resumen para Fernando (lo importante en 6 líneas)
1. **Hoy la app NO es un programa de facturación**: solo prepara «prefacturas» y apunta el número de la factura que se hace en **Golden**. Por eso hoy no hay nada que declarar.
2. **El día que la app emita facturas, FERJUSANZ será «productor»** de ese programa (lo hace la empresa para sí misma; Claude es solo la herramienta) y tendrá que **firmar una declaración responsable** en la que dice que cumple. **No se puede firmar hasta que todas las pruebas pasen.**
3. **Fechas**: en el BOE, las sociedades deben usar un programa adaptado desde el **1/1/2027**. Hacienda **anunció** (5/10/2026) pasarlo a **octubre de 2028**, pero, según lo encontrado, **aún no está en el BOE**. Mientras no salga, manda el 1/1/2027.
4. **A día de hoy la app no cumple** (faltan: registros de facturación, huella encadenada, QR, envío a la AEAT, bloqueo de borrado, declaración). Hacerlo bien y probarlo en 7 semanas es **muy justo**.
5. **Recomendación clara**: el 1/1/2027 **seguir facturando con Golden** (pedir a su proveedor su declaración responsable de 2027) **hasta que la app pase todas las pruebas**. La app factura después, en modo **VERI\*FACTU** (envía cada factura a Hacienda al momento: es lo más sencillo y lo más seguro).
6. Multas si se hace mal: hasta **150.000 €** por año como productor y **50.000 €** por año como usuario (art. 201 bis de la Ley General Tributaria).

---

## 1. Quién es el productor y quién firma
- **Productor del programa: FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., NIF B87446670.** Es quien decide, encarga, prueba, publica y usa el programa. Un programa hecho por el propio usuario para sí mismo también tiene productor, y es él (la AEAT lo trata así en sus preguntas frecuentes; ⚠️ confirmar con Jorge).
- **No son productores**: Anthropic (Claude Code es una herramienta para escribir el código, como un editor), Cloudflare ni Supabase (son servicios genéricos de alojamiento y base de datos, no programas de facturación). Se citan como **componentes** en la declaración. ⚠️ Confirmar con Jorge que no tienen que «intervenir» en la declaración (el art. 15 pide que intervengan todos cuando hay componentes de varios productores; aquí lo razonable es que no, porque no producen nada de facturación).
- **Quién firma**: la persona que **representa legalmente** a la S.L.: el **administrador** (único, solidario o mancomunado) o un **apoderado** con poder suficiente. **Claude no sabe quién es**: hay que mirarlo en la **escritura** o en una **nota simple** del Registro Mercantil (Madrid, Tomo 34.358, Folio 101, Hoja M-618046). Si es Fernando Sanz, firma él «en nombre y representación de FERJUSANZ…, como administrador».
- **Cómo se firma**: mejor con **certificado electrónico de representante de persona jurídica** (el mismo que hará falta para enviar las facturas a la AEAT). Firma a mano escaneada también vale como documento, pero el certificado se necesita igualmente.
- **Administradores (Fernando, 12/11/2026): Fernando Sanz Orrillo y Julián Sanz Orrillo.** Si son **solidarios**, firma uno; si son **mancomunados**, los dos. Mirarlo en la escritura.
- **Lo que hace falta**: DNI del que firma, escritura o nota simple con el cargo vigente y, para el certificado de representante (FNMT), un **certificado del Registro Mercantil** de su nombramiento con menos de 15 días.
- **Claude nunca firma.**

## 2. Nombre, código y versión (propuesta, a decidir por Fernando)
| Dato | Propuesta | Por qué |
|---|---|---|
| Nombre del sistema | **FERJUSANZ Facturación** | Corto y claro |
| Código del sistema (IdSistemaInformatico, 2 caracteres) | **FJ** | Lo pide el formato de la AEAT: 2 letras o números |
| Versión | **SIF 1.0.0** (propia del módulo de facturación) | **No** usar la versión de la app (`ferjusanz-v239`): cambia casi a diario y cada cambio obligaría a una declaración nueva |
| Nº de instalación | **FJ-01** | Una sola empresa y una sola instalación |
| Solo VERI\*FACTU | **Sí (S)** | Recomendado: sin firma electrónica de cada registro ni registro de eventos propio |
| Varios obligados tributarios | **No (N)** | Solo factura FERJUSANZ |

**Requisito técnico para que esto funcione**: separar la facturación en **archivos propios** (por ejemplo `public/sif/` y funciones `sif_*` en Supabase) con su propia versión. Así, tocar pedidos, Harvey o el reparto **no cambia** el programa de facturación ni obliga a otra declaración. Hoy todo está en un solo `public/index.html` de más de 1 MB: eso no vale para controlar versiones del SIF.

## 3. Componentes reales (los que hay y los que habrá)
| Componente | Qué hace en la facturación | Estado hoy |
|---|---|---|
| **App web (PWA)** `public/index.html` + `sw.js` | Pantallas para emitir facturas, rectificativas, PDF con QR | Solo prefacturas para Golden |
| **Cloudflare Worker `ferjusanz-productos`** (`src/worker.js`) | Sirve la app al móvil. No guarda facturas | Activo |
| **Cloudflare Worker `ferjusanz-pruebas`** | App de pruebas. **Nunca debe emitir facturas reales** | Activo, y hoy **comparte la base de datos** con la normal ⚠️ |
| **Supabase · base de datos Postgres** (`hvydnjaswdexttogsyen`) | Guardará facturas, registros de facturación, huellas, contador por serie y año; reglas que impiden borrar o cambiar | Solo existen `facturas_clientes` (apuntes de Golden) y `albaranes_facturados` |
| **Supabase · inicio de sesión (Auth)** | Quién emite cada factura (trazabilidad) | Activo |
| **Supabase · Storage** | PDF de facturas y de las declaraciones | Activo; **no tiene copia de seguridad** ⚠️ |
| **Supabase · función nueva `sif-aeat`** (a crear) | Envía cada registro a la AEAT con el certificado y guarda la respuesta | No existe. ⚠️ Comprobar que Supabase permite el certificado cliente; si no, otro servicio |
| **Certificado electrónico de representante** de la S.L. | Identifica a FERJUSANZ ante la AEAT | ⚠️ Saber si existe y quién lo tiene |
| **Servicio web de la AEAT (VERI\*FACTU)** | Recibe los registros | Externo |
| **Función `albaranes-correo` (Gmail)** | Podría mandar el PDF de la factura al cliente | Activo para albaranes |
| **GitLab** (maestro) y **GitHub** (copia) | Código, versiones y copia nocturna de la base de datos | Activo; copia **no probada** ⚠️ |
| **Golden Soft** | Programa de facturación actual (otro productor, su propia declaración) | En uso hasta que la app esté lista |
| Fuera del SIF: Harvey, ayuda 🆘, lector de facturas de proveedor (API de Anthropic) | **No deben intervenir** en emitir facturas | — |

## 4. Diagnóstico de requisitos (estado real a 12/11/2026)
Leyenda: ❌ no existe · ⚠️ existe algo pero no basta · ✅ comprobado

| Requisito (RD 1007/2023 y Orden HAC/1177/2024) | Estado | Qué hay hoy / qué falta |
|---|---|---|
| **Registro de facturación de alta** por cada factura, en el momento de emitirla | ❌ | No hay tabla ni proceso |
| **Registro de anulación** (y subsanación) | ❌ | — |
| **Integridad e inalterabilidad**: nada se borra ni cambia sin dejar rastro | ❌/⚠️ | `facturas_clientes` permite **todo** (leer, crear, cambiar y **borrar**) a usuarios de la app. Hay un registro de cambios (`trg_auditar`), pero no basta |
| **Huella SHA-256** de cada registro | ❌ en la app · ✅ fórmula comprobada | `pruebas/sif/huella.mjs` reproduce los 3 ejemplos de la AEAT |
| **Encadenamiento** con el registro anterior | ❌ en la app · ✅ fórmula comprobada | Igual que arriba |
| **Trazabilidad** (quién, cuándo, desde qué versión) | ⚠️ | Hay usuarios y auditoría; falta guardarlo en cada registro con fecha, hora y huso |
| **Numeración correlativa sin huecos por serie y año** | ❌ | Plan: 2027-0001 y rectificativas R2027-0001 (`docs/PLAN_FACTURACION.md`) |
| **Conservación** (4 años fiscal; 6 años contabilidad, Código de Comercio) y **legibilidad / exportación** | ⚠️ | Copia nocturna en GitLab 90 días (no probada); Storage sin copia; Supabase en plan gratuito |
| **Código QR** y frase «VERI\*FACTU» en cada factura | ❌ | — |
| **Envío a la AEAT** (modo VERI\*FACTU) y control de respuestas | ❌ | — |
| **Datos del sistema dentro de cada registro** (nombre, código, versión, nº instalación, productor) | ❌ | Ver punto 2 |
| **Declaración responsable visible en el programa** | ❌ | Borrador en esta carpeta, sin firmar |
| **Separar pruebas de producción** | ❌ | Las dos apps usan la **misma** base de datos (plan en `docs/PLAN_SEPARAR_PRUEBAS.md`, sin hacer) |
| **No permitir ventas fuera de facturación** (Ley 11/2021) | ⚠️ | Clientes «sin IVA» con «Descuento por productos» igual al IVA: **hay que resolverlo con Jorge antes de facturar desde la app** |
| Contenido de la factura (RD 1619/2012) | ⚠️ | Plan hecho; datos de empresa ya dados, falta comprobar con nota simple |

**Conclusión: hoy NO se puede afirmar que el programa cumple. No hay programa de facturación todavía.**

Comprobación previa importante: **si FERJUSANZ estuviera en el SII** (Suministro Inmediato de Información del IVA), Verifactu no le aplica. ⚠️ Preguntar a Jorge.

## 5. Pruebas técnicas
Ver `PRUEBAS_TECNICAS.md`: unas 40 pruebas en 10 bloques (huella, cadena, inalterabilidad, numeración, QR, envío a la AEAT en el entorno de pruebas de Hacienda, conservación, separación de pruebas, declaración y contenido de la factura). Solo la de referencia de la huella está hecha (✅ 6/6).

## 6. Declaración responsable
Ver `DECLARACION_RESPONSABLE_BORRADOR.md`. Lleva todos los campos del art. 15 de la Orden según Claude (⚠️ cotejar con el BOE). Está marcada **BORRADOR · SIN FIRMAR · SIN VALOR**.

## 7. Cómo guardar las declaraciones de cada versión y enseñarlas en la app (propuesta, nada creado)
**Guardar**:
1. Cada versión firmada, en PDF, en GitLab: `docs/SIF_PRODUCTOR/declaraciones/SIF-1.0.0/declaracion-firmada.pdf` (+ su huella SHA-256 en un `.txt`). Nunca se borra una antigua.
2. Copia en Supabase Storage (carpeta privada `sif-declaraciones/`) y una tabla de solo lectura. SQL **propuesto, no aplicado** (se enseñará y explicará antes, con Fernando delante):
   ```sql
   create table public.sif_declaraciones (
     version text primary key,            -- 'SIF 1.0.0'
     fecha_firma date not null,
     lugar_firma text not null,
     firmante text not null,              -- nombre y cargo
     pdf_ruta text not null,              -- Storage
     pdf_sha256 text not null,
     vigente_desde timestamptz not null,
     vigente_hasta timestamptz            -- null = la actual
   );
   -- Nadie puede borrar ni cambiar filas desde la app; solo añadir (oficina/admin).
   ```
3. Conservar todas al menos **mientras se conserven las facturas** que se hicieron con esa versión (recomendado: 6 años desde la última factura de esa versión).

**Enseñarlas en la app**: menú **Más → ℹ️ Programa de facturación**, visible para todos los usuarios: nombre, código, versión en uso, productor, botón «📄 Ver declaración responsable» (PDF de la versión actual) y «Versiones anteriores». La app **no deja emitir facturas** si la versión en uso no tiene declaración firmada (bloqueo automático).

## 8. Cambios que obligan a revisar o hacer declaración nueva
**Nueva versión del SIF + nueva declaración** (antes de usarla):
- Cualquier cambio en el módulo de facturación: cálculo de importes o IVA, numeración, registros, huella, cadena, QR, envío a la AEAT, anulaciones, rectificativas, PDF de la factura, exportación.
- Cambiar de modo (VERI\*FACTU ↔ no VERI\*FACTU) o pasar a facturar para otras empresas.
- Cambiar un componente: otra base de datos, otro alojamiento, otro servicio de envío, otro certificado o método de firma.
- Cambios de la norma o de las especificaciones de la AEAT que haya que aplicar.

**Revisar la declaración sin cambiar el programa**: cambia el nombre, domicilio o NIF de la empresa, o la persona que firma.

**No requieren declaración nueva** (si la facturación está separada como en el punto 2): pedidos, reparto, Harvey, portal de clientes, compras, informes.

**Regla para Claude**: cualquier cambio en `public/sif/`, funciones `sif_*` o tablas `sif_*` sube la versión del SIF y deja la facturación **bloqueada** hasta que haya declaración firmada de esa versión.

## 9. Responsabilidades y riesgos de FERJUSANZ (productor y usuario a la vez)
- **Como productor**: responde de que el programa cumple y de que la declaración dice la verdad. Multa de **150.000 € por cada ejercicio y tipo de programa** si no cumple o no tiene declaración (art. 201 bis.1 LGT). La responsabilidad **no pasa a Anthropic** por haber usado Claude Code.
- **Como usuario**: multa de **50.000 € por cada ejercicio** por usar un programa que no cumple o que se ha alterado (art. 201 bis.2 LGT). Al ser las dos cosas, el riesgo se puede **sumar**.
- **Riesgos concretos de esta app**:
  1. Pruebas y producción en la misma base de datos: una prueba podría quedar como factura real. **Separar antes de nada.**
  2. Todo el código en un archivo enorme: difícil saber qué versión del SIF está en uso.
  3. Sin copia de seguridad probada ni copia de PDF: riesgo de no poder enseñar facturas a Hacienda.
  4. Clientes «sin IVA»: una venta sin factura o con el IVA «regalado» fuera de factura es un riesgo fiscal serio.
  5. Permisos: hoy un usuario de oficina podría borrar apuntes de facturas. En el SIF no puede ocurrir.
  6. Depender de un solo certificado y de una sola persona.
  7. Plazo: 7 semanas hasta el 1/1/2027.
- **Lo que hace Claude**: programa y prueba; **no firma, no declara que cumple y no activa la facturación real**.

---

## Qué necesita la empresa para facturar legalmente con su propia app desde enero de 2027
1. **Jorge confirma**: si hay SII (si lo hay, Verifactu no aplica), la fecha vigente en el BOE (2027 o 2028) y que FERJUSANZ es productor y quién firma.
2. **Escritura o nota simple**: quién es el administrador (firmante).
3. **Certificado electrónico de representante** de la S.L. (para firmar y para enviar a la AEAT).
4. **Separar la app de pruebas** de la base de datos real (pendiente 🔴 ya apuntado).
5. **Copias de seguridad probadas** (base de datos y PDF), valorar Supabase Pro.
6. **Programar el módulo de facturación** separado, con registros, huella encadenada, bloqueo de borrado, QR y envío VERI\*FACTU.
7. **Pasar todas las pruebas** de `PRUEBAS_TECNICAS.md`, incluido el entorno de pruebas de la AEAT.
8. **Resolver los clientes «sin IVA»** con Jorge.
9. **Firmar la declaración responsable** de la versión probada (la persona del punto 2) y ponerla en la app.
10. **Plan B**: si el 1/1/2027 algo de lo anterior no está, **se sigue facturando con Golden** (pedir a su proveedor que confirme que Golden está adaptado y su declaración de 2027).
