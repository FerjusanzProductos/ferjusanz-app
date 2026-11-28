# El buscador de clientes en redes

Por Denís Corral · @deniscorralvillarraso en Instagram · [Sell Your AI](https://sellyourai.io)

Escribes `/buscador-de-clientes` en Claude, pegas tu web y Claude hace cuatro trabajos seguidos:

1. **El scraper.** Deduce tu cliente ideal leyendo tu web y busca perfiles y negocios públicos que encajan en
   Instagram, LinkedIn, TikTok, YouTube, Reddit, foros, Google Maps y sus webs.
2. **El que monta cada perfil.** De cada uno saca sus problemas, lo que sueña y sus objeciones **con sus palabras
   exactas**, cada frase con el enlace de dónde la dijo.
3. **El que encuentra el email.** Solo el que el propio negocio publica para que le escriban (contacto, aviso legal,
   bio). Sin adivinar ni comprar nada.
4. **El que lo envía.** Te escribe el primer mensaje usando una frase de esa persona y lo manda desde tu Gmail
   **solo cuando tú le dices que sí a ese mensaje**.

Todo queda en una carpeta con un CSV que abres en Excel, Numbers o Google Sheets. Este documento te explica cómo
funciona, qué necesitas y dónde está el límite legal. Al final tienes un prompt para pegarlo en Claude si no usas
Claude Code.

> Importante: esto no es una máquina de spam. Es para escribir a pocas personas bien elegidas con un mensaje que
> demuestra que las has escuchado. Lee la sección 6 antes de enviar nada.

---

## 1. Qué necesitas

| | |
|---|---|
| Claude | Claude Code (recomendado) o Claude con búsqueda web |
| Navegador (opcional) | Playwright MCP: `claude mcp add playwright -- npx @playwright/mcp@latest` |
| Apify (opcional) | Si ya tienes cuenta y token. Tiene actores para perfiles públicos de Instagram, TikTok, Google Maps o Reddit. Se paga por uso: Claude te dice lo que puede costar antes de lanzarlo |
| Gmail (opcional) | El conector de Gmail de Claude o un MCP de Gmail. Sin él, los mensajes quedan listos para copiar |

Con la búsqueda web sola ya funciona; el navegador y Apify sirven para leer más perfiles y más rápido.

## 2. Instalarlo

```bash
git clone https://github.com/deniscorral3am/buscador-de-clientes-skill ~/.claude/skills/buscador-de-clientes
```

Abre Claude Code y escribe `/buscador-de-clientes`. Te pedirá tu web.

## 3. El scraper: de tu web a la lista

**Tu cliente ideal.** Claude lee tu web (inicio, servicios, precios, casos) y te enseña en 6 líneas a quién vendes,
qué problema resuelves, qué señales públicas delatan a alguien que lo necesita y para quién no es. Lo corriges y
entonces busca. Si esto sale mal, todo lo demás sale mal: dedícale un minuto.

**Las búsquedas.** Mezcla tres tipos:
- Por red: `site:instagram.com "<sector>" "<ciudad>"`, `site:linkedin.com/in "<cargo>" "<sector>"`,
  `site:linkedin.com/company`, `site:tiktok.com`, `site:youtube.com`.
- Por dolor, con las frases que escribe tu cliente cuando tiene el problema: `"no doy abasto" "<sector>"`,
  `"busco a alguien que" "<tarea>"`, `"alguien sabe cómo" "<tema>"`, en Reddit (`site:reddit.com`) y foros del sector.
- Por sitio: Google Maps, directorios y asociaciones del sector, sus webs.

**El filtro.** Solo cuentas públicas, activas en los últimos 6 meses, de negocios o profesionales que encajan, y que
no tengas ya en la lista ni en la de «no contactar». Va por tandas (20 por defecto, 50 como mucho) para que puedas
revisarlas de verdad.

## 4. Cada perfil, con sus palabras

Claude lee lo que **esa persona o ese negocio** ha escrito en público: su bio, sus posts, sus comentarios, su web,
sus respuestas a reseñas. Y monta una ficha así:

- **Problemas:** «cita literal» · enlace · fecha
- **Lo que sueña:** «cita literal» · enlace · fecha
- **Objeciones:** «cita literal» · enlace · fecha
- **Encaje** del 1 al 5 y por qué

La regla de oro: **si no hay cita con enlace, no hay punto.** Claude no resume como si fuera una cita ni se inventa
lo que «seguramente» piensa. Así, cuando le escribas, todo lo que digas lo puede comprobar él.

## 5. El email y el mensaje

**El email.** Solo el que el negocio publica para que le escriban: página de contacto, aviso legal, pie de la web,
bio. Claude apunta también la URL donde aparece. No adivina emails (nombre@dominio), no usa herramientas para
«encontrar» emails y no compra bases de datos. Si no hay email publicado, te apunta el canal que sí ofrece
(formulario, DM, WhatsApp de empresa).

**El mensaje.** Máximo 90 palabras:

1. Su nombre.
2. **Una** frase suya tal cual y dónde la dijo: «Vi en tu post del 3/11 que "…"».
3. Lo que podrías hacer por eso, en una línea y sin tecnicismos.
4. Una pregunta fácil: «¿Te cuento cómo lo haría en tu caso?».
5. Tu firma y la baja: «Si no quieres que te vuelva a escribir, dímelo y no lo hago».

Sin precios, adjuntos, enlaces acortados ni cifras o casos que no puedas demostrar.

**El envío.** Claude te enseña cada mensaje (a quién, de dónde sale el email, asunto y texto) y te pregunta:
«¿Lo envío, lo cambio o lo salto?». Solo con tu sí a **ese** mensaje lo manda o deja el borrador en tu Gmail.
Nunca «envía todos». Como mucho 20 al día y un único seguimiento a los 5-7 días, también aprobado.

## 6. Lo legal (léelo)

No es asesoramiento jurídico; si vas a hacerlo en serio, pregúntale a tu asesor. Lo que hace la skill para
mantenerte en lo razonable:

- **RGPD.** Solo datos públicos y profesionales que la persona o el negocio publica sobre su actividad, nada de datos
  sensibles ni de menores, una tabla mínima (lo justo para contactar) y una lista de «no contactar» que se respeta
  siempre. Si alguien pide que borres sus datos, se borran. Tu base es el interés legítimo en contactar con un
  negocio por algo relacionado con su actividad: documenta por qué le escribes (las citas sirven para eso).
- **LSSI (España).** Ojo: el artículo 21 de la LSSI prohíbe enviar por email comunicaciones comerciales que no se
  hayan pedido o autorizado antes, y la AEPD lo aplica también cuando el destinatario es una empresa. Que el email
  esté publicado no es un permiso. Por eso, si vendes en España:
  - prioriza el canal que el negocio ofrece para que le escriban (formulario, DM, WhatsApp de empresa),
  - si usas el email, que sea un mensaje uno a uno sobre algo concreto que ha dicho, sin oferta ni precio, que te
    identifique y ofrezca la baja, y nunca en masa,
  - y si contesta que no, no vuelves a escribir.
- **Redes sociales.** Solo páginas públicas, sin iniciar sesión con tu cuenta, sin saltarse avisos de «inicia
  sesión», captchas o límites, y a ritmo humano. Cada red tiene sus condiciones de uso: léelas.
- **Volumen.** Pocas personas, bien elegidas, aprobadas de una en una. Si quieres miles de emails automáticos, esta
  skill no es para eso.

## 7. Lo que te queda

```
~/Buscador-de-clientes/<proyecto>/
├── cliente-ideal.md       a quién vendes, sacado de tu web
├── clientes.csv           un cliente por fila: citas, enlaces, contacto, mensaje y estado
├── perfiles/<cliente>.md  la ficha de cada uno
└── no-contactar.csv       las bajas (mandan sobre todo lo demás)
```

`scripts/comprobar.py` revisa el CSV: citas sin enlace, emails sin fuente, duplicados, gente en «no contactar»,
mensajes sin baja o demasiado largos y más de 20 envíos en un día.

## 8. Errores que te harán perder clientes

- Saltarte el paso del cliente ideal: buscarás a quien no te va a comprar.
- Poner «citas» que no ha dicho: si lo comprueba, se acabó.
- Mandar el mismo texto a todos cambiando el nombre: se nota.
- Meter el precio o un PDF en el primer mensaje.
- Escribir a quien te pidió que no lo hicieras.

---

## 9. El prompt para Claude

Si no usas Claude Code, pega esto en Claude (con búsqueda web activada) y contesta sus preguntas.

```
Quiero encontrar clientes potenciales en redes sociales a partir de mi web. Ayúdame paso a paso, en español,
corto y sin tecnicismos, y pregúntame una sola cosa cada vez. No inventes nada: ni perfiles, ni citas, ni emails,
ni cifras. Cada cita literal lleva su enlace.

1. CLIENTE IDEAL. Te paso mi web. Léela y dime en 6 líneas qué vendo, a quién, qué problema resuelvo, qué señales
   públicas delatan a alguien que lo necesita y para quién no es. Espera mi visto bueno.

2. BUSCAR. Busca 20 perfiles o negocios públicos que encajen (Instagram, LinkedIn, TikTok, YouTube, Reddit,
   foros, Google Maps y sus webs), activos en los últimos 6 meses. Solo negocios o profesionales, nada privado.

3. PERFILES. De cada uno, con lo que él mismo ha publicado: sus problemas, lo que sueña y sus objeciones, cada
   punto con la cita literal, el enlace y la fecha. Si no hay cita, no hay punto. Encaje del 1 al 5.

4. EMAIL. Solo el email de contacto que el negocio publica (contacto, aviso legal, bio), con la URL donde
   aparece. No lo adivines. Si no hay, dime qué canal ofrece.

5. MENSAJE. Para cada uno, un primer mensaje de 90 palabras como mucho: su nombre, una frase suya citada y dónde
   la dijo, lo que podría hacer por eso en una línea, una pregunta fácil, mi firma y la línea de baja. Sin
   precios ni cifras inventadas.

6. TABLA. Dámelo todo en una tabla que pueda copiar a una hoja de cálculo: nombre, red, perfil, web, encaje,
   citas con enlace, email, fuente del email, otro canal, asunto y mensaje.

No envíes nada: los mensajes los reviso y los mando yo, de uno en uno. Recuérdame que en España la LSSI no permite
emails comerciales no pedidos, también a empresas, y prioriza el canal que cada negocio ofrece.

Empieza por el paso 1.
```

---

Sell Your AI · Claude es marca de Anthropic. Instagram, LinkedIn, TikTok, YouTube, Reddit, Gmail y Apify son
marcas de sus dueños.
