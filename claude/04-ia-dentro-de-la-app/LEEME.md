# 04 · IA dentro de la app

## Para qué sirve
Partes de la app que usan la inteligencia artificial de Claude (API de Anthropic) por dentro.
Funcionan como «funciones» de Supabase. La clave (`ANTHROPIC_API_KEY`) está guardada en los secretos de Supabase, nunca en el código.

| Función | Qué hace | Dónde |
|---|---|---|
| **Harvey** (`harvey`) | Comercial con IA: mensajes, guiones, ofertas, consulta clientes, deudas, pedidos y ventas. Alta de cliente provisional con confirmación. | `supabase/functions/harvey/` (explicación en su `LEEME.md`) |
| **Harvey 2** (`harvey2`) | «Hoy, a quién escribir», pedido pegado de WhatsApp → borrador, tarifas nuevas cada mañana, aprobación de precios. | `supabase/functions/harvey2/` |
| **Ayuda 🆘** (`ayuda-ia`) | Responde al momento con pasos guiados y «Hazlo conmigo»; si no basta, avisa a Fernando con audio. | `supabase/functions/ayuda-ia/` |
| **Lector de facturas** (`recibir-factura`, «Leer con IA») | Lee fotos o PDF de facturas de proveedor y enlaza los productos según las reglas internas. | En Supabase (no está en el repo) |
| **Correo de albaranes** (`albaranes-correo`) | Envía el albarán por correo al marcar «Entregado» (no usa IA). | `supabase/functions/albaranes-correo/` |

Reglas fijas: Harvey **no envía nada solo**, firma con el nombre de quien escribe, y cualquier precio sale **tapado** hasta que lo apruebas.

## Tareas que hace Claude aquí
- Crear y mejorar estas funciones (primero en pruebas).
- Ajustar lo que «sabe» cada una (reglas de productos, precios, tono de los mensajes).
- Elegir el modelo para equilibrar calidad y coste (secreto `HARVEY_MODEL`).
- Revisar que no salgan a la IA datos que no deben (teléfonos, correos).
- Pendiente: Harvey orquestador v2 (apuntar contactos, confirmar previstos, recordatorios de cobro, siempre con confirmación).
