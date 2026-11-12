# ⛔ BORRADOR · SIN FIRMAR · SIN VALOR LEGAL
_Preparado por Claude el 12/11/2026. **No firmar** hasta que: (1) todas las pruebas de `PRUEBAS_TECNICAS.md` estén ✅, (2) Jorge o un asesor haya cotejado los campos con el art. 15 de la Orden HAC/1177/2024 en el BOE, y (3) se confirme quién representa a la sociedad.
Hoy el programa **NO cumple**: no existe todavía el módulo de facturación. Los campos con `[ ]` faltan por confirmar._

---

# DECLARACIÓN RESPONSABLE DEL SISTEMA INFORMÁTICO DE FACTURACIÓN

### 1. Datos del sistema informático de facturación
| Campo | Valor |
|---|---|
| a) Nombre del sistema | **FERJUSANZ Facturación** `[confirmar]` |
| b) Código identificador del sistema (IdSistemaInformatico) | **FJ** `[confirmar]` |
| c) Identificador completo de la versión | **SIF 1.0.0** `[se fija al terminar las pruebas]` |
| d) Componentes hardware y software y breve descripción | Ver tabla 2 |
| e) ¿Producido para funcionar exclusivamente como «VERI\*FACTU»? | **Sí** `[confirmar]` |
| f) ¿Permite ser usado por varios obligados tributarios? / ¿un usuario puede usarlo para varios obligados? | **No** / **No** |
| g) Tipos de firma utilizados (solo si no es exclusivamente VERI\*FACTU) | No aplica (exclusivamente VERI\*FACTU) |

### 2. Componentes
| Componente | Tipo | Función |
|---|---|---|
| Aplicación web instalable (PWA) «FERJUSANZ», módulo `sif` | Software propio | Emisión de facturas y rectificativas, generación de registros de facturación, huella, QR y PDF |
| Cloudflare Workers (`ferjusanz-productos`) | Servicio de terceros (alojamiento) | Entrega de la aplicación al navegador del usuario |
| Supabase: base de datos PostgreSQL, autenticación y almacenamiento | Servicio de terceros (base de datos) | Conservación de facturas, registros de facturación encadenados, usuarios y PDF |
| Función de servidor `sif-aeat` `[a crear]` | Software propio | Remisión de los registros a la AEAT por servicio web y registro de sus respuestas |
| Navegador del usuario (Chrome en Android u otro moderno) y dispositivo móvil u ordenador | Hardware/software de terceros | Uso de la aplicación |
| Certificado electrónico de representante de persona jurídica | Credencial | Identificación ante la AEAT |

### 3. Datos del productor
| Campo | Valor |
|---|---|
| h) Razón social | FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. |
| i) NIF | B87446670 |
| j) Dirección postal completa de contacto | C/ Carare, 2 — 28033 Madrid `[confirmar con nota simple]` |
| Contacto | ferjusanz@hotmail.com `[confirmar]` |
| Inscripción registral | Registro Mercantil de Madrid, Tomo 34.358, Folio 101, Sección 8.ª, Hoja M-618046 `[confirmar]` |
| Observación | Sistema desarrollado por la propia sociedad para su uso exclusivo, con la ayuda de la herramienta de programación Claude Code. |

### 4. Declaración
k) FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., como productora del sistema informático de facturación identificado arriba, **declara bajo su responsabilidad** que dicho sistema, en la versión indicada, cumple con lo dispuesto en el artículo 29.2.j) de la Ley 58/2003, de 17 de diciembre, General Tributaria; en el Reglamento aprobado por el Real Decreto 1007/2023, de 5 de diciembre; en la Orden HAC/1177/2024, de 17 de octubre; y en las demás normas que los desarrollan.

l) Fecha y lugar de suscripción: `[ ]`, a `[ ]` de `[ ]` de `[ ]`.

Firmado: `[nombre y apellidos]`, `[cargo: administrador único / apoderado]`, en nombre y representación de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.

---
_Notas para quien revise (no forman parte de la declaración):_
- Los campos a)–l) siguen el art. 15 de la Orden HAC/1177/2024 **según Claude, sin haber podido abrir el BOE**. Cotejar letra a letra.
- Los valores de nombre, código, versión, NIF del productor y nº de instalación deben coincidir **exactamente** con los que el programa pone en el bloque «SistemaInformatico» de cada registro enviado a la AEAT (prueba T-DEC-03).
- Una declaración por versión. Las antiguas se conservan (ver `LEEME.md`, punto 7).
