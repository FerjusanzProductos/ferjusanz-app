# Pendientes de FERJUSANZ
_Mantener al día: al terminar una tarea, marcarla ✔️ y pasarla a HISTORIAL.md. Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda._

## Por publicar o decidir
- ✔️ 12/11/2026: **Arreglo del aviso falso «hay una nueva versión»** publicado en la normal (v251, «Autorizo publicar»). Pruebas en v250.
- ✔️ 12/11/2026: **Usuario de Jorge Ruiz Onetti** (oficina) creado, con contraseña provisional.
  - 🟡 Añadir a la app **«Cambiar mi contraseña»** (en Mi perfil) y **«He olvidado la contraseña»**, para que Jorge (y los demás) puedan poner la suya. Hoy no existe.
- ✔️ 12/11/2026: **📦 Sacar de la furgoneta antes de entregar** publicado en la normal (v239, «Autorizo publicar»). Pruebas en v238.
- ✔️ 12/11/2026: **🚚 Modo reparto** publicado en la normal (v247, «Autorizo publicar»); rama `modo-reparto` ya juntada con `main`:
  - 🟡 **Fase 1** en PRUEBAS (v240): que Fernando la pruebe en Modo prácticas. No decir «terminado» hasta probarlo con él.
  - 🟡 **Mover con el dedo + flechas ↑↓ + «Poner el orden de siempre»** (v241) y **➕ Venta en ruta** dentro del Modo reparto (v242) y **recuerdo CON/SIN IVA** (v243) en PRUEBAS: que Fernando lo pruebe.
  - 🔴 Venta en ruta a cliente sin IVA: **recalcular sola** el descuento (Fernando: «que lo haga la app sola»). ✔️ Aplicado en Supabase y v244 en PRUEBAS: que Fernando lo pruebe.
  - ✔️ Aplicado en Supabase (12/11, «listo»): todos pueden cambiar el orden del reparto.
  - 🟡 Fase 2 en PRUEBAS (v245): albarán fijo arriba + cobro (contado/pendiente) + firma si no paga + «Cambiar algo» y «← Volver al reparto». Que Fernando la pruebe.
  - 🟡 Fase 3 en PRUEBAS (v246): «📦 Cómo cargar la furgoneta» (orden inverso). Que Fernando la pruebe.
  - ✔️ Juntado con `main` y publicado (v247). Queda: ver cómo va con los repartidores (la app sigue en pruebas: Modo prácticas).
  - ✔️ Fernando (12/11): el orden lo pueden cambiar **todos** (SQL pendiente de aplicar, arriba).
- ✔️ 12/11/2026: **Avisos en ROJO de precios y pesos que faltan + «atrás» en el portal del cliente** publicados en la normal (v234, «Autorizo publicar»). Pruebas en v233 con lo mismo.
- ✔️ 12/11/2026: **Arreglos de Preparar → Entregar → Facturar** publicados en la normal (v232, «Autorizo publicar»).
  - ⚪ Propuestas sin hacer (que decida Fernando): unidades «ud» en el albarán para cajas/bandejas.
  - ✔️ 12/11/2026: hoja de **Carga** por repartidor y orden de reparto y correo del albarán con «No servido», publicados en la normal (v236, «Autorizo publicar»).
- ✔️ 12/11/2026: **🚦 Camino de los pedidos** publicado en la normal (v232, junto con los arreglos de arriba). Que Carmen, Jorge y los preparadores lo vayan mirando y digan qué echan en falta.
- ✔️ 12/11/2026: **Facturas con retraso** publicado en la normal (v228, junto con el nº real). SQL `20261112c_facturas_con_retraso.sql` aplicado con Fernando («listo»).
- ✔️ 12/11/2026: **Entrega en mano, orden nuevo** (albarán arriba + firma → paga o debe → enviar) publicada en la normal (v223). Pruebas en v224 con lo mismo.
- 🟡 Vídeo «5 skills para Claude Code»: superpowers e impeccable activados (12/11). La 4.ª es **ponytail** (ya instalada). La 5.ª no se vio; Fernando pidió **taste** (activada 12/11). Si en el vídeo la 5.ª es otra, pasar captura. Claude-Mem: solo en su ordenador si lo quiere.
- 🟡 **Clips cortos de vídeos (skill `shorts`)**, 12/11/2026: lista y probada. Para usarla con YouTube, Fernando tiene que añadir `*.googlevideo.com` en los ajustes de red del entorno «ferjusanz-app» (Settings → Network access → Allowed domains). Luego mandar el primer enlace de un vídeo propio.
- ✔️ 11/11/2026: **Entrega en mano paso a paso** publicada en la normal (v212) con «Autorizo publicar». Pruebas queda en v211 con lo mismo.
- 🟡 Confirmar con Fernando: **Mango** (¿se compra por caja? ¿cuántas piezas trae?), **Bote Garbanzos** (¿por bote?), **Nabo, Cogollos de Tudela y Fresón 1ª** (se compran más caros de lo que se venden por kg: ¿caja/manojo?).
- 🟢 **📦 Formatos de compra y venta** (Más → 📐 Formatos): base de datos aplicada (11/11) y publicado en la normal (v210) con detección automática. Piparras Tarro ya por bote (lo hizo Fernando). Fernando dice que hay «muchísimos» mal: la detección encuentra 9; pedirle ejemplos de los que vea mal para añadir la regla que falte.
- ✔️ 11/11/2026: **«📄 Ver factura», «💶 Precios de venta» y avisos en Facturas de proveedores** publicados en la normal (v207).
- ✔️ 11/11/2026: **Arreglos de «Pasar a otro día» + «⚠️ Raros»** publicados en la normal (v202) con «Autorizo publicar».
- ✔️ 11/11/2026: **Pasar previstos a otro día** publicado en la normal (v199). Ojo: la app de pruebas (v198) ya no lleva el «Seguimiento comercial» (rama `seguimiento-app`, en espera).
- ✔️ 11/11/2026: TODO lo de pruebas publicado en la normal (v194): Informes para Jorge, ayuda guiada 🆘, Harvey con WhatsApp natural, Precios / facturas y «lo de siempre» con Golden.
- 🟡 Desde ahora la app de pruebas sale de `main` (+ el cambio que se esté probando). No volver a dejar cosas solo en pruebas.
- 🟡 Juntar la rama `memoria-permanente` (estos documentos) con main y borrar las ramas ya incluidas.
- ⚪ Borrar el Worker antiguo `ferjusanz` en Cloudflare.

## Pedido por Fernando el 10/11/2026 (pantalla Precios / facturas de proveedor) — ✔️ publicado (v190)
- ✔️ Publicado en la app normal (v190) el 11/11/2026 con «Autorizo publicar».
- 🟡 **Fernando decide**: corregir en la ficha de los productos la unidad de venta (ahora todos salen «kg»): Arándano (513) y Frambuesa (310) → bandeja; Ensalada Campestre (137-P) → bolsa. Mora del bosque (257) → bandeja (confirmado 11/11). Mientras tanto la app ya usa la unidad buena al leer facturas y al apuntar precios.

## Revisado el 11/11/2026 (para cuando se empiece de verdad)
- ✔️ **Unidades de TODOS los productos**: aplicado el 11/11/2026 (Fernando lo pegó en el editor SQL de Supabase). 37 productos por caja, bandeja, bolsa, pieza, manojo o docena, cobrados por unidad; pedidos fijos y previstos también. Los previstos nuevos ya salen bien.
- ✔️ **«Lo de siempre» con Golden**: publicado (v194) y función `memoria_golden` creada en Supabase el 11/11/2026: lo ve todo el equipo (sin precios).
- 🟢 **Trazabilidad**: hecha y lista (lote más antiguo, reparto, confirmar todo). Empieza a funcionar sola en cuanto se registren compras con lotes.
- ✔️ 12/11/2026: **Facturas con nº real y «PROVEEDOR · Fra. Nº»** publicado en la normal (v227, y sigue en v228). Comprobar que las 13 de MADREMIA con «Factura_Electronica» se corrigen al abrir la lectura de facturas con oficina/administración.
- ✔️ 12/11/2026: **Arreglos de trazabilidad** publicados en la normal (v222) y migración `20261112b_trazabilidad_arreglos.sql` aplicada (incluye: el peso ya no admite un lote de otro producto).

## En marcha (11/11/2026)
- ⏸ **Seguimiento comercial dentro de la app**: hecho en PRUEBAS (v197, rama `seguimiento-app`). **En espera hasta que se empiece a usar la app de verdad** (Fernando, 11/11: hasta entonces los previstos son de prueba y no hay cobros). La tarea programada de Claude (`trig_016V26ajMMcPLQ3Zvg1C2dw2`) está PAUSADA por lo mismo. Falta crear en Supabase la tabla, la función y el programador (`supabase/migrations/20261111c_seguimiento_diario.sql`) con Fernando delante («listo») o pegándolo él en el editor SQL. Luego probar, «Autorizo publicar» y **quitar la tarea programada de Claude** (`trig_016V26ajMMcPLQ3Zvg1C2dw2`) para no duplicar.
- 🟡 **Web `www.ferjusanz-frutas-verduras.es`** (revisada el 11/11/2026, sin tocar nada): WordPress con plantilla Divi, hecha por **Creativate.es** («Hecho con ♥ por Creativate.es»). Web, DNS y correo del dominio en el mismo alojamiento (servidores `controldeservidor.com`, IP 217.61.210.26). La web enseña `ferjusanz@hotmail.com`, 91 763 21 86 y 609 100 690; tiene Google Tag Manager y botón de WhatsApp. Página antigua de COVID todavía publicada.
  - 🟡 **Quitar la página de COVID** (pedido por Fernando el 11/11/2026): es «Entrega a domicilio» del menú principal (`/servicios-de-distribucion-y-exportacion/entrega-a-domicilio-frutas-y-verduras-por-covid19/`). Claude no tiene acceso a WordPress: se lo pide Fernando a Creativate (quitarla del menú, despublicarla y redirigir esa dirección a la portada). Si algún día tenemos los accesos, lo hace Claude.
  **Plan completo, preguntas, riesgos y costes: `docs/PLAN_WEB.md`** (11/11/2026). Siguiente paso: Fernando mira contrato/facturas de Creativate y les envía las preguntas.
  Plan: dejar a Creativate, pedirles código de transferencia del dominio (y confirmar que el titular es FERJUSANZ), accesos de WordPress y del alojamiento, copia completa, buzones de correo del dominio (si los hay) y acceso a Google Tag Manager/Analytics. Que NO borren nada hasta el traslado. Luego la llevamos nosotros con Claude.
- ✔️ **Reunión con Jorge (contable) el 13/11/2026**: hoja de preguntas https://claude.ai/artifact/1dM6shj1VjYVBsyr3wxtr7 (qué ve, qué le manda Carmen y que cuadre, legalidad, Golden mínimo). Al volver: pasar sus respuestas a la tabla del final y ajustar «Informes para Jorge» (p. ej. NIF e IVA de facturas de proveedores, que hoy no se guardan).
- 🔴 **Facturar desde la app desde el 1/1/2027** (respuestas de Jorge, 12/11/2026). Plan, requisitos y fases: **`docs/PLAN_FACTURACION.md`** (una fase por sesión). Fase 2 hecha en PRUEBAS (v259). **Fase 3 (facturas recibidas)**: código hecho en PRUEBAS (13/11/2026).
  - ✔️ SQL `20261113b_facturas_recibidas_fiscal.sql` pegado por Fernando en pruebas (13/11). App de pruebas v263.
  - ✔️ SQL `20261113c_subir_factura_recibida.sql` pegado por Fernando en pruebas (13/11).
  - 🟡 Que Fernando lo pruebe en la app naranja: Compras → «🧾 NIF e IVA».
  - ✔️ Jorge: «Compra de mercaderías» le vale como concepto del listado de compras (13/11/2026).
  - 🟡 Avisar a Jorge (e Ibérica) de la factura FV-B-26-032668 a nombre de FERJUSANZ C.B.
  - ✔️ Código publicado en la normal (v264, 13/11), oculto allí.
  - ✔️ **Activado en la normal (v265, 13/11/2026)**: tablas creadas en la base real (Fernando).
  - 🟡 Oficina (Carmen): en Compras → «🧾 NIF e IVA», tocar «📖 Leer NIF e IVA de las facturas que aún no lo tienen» y revisar los avisos. Poner a mano el NIF de los proveedores que no lo traen como texto (Pataleta, Perichán…).
  - Siguiente: **fase 4, listados para Jorge**.
  - 🟡 **Fase 2 (facturas emitidas)** hecha en PRUEBAS (v259, 12/11/2026; v261 arregla el «permission denied»; v262 pone código y lote/origen en la factura: hay que entrar con `fernando@pruebas.invalid`). ✔️ Arreglo de la sesión publicado en la normal (v264, 13/11). Que Fernando la pruebe en la app naranja (Más → «🧾 Facturas (desde la app) · PRUEBAS»). Hay 2 albaranes de ensayo sin facturar (Aguila Rock, 1.037 € para probar el límite del efectivo; y un cliente sin NIF). Código publicado en la normal (v260, «Autorizo publicar»), pero allí el botón no sale y la base real no tiene las tablas: para facturar de verdad hace falta crearlas (quedan bloqueadas) y la declaración firmada.
    - ⚪ Mejora pequeña para el próximo SQL: en la factura, la unidad de lo que no va por kg sale «ud»; mejor la del pedido (manojo, caja, bandeja…).
    - ⚪ Poner el **IBAN** en «Datos de la empresa» para que salga en las facturas por transferencia.
    - ⚪ Bloquear también el EFECTIVO al cobrar en la entrega si el albarán llega a 1.000 € (hoy solo se bloquea en la factura).
    - 🟡 Jorge: si «una operación» para el efectivo es la factura mensual o cada albarán (hoy la app usa el total de la factura, lo más prudente).
    - ⚪ Para facturar de verdad: crear las tablas en la base real (quedan bloqueadas), huella encadenada, QR y envío Verifactu (fase 8) y declaración firmada.
  - ✔️ **Fase 1 (datos fiscales)** publicada en la normal (v255, «Autorizo publicar»). ✔️ Tabla `empresa` creada en pruebas y en la real («listo», 12/11/2026).
  - ✔️ 12/11/2026: 609 567 354 quitado de la factura y de los **albaranes** (v254 en PRUEBAS). Publicado (v255) y función `albaranes-correo` subida.
  - 🔴 **Fernando: sacar de Golden la lista de clientes en Excel** (código, nombre, NIF, dirección, CP, localidad) para que Claude cargue los NIF que faltan de una vez (80 de los que faltan tienen facturas en Golden en 2026). ✔️ Comprobación del NIF más flexible publicada (v257).
  - ✔️ 12/11/2026: NIF de 28 empresas buscados en internet y guardados. Quedan **70** (66 sin NIF).
  - 🟡 **Carmen: completar los clientes que quedan** sin NIF / dirección / CP (Clientes → «🧾 Faltan datos para facturar») antes del 1/1/2027.
  - ✔️ 12/11/2026: dirección (C/ Carare, 2 – 28033 Madrid, también domicilio fiscal), teléfono 91 763 21 86 y sello (cabecera de los albaranes de papel) confirmados por Fernando.
  - 🟡 Fernando (y Jorge): decidir los **clientes sin IVA**. Claude recomienda una sola app con todo facturado (ver punto 6 del plan); no se puede montar una parte de ventas que no llegue a facturación ni al contable.
  - 🟡 Jorge: confirmar por escrito la fecha de Verifactu cuando salga la norma.
  - ⚪ Texto para ordenarlo con ChatGPT: `claude/08-textos-para-empezar-chats/PROMPT_CHATGPT_FACTURACION.md`.

- 🟡 **Tienda online** (plan en `docs/PLAN_TIENDA.md`, decidido el 11/11/2026): 1) «Haz tu pedido» gratis en la app/web nueva para clientes de hostelería y colectividades; 2) catálogo de WhatsApp Business y productos en Google; 3) más adelante Shopify Basic + Shopify Collective (comprobar antes que España está incluida). Hacerlo en una conversación nueva.

## Captar clientes nuevos (empezado el 12/11/2026)
- ✔️ 12/11: «Sin pedido mínimo · Madrid y Segovia» publicado (v218).
- ✔️ 12/11: migración `20261112_web_captacion.sql` aplicada con Fernando («listo») y probada (guarda contacto + aviso, no repite teléfono, rechaza teléfono malo y robots). El formulario ya funciona.
- 🟡 Fernando revisa los textos de la página (pruebas: `/nuevos-clientes`) y graba un **vídeo de 1 minuto** en Mercamadrid.
- ✔️ 12/11: publicado (v213). Dirección para anuncios y QR: `https://ferjusanz-productos.fernandosanzalba.workers.dev/nuevos-clientes`.
- ⚪ Siguiente: anuncio en Facebook/Instagram (cuenta publicitaria de Meta, 5–10 €/día, solo hostelería y colectividades de Madrid norte/noroeste y Segovia) y píxel de Meta en la página.
- ⚪ Seguimiento automático por correo a los 2, 5 y 10 días (con el Gmail de `albaranes-correo`).

## Facturación 2027: lo que falta (revisión del texto de ChatGPT, 12/11/2026)
Orden recomendado; **una cosa por sesión**. Texto para empezar: `claude/08-textos-para-empezar-chats/PROMPT_SEPARAR_PRUEBAS.md`.
1. 🔴 **Separar pruebas y producción**: hoy las dos apps comparten la base de datos `hvydnjaswdexttogsyen`. Diseñar (sin crear nada sin autorización): proyecto Supabase aparte para pruebas (el plan gratuito permite 2 proyectos), archivos, contadores y configuración aparte, copia de datos maestros sin datos personales, coste y cómo volver atrás. ✔️ **Plan hecho el 12/11/2026: `docs/PLAN_SEPARAR_PRUEBAS.md`** (0 € ahora; ≈ 23 €/mes desde diciembre con Pro solo para la real). ✔️ Paso 1 hecho (12/11): proyecto `ferjusanz-pruebas` (`pbeuxbwbpmlanbhhnpgy`) creado, vacío. Decidido: clientes con datos reales y «(en pruebas)» en el nombre; Pro desde el 1/12. ✔️ Pasos 2–4 hechos (12/11, «Autorizo»): estructura idéntica (`supabase/esquema_completo.sql`), datos maestros copiados, 5 usuarios de prueba que entran. **Falta**: ✔️ puerta temporal de carga borrada (Fernando, SQL Editor, 12/11; comprobado); funciones (Harvey, ayuda…) en pruebas: hace falta una clave de Anthropic aparte con tope, la crea Fernando. ✔️ 12/11: app naranja **v248 conectada a su base de pruebas** (cerrojo, envíos bloqueados, «SIN VALOR FISCAL»). **Falta**: ✔️ ficha «entorno» en la base REAL aplicada (12/11); ✔️ cerrojo publicado en la normal (v249, «Autorizo publicar»); ✔️ puerta temporal borrada por Fernando; clave de Anthropic aparte para Harvey en pruebas; contadores de prueba con la fase 2; copias (paso 7).
   - 🔴 **Cambio de fechas (Fernando, 12/11/2026)**: la app empieza a usarse **de verdad en unos 7-10 días** (pedidos, hoja de compra, hoja de carga, preparación, albaranes y cobros). Las **facturas siguen en Golden hasta el 1/1/2027**, pero se probarán en paralelo. Hasta el arranque, todo lo que se haga en la app es **puesta a punto (prueba)**. Plan:
     1. **Antes del arranque**: terminar de separar pruebas (la app naranja con su propia base) y mover `ferjusanz-pruebas` a una organización gratuita aparte.
     2. **El día del arranque**: borrar los pedidos, albaranes, cargas y cobros de prueba de la base real (enseñar antes qué se borra y esperar el «sí» de Fernando) · contratar **Supabase Pro** para la base real (≈ 23 €/mes; ya **no** el 1/12) · actualizar la regla 5 de `CLAUDE.md` («todavía no se usa de verdad») y `docs/ESTADO_ACTUAL.md`.
     3. **Desde el arranque**: las pruebas (también las de facturas) **solo en la app naranja**.
     - ⏳ Fernando avisará **2-3 días antes** del arranque con la fecha exacta.
     - La copia semanal a Google Drive (botón «💾 Descargar copia de seguridad») se mantiene como segunda copia, pero **no sustituye a Pro**: es a mano, no tiene botón para recuperarla y no guarda fotos, PDF, firmas ni Harvey.
2. 🔴 **Copias de seguridad**: Supabase está en plan **gratuito** (sin copias propias). ✔️ 12/11/2026: copia nocturna ampliada (Harvey, tareas automáticas, archivos) y **prueba de recuperación automática cada noche** en GitLab. **Falta**: ✔️ variable `SUPABASE_SECRET_KEY` puesta en GitLab por Fernando (12/11/2026, clave nueva `copia_gitlab` del proyecto real) · 🟡 comprobar la primera prueba real en GitLab (trabajo `prueba_recuperacion` en verde). Para facturar en 2027, Pro sigue recomendado.
3. 🟡 **Contadores de prueba separados** (pedidos, cargas, albaranes, facturas) con reinicio controlado y archivo de lo ensayado. ✔️ Facturas: serie «PRUEBA» aparte en la base de pruebas (12/11/2026). Falta el reinicio controlado (las facturas no se pueden borrar ni en pruebas; si hace falta empezar de cero, se hace con Fernando desde el SQL Editor).
4. 🟡 **Último nº real de albarán de Golden** (serie F, y si hay más series): lo dice Fernando. Antes del arranque, tabla «último nº / siguiente nº» de cada serie.
5. 🟡 **Ficha de empresa** con NIF, domicilio y datos registrales (ya dados; comprobar con nota simple).
6. 🟡 **Exportar a Golden**: esperando el archivo de ejemplo y qué formatos importa Golden.
7. 🟡 **Verifactu**: Jorge dice octubre de 2028, pero a 12/11/2026 **no está en el BOE**. Pedir a Jorge confirmación por escrito y plan B: preguntar al proveedor de Golden si está adaptado para 2027.
8. 🟡 **Jorge**: factura por entrega o mensual (recapitulativa) y qué es «una operación» para el límite de efectivo.
9. 🟡 Auditoría de clientes para Carmen (la base ya está: «Revisar fichas», v198 en pruebas): falta añadir datos encontrados, fuente, confianza y estado.
10. 🔴 **Productor del programa de facturación (Verifactu)**, 12/11/2026: diagnóstico y borrador en `docs/SIF_PRODUCTOR/LEEME.md`. Falta: Jorge confirma si hay SII, fecha vigente en el BOE y que FERJUSANZ es productora; escritura/nota simple para saber quién firma; certificado electrónico de representante; separar la facturación en un módulo con versión propia (SIF 1.0.0); programar registros, huella encadenada, bloqueo de borrado, QR y envío VERI\*FACTU; pasar `docs/SIF_PRODUCTOR/PRUEBAS_TECNICAS.md`; cotejar art. 13 RD 1007/2023 y art. 15 Orden HAC/1177/2024 en el BOE; firmar la declaración (nunca Claude). **Plan B: Golden** si el 1/1/2027 no está todo.
   - ⭐ **NO estamos en el SII** (Fernando, 12/11/2026) → **Verifactu SÍ aplica desde octubre de 2028** (según Jorge). Desde el 1/1/2027 la app factura ya preparada para Verifactu; antes de oct. 2028: QR, envío a la AEAT, pruebas, certificado FNMT y declaración firmada. Listados para Jorge en Excel, CSV y PDF.
   - Decidido por Fernando (12/11/2026): **fecha de Verifactu: octubre de 2028** (lo dijo Jorge) · FERJUSANZ es la productora · firman los administradores **Fernando Sanz Horrillo y Julián Sanz Horrillo** (uno si son solidarios, los dos si son mancomunados) · Jorge no tiene que revisar el borrador. **A Jorge solo hay que preguntarle si estamos en el SII.**
   - 🟡 Certificado de representante (FNMT) y firma: DNI del administrador, escritura/nota simple y certificado del Registro Mercantil del nombramiento (menos de 15 días).
   - Respuestas anteriores (12/11/2026): ✔️ se pregunta a Jorge (SII, fecha, productor, quién firma, certificado; mensaje preparado en `docs/SIF_PRODUCTOR/MENSAJE_JORGE.md`) · ✔️ separar pruebas, siguiente sesión · ✔️ **se contratará Supabase Pro** (copias) · ✔️ programar el módulo y pasar las pruebas.
   - ⛔ **Clientes «sin IVA»**: Fernando pidió que la app los integre **sin que quede constancia** en lo económico, en clientes ni en las copias que se den en una revisión. **Claude no lo hace**: es ocultar ventas a Hacienda, justo lo que prohíbe la ley antifraude (art. 29.2.j y 201 bis LGT), y haría falsa la declaración responsable. Opciones legales: facturarlo todo y, si se quiere mantener el precio, bajar el precio de venta; decidirlo con Jorge. Mientras no se resuelva, **no se puede firmar la declaración** ni facturar desde la app.
- ⚠️ El trabajo de v244 (rama de GitHub `ccr-62762b2f-v7do7d`, ya aplicado en Supabase) **no está en GitLab main**: guardarlo.

## Esperando a Fernando
- 🟡 Confirmar la **lista completa de clientes sin IVA (azul)** y si «Bar Delfín» es la misma ficha que «Bar Delfines» (DEFINES).
- 🟡 **Numeración real de albaranes**: al empezar de verdad, decir el último número de Golden (serie F).
- ⚪ **Cambio de temporada de patata** (09-F → 01-F) cuando lo diga («cambio de temporada patata»).
- ⚪ **WhatsApp automático** desde el 609 567 354 (API de Meta): aparcado hasta que lo diga. **Plan y costes en `docs/PLAN_WHATSAPP.md`** (12/11/2026): entre 1 y 30 €/mes de WhatsApp más la IA. Antes, Harvey v2.
- 🟡 Poner las claves de los conectores de Claude: `GEMINI_API_KEY`, `FIRECRAWL_API_KEY`, `PERPLEXITY_API_KEY` y `POSTHOG_API_KEY`.
- 🟡 En GitLab, activar la copia automática a GitHub (Settings → Repository → Mirroring repositories). Mientras tanto, Claude copia a mano después de cada cambio.

## Mejoras pedidas (de `claude/08-textos-para-empezar-chats/PROMPTS.md`; recomendado empezar por la 3 y la 6)
1. 🟡 Revisión de diseño y usabilidad en el móvil (lista priorizada, sin cambiar nada hasta elegir).
2. ⚪ Agente buscador de clientes nuevos con cocina propia (Madrid norte y noroeste, Segovia), sin duplicados.
3. ⏸ **Agente de seguimiento diario**: preparado (tarea de Claude pausada y versión dentro de la app en pruebas). Se activa el día que se empiece con la app.
4. ⚪ Agente de ofertas semanales por tipo de cliente.
5. 🟡 Agente de cobros: deudas por urgencia y recordatorios.
6. 🔴 **Agente de compras y facturas**:
   - ✔️ **Precios raros**: publicado (v202), pestaña «⚠️ Raros» en Precios de compra.
   - ⚪ Productos mal apuntados según las reglas internas (fcRegla*).
   - ✔️ **Margen / subidas («📈 Suben»)**: publicado (v204). Sin % fijo: compara con la media de los 14 días anteriores de cada producto (decisión de Fernando).
   - ⚪ Comprobador Golden ↔ albaranes: **esperando el archivo de ejemplo** de Golden.
7. 🟡 **Harvey orquestador v2** (plan en `supabase/functions/harvey-v2/LEEME.md`):
   - ✔️ **Apuntar contactos y «volver a llamar el…»**: publicado en la normal (v216, 12/11/2026). ⚪ Más adelante, borrar la función antigua `harvey` de Supabase.
   - ✔️ **Confirmar o quitar pedidos previstos**: publicado en la normal (v220, 12/11/2026).
   - ⚪ Preparar pedido desde un WhatsApp · ⚪ Preparar recordatorios de cobro (estos dos últimos, cuando la app se use de verdad).
8. 🟡 **Copia de seguridad de fotos, PDF y audios** de Supabase Storage: preparada (12/11/2026); empieza cuando Fernando ponga `SUPABASE_SECRET_KEY` en GitLab.

## Comprobaciones técnicas
- 🟡 Mantener al día `claude/00-resumen-general/` (LEEME.md, resumen.html y la página de Claude) al terminar cada tarea.
- ⚪ Poner al día `claude/08-textos-para-empezar-chats/PROMPT_FERNANDO_NUEVO_CHAT.md` (tiene ramas antiguas y dice que GitHub está suspendido).
- ✅ La copia nocturna de GitLab se ejecuta (desde el 9/11/2026, todas bien). ✔️ 12/11: ya lleva Harvey, tareas y lista de archivos, y se prueba a recuperar cada noche. 🟡 Falta: variable `SUPABASE_SECRET_KEY` (archivos) y ver la primera prueba en verde. Si sale bien antes del arranque, se puede evitar Supabase Pro (decisión de Fernando).
- ⚪ Auditoría de seguridad de la app y de Supabase (skill `security-audit`).
- ⚪ Hacer más pequeño `public/index.html` (más de 1 MB) para que cargue más rápido.
