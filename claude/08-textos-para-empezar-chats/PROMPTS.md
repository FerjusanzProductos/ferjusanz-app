# Prompts para empezar conversaciones nuevas con Claude (Ferjusanz)
Copia SIEMPRE el bloque «Contexto» y debajo el de la tarea. Una tarea por conversación.

## Contexto (pegar siempre primero)
Hola Claude. Háblame en español, paso a paso y pensando que trabajo desde el MÓVIL (Android, Chrome). Consúltame antes de borrar o cambiar algo importante y no publiques nada sin enseñármelo.
Proyecto: app de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. (mayorista de fruta, verdura, patatas y huevos en Mercamadrid). Usa el entorno «ferjusanz-app».
1. Clona https://gitlab.com/ferjusanz-productos/ferjusanz-app.git (rama main).
2. Antes de nada lee: LEEME.md, docs/REGLAS_INTERNAS.md, supabase/functions/harvey/LEEME.md y supabase/migrations/.
3. Publicar la app: CLOUDFLARE_API_TOKEN=proxy-injected CLOUDFLARE_ACCOUNT_ID=9a4f085c6f3a0c2671fa344c288b3e46 npx -y wrangler@4 deploy (subiendo antes la versión de public/sw.js). Prueba antes en local (npx wrangler dev) y en Modo prácticas.
4. Base de datos: Supabase, proyecto hvydnjaswdexttogsyen. Si necesitas acceso, pídeme una llave por el formulario seguro (nunca por el chat).
5. La app todavía está en pruebas: no crees pedidos ni datos reales para probar; usa el Modo prácticas.
6. Guarda cada cambio en GitLab y documenta las reglas nuevas en docs/REGLAS_INTERNAS.md.

## 1. Revisión de diseño (con las skills web-design-guidelines y frontend-design)
Haz una revisión de diseño y usabilidad de la app (public/index.html) con las skills «web-design-guidelines» y «frontend-design» (y si están, las de audit-suite de UX y accesibilidad). Céntrate en el móvil: tamaño de botones para el dedo, contraste al sol, textos claros, orden de las pantallas más usadas (Preparar, Semana, pedido, albarán, carga, compra, cobros) y rapidez. Haz capturas en Modo prácticas. Dame una lista PRIORIZADA de mejoras (qué, por qué, esfuerzo) y no cambies nada hasta que te diga cuáles.

## 2. Agente buscador de clientes (leads)
Quiero un agente que busque negocios NUEVOS con COCINA PROPIA (restaurantes, colegios y residencias con cocina, caterings) en Madrid norte y noroeste y algo de Segovia, compruebe datos públicos (teléfono, web, que cocinan) y los meta en la tabla «prospectos» SIN duplicados (compara con prospectos y clientes). Cliente ideal: La Figal de Pablo (hostelería), Colegio Reggio y Residencia El Pardo de Aravaca (colectividades). Propón cómo montarlo (función de Supabase + API de Claude con búsqueda web), cuánto costaría al mes y haz primero una prueba con 10 negocios que yo revise antes de guardar.

## 3. Agente de seguimiento diario
Quiero que cada mañana la app me diga a quién llamar o escribir hoy: contactos pendientes con fecha de «volver a llamar», clientes nuevos a los que hacer seguimiento, pedidos fijos «previstos» sin confirmar para mañana y clientes que han dejado de pedir. Que prepare los mensajes (WhatsApp con el número ya puesto, o guion de llamada) para que yo solo confirme y envíe. Propón diseño (pantalla en la app y/o aviso al móvil) y coste, y empieza por lo más simple.

## 4. Agente de ofertas semanales
Con las recomendaciones y listas de precios de la semana, prepara ofertas por tipo de cliente (restaurantes, colegios, residencias, caterings) listas para enviar por WhatsApp o como lista de precios en PDF. Respeta las reglas internas de productos (nombres y códigos). Nunca prometer descuentos ni plazos de pago. Propón y enséñame un ejemplo antes de montarlo.

## 5. Agente de cobros
Quiero un aviso de deudas: qué clientes deben, desde cuándo y cuánto (vista v_pedidos_importe y cobros), ordenado por urgencia, y que prepare recordatorios educados por WhatsApp para que yo los revise y envíe. Ojo: los clientes en AZUL (sin IVA) llevan la línea «Descuento por productos». Propón y empieza por un listado simple.

## 6. Agente de compras y facturas de proveedor
Quiero que revise las facturas de proveedor leídas (lineas_factura_leida, tarifas_compra): que avise de precios raros (subidas o bajadas fuertes frente al histórico), de productos mal apuntados según las reglas internas (fcRegla* en index.html) y de pedidos o productos cuyo margen baje de un mínimo que yo te diga. Y un «comprobador»: comparar las facturas de Golden Soft con los albaranes de la app (producto y cantidad). Para lo de Golden te mandaré un archivo de ejemplo.

## 7. Harvey orquestador (versión 2)
Harvey (supabase/functions/harvey) ya consulta clientes, deudas, pedidos, ventas, contactos y quejas, y da de alta clientes provisionales con confirmación. Quiero ampliarlo para que pueda, SIEMPRE pidiéndome confirmación antes: apuntar contactos y «volver a llamar el…», confirmar pedidos previstos, preparar pedidos a partir de un WhatsApp, y preparar recordatorios de cobro. Propón las herramientas, cómo se confirma cada acción en la app y el coste; empieza por una. Ten en cuenta `docs/PLAN_WHATSAPP.md`: más adelante Harvey contestará el WhatsApp con la API de Meta, así que lo que hagas debe servir también para eso.

## 8. Copias de seguridad de fotos y PDF
La copia diaria de GitLab (scripts/copia-supabase.sh) guarda la base de datos, pero no los archivos de Supabase Storage (fotos, PDF de facturas, firmas). Propón cómo copiarlos periódicamente y gratis, y hazlo.
