# Harvey — agente comercial con IA

Harvey aparece en la app en **Inicio › 🤝 Comercial › 🤵 Harvey** (solo oficina y admin).
Escribe mensajes de WhatsApp, guiones de llamada, ofertas y respuestas a objeciones y quejas
usando las recomendaciones vigentes, las listas de precios, los contactos pendientes,
las quejas abiertas y los clientes nuevos. Nunca envía nada solo: la oficina revisa y pulsa
«Copiar» o «WhatsApp».

## Activarlo en Supabase (una sola vez)

1. Si ya funciona «Leer con IA», el secreto `ANTHROPIC_API_KEY` ya existe. Si no:
   `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`
2. Subir la función:
   `supabase functions deploy harvey`
   (o en el panel de Supabase › Edge Functions › «Deploy a new function», nombre `harvey`,
   pegando `index.ts`).
3. Opcional: cambiar el modelo con el secreto `HARVEY_MODEL` (por defecto `claude-opus-5-5`).
   Para abaratar, `claude-sonnet-5-5`.

Necesita las tablas de Comercial (Parte 43). La función comprueba que quien llama
tiene sesión y rol `oficina` o `admin` en `perfiles`.

## Qué datos salen a Anthropic

Solo el mensaje y un resumen: recomendaciones, listas de precios, contactos pendientes
(nombre, tipo, estado, localidad, notas; **sin teléfonos ni correos**), quejas abiertas y
clientes nuevos. La app pide permiso la primera vez. En modo prácticas Harvey no funciona.

## Consultas a la base de datos (orquestador, versión 1: solo lectura)

Harvey puede consultar por su cuenta, con los permisos de quien le escribe: `buscar_clientes`,
`deudas`, `pedidos_cliente`, `ventas`, `prospectos` y `quejas_abiertas`. Solo hace SELECT:
no envía, no crea, no cambia ni borra nada. No devuelve teléfonos ni correos (solo si los hay).
Máximo 6 rondas de consultas por pregunta. La respuesta incluye `consultas` (qué herramientas usó).
- `buscar_clientes` es tolerante (tildes, erratas, palabras sueltas, código, alias, localidad). Si hay varias
  coincidencias parecidas, Harvey pregunta cuál es antes de seguir.
- `crear_cliente_provisional` (única escritura): solo funciona si el último mensaje de la persona es una
  confirmación («sí», «vale», «adelante»…). Crea el cliente con nombre y código y la nota
  «⚠️ FALTA COMPLETAR · alta provisional desde Harvey por …» para que la secretaria complete la ficha.
