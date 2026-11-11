# 01 · Memoria y reglas

## Para qué sirve
Claude no recuerda las conversaciones anteriores. Esta es su **memoria permanente**: lo que lee al empezar
cada tarea para saber cómo está todo, qué reglas respetar y qué falta por hacer.

## Dónde está
| Archivo | Qué contiene |
|---|---|
| `CLAUDE.md` (raíz) | Instrucciones fijas: cómo hablarte, en qué orden leer, reglas de trabajo y cómo publicar. Claude lo lee solo al abrir cada sesión. |
| `docs/ESTADO_ACTUAL.md` | Versión publicada, ramas, arquitectura. |
| `docs/REGLAS_INTERNAS.md` | **Obligatorias**: patatas, tomates, cebollas, abreviaturas, IVA, albaranes. |
| `docs/PENDIENTES.md` | Qué está pedido, en marcha o esperando tu decisión. |
| `docs/HISTORIAL.md` | Qué se hizo, cuándo y por qué (decisiones y errores corregidos). |
| `docs/FUNCIONALIDADES.md` | Qué hace cada pantalla de la app. |
| `docs/OPERATIVA.md` | Cómo funciona la empresa en el día a día. |

## Tareas que hace Claude aquí
- Leer estos documentos **antes de tocar nada** (en el orden de `CLAUDE.md`).
- Al terminar cada tarea: apuntar en **HISTORIAL** lo hecho, marcar en **PENDIENTES** lo terminado y lo nuevo, y actualizar **ESTADO_ACTUAL** si cambia la versión.
- Pasar a **REGLAS_INTERNAS** cada regla nueva de productos o negocio que digas.
- Corregir los documentos si algo no cuadra con la realidad (y avisarte).
