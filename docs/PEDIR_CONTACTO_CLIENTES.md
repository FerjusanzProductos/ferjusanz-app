# 📇 Pedir correo y teléfono a los clientes (18/11/2026)
Encargo de Fernando: «a los clientes que no tengan correo o teléfono envíales un correo… pídeles que te pasen un correo y teléfono para enviarles la factura. Localízalos. Y añades esa pestaña en la app en clientes».

- **Quiénes**: solo clientes **activos** sin correo o sin teléfono (166 el 18/11; sin la ficha `0001`). A los inactivos no se les escribe.
- **Lo encontrado en internet** está en `cliente_propuestas` (campo `email`/`telefono`, con fuente y confianza; solo alta y media). **No se ha tocado ninguna ficha**: la oficina pulsa «✔ Usar». 17 correos y 36 teléfonos (18/11). Las búsquedas fueron limitadas: el entorno no deja abrir varios directorios (Tripadvisor, Páginas Amarillas, einforma…), Firecrawl falló y Gemini no tenía cupo; casi todo sale de resúmenes del buscador.
- **Estado de cada petición**: tabla `cliente_peticion_contacto` (SQL `20261202a`): `enviado_a`, `enviado_at`, `contestado_at`. En la app: Clientes › «📇 Pedir correo y teléfono».
- **Correos**: 25 **borradores** en Gmail (cuenta de facturas), asunto «Ferjusanz: correo y teléfono para enviarle las facturas». **No enviados**: esperan el «sí» de Fernando. Al enviarlos, apuntar en `cliente_peticion_contacto` (`enviado_a`, `enviado_at = now()`).
  - 17 a correos encontrados en internet: AMIRA, BACAM, BASTIAN, BECERRIL (registro del Ayuntamiento), BERMUT, BULE, C.REGGIO, CAPARRA, CARAMBOLA, CARNICERO, CARPANES (media), CECA (media), CHATO, CHICO (media), CREPE (media), DEFINITIVA (media), MESONCAN.
  - 8 a correos que ya estaban en su ficha (les falta el teléfono): CAEL93, CLARA, COMIC, DOCU, EL21, FIGAL, L-EVROPE, ORGAZ.
- **Sin correo público** (unos 140): no se les manda nada; en la pestaña salen como «📞 Sin correo público: llamar».
- **Dudas que mirar**: ARROZ (en internet solo existe en otra dirección), CARDENAL y Las Musas (los datos son del colegio/instituto, no de la cafetería), TENIS (datos del club, no del restaurante), BULE y BULEVAR quizá son el mismo, HATA y HANDYMAN también, «Falta poner 10» = EPOCA.
