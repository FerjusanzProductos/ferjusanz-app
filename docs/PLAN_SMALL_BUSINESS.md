# Plan: aprovechar el plugin «Small Business» de Anthropic en FERJUSANZ
_Preparado el 13/11/2026 a partir de la guía de El Hipster (PDF en el Drive de Fernando) y del estado real de la app (normal v285, pruebas v287). **Solo es un plan: no se ha instalado ni cambiado nada.** Fernando: «Sí» a guardarlo._

## 1. Qué es y si nos sirve
- **Oficial de Anthropic** (repo `anthropics/knowledge-work-plugins`, licencia Apache 2.0). Gratis con plan de pago. 44 habilidades y unos 35 conectores (septiembre de 2026).
- Se instala en **Cowork**, dentro de la app de Claude **de ordenador** (Windows/Mac). **No se puede en el móvil Android.**
- **No hace falta instalarlo**: 10 habilidades ya están copiadas en `.claude/skills/` (13/11/2026) con las reglas de Ferjusanz (`.claude/shared/FERJUSANZ.md`) y funcionan en Claude Code en la nube, desde el móvil, con Supabase y Golden. En Cowork estarían «a ciegas».
- Está pensado para EE. UU.: impuestos, nóminas, QuickBooks… no sirven.

## 2. Las 44 habilidades
| Grupo | Habilidades |
|---|---|
| ✅ **Ya instaladas (10)** | reactivate, lead-finder, lead-triage, call-list, outreach-composer, invoice-chase, cash-flow-snapshot, ap-processor, business-pulse, contract-review |
| ⭐ **Añadir (10)** | speed-to-lead (responder al formulario `/nuevos-clientes`), proposal-builder (ofertas formales para residencias, colegios, restaurantes), grant-rfp-writer (**licitaciones públicas** de suministro de fruta), grow-pipeline + crm-autopilot (con la tabla `prospectos`, no HubSpot), monday-brief, inbox-manager (junto a `/resumen-correo`), ticket-deflector (quejas con datos del pedido), restock (compra sugerida), seo-ai-visibility (web nueva), review-reputation (reseñas de Google; la usa reactivate) |
| ⏳ **Más adelante (8)** | content-strategy, social-content-engine, brand-style, ad-manager, report-pack, report-builder, close-month, pay-the-bills, growth-pulse / marketing-monday |
| ❌ **No sirven** | tax-prep, tax-season-organizer, plan-payroll, payroll-prep (EE. UU.); smb-onboard, smb-router, build-connector, build-agent (solo Cowork; nosotros: `CLAUDE.md`, kit y tareas programadas); month-end-prep (lo hace 🏦 Banco); inventory-planner (la fruta no se almacena); job-post-builder, hiring-screener (hasta que haya que contratar); canva-creator (solo si se usa Canva) |

Las habilidades funcionan en el chat de Claude. **Harvey** (dentro de la app, para el equipo) no las usa directamente: se le pasa la lógica de las mejores como herramientas nuevas en `supabase/functions/harvey-v2`.

## 3. Harvey comercial: qué le falta
Ya hace: «Hoy, a quién escribir», ofertas para recuperar clientes (compra + 0,25 €), productos dejados, tarifas, contactos, «volver a llamar», confirmar previstos (ver `supabase/functions/harvey-v2/LEEME.md`).
Nuevo:
1. **Investigar una empresa en internet** (cocina, tamaño, NIF) y crear su ficha de contacto, con «✅ Sí, hazlo». Herramienta de búsqueda web de la API de Anthropic (céntimos por consulta).
2. **Prospectos parecidos a los mejores clientes**, puntuados (lógica de lead-finder + lead-triage). Base: 1.098 clientes y 42 contactos reales.
3. **Oferta personalizada en PDF** por tipo de cliente con precios de Golden (proposal-builder + listas de precios actuales).
4. **Seguimiento a los 2, 5 y 10 días**: avisa y prepara el mensaje.
5. **Escribe como Fernando** (perfil de voz sacado de su correo enviado; outreach-composer).
6. **Enviar tarifas por correo** desde el Gmail de la empresa (`albaranes-correo`), con botón «Enviar» que pulsa una persona.
7. **WhatsApp**: hoy borrador y lo envía una persona; automático con la API de Meta (`docs/PLAN_WHATSAPP.md`).

## 4. Automatizaciones por área (✅ = ya existe; no duplicar)
| Área | Ya tenemos | Nuevo propuesto |
|---|---|---|
| Pedidos | ✅ Fijos, previstos, semana | Pedido desde un WhatsApp pegado (herramienta 3 de Harvey v2) |
| Facturación | ✅ Fases 1–7 (`docs/PLAN_FACTURACION.md`) | Nada del plugin (EE. UU.) |
| Cobros | ✅ Deudas, Banco, Caja | Recordatorios con el tono de cada cliente (invoice-chase → herramienta 4 de Harvey) |
| Proveedores | ✅ Lector de facturas, ⚠️ Raros, 📈 Suben | Calendario de pagos (sin pagar nada) y argumentos para negociar precios |
| Compra | ✅ Hoja de compra, lotes | Compra sugerida por día de la semana (restock) |
| Reparto | ✅ Modo reparto | — |
| Contabilidad | ✅ Informes para Jorge | Previsión de caja 30/60/90 días (cash-flow-snapshot) |
| Marketing | ✅ `/nuevos-clientes` | Reseñas de Google, SEO de la web nueva, licitaciones públicas |
| Atención al cliente | ✅ Portal, quejas en Harvey | Respuestas a quejas con datos del pedido; resumen de correo con borradores |

## 5. Conectores
- **Ya tenemos (gratis)**: Gmail, Google Drive, Supabase, GitLab, Cloudflare, GitHub. Configurados: Firecrawl, Playwright, Perplexity, PostHog, Context7 (el 13/11/2026 Perplexity, PostHog, Context7 y Firecrawl fallaron al conectar en la sesión).
- **Gratis, sin conectar**: Google Calendar (bloquear tiempo de llamadas).
- **De pago, solo si hace falta** (precios aproximados, comprobar antes): Shopify (tienda, `docs/PLAN_TIENDA.md`), Canva Pro, API de WhatsApp (1–30 €/mes), anuncios de Meta (5–10 €/día), Apollo (poco útil para bares de Madrid).
- **No sirven**: QuickBooks, Xero, MYOB, NetSuite, Zoho, Stripe, PayPal, Square, Airwallex, HubSpot, Salesforce, Gusto, Slack, Zapier, Docusign, Microsoft 365.

## 6. Fases (una tarea por sesión; primero en la app de PRUEBAS; publicar con «Autorizo publicar»)
- **Fase 0 (ya, 0 €, desde el móvil)**: usar las 10 instaladas con datos reales de Golden: clientes que dejaron de comprar con borradores (reactivate) y prospectos en Madrid norte/noroeste y Segovia (lead-finder).
- **Fase 1 (antes del arranque, ventas)**: 1) Harvey investiga empresas y crea la ficha · 2) ofertas en PDF · 3) Harvey escribe como Fernando · 4) licitaciones públicas (grant-rfp-writer).
- **Fase 2 (al arrancar de verdad, tiempo)**: pedido desde WhatsApp · recordatorios de cobro · seguimiento diario (ya preparado, en pausa) · respuesta rápida al formulario (speed-to-lead).
- **Fase 3 (enero, rentabilidad)**: previsión de caja con cobros reales · calendario de pagos · negociación con proveedores.
- **Fase 4 (crecer)**: WhatsApp automático · reseñas de Google · anuncios · web nueva · tienda.

Recomendado empezar por **Fase 1.1 «Harvey investiga y prepara la oferta»**.

## 7. Móvil u ordenador
- **Móvil (Claude Code en la nube)**: todo lo de arriba: habilidades, Harvey, base de datos, app naranja y publicar.
- **Ordenador**: instalar el plugin en Cowork (no hace falta), sacar el Excel de clientes de Golden, certificado FNMT. Verificación de la empresa en Meta: mejor en ordenador.

## Fuentes
- https://claude.com/resources/tutorials/how-to-install-the-claude-for-small-business-plugin
- https://zapier.com/blog/claude-for-small-business/
- https://christopheralarcon.com/blog/claude-for-small-business/
- https://techinformed.com/anthropic-brings-claude-workflows-to-small-businesses/
