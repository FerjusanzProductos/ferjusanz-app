# Ficha de Google (Perfil de Empresa): textos listos para pegar

Preparado el 16/11/2026 con las skills `seo-audit` (SEO local) y `copywriting`, con los datos comprobados de `web/LEEME.md`.
La ficha está **verificada desde el 26/11/2026**. Estos textos los pega Tito desde el móvil (ver PENDIENTES).

## Nombre
**Ferjusanz** (o «Ferjusanz Productos Hortofrutícolas»). Solo el nombre real: Google penaliza meter palabras como «fruta Madrid» en el nombre.

## Categoría
- Principal: **Mayorista de frutas y verduras**.
- Secundarias (solo si salen al escribirlas): **Proveedor de huevos**, **Distribuidor de alimentos**.

## Dirección y zona (decidido por Fernando, 16/11/2026: los clientes no van a la oficina)
- **Ocultar la dirección** (C/ Carare, 2 queda solo para Google, sin mostrarse).
- **Zona de servicio**: Madrid, Alcobendas, San Sebastián de los Reyes, Tres Cantos, Pozuelo de Alarcón, Las Rozas, Boadilla del Monte, Majadahonda, Coslada, San Fernando de Henares y Segovia.

## Contacto y horario
- Teléfono: 609 100 690 (el de los botones «Llamar» de la web). Web: la nueva cuando tenga el dominio.
- Horario (Tito, 26/11/2026: el de Mercamadrid): lunes a viernes, de 4:30 a 14:00; sábados, de 4:30 a 13:00. La web dice lo mismo.

## Descripción (708 caracteres; máximo 750)
> Ferjusanz es una empresa familiar de Madrid, en su tercera generación, con más de 60 años en el sector de la fruta y la verdura. Servimos a restaurantes, bares, hoteles, colegios, residencias, comedores y fruterías de Madrid y Segovia. Trabajamos más de 200 productos: fruta, verdura y hortaliza, patatas (también peladas y cortadas), cebollas y ajos, setas, legumbres, hierbas y huevos de gallina y codorniz. Seleccionamos el género cada día en Mercamadrid y con agricultores de confianza, y lo llevamos en camiones y furgonetas refrigerados. Sin pedido mínimo; los pedidos se hacen hasta la tarde anterior. El precio cambia con el mercado: pídalo por WhatsApp o por teléfono y se lo pasamos sin compromiso.

## Servicios (uno por línea en la ficha)
- Fruta al por mayor para hostelería
- Verdura y hortaliza al por mayor
- Patata pelada y cortada para cocinas
- Huevos para hostelería
- Fruta y verdura para colegios y comedores escolares
- Fruta y verdura para residencias de mayores
- Reparto refrigerado en Madrid y Segovia
- Proveedor para restaurantes y residencias que abren (26/11/2026)

## Publicaciones de la ficha («Añadir novedad», con botón «Más información» y el enlace)
1. Restaurantes que abren (26/11/2026):
> ¿Vas a abrir un restaurante en Madrid y buscas proveedor de fruta y verdura? Muchos de nuestros clientes empezaron igual. Te contamos qué preguntar y cómo cuadrar carta y menú con el género. https://www.ferjusanz-frutas-verduras.es/blog/proveedor-fruta-verdura-abrir-restaurante-madrid/

2. Residencias que abren (26/11/2026):
> ¿Abres una residencia en Madrid? Fruta y verdura sin pedido mínimo mientras se llenan las plazas, fruta en calibre pequeño y menús pensados ya para la norma de 2027. https://www.ferjusanz-frutas-verduras.es/blog/proveedor-fruta-verdura-residencia-nueva-madrid/

## Pedir reseñas (lo envía Fernando, a mano, a clientes de verdad)
Pedirlo a **todos** los clientes con los que se trabaja, no solo a los más contentos, sin regalos a cambio y sin decirles qué poner (son las reglas de Google):
> Hola, [nombre]. Gracias por confiar en Ferjusanz. Si quiere contar su experiencia con nosotros, puede dejar una reseña aquí: [enlace de reseñas de la ficha]. Nos ayuda mucho y leemos todas las opiniones. Un saludo, Fernando.

Contestar todas las reseñas con nombre y algo concreto; a una queja, pedir perdón y dar el teléfono, sin datos del cliente.

## Lo que no hacer
- Crear una ficha por cada pueblo o barrio (Google las borra).
- Comprar reseñas o pedirlas solo a los contentos.
- Poner promociones o enlaces en la descripción (van en «Publicaciones»).

## Claude publica en la ficha con Zapier (26/11/2026)
Tito conectó Zapier (conector de claude.ai) y la ficha («Google Business Profile» en Zapier) con **su cuenta de Google, la de la «F»**, no la de facturas (esa no gestiona la ficha). Datos para las llamadas: conexión `021a8d7e-410f-8f1c-a8d8-8f5c8d729871` (la principal), cuenta `accounts/104932642392955165782`, ficha `locations/10599973791966588010`.
- **Publicaciones** (acción `create_post`): Claude las hace sola cuando sale una guía nueva (Tito: «eso hazlo tú») y se lo cuenta después.
- **Respuestas a reseñas** (`create_reply`): hablan en nombre de la empresa → Claude las prepara y **solo las publica con el «sí» de Tito**. Firma: «Fernando».
- Publicaciones a mano solo si el flujo automático falla (ver abajo).
- Leer reseñas y publicaciones: petición GET a `https://mybusiness.googleapis.com/v4/accounts/104932642392955165782/locations/10599973791966588010/reviews` (o `/localPosts`).
- 26/11: publicadas por Tito las de restaurantes y residencias que abren; contestada por Claude la reseña de Ainhoa (5★).
- **Automático desde el 26/11/2026** (Tito: «Que se haga solo»): flujo de Zapier «Guía nueva de la web → ficha de Google» (https://zapier.com/workflow/01a21757-a0fc-7e17-99ea-d67f0ceaaa42, privado, activo). Vigila `https://www.ferjusanz-frutas-verduras.es/feed.xml` (lo genera `web/construir.cjs` con las 10 últimas guías) y, por cada guía nueva, publica en la ficha título + descripción, la foto de la guía y el botón «Más información». Solo enlaces de `/blog/`. Para pararlo: apagarlo en ese enlace. Probado con la guía de catering de línea fría (publicada el 26/11).
- **Fotos a la ficha** (26/11/2026): petición POST con `_zap_raw_request` a `https://mybusiness.googleapis.com/v4/accounts/104932642392955165782/locations/10599973791966588010/media`, cuerpo `{"mediaFormat":"PHOTO","locationAssociation":{"category":"ADDITIONAL"},"sourceUrl":"<foto ya publicada en la web>"}` (con categoría AT_WORK dio error). Subidas las 7 fotos del 26/11.
