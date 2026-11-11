# 00 · Resumen general de FERJUSANZ
_Actualizado el 11/11/2026. Para leer de un vistazo y para contárselo a Jorge. Versión bonita para el móvil: `resumen.html` (en esta misma carpeta) y la página de Claude que enlaza `claude/LEEME.md`._

## 1. Dónde está todo
- **GitLab (lo principal)**: https://gitlab.com/ferjusanz-productos/ferjusanz-app → carpeta `claude/` (este índice) y `docs/` (los documentos completos).
  - Es **privado**: primero hay que **iniciar sesión** en https://gitlab.com/users/sign_in con la cuenta de Fernando. Si no, GitLab manda a su página de publicidad (about.gitlab.com).
  - En el móvil, mejor en **Chrome** que en una aplicación.
- **GitHub (copia de seguridad)**: `FerjusanzProductos/ferjusanz-app`, mismo contenido.
- **App normal**: https://ferjusanz-productos.fernandosanzalba.workers.dev (v210) · **App de pruebas** (naranja): https://ferjusanz-pruebas.fernandosanzalba.workers.dev (v209).

## 2. Lo que ya hemos hecho
**La app (7–11/11/2026)**
- Pedidos, pedidos fijos y previstos, calendario, pantalla Semana, «📆 Pasar a otro día».
- Albaranes enviados por correo al entregar (no impresos), copia con código de Golden, portal privado del cliente.
- Clientes sin IVA en azul; tarifas y listas de precios por WhatsApp y PDF.
- Lector de facturas de proveedor con IA, pantalla Precios / facturas, «⚠️ Raros» (precios raros) y «📈 Suben» (subidas frente a la media de 14 días).
- Unidades y formatos de compra y venta de todos los productos (caja, bandeja, bolsa, pieza, manojo, docena, bote) con detección de los mal puestos.
- «Lo de siempre» de cada cliente aprendido del historial de Golden.
- Trazabilidad por lote más antiguo.
- Harvey (asistente comercial con IA) y ayuda 🆘 con IA y «Hazlo conmigo».
- «📤 Informes para Jorge» dentro de la app.
- Modo prácticas (morado) y app de pruebas (naranja) separada.

**Organización y seguridad**
- Memoria permanente de Claude (`docs/`) y mapa por áreas (`claude/`).
- GitLab maestro + GitHub copia; copia nocturna de la base de datos (90 días).

**Planes preparados**
- Llevarnos la web de Creativate (`docs/PLAN_WEB.md`).
- Tienda online y ser proveedores de otras tiendas (`docs/PLAN_TIENDA.md`).

## 3. Lo que hay que saber
- La app **todavía no se usa de verdad**: se sigue trabajando y **facturando en Golden Soft**. Los pedidos y cobros de la app son de prueba.
- **Verifactu** lo cumple Golden Soft (quien factura), antes del 1/1/2027. La app no factura.
- Datos reales en la app: historial de Golden, clientes, productos, contactos y facturas de proveedores.
- Reglas fijas: nada se publica sin «Autorizo publicar»; no se borran datos ni se tocan precios, facturas, cobros o permisos sin confirmación; las claves nunca por el chat.
- Coste: la app y su alojamiento (Cloudflare) son gratis; se paga la IA (Anthropic) según uso y Supabase.

## 4. Lo que quiero hacer (planes)
1. Empezar a usar la app de verdad (dejar Golden solo para facturar).
2. Web nueva propia, más rápida y mejor en Google, sin Creativate.
3. «Haz tu pedido» online para hostelería y colectividades; catálogo de WhatsApp Business y Google; más adelante Shopify.
4. Agentes de Claude: seguimiento diario, cobros, ofertas semanales, buscador de clientes nuevos, compras y facturas.

## 5. Pendientes
### App
- 🟡 Confirmar formatos: Mango, Bote Garbanzos, Nabo, Cogollos de Tudela, Fresón 1ª.
- 🟡 Lista completa de clientes sin IVA y si «Bar Delfín» = «Bar Delfines».
- 🟡 Último número de albarán de Golden (serie F) al empezar de verdad.
- ⏸ Seguimiento comercial dentro de la app (hecho en pruebas, espera a usar la app de verdad).
- 🔴 Copia de seguridad de fotos, PDF y audios.
- ⚪ Revisión de diseño en el móvil; app más ligera; auditoría de seguridad.

### Web
- 🟡 Quitar la página de COVID («Entrega a domicilio»): pedírselo a Creativate.
- 🟡 Mirar contrato/facturas de Creativate y enviarles las preguntas del plan.
- ⚪ Hacer la web nueva y trasladar el dominio (cuando tengamos los accesos).

### Redes, Google y WhatsApp
- 🟡 Ficha de Google (Google Business Profile): conseguir la propiedad, fotos y reseñas.
- 🟡 Catálogo de WhatsApp Business y productos en Google.
- ⚪ Enlazar Instagram y Facebook con la web nueva.
- ⚪ WhatsApp automático desde el 609 567 354: aparcado.

### Proyectos y agentes
- 🔴 Agente de compras: falta el comprobador Golden ↔ albaranes (esperando archivo de ejemplo de Golden).
- 🟡 Agente de cobros · Harvey v2 · tienda «Haz tu pedido».
- ⚪ Buscador de clientes nuevos · ofertas semanales.

### Técnico
- 🟡 Activar en GitLab la copia automática a GitHub · comprobar la copia nocturna.
- 🟡 Poner las claves de los conectores (Gemini, Firecrawl, Perplexity, PostHog).
- ⚪ Borrar ramas viejas y el Worker antiguo `ferjusanz`.

## 6. Para la reunión con Jorge (contable)
- Enseñarle «📤 Informes para Jorge» en la app y el documento: https://claude.ai/artifact/8Da6PSY7rvVAzn8aTpStTC
- Explicar que la facturación sigue en Golden Soft (Verifactu cubierto por Golden).
- Preguntarle: qué informes quiere cada mes y en qué formato; clientes sin IVA (azul) y cómo se reflejan; facturas de proveedores leídas por la app (¿le sirven?); costes de la app (IA y Supabase) y cómo se contabilizan; dominio y web (quién es el titular, gasto con Creativate).
