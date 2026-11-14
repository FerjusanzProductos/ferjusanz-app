# Pruebas técnicas del programa de facturación (SIF)
_Diseñadas el 12/11/2026. Se hacen **siempre** en la app de PRUEBAS con base de datos **separada** y en el **entorno de pruebas de la AEAT** (nunca con facturas reales). Estado: ⬜ por hacer · ✅ pasa · ❌ falla._
_Una prueba solo se marca ✅ con la prueba hecha y su resultado guardado (captura o salida) en `pruebas/sif/resultados/`._

## A. Huella (hash) — referencia
| ID | Qué se prueba | Cómo | Resultado esperado | Estado |
|---|---|---|---|---|
| T-HASH-01..03 | Fórmula SHA-256 de alta y anulación | `node pruebas/sif/huella.mjs` | Coincide con los 3 ejemplos de la AEAT | ✅ 12/11/2026 (solo la fórmula; aún no hay app) |
| T-HASH-04 | Cambiar 1 céntimo cambia la huella | Mismo script | Huella distinta | ✅ 12/11/2026 |
| T-HASH-06 | La app calcula igual que el script | Emitir 20 facturas de prueba y recalcular con el script | 20 de 20 iguales | ✅ 14/11/2026: 55 de 55 iguales (`pruebas/sif/bateria.mjs`) |
| T-HASH-07 | Formato de importes y fechas en la huella | Importes 0, negativos (rectificativas), con 1 decimal; fecha dd-mm-aaaa; hora con huso +01:00/+02:00 (cambio de hora) | Igual que el script | ✅ 14/11/2026: importes siempre con 2 decimales, también negativos (-1.30); huso +01:00 en invierno y +02:00 en verano, bien en las dos horas del cambio (28/3 y 31/10). Importe 0 no se da: la app no deja facturas a cero |

## B. Encadenamiento
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-CAD-01 | Cada registro lleva la huella del anterior | Emitir 50 facturas y recorrer la cadena | Sin saltos | ✅ 14/11/2026: 60 registros, cadena correcta |
| T-CAD-02 | Dos personas emiten a la vez | 2 móviles pulsan «Emitir» al mismo tiempo, 20 veces | Una sola cadena, sin huellas repetidas ni huecos | 🟡 Visto en el código (bloqueo del contador + bloqueo de la cadena), sin probar con dos móviles a la vez: se hará en la prueba de diciembre |
| T-CAD-03 | Detectar manipulación | Cambiar a mano (como administrador de la base de datos) un importe guardado | El verificador de cadena avisa en rojo | ✅ 14/11/2026: tocando una factura y un registro saltándose los cerrojos, el verificador señala las dos |
| T-CAD-04 | Primer registro | Primera factura de la instalación | Huella anterior vacía, marca de primer registro | ✅ 14/11/2026: solo el primero (PRUEBA-2026-0001) tiene la anterior vacía |

## C. Inalterabilidad e integridad
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-INA-01 | No se puede borrar una factura | Intentar borrar desde la app y desde la API con usuario oficina y admin | Rechazado | ✅ 14/11/2026 (admin: «permission denied»; dueño de la base: «FACTURA_INALTERABLE») |
| T-INA-02 | No se puede cambiar una factura emitida | Intentar cambiar importe, fecha, cliente, número | Rechazado | ✅ 14/11/2026 |
| T-INA-03 | No se pueden borrar ni cambiar registros de facturación | Igual sobre la tabla de registros | Rechazado | ✅ 14/11/2026 (también vaciarla y bajar el contador) |
| T-INA-04 | Corregir = rectificativa | Hacer una rectificativa de una factura | Nueva factura serie R, que dice qué corrige y por qué; la original intacta | ✅ 14/11/2026 |
| T-INA-05 | Anulación | Anular una factura emitida por error | Registro de anulación encadenado; la factura sigue guardada | ✅ 14/11/2026 (SIF 0.4.0): **registro de anulación** de Verifactu para facturas emitidas por error (huella de anulación encadenada, la factura sigue guardada y marcada «ANULADA», sus albaranes vuelven a «Por facturar»). Además, la rectificativa a cero para las ya entregadas. Batería: `resultados/2026-11-14_bateria_anulacion.json`; probado también pulsando en la app naranja v317 (PRUEBA-2026-0004) y XML válido con el esquema de la AEAT |
| T-INA-07 | Límites de la anulación | No deja anular dos veces, ni con rectificativas, ni una rectificativa, ni ya cobrada, ni sin motivo; ni rectificar una anulada | Rechazado | ✅ 14/11/2026 |
| T-INA-06 | Sin ventas fuera de factura | Revisar que no exista ningún camino para cobrar sin factura | Ninguno | ⬜ |

## D. Numeración
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-NUM-01 | Correlativa sin huecos | 100 facturas, incluyendo errores a mitad (sin conexión, cancelar) | 2027-0001 a 2027-0100 sin huecos | ✅ 14/11/2026: 50 facturas con 3 fallos a mitad, PRUEBA-2026-0005 a 0054 sin huecos |
| T-NUM-02 | Cambio de año | Simular 31/12 23:59 → 1/1 00:01 | Empieza 2028-0001 | ✅ 14/11/2026: fingiendo el 1/1/2027 sale PRUEBA-2027-0001 |
| T-NUM-03 | Serie de rectificativas aparte | Varias rectificativas | R2027-0001… | ✅ 14/11/2026: PRUEBA-R2026-0001 a 0004 |
| T-NUM-04 | Serie de pruebas | Facturas en la app de pruebas | Serie «PRUEBA», marca «SIN VALOR FISCAL», nunca se envían a la AEAT real | ✅ 14/11/2026 (serie y marca; el envío aún no existe) |

## E. Trazabilidad
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-TRA-01 | Quién y cuándo | Ver cada registro | Usuario, fecha-hora con huso y versión del SIF | ✅ 14/11/2026 |
| T-TRA-02 | De albarán a factura | Factura hecha desde albaranes | Se ve qué albaranes la forman y al revés | ✅ 14/11/2026 |

## F. QR y contenido de la factura
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-QR-01 | URL del QR bien formada | Script de referencia | Caracteres especiales codificados | ✅ 12/11/2026 (fórmula) |
| T-QR-02 | QR en el PDF | Imprimir PDF y leer el QR con el móvil | Abre el cotejo de la AEAT (entorno de pruebas) con NIF, número, fecha e importe correctos | 🟡 13/11/2026: Claude leyó el QR (pantalla) en la naranja v305 y la dirección es exacta; falta escanearlo en papel con el móvil |
| T-QR-03 | Tamaño, posición y frase | Medir en el PDF | Tamaño y posición que fija la Orden (⚠️ cotejar: 30–40 mm, al principio) y frase «VERI\*FACTU» | 🟡 35 mm arriba a la derecha, «QR tributario:»; sin la frase mientras no se envíe a la AEAT (modo No VERI\*FACTU). ⚠️ Cotejar la Orden |
| T-FAC-01 | Datos obligatorios | Revisar 10 facturas | Emisor y cliente completos, Registro Mercantil, desglose por IVA, forma de pago | ✅ 14/11/2026: 55 facturas, y el total cuadra con el desglose |
| T-FAC-02 | Bloqueo si falta algo | Cliente sin NIF o sin CP | No deja emitir y dice qué falta | ✅ 14/11/2026 |
| T-FAC-03 | Efectivo | Factura de 1.000 € o más a empresa | No deja cobrar nada en efectivo | ✅ 14/11/2026: 1.000,48 € rechazada; 998,40 € sí |

## G. Envío a la AEAT (solo entorno de pruebas de la AEAT)
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-AEAT-01 | Conexión con certificado | Envío de 1 registro de alta | Respuesta «Correcto», guardada | ⬜ |
| T-AEAT-02 | Sin conexión | Emitir sin internet | Factura emitida y registro en cola; se envía al volver | ⬜ |
| T-AEAT-03 | Rechazo y subsanación | Enviar un registro con un error a propósito | Se guarda el rechazo, se corrige con subsanación | ⬜ |
| T-AEAT-04 | Espera entre envíos y lotes | 1.500 registros seguidos | Respeta el tiempo de espera que indica la AEAT y el máximo por envío | ⬜ |
| T-AEAT-05 | Bloque del sistema | Mirar el XML enviado | Nombre, código, versión, nº instalación y NIF del productor iguales a la declaración | ⬜ |

## H. Conservación y exportación
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-CON-01 | Restaurar copia | Recuperar la copia nocturna en una base de datos vacía | Facturas, registros y cadena completos y verificables | ✅ 14/11/2026 con la base de PRUEBAS (la real aún no tiene facturas): réplica local, mismos `pg_dump` que la copia nocturna y mismo `scripts/prueba-recuperacion.sh`. 80 de 80 tablas, 0 errores; cadena correcta con la misma última huella; los cerrojos siguen; se pudo seguir la cadena (una anulación más, cadena correcta). `pruebas/sif/recuperacion/prueba.sh`, `resultados/2026-11-14_recuperacion.txt` |
| T-CON-02 | PDF guardados | Restaurar los PDF de Storage | Todos presentes | 🟡 Las facturas emitidas no se guardan en PDF: se rehacen de los datos guardados (que sí se recuperan). La copia nocturna baja todos los archivos (14/11: 128 de 128). Cuando haya declaraciones firmadas (`sif-declaraciones`), mirar que entran en la copia |
| T-CON-03 | Exportar para Hacienda/Jorge | Exportar un año completo | Archivo legible con todas las facturas y registros | ⬜ |

## I. Separación pruebas / real
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-SEP-01 | La app de pruebas no toca la base real | Emitir en pruebas | Nada aparece en la base real | ✅ 14/11/2026: la real sigue con 0 facturas y 0 registros |
| T-SEP-02 | La de pruebas no puede enviar a la AEAT real | Revisar configuración | Solo apunta al entorno de pruebas de la AEAT | ⬜ |
| T-SEP-03 | Modo prácticas | Emitir en Modo prácticas de la app normal | No genera factura real (o el modo no permite facturar) | ✅ 14/11/2026: la base real rechaza emitir («FACTURACION_NO_ACTIVA») |

## J. Declaración responsable
| ID | Qué | Cómo | Esperado | Estado |
|---|---|---|---|---|
| T-DEC-01 | Visible en la app | Más → ℹ️ Programa de facturación | Se ve la declaración de la versión en uso | 🟡 14/11/2026: pantalla hecha (pruebas v319, la ven todos, también el preparador); dice «todavía no hay declaración firmada». Falta verla con el PDF firmado |
| T-DEC-02 | Bloqueo sin declaración | Subir la versión del SIF sin declaración | La app no deja emitir | ✅ 14/11/2026: fingiendo la base real encendida: sin declaración «SIN_DECLARACION»; con ella, sí; versión nueva sin la suya, otra vez bloqueado (`pruebas/sif/declaracion.sql`, `resultados/2026-11-14_declaracion.json`) |
| T-DEC-03 | Coincidencia | Comparar declaración con el XML enviado | Datos idénticos | ⬜ |
| T-DEC-04 | Histórico | Ver versiones anteriores | Se ven todas, ninguna borrada | ✅ 14/11/2026: la anterior sale en «Versiones anteriores»; no se pueden borrar ni añadir desde la app |

**Batería automática** (14/11/2026): `NODE_USE_ENV_PROXY=1 node pruebas/sif/bateria.mjs [salida.json]` hace todo en la base de PRUEBAS dentro de una transacción que se deshace (no deja nada). Resultado: `pruebas/sif/resultados/2026-11-14_bateria.json`.

**Regla**: hasta que todas estén ✅, **no se firma** la declaración ni se emiten facturas reales desde la app.
