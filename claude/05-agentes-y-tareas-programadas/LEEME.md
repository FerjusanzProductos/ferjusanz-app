# 05 · Agentes y tareas programadas

## Para qué sirve
Trabajos que Claude hace **solo, a una hora fija**, sin que abras un chat: revisa datos, prepara listas o
mensajes y te avisa al móvil. **Solo leen y preparan**: no envían ni cambian nada.

## Lo que hay
| Agente | Estado | Qué hace |
|---|---|---|
| **Seguimiento diario Ferjusanz** (tarea `trig_016V26ajMMcPLQ3Zvg1C2dw2`) | ⏸ **Pausado** hasta que se use la app de verdad | Cada día a las 7:03 (Madrid): previstos sin confirmar, a quién llamar, clientes que dejaron de pedir, cobros y mensajes de WhatsApp listos para revisar. |
| **Asistente de Tito** (tarea `trig_01KUVsUjo6UtsmqfzaKpvWMx`) | ✅ Activo desde el 23/11/2026 | Lunes a sábado a las 7:47: lo urgente, correo con borradores en Gmail, lo que vence y enlace al comercial, en la página fijada «Asistente de Tito». Detalle: `ASISTENTE_TITO.md`. |
| **Resumen de correo Ferjusanz** (tarea `trig_01XauuDWFMvwzt9mGBonJ9Sh`) | ⏸ En pausa: las tareas no dejan usar Gmail. Mientras, **/resumen-correo** en un chat | Lunes a sábado a las 7:47: resumen del Gmail de facturas (facturas, reclamaciones, clientes con borrador de respuesta). Solo lee. Ver `RESUMEN_CORREO.md`. |
| **Ideas de contenido para redes y web** (tarea `trig_01CoSF7uUB9gvt2gcwPfu6d8`) | ✅ Activo desde el 27/11/2026 | Cada lunes a las 8:53: mira qué publica la competencia y revisa sus webs y redes y deja 3 ideas con guion para @ferjusanz y 2 propuestas para la web en la página «Comercial Ferjusanz» → 🎬 Ideas para redes (tabla `resumen_contenido`). No publica nada. |
| **Recordatorio: mirar Search Console** (tarea `trig_01A3aJzG9kStqJ1tAeLZKncH`) | ✅ Activo desde el 27/11/2026 | El 1 y el 15 de cada mes a las 10:17: aviso al móvil con los pasos para exportar Search Console y mandarlo por el chat. |
| Seguimiento dentro de la app (rama `seguimiento-app`) | ⏸ Hecho en pruebas, en espera | Lo mismo pero en una pantalla de la app. Cuando se active, se quita la tarea de Claude para no duplicar. |

## Agentes pedidos (sin hacer todavía)
Detalle de cada uno en `claude/08-textos-para-empezar-chats/PROMPTS.md`:
1. Revisión de diseño en el móvil · 2. Buscador de clientes nuevos con cocina propia · 3. Seguimiento diario (arriba) ·
4. Ofertas semanales · 5. Cobros · 6. 🔴 Compras y facturas (precios raros, márgenes, comprobar con Golden) ·
7. Harvey orquestador v2 · 8. 🔴 Copia de fotos y PDF.

## Tareas que hace Claude aquí
- Crear, pausar, cambiar de hora o quitar tareas programadas cuando lo pidas.
- Proponer cada agente nuevo con diseño y coste, y probarlo primero con pocos datos que revisas tú.
- Recordar que, mientras la app esté en pruebas, sus pedidos y cobros **no son reales**: no sacar conclusiones ni mensajes a clientes de ellos.
