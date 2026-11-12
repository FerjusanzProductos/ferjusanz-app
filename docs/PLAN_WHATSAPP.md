# Plan: WhatsApp automático (Harvey contesta solo)
_Preparado el 12/11/2026 a partir del vídeo «Construye un agente de IA para WhatsApp en 30 minutos con Claude Code» (revolutia). **Solo es un plan: no se ha montado nada.** Sigue aparcado hasta que Fernando lo diga._

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
