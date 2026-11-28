---
name: ltv
description: Método LTV (Lifetime Value) para agencias de IA. Calcula lo que te deja cada cliente al año, si tu implantación y tu mantenimiento son rentables, cuántos clientes necesitas para 20.000 €/mes recurrentes y qué cobrar por cada cambio; y te monta el pacto de alcance (qué compró el cliente, qué no y cuánto cuesta lo demás) listo para mandar, para que no te coja el brazo cuando le das la mano. Úsala cuando digan /ltv, «comenta LTV», «método LTV», «qué mantenimiento cobro», «el cliente no para de pedirme cosas», «cuánto cobro por un cambio», «pacto de alcance», «sube mis precios» o pasen una propuesta o presupuesto ya aceptado.
---

# /ltv: lo que cobras por cliente al año y qué cobrar por cada cambio

Le das la mano al cliente (presupuesto barato, «eso también te lo hago») y te coge el brazo entero: pasas el año
desarrollando con un presupuesto mínimo y no hay forma de escalar. El método LTV lo corta en 3 pasos:
**1. Pegas la skill** y le mandas la propuesta y tu agencia · **2. Te pregunta lo justo** (cada pregunta con su
recomendación) · **3. Aplica el método LTV**: tus números por cliente, tus precios de cambios y el pacto de alcance.
Resultado: el cliente sabe qué compró y tú cobras el resto.

Referencias: `ref/metodo.md` (las cuentas y las 4 puertas) · `ref/preguntas.md` (las 12 preguntas con su recomendación).
Motor: `motor/ltv.py` (números) · `motor/pacto.py` (pacto en HTML). Salida: `~/Desktop/LTV/<cliente>/`.


## En FERJUSANZ (léelo primero)
- La skill está en el proyecto: usa `.claude/skills/ltv/` donde ponga `~/.claude/skills/ltv/`. Salidas en `docs/ltv/<cliente>/` (no en `~/Desktop`, el contenedor se borra).
- Ferjusanz no es una agencia de IA: aquí sirve para hacer números de un cliente mayorista (lo que deja al año, margen, coste de servirle) y para poner límites a lo que se regala (portes, pedidos sueltos, cambios de última hora). Datos reales solo del historial de Golden (`golden_*`), nunca de los pedidos de prueba de la app.
- **Cambiar precios o mandar el pacto a un cliente lo decide Tito expresamente.** Cualquier texto para un cliente pasa por `node web/revisar-texto.cjs` y se firma «Fernando Sanz». Ver `.claude/shared/FERJUSANZ.md`.

## 01 · Leer el caso
Lo normal es que pegue algo como: «Hazme el pacto de alcance de mi cliente Clínica Sonrisa. Te adjunto mi logo y la
propuesta que aceptó: asistente de WhatsApp que coge las primeras visitas y manda recordatorios, 1.900 € de
implantación, 14 días, 290 €/mes. Ojo: el doctor ya me preguntó por Instagram.»
Sacar de ahí (y leer enteros los archivos que pase): agencia, cliente y nicho, entregables, implantación, plazo,
mensualidad, lo que el cliente ya ha pedido o insinuado, logo y color. Si solo quiere los números de su pricing (sin
cliente concreto), saltar al paso 03 con los datos de su servicio tipo.

## 02 · Preguntar lo justo (un solo mensaje)
Con `ref/preguntas.md`: las 12 preguntas en **un único mensaje**, agrupadas (Tu marca · Qué entra y qué no · Cambios y
dinero · Cómo trabajáis), cada una con «→ recomendación: por qué» adaptada a su caso, y al final las 2-4 del LTV que no
se sepan (horas reales, herramientas, su tarifa, meses). Cerrar con: «Contesta solo lo que quieras cambiar o escribe
**todo como recomiendas**». No usar AskUserQuestion para esto: es un mensaje de texto, como en el método.

## 03 · Aplicar el método LTV
1. Números: `python3 ~/.claude/skills/ltv/motor/ltv.py --implantacion … --mensualidad … --meses … --horas-desarrollo …
   --horas-mes … --herramientas … --tarifa … --objetivo 20000 --json`. Lo que no sepa va como **supuesto** y se dice.
2. Leer los `avisos`: si la mensualidad o la implantación están por debajo del mínimo, o el margen baja del 40 %,
   decirlo sin rodeos y proponer el precio nuevo (o recortar lo incluido).
3. Clasificar lo que el cliente ya ha pedido o insinuado con las 4 puertas de `ref/metodo.md` (p. ej. Instagram →
   Nuevo, propuesta aparte).

## 04 · Entregar
1. Escribir `~/Desktop/LTV/<cliente>/datos.json` (campos en la cabecera de `motor/pacto.py`) y generar el pacto:
   `python3 ~/.claude/skills/ltv/motor/pacto.py datos.json pacto.html`. Abrirlo con `open`.
2. Escribir `~/Desktop/LTV/<cliente>/ltv.md`: LTV, coste, margen, mínimos, clientes para el objetivo, la tabla
   «Tus precios de cambios» y el mensaje corto para mandar el pacto al cliente (sin emojis, en su idioma, sin pedir
   perdón por los precios).
3. En la respuesta, corto: LTV y margen de ese cliente, la tabla de precios de cambios, los avisos y la ruta de los
   archivos. Ofrecer el siguiente paso: el mensaje para subir precio a sus clientes actuales o contestar al cliente
   la próxima vez que pida «solo una cosita».

## Cuando ya tiene el pacto y el cliente pide algo
Si pega un mensaje del cliente («¿y si cuando reservan les pide la mutua?»): clasificarlo en su puerta, decir el precio
según su tabla y escribir la respuesta al cliente (amable, corta, con el precio y la pregunta «¿lo hacemos?»).

## Reglas
- **Nunca inventar** cifras del cliente ni casos. Lo estimado va marcado como supuesto.
- Euros y lenguaje de dueño de negocio, no de técnico.
- El objetivo no es cobrar menos ni regalar: es que **lo incluido sea finito y visible** y que todo lo demás tenga precio.
- Lo que ya pagó el cliente no se toca; los precios nuevos aplican desde la siguiente mensualidad o mejora.
