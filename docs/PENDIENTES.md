# Pendientes de FERJUSANZ (web y app)
_Solo lo que **falta**. Regla de Fernando (14/11/2026): «Cada vez que hagamos algo, quítalo». Al terminar algo: **borrarlo de aquí** (no tacharlo), apuntarlo en `docs/HISTORIAL.md` y volver a publicar la página fijada (ver `CLAUDE.md`). Lo ya hecho hasta el 14/11/2026 está en `docs/HISTORIAL.md`._
_Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda · ⏸ en espera._

## 🌐 LA WEB (nueva, de prueba: https://ferjusanz-web.fernandosanzalba.workers.dev)
Detalle en `web/LEEME.md`, `docs/PLAN_WEB.md` y `docs/LISTA_PARA_ENVIAR.md` (lista para mandar por WhatsApp).
- 🔴 **Fernando**: revisarla en el móvil y decir qué cambiar.
- 🔴 **Dominio a una cuenta de FERJUSANZ** (procedimiento en `docs/PLAN_WEB.md`). DonDominio, caduca el **26/05/2027**, DNS en Webempresa. Alberto (audio 16/11/2026): **él hace ya el traslado (Push)** a nuestra cuenta; el **cambio de titular** a FERJUSANZ S.L. (B87446670) **lo pedimos nosotros** desde nuestra cuenta de DonDominio («Cambiar titular» .es; en «Gestor» poner **SCIP**). La petición que hizo él llegó a un correo de Gmail mal puesto en el contacto; Alberto avisa a esa persona para que la apruebe cuando llegue. No hay correo con el dominio: el contacto es el Hotmail de Fernando; «separarlo» = poner un correo de la empresa en el contacto. Correo de confirmación del traslado **enviado** a Alberto (info@creativate.es) el 16/11 desde el Gmail de facturas; si lo pide desde el Hotmail, mandarlo desde ahí. Falta: **Fernando**: entrar en la cuenta de DonDominio que reciba el dominio y confirmar que aparece; luego pedir el cambio de titular (Claude le guía) y **vigilar el correo**. **Fernando**: entrada a Webempresa o captura de la zona DNS. WordPress: ya hay entrada (`fernadoseo`); siguen de administradores `11_creatiVate` y «FRUTAS Y VERDURAS FERJUSANZ».
- 🟡 **Fernando → Creativate** (solo lo que la cuenta no dice): Search Console, licencia de las fotos y si aún se les paga algo (permanencia). Que **no borren nada**.
- 🟡 **Logo nuevo, lo que falta** (en la app y la web ya está, 16/11/2026). **Fernando**: foto de perfil de WhatsApp Business y de la ficha de Google con `marca/logo/perfil-whatsapp-google.png` (fondo negro). **Imprenta**: tarjetas de visita, letrero y fachada con la etiqueta granate y oro (`marca/logo/etiqueta.pdf`). Opcional: registrar la marca en la OEPM (antes, comprobar que no hay otra parecida).
- 🟡 **Fotos reales** (carpeta de Drive «Fotos web Ferjusanz» o por el chat): almacén, familia/equipo (con permiso), campo, patatas enteras, legumbres, cuarta gama, hierbas y picantes, pedidos preparados, Fernando o Julián en el puesto. No usar Getty ni bancos de pago.
- 🟡 **Ficha de Google**: esperar respuesta a «Solicitar acceso». Cuando sea nuestra: S.L. en vez de C.B., dirección, horario, fotos, descripción, productos y mensaje para pedir reseñas. **Textos ya listos para pegar** en `docs/FICHA_GOOGLE.md` (16/11/2026);
- 🟡 **Portada «Scroll World»** (vuelo al bajar con el dedo, ordenador + móvil). Cuenta de Higgsfield ya conectada a Claude (gratis, 10 créditos). Coste calculado (15/11/2026): versión buena **≈ 1.475 créditos** (Ultra) o versión 720p **≈ 845** (cabe en Plus mensual, 39 €). Falta: **Fernando** elige plan y lo compra desde el móvil; luego Claude hace un borrador barato y después la buena.
- 🟡 ¿Clientes en la portada (Hotel Cándido, Mesón de Cándido, La Figal de Pablo, Colegio Reggio, Residencia El Pardo de Aravaca)? Solo con su «sí» y el permiso de cada uno.
- 🟡 Una **nota de voz a la semana** de Fernando con algo del mercado para los artículos.
- ⚪ La tarea automática de la web (`trig_01AXKhyzZyg7sMDufq37Ahuw`, cada 2 días) no ve Drive: las fotos, por el chat.
- ⚪ **Cuando haya dominio** (Claude; decidido el 15/11/2026: la web nueva usará **el mismo dominio**, www.ferjusanz-frutas-verduras.es, lo mejor para Google; depende de tener el dominio en nuestra cuenta, sin tocar el correo; pasos 2-5 del plan): Cloudflare con los mismos registros, cambiar DNS, `PRUEBAS = false` en `web/worker.js`, apuntar el dominio, Search Console, enlazar la ficha de Google, tarjeta en `www…/tarjeta/` (cambiar `URL_TARJETA` en `public/index.html` y la redirección en `src/worker.js`).
- 🔴 **Fernando**: primera tanda de **fotos** (listas A y B del plan: https://claude.ai/artifact/VSPKY1BfUkgc5CVJkm53hi) y luego 5-10 por semana.
- 🟡 **QR de reseñas** (Fernando, 16/11/2026, idea de un vídeo de TikTok con tarjetas NFC): un enlace fijo `…/resena` con un QR que no cambia nunca y lleva a «Escribir una reseña» de Google (y a seguir en Instagram cuando exista). Dónde: tarjetita para dar con el pedido o pegar en la caja, el **Portal de clientes**, la **📇 Tarjeta para clientes** y la tarjeta de visita de Fernando. Espera a que la **ficha de Google** sea nuestra (para no mandar reseñas a la ficha con «C.B.» y dirección vieja). Pegatinas NFC: opcional, cuestan poco y llevan al mismo enlace. **Ya hecho el diseño** (16/11): `marca/resenas/` (tarjetita A6, pegatina 70 mm e imagen para WhatsApp; se rehacen con `node marca/resenas/hacer.mjs`). ⚠️ **No imprimir aún**: falta crear `/resena` en `src/worker.js` (el QR ya apunta ahí) y un botón en la app para mandar el enlace por WhatsApp al entregar.
- 🔴 **Fernando**: volver a grabar el vídeo de la presentación con el guion corto (unos 30 s) y las fotos nuevas: Comercial › posible cliente › «🧮 Primer pedido y tarifa» › «🎙️ Grabar / repetir el vídeo», una vez para hostelería y otra para colegios y residencias.
- 🔴 **Vídeo «Naranja de zumo, esta semana más barata»** (`redes/videos/naranja-zumo/`): ya con la foto de las naranjas de zumo de Fernando (17/11/2026); versiones de redes (con voz) y web (sin sonido) mandadas. **Fernando**: decir si se publica en redes o en la web (solo con su «sí»). Cómo: `redes/videos/LEEME.md`.
- 🟡 **Fernando**: crear el **Instagram de empresa** y la **página de Facebook** (Claude le guía desde el móvil) y grabar el primer Reel («Esta semana en Mercamadrid»).
- 🟡 **LinkedIn** (16/11/2026, skill `li-*` instalada): **Fernando**: crear la **página de empresa en LinkedIn** (aún no hay, confirmado 16/11/2026; Claude le guía desde el móvil cuando quiera) y pegar el primer post (`docs/redes/linkedin/borrador-01.txt`, enlace en el primer comentario). Mejor cuando la web tenga el dominio bueno. Después: `/li-profile` con la página y 1 post a la semana con los artículos de colectividades (`/li-repurpose`).
- ⚪ Decidir si se usa **Metricool** para que Claude deje programadas las publicaciones; **anuncios de Meta** más adelante (con 20-30 publicaciones y el dominio).
- ⚪ **Claude**: al pasar el artículo 45 del plan (11/02/2027), añadir la siguiente tanda en `docs/PLAN_MARKETING.md`.
- ⚪ Otras ideas para subir en Google: reseñas, publicaciones semanales en la ficha, directorios, informe mensual. Plan: `docs/PLAN_MARKETING.md`; lista completa en `docs/LISTA_PARA_ENVIAR.md`.

## 📱 LA APP
### 👤 Fernando
- 🟡 Hablar con **Carmen** y con **Jorge** (o la gestoría) de sus funciones desde enero: oficina + clientes, objetivos y premio por escrito (https://claude.ai/artifact/R8Zor6BHenQdEi3FMbJJSn).
- 🔴 Avisar **2-3 días antes** del día en que se empieza a usar la app de verdad.
- 🔴 Antes del 30/11: decidir con Jorge los **clientes «sin IVA»** (todo tiene que ir facturado; si se quiere, se baja el precio). Sin esto no se puede firmar la declaración ni facturar desde la app. Y confirmar la lista.
- 🔴 Sacar de Golden la **lista de clientes en Excel** (código, nombre, NIF, dirección, CP, localidad) para cargar los NIF que faltan.
- 🟡 Decir el **último nº de albarán de Golden** (serie F, y si hay más series).
- 🟡 Probar «**He olvidado la contraseña**» con su correo y avisar a Jorge Ruiz Onetti de que ya tiene usuario.
- 🟡 Probar en la app naranja: **Modo reparto** (orden, venta en ruta y descuento sin IVA, albarán, cobro, firma, cómo cargar la furgoneta), **«🔗 Comprobar que ninguna factura se ha tocado»**, **«🧾 NIF e IVA»** y **anular una factura** (PRUEBA-2026-0002 o 0003).
- 🟡 Confirmar formatos: Mango, Bote de garbanzos, Nabo, Cogollos de Tudela, Fresón 1ª; unidad de Arándano (513) y Frambuesa (310) → bandeja, Ensalada Campestre (137-P) → bolsa. Pasar ejemplos de otros formatos mal.
- 🟡 Revisar en Golden la factura **P/20.453 (30/09/2026)** (IVA al 4,5 %).
- 🟡 Crear una **clave de Anthropic aparte** (tope 5 $/mes) y ponerla como `ANTHROPIC_API_KEY` en Supabase › `ferjusanz-pruebas` (para Harvey y la ayuda en la naranja; nunca por el chat).
- 🟡 Hablar con **Golden**: seguir en enero si hace falta (plan B) y guardar el histórico de facturas (**6 años**, Jorge 16/11). Y el archivo de ejemplo para **exportar a Golden** y comprobar Golden ↔ albaranes.
- 🟡 Preguntar al **banco** qué fichero dan (Norma 43 o Excel) y si hay más de una cuenta; subir el primero real en Más → «🏦 Banco».
- 🟡 Captar clientes: revisar y enviar los **correos a los 8 prospectos** (https://claude.ai/artifact/Voa8zmukh1GScZ81XYJDaH); **Coffee, Books and Vibes**: llamar el lunes 16/11; probar la **tarjeta virtual** con un cliente; revisar `/nuevos-clientes` y grabar el **vídeo de 1 minuto**.
- 🔴 **Tarifas para el «primer pedido»**: la tarjeta ya enseña los **206 productos**, pero la tarifa de **hostelería** solo tiene precio en **65** y la de **colectividades** en **3 de 62**: lo que marque un cliente sin precio en la tarifa sale «sin precio» (se pone a mano en el mensaje). Añadir a las tarifas lo que más se pida (patata pelada, legumbres, huevos…). Comercial › 🤵 Harvey › 💶 Tarifas nuevas → margen → «✅ Aplicar»; lo que no se calcule solo (cajas, manojos, docenas), a mano en Comercial › 📄 Listas.
- 🟡 Quitar «cosechas propias» de la presentación guardada **«Presentación Hostelería (copia)»** (Comercial › 🎬 Presentaciones › ✏️ Editar) o borrarla si ya no se usa.
- 🟡 **Fernando**: decir qué **pueblos de la zona sur** se reparten (en la web pone de momento «municipios del sur de Madrid, pregúntenos»).
- 🟡 **Grabar el vídeo para exclientes** con tu voz: Comercial › 🔔 Avisos › «🔁 Mandar a un excliente» › «📎 Solo presentación» › «🎙️ Grabar / repetir el vídeo con tu voz». Antes, revisar sus frases con «✏️ Editar la presentación».
- 🟡 Probar la tarjeta nueva (**«Imagine su primer pedido…»**) mandándosela a un posible cliente de verdad (desde su ficha: «🧮 Pedirle su primer pedido y calcular tarifa»).
- 🟡 Decidir: ¿juntar en el menú Cobros y Deudas (y las de caja)?; ¿se queda o se quita **becario-mods**?
- 🟡 Activar en GitLab la copia automática a GitHub (Settings → Repository → Mirroring). Mientras, la hace Claude.
- 🟡 Ver en GitLab que la copia nocturna sale en verde: https://gitlab.com/ferjusanz-productos/ferjusanz-app/-/pipelines
- 🟡 Claves de conectores que faltan (Perplexity, PostHog), con el formulario seguro cuando las tenga. Para `shorts` con YouTube: añadir `*.googlevideo.com` en la red del entorno.

### 👩‍💼 Carmen (oficina)
- 🟡 **Fernando** o **Carmen**: en la lupa 🔍 escribir «productos sin reconocer» → botón **«♻️ Releer las facturas de 30 días»** (así se rellenan solos el IVA, el total y el nº de las que ya estaban leídas; solo rellena lo vacío).
- 🔴 Completar los **clientes sin NIF / dirección / CP** antes del 1/1/2027 (Clientes → «🧾 Faltan datos para facturar» → «🔎»): revisar las propuestas (botón **«🔎 NIF por confirmar»** en Clientes) (las de confianza media, confirmarlas con el cliente; nuevas del 16/11: **El Chato de Boadilla, Gallo Descorchado, Sidrería Don Carlos y d'Coysa**), CAPARRA, BOUZAS, CUENDA, HANDYMAN; sin encontrar: Cervecería Los Picos, Purakai, Restaurante Hawaii (Lasga) y Restaurante los Ángeles (Tapeador): pedírselo al cliente y pedir datos a autónomos y a las sociedades que no salen en internet.
- 🟡 Compras → «🧾 NIF e IVA»: leer los que faltan y poner a mano el NIF de Pataleta, Perichán…
- 🟡 Empezar a apuntar la **caja** en la app (Más → «💵 Caja (efectivo)»).
- 🟡 Prueba completa de facturas en la naranja el **15–18/12** con Fernando (`docs/GUION_PRUEBA_DICIEMBRE.md`).

### 🧮 Jorge (contable)
_Hoja para la reunión (todo lo que hay que preguntarle): https://claude.ai/artifact/5qQe3mrM3E9wHwrQACgkmG (`docs/PREGUNTAS_JORGE.md`). Lo que conteste se quita de aquí y de esa hoja._
- 🔴 **Decisión de Verifactu el 22/12** (no está en el BOE el aplazamiento; si no se cumple todo, Plan B: Golden en enero). Su visto bueno (de palabra, 16/11) vale como si fuera por escrito (Fernando). Ver `docs/FACTURACION_2027.md`.
- 🔴 Tramitar el **certificado de representante (FNMT)**; con él, Claude hace la fase 8d (envío a Hacienda).
- 🟡 Saldo inicial de caja.
- 🟡 Factura por entrega o mensual.
- 🟡 Avisarle (e Ibérica) de la factura FV-B-26-032668 a nombre de FERJUSANZ C.B.

### 🤖 Claude (sin esperar a nadie)
- 🟡 Antes de enero: **guías cortas con fotos** para Carmen (facturar, caja, banco, proveedores, informes para Jorge, pedidos por teléfono) y **guion de llamadas** comerciales.
- 🟡 Revisar cada lunes si sale en el BOE el aplazamiento de Verifactu: **lo hace sola** la tarea automática «Verifactu en el BOE (lunes)» (`trig_01Q2osxJtGHJMTo3oksNiXG7`, lunes 9:47 hora de Madrid, avisa al móvil). Se quita cuando salga o pase el 22/12.
- ⚪ Hacer más pequeño `public/index.html`.

### 🚀 El día del arranque
- Contar y, con el «sí» de Fernando, borrar lo de prueba de la base real (hoy no hay nada; los pedidos fijos y facturas de proveedores **no** se borran).
- Contratar **Supabase Pro** (≈ 23 €/mes). Al contratarlo, activar la **comprobación de contraseñas filtradas** (Authentication › Policies; solo existe en Pro).
- Tabla «último nº / siguiente nº» de cada serie de albaranes.
- Actualizar la regla 5 de `CLAUDE.md` y `docs/ESTADO_ACTUAL.md`.
- Activar el **seguimiento comercial** (rama `seguimiento-app`, SQL `20261111c_seguimiento_diario.sql`) y quitar la tarea `trig_016V26ajMMcPLQ3Zvg1C2dw2`.

### ⏸ Aparcado (hasta que Fernando lo diga)
- Facturar de verdad desde la app (tras el 22/12): encender la emisión, declaración firmada (**la firma un administrador, nunca Claude**), envío VERI\*FACTU. Plan: `docs/PLAN_FACTURACION.md`, `docs/SIF_PRODUCTOR/LEEME.md`.
- Harvey v2 en la normal (`harvey-v2` «investiga y prepara la oferta») tras probarlo en pruebas; preparar pedido desde WhatsApp y recordatorios de cobro.
- **WhatsApp automático** (`docs/PLAN_WHATSAPP.md`) · **Tienda online** (`docs/PLAN_TIENDA.md`) · anuncios de Meta y seguimiento automático por correo a contactos.
- Agentes: ofertas semanales, cobros, buscador de clientes con cocina propia.
- Skills del plan Small Business (`docs/PLAN_SMALL_BUSINESS.md`) cuando lo autorice.
- Resumen de correo automático cada mañana (las tareas programadas no ven Gmail; mientras, **/resumen-correo** en un chat).
- Cambio de temporada de patata (09-F → 01-F) cuando diga «cambio de temporada patata».
- No se hace: ocultar las ventas «sin IVA» (ilegal, art. 29.2.j y 201 bis LGT).
