# 05 · Agentes y tareas programadas

## Para qué sirve
Trabajos que Claude hace **solo, a una hora fija**, sin que abras un chat: revisa datos, prepara listas o
mensajes y te avisa al móvil. **Solo leen y preparan**: no envían ni cambian nada.

## Lo que hay
| Agente | Estado | Qué hace |
|---|---|---|
| **Seguimiento diario Ferjusanz** (tarea `trig_016V26ajMMcPLQ3Zvg1C2dw2`) | ⏸ **Pausado** hasta que se use la app de verdad | Cada día a las 7:03 (Madrid): previstos sin confirmar, a quién llamar, clientes que dejaron de pedir, cobros y mensajes de WhatsApp listos para revisar. |
| **Resumen de correo Ferjusanz** (tarea `trig_01XauuDWFMvwzt9mGBonJ9Sh`) | ⏸ En pausa hasta ponerle Gmail en claude.ai | Lunes a sábado a las 7:47: resumen del Gmail de facturas (facturas, reclamaciones, clientes con borrador de respuesta). Solo lee. Ver `RESUMEN_CORREO.md`. |
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
