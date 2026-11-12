# Harvey v2 — orquestador (acciones con confirmación)

Función de Supabase `harvey-v2`. Es Harvey (ver `../harvey/LEEME.md`) **más acciones que cambian datos**,
siempre con confirmación. Mientras se prueba, solo la usa la app de PRUEBAS; la normal sigue con `harvey`.
Al publicar: en `public/index.html` (tabHarveyChat) quitar la condición `H2_PRUEBAS ? 'harvey-v2' : 'harvey'`.

## Cómo se confirma (igual en la app y, más adelante, en WhatsApp)
1. Harvey resume exactamente lo que va a guardar y termina con la línea `[CONFIRMAR]`.
2. La app quita esa marca y enseña **«✅ Sí, hazlo»** / **«❌ No»** (en WhatsApp bastará con contestar «sí»).
3. La función solo guarda si el mensaje anterior de Harvey llevaba `[CONFIRMAR]` **y** la respuesta empieza por «sí / vale / ok / adelante…».
   Si no, la herramienta contesta «no confirmado» y no toca nada.

## Herramientas (plan)
| # | Acción | Qué toca | Estado |
|---|---|---|---|
| 1 | `apuntar_contacto`: contacto nuevo, nota, «volver a llamar el…», estado | tabla `prospectos` (nota se añade, nunca se borra) | 🧪 en pruebas (v215) |
| — | `crear_cliente_provisional` (ya existía) | `clientes` | ahora con el mismo sistema de confirmar |
| 2 | Confirmar pedidos previstos (✅ del día siguiente) | previstos → pedido confirmado | ⚪ siguiente |
| 3 | Preparar pedido desde un WhatsApp pegado | borrador (`harvey.borradores`), nunca pedido real sin confirmar | ⚪ cuando se use la app de verdad |
| 4 | Preparar recordatorios de cobro | solo texto + apuntar en `harvey.contactos`; nunca envía | ⚪ cuando se use la app de verdad |

## Coste
Igual que Harvey: cada pregunta son 1–3 llamadas a la IA (con Opus 5.5 y caché, del orden de **1–3 céntimos**;
con `HARVEY_MODEL=claude-sonnet-5-5`, bastante menos). Confirmar añade un mensaje más (≈1 céntimo).
No hay costes fijos nuevos ni cambios en la base de datos.
