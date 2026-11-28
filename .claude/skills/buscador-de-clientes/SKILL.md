---
name: buscador-de-clientes
description: El buscador de clientes en redes. Le pegas tu web y Claude deduce tu cliente ideal, busca perfiles y negocios públicos que encajan (Instagram, LinkedIn, TikTok, YouTube, Reddit, foros, reseñas y webs), monta la ficha de cada uno con sus problemas, lo que sueñan y sus objeciones citando sus palabras exactas con el enlace, encuentra solo el email de contacto que el propio negocio publica y te escribe el primer mensaje con sus palabras. Lo envía solo cuando tú apruebas cada mensaje (Gmail o borradores), respetando RGPD y LSSI. Deja todo en un CSV. Úsala cuando digan /buscador-de-clientes, «comenta CLIENTE», «búscame clientes en redes», «saca clientes de mi web», «lista de clientes potenciales», «qué dicen mis clientes en redes» o peguen su web para buscar clientes.
---

# /buscador-de-clientes: tu web → lista de clientes con sus palabras → mensaje aprobado

Una skill, cuatro trabajos: **el scraper** (busca perfiles), **el que monta cada perfil** (problemas, sueños y
objeciones con citas literales), **el que encuentra el email** (solo el publicado por el negocio) y **el que lo
envía** (solo con tu sí, mensaje a mensaje).

Al terminar, el usuario tiene en `~/Buscador-de-clientes/<proyecto>/`:
- `cliente-ideal.md`: a quién vende, sacado de su web.
- `clientes.csv`: un cliente por fila, con fuentes, citas, contacto y mensaje (abre en Excel, Numbers o Sheets).
- `perfiles/<slug>.md`: la ficha de cada cliente con las citas y sus enlaces.
- `no-contactar.csv`: las bajas y los que no quieren mensajes. Se respeta siempre.

Habla en español de España, cercano, corto y sin tecnicismos. Una pregunta cada vez. El método completo, las fuentes
y la parte legal están en `DOCUMENTO.md`: léelo antes de empezar. Plantillas en `plantillas/` y comprobador del CSV en
`scripts/comprobar.py` (todo dentro de `~/.claude/skills/buscador-de-clientes/`). Para empezar un proyecto:
`python3 ~/.claude/skills/buscador-de-clientes/scripts/comprobar.py ~/Buscador-de-clientes/<proyecto> --crear`.


## En FERJUSANZ (léelo primero)
- La skill está en el proyecto: usa `.claude/skills/buscador-de-clientes/` donde ponga `~/.claude/skills/buscador-de-clientes/`. Proyectos en `docs/buscador-clientes/<proyecto>/` (no en `~/`, el contenedor se borra). La web es https://www.ferjusanz-frutas-verduras.es.
- Antes de buscar, cruza con lo que ya hay: clientes de Golden y la tabla de contactos (prospectos) de Supabase, para no repetir. Se parece a `/buscar-clientes` y `lead-finder`; esta añade las citas de redes.
- Correos: **uno por uno**, con su nombre y un detalle suyo, nunca en tanda ni con copia oculta; **nunca de noche**: borrador en Gmail y sale a las 7:00 (Madrid). Firma «Fernando Sanz». Cada texto pasa antes por `node web/revisar-texto.cjs` («Todo bien»). Mandar algo de verdad lo aprueba Tito mensaje a mensaje. Ver `.claude/shared/FERJUSANZ.md`.

## Paso 0. Las herramientas
Mira qué tiene y dilo en una línea (no pidas nada que no haga falta):
- **Búsqueda web** (WebSearch / WebFetch): siempre. Con esto solo ya funciona.
- **Navegador** (Playwright MCP): para páginas que no se leen con WebFetch. Si no lo tiene:
  `claude mcp add playwright -- npx @playwright/mcp@latest`. Solo páginas públicas, **nunca con su sesión iniciada**
  en redes y sin saltarse avisos de «inicia sesión».
- **Apify** (opcional, si ya tiene cuenta y `APIFY_TOKEN`): actores oficiales para perfiles públicos de Instagram,
  TikTok, Google Maps o Reddit. Antes de lanzar uno, dile cuánto le puede costar y espera su sí.
- **Gmail** (opcional): el conector de Gmail de Claude o un MCP de Gmail, para dejar borradores o enviar. Sin Gmail,
  los mensajes quedan en el CSV para copiar y pegar.

## Paso 1. Su web → su cliente ideal
Pídele la web (y, si quiere, su Instagram). Léela entera (inicio, servicios, precios, casos, sobre nosotros).
En `cliente-ideal.md` (plantilla `plantillas/cliente-ideal.md`): qué vende, a quién (tipo de negocio o persona,
tamaño, zona, idioma), el problema que resuelve, señales públicas de que alguien lo necesita y para quién NO es.
Enséñaselo en 6 líneas y **espera su visto bueno** antes de buscar. Pregunta cuántos quiere en esta tanda
(por defecto 20; máximo 50 por tanda para poder revisarlos de verdad).

## Paso 2. El scraper: buscar perfiles
Con el cliente ideal, monta las búsquedas (ver `DOCUMENTO.md`, sección 3): `site:instagram.com`, `site:linkedin.com/in`
y `/company`, `site:tiktok.com`, `site:reddit.com`, foros del sector, Google Maps y directorios, y frases de dolor
(«no tengo tiempo para», «busco a alguien que», «alguien sabe cómo»). Quédate solo con:
- cuentas **públicas** y activas (algo publicado en los últimos 6 meses),
- de **negocios o profesionales** que encajan (B2B: empresa, autónomo con negocio, perfil profesional),
- que no estén ya en `clientes.csv` ni en `no-contactar.csv`.
Nada de menores, perfiles personales privados ni datos sensibles (salud, política, religión). Pide el doble de
candidatos de los que necesitas: la mitad se cae.

## Paso 3. Montar cada perfil
Por cada candidato, lee lo que **él mismo** ha publicado: su bio, sus posts y pies de foto, sus comentarios, su web,
sus respuestas a reseñas, sus hilos. En `perfiles/<slug>.md` (plantilla `plantillas/perfil.md`):
- **Problemas**, **lo que sueña** y **objeciones**: cada punto con **la cita literal** entre comillas, el enlace y la
  fecha. Si no hay cita, no hay punto. Nunca parafrasees como si fuera cita ni pongas palabras en su boca.
- **Encaje** del 1 al 5 con el cliente ideal y por qué en una frase.
Si un perfil no tiene ninguna cita útil, descártalo (ponlo en `notas`).

## Paso 4. El email (solo el que publica el negocio)
Busca el contacto **que el propio negocio ha hecho público para que le escriban**: página de contacto, aviso legal,
pie de la web, botón de email o bio del perfil. Apunta el email y **la URL donde aparece** (`fuente_email`).
- Nunca adivines emails (nombre@dominio), ni uses herramientas de «encontrar emails», ni bases de datos compradas.
- Emails personales (gmail de una persona) solo si los publica él como contacto profesional de su negocio.
- Si no hay email publicado, apunta el canal que sí ofrece (formulario, DM, WhatsApp de empresa) y deja `email` vacío.

## Paso 5. El mensaje con sus palabras
Uno por cliente, en `mensaje` (plantilla `plantillas/mensaje.md`): ≤ 90 palabras, tuteo o usted según cómo escribe él,
su nombre, **una** de sus frases citada tal cual y de dónde la sacaste («vi en tu post del 3/11 que…»), lo que
podrías hacer en una línea, una pregunta fácil de contestar y, al final, la línea de baja
(«Si no quieres que te vuelva a escribir, dímelo y no lo hago»). Asunto corto y sin trucos. Sin precios, adjuntos,
enlaces acortados, cifras inventadas ni «somos líderes». Firma con su nombre, empresa y cómo darse de baja.

## Paso 6. Enviar, solo con su sí
Antes de nada, recuérdale lo legal de `DOCUMENTO.md` (sección 6) en 3 líneas, sobre todo si vende en España.
Luego, **de uno en uno**: enséñale destinatario, de dónde sale el email, asunto y mensaje, y pregunta
«¿Lo envío, lo cambio o lo salto?».
- Solo con un «sí» explícito para **ese** mensaje: envía (o crea el borrador si lo prefiere). Nunca «envía todos».
- Máximo 20 envíos al día y nunca el mismo mensaje dos veces a la misma persona; un solo seguimiento como mucho,
  a los 5-7 días y también aprobado.
- Apunta `estado` (enviado / borrador / saltado) y `fecha_envio`. Si alguien contesta que no, o pide la baja,
  pásalo a `no-contactar.csv` en el momento.
- Sin Gmail: deja los mensajes listos y dile que los mande él desde su correo.

Al acabar cada tanda ejecuta `python3 ~/.claude/skills/buscador-de-clientes/scripts/comprobar.py ~/Buscador-de-clientes/<proyecto>` (avisa de citas sin
enlace, emails sin fuente, duplicados y gente en no-contactar) y arregla lo que salga.

## Entrega
Cuántos perfiles han entrado, los 3 que mejor encajan (nombre · su frase · mensaje), cuántos sin email publicado y
la ruta de la carpeta.

## Reglas
- **No inventes nada:** ni perfiles, ni citas, ni emails, ni cifras, ni casos. Cada cita lleva su enlace.
- **Solo lo público** y solo lo que la persona o el negocio publica sobre su actividad profesional. Nada de entrar
  con la cuenta del usuario, saltarse logins, captchas o límites, ni recoger datos sensibles.
- **Nunca envíes nada sin su sí, mensaje a mensaje.** Nada de envíos masivos ni secuencias automáticas.
- **Baja siempre:** cada mensaje la ofrece y `no-contactar.csv` manda sobre todo lo demás.
- Si el usuario quiere más volumen, más envíos o comprar listas, dile que no con esta skill y por qué.
