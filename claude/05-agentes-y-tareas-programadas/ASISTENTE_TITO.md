# Asistente de Tito (cada mañana)

- **Pedido por**: Tito, 23/11/2026 (reel de @nacho.mirandap: «MCP… asistente personal» → «Sí»).
- **Tarea**: «Asistente de Tito (L-S)» (`trig_01KUVsUjo6UtsmqfzaKpvWMx`), de lunes a sábado a las 7:47 (Madrid). Despierta **la misma conversación** donde se montó (`session_01VB7xFULxmPq4BKquVWw7VJ`), porque esa sí tiene el conector **Gmail** (a las tareas con sesión nueva no se les puede poner Gmail en esta organización; comprobado el 23/11/2026).
- **Página fijada**: https://claude.ai/artifact/MxB8nhUcYdC5SWVvaRmp21 (archivo `docs/asistente.html`).
- **Buzón**: el Gmail de facturas de la empresa (`ferjusanzfacturas@gmail.com`).
- Sustituye a «Resumen de correo Ferjusanz» (en pausa; se queda así).

## Qué hace la tarea (instrucciones para Claude)

1. `git clone --depth 1 https://gitlab.com/ferjusanz-productos/ferjusanz-app.git && cd ferjusanz-app`. Lee `CLAUDE.md` y `docs/PENDIENTES.md`.
2. **Correo** (Gmail: `search_threads` + `get_thread` de cada hilo; los lunes `newer_than:3d`, el resto `newer_than:1d`; `in:inbox -category:promotions -category:social`). Lo reenviado desde el Hotmail («RV:») tiene el remitente real dentro.
   - 🔴 **Lo de hoy**: lo que pide respuesta o acción (máx. 4). Cambios de IBAN = 🔴 posible fraude, llamar antes de pagar.
   - Facturas de proveedores: solo cuántas y de quién, en una línea (entran solas en la app).
   - Correos personales de Tito (p. ej. su despido): solo «hay correos personales», sin detalles.
   - **Nunca** copiar a la página códigos, contraseñas, IBAN completos ni datos de clientes (teléfonos, correos).
3. **Borradores**: para lo que pida respuesta de un proveedor, gestoría, banco, Red.es…, crear un borrador en Gmail (`create_draft` con `replyToMessageId`), corto, en español, firmado «Fernando Sanz / FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.». Antes mirar `list_drafts` para no repetir uno que ya exista. **Nunca enviar** nada. **Nunca** borradores a clientes (eso lo decide Fernando), ni nada sobre precios, cobros o facturas ya hechas.
4. **Lo que vence pronto**: de `docs/PENDIENTES.md`, lo que tenga fecha en los próximos 30 días (más lo 🔴 de Tito). Máx. 4.
5. **A quién llamar**: solo el enlace a «Comercial Ferjusanz» (https://claude.ai/artifact/WomsAtCVCe1cqaQCwqd9Wh); no repetir esa lista.
6. Reescribir `docs/asistente.html` con el mismo diseño (cambiar solo el texto de las secciones y la fecha/hora de arriba), leer la página con Artifact `action: "read"` y publicarla pasando `url: https://claude.ai/artifact/MxB8nhUcYdC5SWVvaRmp21` (sin cambiar el icono, sin crear otra).
7. No tocar la app, la base de datos ni el repositorio (sin commits ni push). Respuesta final (llega al móvil): lo urgente en 3 líneas + «Borradores nuevos: N» + el enlace a la página.
