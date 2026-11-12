# Plan: separar la app de PRUEBAS de la app normal
_Preparado el 12/11/2026. Cada paso necesita «Autorizo» de Fernando._

## Decisiones de Fernando (12/11/2026)
1. ✔️ **Paso 1 autorizado y hecho**: proyecto **`ferjusanz-pruebas`** creado (id `pbeuxbwbpmlanbhhnpgy`, Irlanda, plan gratuito, 0 €). Está vacío. Lo único que existe en Supabase es la organización `FerjusanzProductosApp`, así que va ahí; **en diciembre, antes de pasar la real a Pro, mover pruebas a una organización gratuita aparte** (si no, costaría unos 10 $/mes más).
2. **Clientes en pruebas con sus datos reales y bien puestos**, pero con **«(en pruebas)»** detrás del nombre (p. ej. «Bar La Torre (en pruebas)»). Esto **sustituye** la limpieza de datos personales del punto 2. Para que no llegue nada a un cliente de verdad: en pruebas no hay Gmail ni WhatsApp, y en el paso 6 la app naranja **bloquea los botones de llamar, WhatsApp y correo** («en pruebas no se envía»). Los prospectos, fichajes, mensajes y PDF siguen sin copiarse.
3. ✔️ **Plan Pro para la base real** (≈ 23 €/mes). ~~Desde el 1/12/2026~~ → **desde el día que se empiece a usar la app de verdad** (unos 7-10 días después del 12/11/2026; Fernando avisa 2-3 días antes).
4. ✔️ **Arranque real antes de lo previsto** (12/11/2026): pedidos, hojas de compra y carga, preparación, albaranes y cobros de verdad en 7-10 días; facturas en Golden hasta el 1/1/2027, probándolas en paralelo **solo en la app naranja**. Por eso la separación tiene que estar hecha **antes del arranque**. Ese día se borran los datos de prueba de la base real (con el «sí» de Fernando).

## Hecho: pasos 2 a 4 (12/11/2026, «Autorizo pasos 2 a 4»)
- **Estructura**: sacada de la real con `scripts/esquema/ddl.py` (solo lectura) → `supabase/esquema_completo.sql` (1.070 sentencias, sin datos ni claves). Aplicada en pruebas sin fallos. Comprobado igual que la real: 61 tablas, 5 vistas, 76 funciones, 43 disparadores, 116 reglas de permisos, 113 índices, 3 carpetas de archivos, 2 tareas de madrugada y la misma huella de columnas.
- **Datos copiados** (la real no se ha cambiado): proveedores 45, productos 711, clientes 1.098 (nombre con «(en pruebas)»), listas de precios 5 + 169, tarifas 1.656, tarifas de compra 1.143, alias 137, formatos 11 + 26, pedidos fijos 73 + 142 líneas (sin repartidor asignado), ajustes, Harvey precios fijos 6 y proveedor preferido 1, Golden de los últimos 60 días con datos (406 facturas y 5.791 líneas, del 23/08 al 22/10). Comprobado: ningún dato huérfano. **No** se copiaron pedidos, albaranes, cobros, historial, prospectos, fichajes, enlaces del portal ni PDF.
- **Usuarios de prueba** (correos que no existen, misma contraseña para todos; se le dio a Fernando en el chat, no se guarda aquí): `fernando@pruebas.invalid` (admin), `oficina@…`, `compras@…`, `preparador@…`, `repartidor@…` (preparador que reparte). Los 5 entran; sin entrar no se ve nada.
- **Cómo se cargó**: esta sesión no llega a la base de pruebas con su clave de administración, así que se añadió `pbeuxbwbpmlanbhhnpgy.supabase.co` a la red del entorno de Claude (aprobado por Fernando) y se puso en pruebas una función temporal `_carga_temporal` con llave aleatoria (tabla `_carga_llave`). Cerrada el 12/11 (ya nadie puede usarla: permiso quitado). ⚪ Falta borrarlas; el aviso de Supabase caducó dos veces.
- **Pendiente del paso 4**: subir las funciones (Harvey, ayuda, correo, lector) a pruebas. Las de IA necesitan una **clave de Anthropic aparte con tope de 5 $/mes** que crea Fernando y se pone en Supabase (nunca por el chat). El correo se sube **sin** la contraseña de Gmail.
- Las 2 tareas de madrugada ya funcionan en pruebas (crearán previstos de prueba desde los pedidos fijos).

## Cómo está hoy (comprobado el 12/11/2026)
- Las dos apps (normal y naranja) usan **la misma base de datos** de Supabase (`hvydnjaswdexttogsyen`). La dirección está escrita en `public/index.html` (línea `SUPABASE_URL`) y en `public/nuevos-clientes.html`.
- Lo único separado hoy: el color/icono (lo pone `src/worker.js` según la dirección) y Harvey (`harvey-v2-pruebas`).
- Base de datos: 38 MB, 52 tablas en `public` + 9 en `harvey`. Archivos (facturas en PDF, ayudas): 55 MB. 8 usuarios. 9 funciones. 2 tareas automáticas cada madrugada (previstos 04:15 y tarifas de Harvey 06:15).
- Plan **gratuito** de Supabase: sin copias propias.
- La copia nocturna de GitLab copia `public` y los usuarios, pero **no** copia `harvey`, ni las tareas automáticas, ni los archivos (PDF, fotos, firmas). **Nunca se ha probado a recuperarla.**
- La carpeta `supabase/migrations/` tiene solo 21 archivos: **no** está toda la estructura (parte se hizo a mano en el editor SQL).

## Hecho: pasos 5 (en pruebas) y 6 (12/11/2026)
- Ficha «entorno» (`supabase/migrations/20261112f_entorno.sql`) aplicada en **pruebas** con `pruebas`. **En la real falta** (con `produccion`): se enseña el SQL a Fernando y se aplica con su «Autorizo». Mientras no esté, la app normal sigue como siempre (si no hay ficha, no bloquea).
- App **v248 en PRUEBAS**: la naranja usa la base `ferjusanz-pruebas` (también la página `/nuevos-clientes`); cerrojo con pantalla roja «⛔ Configuración equivocada» si la base no coincide; en pruebas se bloquean llamar, WhatsApp, correo, SMS y «Compartir» (aviso «🟠 App de PRUEBAS: aquí no se llama ni se envía nada a nadie»); albarán en pantalla y PDF con «PRUEBA · SIN VALOR FISCAL».
- Probado en un navegador: entra `fernando@pruebas.invalid`, ve clientes «(en pruebas)», solo se conecta a la base de pruebas, `wa.me` bloqueado, cerrojo probado simulando la base real. La dirección normal sigue apuntando a la base real.
- **Sin hacer todavía**: contadores de prueba y botón «poner a cero» (llegan con la fase 2 de facturación, cuando existan las facturas); funciones (Harvey, ayuda, correo) en pruebas: falta la clave de Anthropic aparte. En la naranja, Harvey y la ayuda con IA no funcionan hasta entonces.
- Aviso: en pruebas sale «Hace más de 7 días sin copia de seguridad» porque la configuración de copias no se copió; es normal.

## 1. Qué se crea y qué sigue igual
**Se crea:**
1. **Un proyecto de Supabase nuevo «ferjusanz-pruebas»** (misma región, Irlanda). Base de datos, usuarios, archivos y funciones propios. El plan gratuito permite 2 proyectos: **0 €**.
2. **Una ficha «entorno»** en cada base de datos: `produccion` en la normal y `pruebas` en la nueva. La app la lee al abrir (ver punto 3).
3. En la app (`public/index.html` y `nuevos-clientes.html`): si la dirección tiene «pruebas», usa el proyecto nuevo; si no, el de siempre. Es un cambio de unas pocas líneas.
4. **Usuarios de prueba**, uno por puesto (admin, oficina, secretaria, comercial, compras, preparador, repartidor, dirección), con correos que no existen (`…@pruebas.invalid`). Fernando tendrá su usuario de prueba aparte.
5. Las **funciones** (Harvey, ayuda, correo de albaranes, lector de facturas…) copiadas en el proyecto nuevo, **sin** la contraseña de Gmail ni WhatsApp: en pruebas nunca sale un correo ni un WhatsApp a un cliente.
6. Un archivo con **toda la estructura** de la base de datos (`supabase/esquema_completo.sql`), sacado de la real. Sirve para montar pruebas y, además, para recuperar si un día hace falta.

**Sigue igual:** la app normal, su dirección, sus datos, sus usuarios y su Harvey. El **Modo prácticas** (morado, dentro del móvil) se queda: sigue sirviendo para enseñar a los empleados en la app normal.

## 2. Qué datos se copian a pruebas y cómo se protegen los datos personales
| Datos | ¿Se copian? | Cómo |
|---|---|---|
| Productos, unidades y formatos | Sí | Tal cual |
| Tarifas, listas de precios, precios de compra | Sí | Tal cual (no son datos personales) |
| Proveedores y «alias» de compra | Sí | Tal cual (son empresas) |
| **Clientes (1.098)** | Sí, **limpiados** | Se queda: código, nombre del local, ruta, tipo, con/sin IVA. Se cambian por **falsos**: NIF, teléfonos, móviles, correos, persona de contacto y dirección (la calle; se deja el código postal) |
| Pedidos fijos (lo de siempre) | Sí | Para que salgan previstos parecidos a los reales |
| Historial de Golden | Solo los **últimos 60 días** | Para que funcione «lo de siempre» |
| Pedidos, albaranes, cobros, previstos | **No** | Se empieza vacío |
| Prospectos (contactos), fichajes, mensajes, historial de cambios | **No** | Tienen datos personales |
| Facturas de proveedores (PDF) | **No** | Para probar el lector se suben 3–4 de ejemplo a mano |
| Usuarios y contraseñas reales | **No** | Se crean los de prueba |

La limpieza se hace **dentro** del proceso de copia: los datos personales nunca llegan a la base de pruebas, ni a GitLab, ni a GitHub.

## 3. Cómo se evita que una prueba toque datos reales
1. **Llave distinta**: la app naranja solo tiene la dirección y la clave del proyecto de pruebas. Con ella **no se puede** entrar en la base real (son dos proyectos distintos, como dos cajas fuertes con llaves distintas).
2. **Cerrojo doble**: al abrir, la app comprueba la ficha «entorno». Si la dirección dice «pruebas» pero la base contesta «produccion» (o al revés), **no arranca** y sale una pantalla roja «Configuración equivocada, avisa a Fernando».
3. **Sin salidas al exterior en pruebas**: sin Gmail, sin WhatsApp, y los clientes tienen correos y teléfonos falsos. Aunque alguien pulse «enviar», no le llega a nadie.
4. **Usuarios separados**: entrar en pruebas no da entrada a la normal.
5. **Cambios de la base de datos, primero en pruebas**: cada SQL nuevo se aplica antes en pruebas; solo con «Autorizo publicar» se aplica en la real.

## 4. Contadores de prueba y facturas «SIN VALOR FISCAL»
- En pruebas, contadores propios: albaranes **PRUEBA-F-0001…**, facturas **PRUEBA-2027-0001…**, rectificativas **PRUEBA-R2027-0001…** (y pedidos/cargas si se numeran).
- Botón **«Poner contadores a cero»** (solo admin, **solo existe en la base de pruebas**; la función comprueba que la ficha dice `pruebas` antes de hacer nada). Antes de ponerlos a cero guarda lo ensayado en un archivo («ensayo del día X») por si hay que revisarlo.
- Toda factura o albarán de pruebas (pantalla, PDF y correo) lleva en grande la marca **«PRUEBA · SIN VALOR FISCAL»**. La marca la decide la ficha «entorno» de la base de datos, no la dirección: no se puede quitar por error.
- La base real no lleva el botón ni la función de poner a cero. Los contadores reales (serie F con el último nº de Golden, 2027-0001…) se crean en la fase 2 de facturación.

## 5. Copias de seguridad y prueba real de recuperación
1. **Ampliar la copia nocturna de GitLab** (`scripts/copia-supabase.sh`): añadir el esquema `harvey`, las tareas automáticas y una copia de los **archivos** (PDF, fotos, firmas; hoy 55 MB).
2. **Comprobar** que la copia nocturna está programada en GitLab y que sale bien (hoy está ⚠️ sin confirmar).
3. **Prueba real de recuperación**: se recupera la última copia **en el proyecto de pruebas** (limpiando los datos personales) y se comparan las filas de cada tabla con la real. Así cada vez que se refresquen las pruebas, se comprueba de paso que la copia sirve. **Una vez al mes** y siempre antes del 1/1/2027.
4. **El día del arranque real** (ya no en diciembre): pasar la base **real** al plan **Pro** de Supabase (copias diarias de 7 días hechas por Supabase, y no se pausa nunca). Pruebas se queda gratis.

## 6. Coste al mes
| Qué | Ahora | Desde diciembre (recomendado) |
|---|---|---|
| Proyecto de pruebas (Supabase gratuito) | 0 € | 0 € |
| Base real en Supabase | 0 € (gratuito) | **Pro ≈ 25 $/mes (≈ 23 €)** |
| Cloudflare (las dos apps) | 0 € | 0 € |
| Harvey en pruebas (IA) | céntimos | céntimos (clave aparte con tope de 5 $/mes) |
| **Total** | **0 €** | **≈ 23 €/mes** |
Precios a comprobar el día de contratar. Ojo: en el plan Pro, un **segundo** proyecto dentro de la misma cuenta cuesta unos 10 $/mes más; por eso pruebas se pone en una organización **gratuita aparte** y sigue a 0 €.

## 7. Riesgos
- **Pruebas se «duerme»** si pasa 7 días sin uso (plan gratuito). Se despierta con un clic (o lo hace Claude); los datos no se pierden.
- **Dos bases que mantener al día**: cada cambio de la base y cada función hay que subirlo a las dos. Es justo lo que queremos (pruebas primero), pero es un paso más en cada publicación.
- **Datos de pruebas viejos**: se refrescan una vez al mes con la prueba de recuperación.
- **Confusión de apps**: la naranja ya se distingue; además, la pantalla roja si algo está mal enchufado.
- Mientras se monta, la app de pruebas puede fallar un rato. **La normal no se toca**, salvo la ficha «entorno» (una tabla pequeña, solo lectura para la app).

## 8. Cómo volver atrás
- Cambiar de nuevo la dirección en `public/index.html` y volver a publicar **solo** la app de pruebas: vuelve a usar la base compartida, como hoy. 5 minutos.
- El proyecto de pruebas se puede pausar o borrar sin afectar a nada real.
- En la base real solo quedaría la ficha «entorno»; se puede dejar (no molesta) o quitar con una línea de SQL.

## 9. Pasos (cada uno con autorización)
| # | Qué | Toca la real | Sesión |
|---|---|---|---|
| 1 | Crear el proyecto «ferjusanz-pruebas» en una organización gratuita aparte | No | A |
| 2 | Sacar la estructura completa de la real y montarla en pruebas | Solo lectura | A |
| 3 | Copiar los datos maestros limpiados (tabla del punto 2) | Solo lectura | A |
| 4 | Usuarios de prueba, funciones sin Gmail/WhatsApp, tareas automáticas | No | A |
| 5 | Ficha «entorno» (SQL que se enseña antes; en la real con «listo») | **Sí, mínima** | B |
| 6 | App: dirección por entorno, pantalla roja, marca «SIN VALOR FISCAL», contadores de prueba y botón de ponerlos a cero. **Solo en la app naranja**; Fernando lo prueba | No | B |
| 7 | Copia nocturna ampliada + prueba de recuperación en pruebas | Solo lectura | C |
| 8 | Normal con «Autorizo publicar» (solo lleva el cerrojo; sin contadores de prueba) | Sí | B o C |
| 9 | Diciembre: plan Pro para la real | Coste | — |

## 10. Lo que tiene que decidir Fernando
1. **¿Autorizas el paso 1** (crear el proyecto de pruebas, 0 €)?
2. **Nombres de los clientes en pruebas**: recomendado **dejar el nombre del local** (para reconocerlos al probar) y poner falsos el NIF, teléfonos, correos, contacto y calle.
3. **Plan Pro (≈ 23 €/mes)** para la base real: recomendado desde **el 1 de diciembre**, antes de la prueba completa de facturación.
4. Para la copia de archivos y la prueba de recuperación hará falta poner en GitLab las claves del proyecto de pruebas: se hará con el **formulario seguro**, nunca por el chat.
