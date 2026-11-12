# Texto para empezar el chat del Modo reparto (fases 2 y 3)
_Escrito el 12/11/2026. Copiar y pegar entero en un chat nuevo de Claude Code._

```
Seguimos con el «🚚 Modo reparto» de la app. Lee primero CLAUDE.md y los documentos que dice (ESTADO_ACTUAL, REGLAS_INTERNAS —sección «Reparto»—, PENDIENTES e HISTORIAL del 12/11/2026).

DÓNDE ESTÁ: rama `modo-reparto` de GitLab (NO está en main ni en la app normal). La Fase 1 está en la app de PRUEBAS (v240): función `vistaModoReparto` en public/index.html. Trabaja sobre esa rama.

LO NUEVO QUE PIDO (lo primero):
- Que se puedan MOVER los pedidos del reparto para cambiar el orden DESLIZANDO CON EL DEDO (mantener pulsado y arrastrar a otra posición). Que funcione bien en el móvil (Android, Chrome), con letra y filas grandes, sin que se mueva sin querer al hacer scroll. Dejar también flechas ↑↓ pequeñas por si a alguno le cuesta arrastrar.
- Dentro del Modo reparto (pestaña «📋 Lista» / «Orden de hoy») y también en la pantalla «Reparto» de la oficina.
- Guardar con la función que ya existe `ordenar_reparto` (queda sola en el historial). Sin cobertura: guardar en el móvil y enviarlo al volver la red, como la cola que ya existe.
- Botón «Poner el orden de siempre» (sacado de los últimos días de ese repartidor).

DESPUÉS (fases que faltan del plan ya aprobado):
- Fase 2: tras «ENTREGADO», el albarán ARRIBA siempre visible sin bajar; debajo el cobro (contado o pendiente) y la firma si no paga. Usar el albarán, el cobro y la firma que ya existen (entregaPasoAPaso, enviarCobro, colaFi, marcarEntregado); no duplicar. Botón pequeño y aparte «Cambiar algo» con la edición de pedidos de siempre y un botón grande «← Volver al reparto».
- Fase 3: «📦 Cómo cargar la furgoneta»: lo de cada pedido en orden inverso al reparto (lo del último cliente se carga primero).

NORMAS: no borrar ni cambiar datos reales ni funciones que ya existen (si algo puede romper lo actual, pregúntame antes). No cambiar el orden de trabajo diario. Todo sin cobertura y en el móvil. Máximo dos columnas, letra y botones grandes. Que funcione en Modo prácticas. Explícame el plan en sencillo antes de empezar, hazlo por fases, súbelo a la app de PRUEBAS para que lo vea y no me digas que está terminado hasta que lo hayamos probado. Publicar en la normal solo cuando yo diga «Autorizo publicar».
```
