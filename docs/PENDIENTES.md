# Pendientes de FERJUSANZ (web y app)
_Solo lo que **falta**. Regla de Fernando (14/11/2026): «Cada vez que hagamos algo, quítalo». Al terminar algo: **borrarlo de aquí** (no tacharlo), apuntarlo en `docs/HISTORIAL.md` y volver a publicar la página fijada (ver `CLAUDE.md`). Lo ya hecho hasta el 14/11/2026 está en `docs/HISTORIAL.md`._
_Prioridad: 🔴 alta · 🟡 media · ⚪ cuando se pueda · ⏸ en espera._

## 🌐 LA WEB (nueva, de prueba: https://ferjusanz-web.fernandosanzalba.workers.dev)
Detalle en `web/LEEME.md`, `docs/PLAN_WEB.md` y `docs/LISTA_PARA_ENVIAR.md` (lista para mandar por WhatsApp).
- 🔴 **Fernando**: revisarla en el móvil y decir qué cambiar.
- 🔴 **Fernando**: **recuperar la entrada a Webempresa** (no DonDominio). DonDominio contestó el 15/11/2026 que el dominio **ya no está con ellos**: está en **Webempresa** (comprobado por Claude: los DNS y el correo del dominio van a `controldeservidor.com`, que es de Webempresa). Alguien lo trasladó después de 2017 (probablemente Creativate o quien lleva la web). Pasos: en webempresa.com, «Área de cliente» → «¿Olvidaste tu contraseña?» con ferjusanz@hotmail.com u otro correo de la empresa (no comprobado desde aquí: la red bloquea Webempresa). Si no sale ninguna cuenta a su nombre, preguntar a Creativate a nombre de quién está la cuenta de Webempresa y **quién la paga**, y pedir que la pasen a Fernando (sin borrar nada). **WordPress: ya hay entrada** (15/11/2026, usuario `fernadoseo`, administrador). Siguen de administradores `11_creatiVate` (alberto@albertopeco.com) y «FRUTAS Y VERDURAS FERJUSANZ». Los registros del correo del dominio (MX, SPF, DKIM, DMARC) se ven en la cuenta de Webempresa; el logo en buena calidad, a Creativate o a la imprenta. La cuenta de DonDominio `FerNanSz` sigue existiendo (la contraseña de 2017 no vale; «Recuperar cuenta» manda un código al correo de la cuenta), pero el dominio ya no está en ella. Con eso ya no hace falta preguntar a Creativate el titular, el código de traslado ni los accesos. Al cambiarlas, **no mandarlas por el chat**.
- 🟡 **Fernando → Creativate** (solo lo que la cuenta no dice): Analytics/Tag Manager/Search Console, licencia de las fotos y si aún se les paga algo (permanencia). Que **no borren nada**.
- 🟡 **Fotos reales** (carpeta de Drive «Fotos web Ferjusanz» o por el chat): furgoneta con logo, almacén, familia/equipo (con permiso), campo, patatas y patata pelada, cebollas y ajos, legumbres, cuarta gama, hierbas y picantes, pedidos preparados, Fernando o Julián en el puesto y el logo en buena calidad. No usar Getty ni bancos de pago.
- 🟡 **Ficha de Google**: esperar respuesta a «Solicitar acceso». Cuando sea nuestra: S.L. en vez de C.B., dirección, horario, fotos, descripción, productos y mensaje para pedir reseñas.
- 🟡 **Portada «Scroll World»** (vuelo al bajar con el dedo, ordenador + móvil). Cuenta de Higgsfield ya conectada a Claude (gratis, 10 créditos). Coste calculado (15/11/2026): versión buena **≈ 1.475 créditos** (Ultra) o versión 720p **≈ 845** (cabe en Plus mensual, 39 €). Falta: **Fernando** elige plan y lo compra desde el móvil; luego Claude hace un borrador barato y después la buena.
- 🟡 Datos del **Registro Mercantil** (tomo, folio, hoja) para el aviso legal.
- 🟡 **Fernando**: en WordPress (Usuarios → Perfil → «Contraseñas de aplicación»), **revocar las contraseñas de aplicación creadas el 15/11/2026**: no funcionan porque el servidor de la web antigua no pasa la clave a WordPress (responde «no conectado» con cualquier clave). Para leer la web antigua ya vale la exportación de «Herramientas → Exportar» subida a Drive. Solo si algún día hiciera falta la API: pedir a Webempresa/Creativate que el servidor deje pasar la cabecera `Authorization`.
- ⚪ Idea (sin hacer): que el formulario de Contacto guarde también el contacto en la base para que Harvey lo clasifique.
- 🟡 ¿Clientes en la portada (Hotel Cándido, Mesón de Cándido, La Figal de Pablo, Colegio Reggio, Residencia El Pardo de Aravaca)? Solo con su «sí» y el permiso de cada uno.
- 🟡 Decidir si se miden las visitas (Google Analytics / Tag Manager `GTM-5QRBQNJ`); si sí, aviso de cookies.
- 🟡 Una **nota de voz a la semana** de Fernando con algo del mercado para los artículos.
- ⚪ La tarea automática de la web (`trig_01AXKhyzZyg7sMDufq37Ahuw`, cada 2 días) no ve Drive: las fotos, por el chat.
- ⚪ **Cuando haya dominio** (Claude): `PRUEBAS = false` en `web/worker.js`, apuntar el dominio, Search Console, enlazar la ficha de Google, tarjeta en `www…/tarjeta/` (cambiar `URL_TARJETA` en `public/index.html` y la redirección en `src/worker.js`).
- ⚪ Ideas para subir en Google (cuando Fernando diga): reseñas, publicaciones semanales en la ficha, vídeos, páginas por zona, directorios, redes, anuncios de Meta, informe mensual. Lista completa en `docs/LISTA_PARA_ENVIAR.md`.

## 📱 LA APP
### 👤 Fernando
- 🔴 Avisar **2-3 días antes** del día en que se empieza a usar la app de verdad.
- 🔴 Antes del 30/11: decidir con Jorge los **clientes «sin IVA»** (todo tiene que ir facturado; si se quiere, se baja el precio). Sin esto no se puede firmar la declaración ni facturar desde la app. Y confirmar la lista y si «Bar Delfín» = «Bar Delfines».
- 🔴 Sacar de Golden la **lista de clientes en Excel** (código, nombre, NIF, dirección, CP, localidad) para cargar los NIF que faltan.
- 🟡 Decir el **último nº de albarán de Golden** (serie F, y si hay más series).
- 🟡 Probar «**He olvidado la contraseña**» con su correo y avisar a Jorge Ruiz Onetti de que ya tiene usuario.
- 🟡 Probar en la app naranja: **Modo reparto** (orden, venta en ruta y descuento sin IVA, albarán, cobro, firma, cómo cargar la furgoneta), **«🔗 Comprobar que ninguna factura se ha tocado»**, **«🧾 NIF e IVA»** y **anular una factura** (PRUEBA-2026-0002 o 0003).
- 🟡 Confirmar formatos: Mango, Bote de garbanzos, Nabo, Cogollos de Tudela, Fresón 1ª; unidad de Arándano (513) y Frambuesa (310) → bandeja, Ensalada Campestre (137-P) → bolsa. Pasar ejemplos de otros formatos mal.
- 🟡 Revisar en Golden la factura **P/20.453 (30/09/2026)** (IVA al 4,5 %).
- 🟡 Crear una **clave de Anthropic aparte** (tope 5 $/mes) y ponerla como `ANTHROPIC_API_KEY` en Supabase › `ferjusanz-pruebas` (para Harvey y la ayuda en la naranja; nunca por el chat).
- 🟡 Hablar con **Golden**: seguir en enero si hace falta (plan B) y guardar el histórico de facturas (4-6 años). Y el archivo de ejemplo para **exportar a Golden** y comprobar Golden ↔ albaranes.
- 🟡 Preguntar al **banco** qué fichero dan (Norma 43 o Excel) y si hay más de una cuenta; subir el primero real en Más → «🏦 Banco».
- 🟡 Captar clientes: revisar y enviar los **correos a los 8 prospectos** (https://claude.ai/artifact/Voa8zmukh1GScZ81XYJDaH); **Coffee, Books and Vibes**: llamar el lunes 16/11; probar la **tarjeta virtual** con un cliente; revisar `/nuevos-clientes` y grabar el **vídeo de 1 minuto**.
- 🟡 Decidir: ¿juntar en el menú Cobros y Deudas (y las de caja)?; ¿se queda o se quita **becario-mods**?
- 🟡 Activar en GitLab la copia automática a GitHub (Settings → Repository → Mirroring). Mientras, la hace Claude.
- 🟡 Ver en GitLab que la copia nocturna sale en verde: https://gitlab.com/ferjusanz-productos/ferjusanz-app/-/pipelines
- 🟡 Claves de conectores que faltan (Perplexity, PostHog), con el formulario seguro cuando las tenga. Para `shorts` con YouTube: añadir `*.googlevideo.com` en la red del entorno.

### 👩‍💼 Carmen (oficina)
- 🔴 Completar los **clientes sin NIF / dirección / CP** antes del 1/1/2027 (Clientes → «🧾 Faltan datos para facturar» → «🔎»): revisar las propuestas (las de confianza media, confirmarlas con el cliente), CAPARRA, BOUZAS, CUENDA, HANDYMAN y pedir datos a autónomos y a las sociedades que no salen en internet.
- 🟡 Compras → «🧾 NIF e IVA»: leer los que faltan y poner a mano el NIF de Pataleta, Perichán…
- 🟡 Empezar a apuntar la **caja** en la app (Más → «💵 Caja (efectivo)»).
- 🟡 Prueba completa de facturas en la naranja el **15–18/12** con Fernando (`docs/GUION_PRUEBA_DICIEMBRE.md`).

### 🧮 Jorge (contable)
- 🔴 **Decisión de Verifactu el 22/12** (no está en el BOE el aplazamiento; si no se cumple todo, Plan B: Golden en enero). Que confirme la fecha por escrito. Ver `docs/FACTURACION_2027.md`.
- 🔴 Tramitar el **certificado de representante (FNMT)**; con él, Claude hace la fase 8d (envío a Hacienda).
- 🟡 Decir si le llegaron los adjuntos del correo y si le valen los formatos (ventas/compras, caja y banco en CSV o Excel/PDF; saldo inicial de caja).
- 🟡 Factura por entrega o mensual.
- 🟡 Avisarle (e Ibérica) de la factura FV-B-26-032668 a nombre de FERJUSANZ C.B.

### 🤖 Claude (sin esperar a nadie)
- 🟡 Publicar en la normal «**factura cobrada al confirmar en el Banco**» (probada por Fernando) + SQL `20261117a` en la real.
- 🟡 Crear la tabla `resumen_mercado` (y `resumen_correo`) en la base de PRUEBAS.
- 🟡 Revisar cada lunes si sale en el BOE el aplazamiento de Verifactu.
- ⚪ Juntar `memoria-permanente` con main y borrar las ramas viejas de GitLab (lista en `docs/ESTADO_ACTUAL.md`); borrar el Worker antiguo `ferjusanz` y la función `harvey` antigua.
- ⚪ Factura: unidad igual que el albarán (singular si es 1, piezas como «ud»).
- ⚪ Productos mal apuntados según las reglas internas (fcRegla*).
- ⚪ Revisión de diseño y usabilidad de la app en el móvil (lista, sin cambiar nada hasta elegir).
- ⚪ Auditoría de seguridad (skill `security-audit`) y hacer más pequeño `public/index.html`.
- ⚪ Poner al día `claude/00-resumen-general/` y `claude/08-textos-para-empezar-chats/PROMPT_FERNANDO_NUEVO_CHAT.md`.

### 🚀 El día del arranque
- Contar y, con el «sí» de Fernando, borrar lo de prueba de la base real (hoy no hay nada; los pedidos fijos y facturas de proveedores **no** se borran).
- Contratar **Supabase Pro** (≈ 23 €/mes).
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
