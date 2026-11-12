# WhatsApp automático (función `whatsapp`)

**Fase 1: Harvey PROPONE la respuesta y la oficina la envía.** Nada sale solo.
En la app: **Inicio › 🤝 Comercial › 💬 WhatsApp** (solo oficina y admin).

## Cómo funciona
1. Un cliente escribe al número conectado a la API de WhatsApp de Meta.
2. Meta llama a esta función (webhook). Se comprueba la firma de Meta y se guarda el mensaje en `whatsapp_mensajes`, con el cliente si su teléfono está en alguna ficha.
3. Harvey prepara una respuesta (sin precios ni promesas) y una «NOTA» para la oficina.
4. La oficina la revisa, la cambia si quiere y pulsa «📨 Enviar por WhatsApp» o «🙈 No contestar».
5. Solo se puede contestar en las 24 horas siguientes al último mensaje del cliente (norma de WhatsApp).

## Puesta en marcha (una vez)
- Tabla: `supabase/migrations/20261112a_whatsapp.sql`.
- Función publicada **sin comprobar JWT** (Meta no lo manda): la protegen la firma de Meta y la sesión de la app.
- Secretos de Supabase (Edge Functions › Secrets), **nunca por el chat**:
  - `WHATSAPP_TOKEN`: token de acceso de Meta.
  - `WHATSAPP_PHONE_ID`: identificador del número de teléfono.
  - `WHATSAPP_APP_SECRET`: clave secreta de la app de Meta (Configuración de la app › Básica).
  - `WHATSAPP_VERIFY_TOKEN`: una palabra inventada, la misma que se pone en Meta al configurar el webhook.
  - Opcionales: `WHATSAPP_API_VERSION` (por defecto `v23.0`), `HARVEY_MODEL`.
- En Meta (WhatsApp › Configuración): URL de devolución de llamada `https://hvydnjaswdexttogsyen.supabase.co/functions/v1/whatsapp`, el mismo token de verificación y suscribirse a `messages`.

## Qué datos salen a Anthropic
La conversación de ese teléfono (últimos 12 mensajes), el nombre y código del cliente y lo que suele pedir (productos y cantidades). Sin teléfonos, precios ni deudas.
