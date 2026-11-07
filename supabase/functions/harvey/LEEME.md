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
