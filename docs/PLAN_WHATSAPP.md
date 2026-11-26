# Plan: asistente de WhatsApp (apunta pedidos en la app)
_Primer plan del 12/11/2026 (vídeo de revolutia). **Actualizado el 22/11/2026**: lo de abajo de «Plan antiguo» queda solo como referencia._

## Lo decidido (22/11/2026, Tito)
- **Número: 609 100 690** (WhatsApp Business del padre, «Ferjusanz Productos»), conectado por **360dialog** en modo **Coexistence**: el padre sigue usando la app del móvil y los mensajes llegan también a la API. **El 609 567 354 (Tito) NO se conecta** (motivos personales y legales; no insistir).
- Meta: portfolio «Ferjusanz Productos» creado con el Facebook del padre. ⚠️ Posible duplicado con la cartera `1034977426309371` (de Tito). No tocar nada en Meta por ahora.
- 360dialog: cuenta Direct Client a nombre de la SL. **Canal aún sin crear** (el alta se atascó; Tito escribió al soporte). **Sin API key todavía.** Chats antiguos: «No compartir».

## Cómo funciona (montado en PRUEBAS, 22/11/2026)
- **Silencioso**: solo lee y apunta. **Única respuesta** (Tito, 26/11/2026): a un número que no es de ningún cliente y manda un pedido, una vez al día: «Gracias, hemos recibido tu pedido. Para que vaya todo bien anotado, es importante que nos digas: nombre del negocio, dirección de entrega y día que lo quieres. — Ferjusanz Productos». Necesita `D360_API_KEY` en Supabase. (Más adelante, quizá «Pedido recibido ✅» solo a clientes.)
- **Qué guarda**: mensajes de **clientes conocidos** (su teléfono está en la ficha) y **pedidos reenviados por la casa** (Tito reenvía al 609 100 690 lo que le llega; el cliente se saca del texto o de una nota que mande justo después, «es del bar X»; si no está claro, queda «sin cliente»). De números desconocidos, solo un **texto que nombre un producto y una cantidad** y que la IA vea como pedido. **No guarda nada personal**: familia, amigos, sus fotos y audios, grupos y lo que manda el propio padre.
- **Audios**: los transcribe **Gemini** (Claude no oye audios). **Fotos de listas** y texto: los lee **Claude** (o Gemini si no hay clave de Claude).
- El pedido queda como **propuesta** en la tabla `whatsapp_pedidos` y en la pantalla **«💬 WhatsApp · pedidos»** (Entregas y pedidos, solo oficina). **No crea pedidos** (el trabajo real sigue en Golden).
- Piezas: `supabase/functions/whatsapp/index.ts` y `supabase/migrations/20261209a_whatsapp_pedidos.sql`.

## Conectar el webhook (✅ hecho el 26/11/2026 en la real; falta `D360_API_KEY` en Supabase)
1. **Tito** guarda la API key de 360dialog: con el formulario seguro que abre Claude (para `waba-v2.360dialog.io`) y en los secretos de Supabase de la base real como `D360_API_KEY` (https://supabase.com/dashboard/project/hvydnjaswdexttogsyen/functions/secrets, «Sitio para ordenador»). Nunca por el chat.
2. **Claude** (autorización permanente): lanzar `20261209a_whatsapp_pedidos.sql` en la real; crear un secreto nuevo `WHATSAPP_WEBHOOK_SECRET` (al azar, sin escribirlo en ningún sitio); subir la función `whatsapp` a la real **sin comprobar JWT**.
3. **Claude** da de alta el webhook: `POST https://waba-v2.360dialog.io/v1/configs/webhook` con cabecera `D360-API-KEY` y cuerpo `{"url": "https://hvydnjaswdexttogsyen.supabase.co/functions/v1/whatsapp", "headers": {"x-ferjusanz-secreto": "<el secreto>"}}`.
4. Comprobar con un WhatsApp de verdad de Tito reenviado al 609 100 690 y publicar la pantalla en la app normal.
5. Audios: si Tito quiere, clave de Gemini (https://aistudio.google.com/apikey desde Chrome) como secreto `GEMINI_API_KEY`.
- ⚠️ Sin comprobar (la web de documentación de 360dialog no se abre desde el entorno de Claude): la dirección del webhook, que acepte `headers`, y cómo se bajan los audios y fotos (`GET /{media_id}` → `url`, cambiando `lookaside.fbsbx.com` por `waba-v2.360dialog.io`).

# Plan antiguo (12/11/2026, solo referencia)
## Qué sería
Que el WhatsApp de la empresa (609 567 354) lo conteste un agente con IA (Harvey), que:
- responda a clientes sobre productos, precios, horarios de reparto y pedidos;
- recuerde la conversación de cada cliente;
- **prepare** pedidos, contactos y recordatorios de cobro, que la oficina **confirma** en la app antes de que cuenten (como Harvey hoy).

## Cómo se montaría (sin intermediarios)
1. **Cuenta de WhatsApp Business de Meta (API oficial, «Cloud API»)**, verificada a nombre de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. (piden CIF y algún documento de la empresa).
2. **El número**: el 609 567 354 se pasa a la API. Meta permite usar a la vez la app WhatsApp Business del móvil y la API en el mismo número («coexistencia»). **Hay que comprobarlo con ese número antes de pasarlo**, para no perder los chats.
3. **Una función nueva en Supabase** (`whatsapp`) que recibe los mensajes y se los pasa a Harvey, que ya conoce clientes, precios, deudas y pedidos.
4. **Pantalla en la app** «💬 WhatsApp»: conversaciones, lo que ha contestado Harvey y botón «Lo cojo yo» para que conteste una persona.
5. Hace falta permitir en el entorno de Claude la web de Meta (`graph.facebook.com`) y guardar la clave de Meta en los secretos de Supabase. **Nunca por el chat.**

## Lo que permite Meta (normas de 2026)
- Desde el 15/01/2026 Meta **prohíbe los chatbots «para todo»** (tipo ChatGPT) en la API de WhatsApp.
- **Sí permite** los agentes de una empresa para atender a clientes, vender, tomar pedidos y avisar. Harvey entra aquí: tiene que contestar **solo de Ferjusanz**.

## Costes (precios de España, 2026, según páginas de terceros; confirmar con Meta)
| Qué | Cuándo se paga | Precio aproximado |
|---|---|---|
| **Contestar a un cliente que escribe** (24 h desde su mensaje) | Desde octubre de 2026: **1.000 gratis al mes** por número; después, como «utilidad» | 0 € (hasta 1.000) · luego ~0,017 € |
| **Avisos** que manda la empresa (pedido confirmado, recordatorio de cobro, reparto) | Siempre | ~0,017 € por mensaje |
| **Ofertas y promociones** | Siempre | ~0,059 € por mensaje |
| **IA (Claude)** | Por cada respuesta de Harvey | Como Harvey hoy; se mide en la prueba |
| Meta, Supabase y Cloudflare | — | Sin cuota fija (ya los tenemos) |

**Ejemplo** con 100 clientes:
- Contestar sus pedidos y preguntas (menos de 1.000 al mes): **0 €**.
- Un recordatorio de cobro al mes a 40 clientes: 40 × 0,017 ≈ **0,70 €**.
- Una oferta semanal a 100 clientes: 400 × 0,059 ≈ **24 €/mes**. Es lo único caro: se puede enviar solo a los que interesen.
- Total aproximado: **entre 1 y 30 €/mes de WhatsApp**, más lo de la IA.

Las plataformas intermedias (Twilio, respond.io, ManyChat…) cobran además una cuota mensual. **No hacen falta:** lo conectamos directamente.

## Riesgos y cómo evitarlos
- **Respuestas equivocadas** (precio o disponibilidad): al principio Harvey solo **propone** la respuesta y la oficina pulsa «Enviar». Cuando vaya bien, contesta solo lo sencillo (horarios, «¿me apuntas lo de siempre?») y lo demás lo pasa a una persona.
- **Datos de prueba**: no se activa hasta que la app se use de verdad (hoy lo real sigue en Golden).
- **Perder los chats del 609**: comprobar la coexistencia antes, o empezar con un número nuevo.
- **Bloqueos de Meta**: no mandar ofertas a quien no las quiere; botón «no quiero ofertas».

## Orden recomendado
1. **Harvey v2** (preparar pedidos desde un WhatsApp pegado, recordatorios de cobro y contactos, con confirmación). Sirve igual con o sin API.
2. Cuando la app se use de verdad: verificar la empresa en Meta y probar la API con un número de pruebas.
3. Fase «propone y la oficina envía».
4. Fase «contesta solo lo sencillo».

## Fuentes
- Precios España 2026: https://whautomate.com/whatsapp-business-api-pricing-spain · https://www.manycontacts.com/en/blog/whatsapp-business-api-pricing/ · https://engrana.es/en/blog/whatsapp-message-charges-october-2026
- Normas sobre chatbots: https://respond.io/blog/whatsapp-chatbot-policy-2026 · https://techcrunch.com/2025/10/18/whatssapp-changes-its-terms-to-bar-general-purpose-chatbots-from-its-platform

## Mensaje de bienvenida del 609 100 690 (propuesto el 25/11/2026)
Para que cada cliente nuevo diga quién es y la app lo reconozca. Lo pone **el padre (o Tito) en su WhatsApp Business**, no la app (la app no manda nada a nadie). Se envía solo la **primera vez** que alguien escribe o tras 14 días sin hablar; no en cada pedido (a los de siempre les molestaría).
Dónde (sin comprobar en su móvil): WhatsApp Business › ⋮ › **Herramientas para la empresa** › **Mensaje de bienvenida** › activar › editar.

> Hola, gracias por escribir a Ferjusanz 🥔🍅. Para apuntar bien tu pedido, dinos la primera vez:
> 1️⃣ Nombre de tu negocio
> 2️⃣ Dirección de entrega
> 3️⃣ Para qué día lo quieres
> Y lo que necesitas (por ejemplo: 3 kg de tomate, 2 sacos de patata). Si luego quieres añadir algo, escríbelo aquí mismo y lo juntamos. ¡Gracias!

Después, en la app: cuando llegue de un número desconocido, elegir el cliente en «📥 Pedidos entrantes» y pulsar «📱 Guardar este número en su ficha». Los **motes** se escriben en la ficha del cliente («Motes u otros nombres»).
