# Plan: llevarnos la web www.ferjusanz-frutas-verduras.es
_Preparado el 11/11/2026 para Fernando. Aún no se ha hecho nada; la web sigue con Creativate._

## Objetivo
Dejar a Creativate, tener la web, el dominio y los accesos a nombre de FERJUSANZ y llevarla nosotros con Claude:
rápida, bien posicionada en Google en nuestro sector, fácil de actualizar y lista para conectar con redes sociales más adelante.

## Cómo hacerlo (orden, sin prisa y sin que la web se caiga)
1. **Fernando lee su contrato o sus facturas de Creativate**: cuánto paga, cada cuánto y si hay permanencia o un plazo de aviso.
2. **Enviar a Creativate las preguntas** (abajo), con tono cordial. Todavía sin decir «nos vamos».
3. **Con las respuestas, avisar por escrito** de que no se renueva el servicio, pidiendo que **no borren nada** hasta terminar el traslado.
4. **Claude hace la web nueva en paralelo**, en una dirección de pruebas, con las **mismas direcciones de página** que la actual (para no perder Google).
5. **Fernando la revisa en el móvil** y da el visto bueno.
6. **Traslado del dominio** (y del correo, si lo hay) en un día tranquilo. Se comprueba que todo funciona.
7. **Solo entonces** se da de baja el alojamiento de Creativate.

## Preguntas para Creativate
1. ¿Quién es el **titular** del dominio ferjusanz-frutas-verduras.es? ¿Está a nombre de FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.? ¿Con qué registrador está y cuándo caduca?
2. ¿Nos podéis dar el **código de autorización (AuthCode)** para trasladar el dominio?
3. ¿Hay **cuentas de correo** con el dominio (p. ej. info@…)? ¿Cuáles y quién las usa?
4. Acceso de **administrador de WordPress** y del **panel del alojamiento**.
5. Una **copia completa** de la web (archivos y base de datos).
6. ¿Quién es el propietario de **Google Tag Manager, Google Analytics, Search Console** y de la **ficha de Google (Google Business Profile)**? Que nos pasen la propiedad.
7. ¿Las **fotos y textos** de la web son nuestros o hay alguno con licencia vuestra o de un banco de imágenes?
8. ¿Hay **permanencia** o plazo de aviso? ¿Qué importe pagamos y hasta cuándo está pagado?
9. Que **no borren nada** hasta que confirmemos el traslado.

## Qué puede pasar y cómo evitarlo
| Riesgo | Cómo lo evitamos |
|---|---|
| Que el dominio esté a nombre de Creativate | Preguntarlo lo primero. Si es así, piden cambiar el titular a FERJUSANZ (tenemos derecho: es nuestra marca y lo pagamos). |
| Que se enfaden y tarden | Tono cordial, todo por escrito, y no darles de baja hasta tener el dominio y la copia. |
| Perder correos | Si hay buzones del dominio, se preparan los nuevos antes de mover nada. |
| Bajar en Google | Mismas direcciones de página (o redirecciones), mismos textos buenos mejorados y aviso a Google con Search Console. |
| Perder la ficha de Google o Analytics | Pedir la propiedad antes de irse. |
| Fotos con licencia de otros | Sustituirlas por fotos nuestras (mejor aún para Google). |

## Costes aproximados (al año)
| Concepto | Con nosotros |
|---|---|
| Dominio .es | 10–15 € |
| Alojamiento de la web (Cloudflare, el mismo que la app) | 0 € |
| Correo con el dominio (si hace falta) | 0 € solo reenvío · ~1–7 € al mes por persona con buzón (Zoho / Google Workspace) |
| Plantilla Divi y plugins | 0 € (no hace falta WordPress) |
| Hacer y mantener la web | Claude (ya lo tenemos) |
| Opcional: fotos profesionales del puesto y la mercancía | 150–400 € una vez |

Ahorro: lo que se paga hoy a Creativate (Fernando lo mira en las facturas).

## Para ser los primeros en Google (nuestro sector)
- **Ficha de Google (Google Business Profile)**: es lo que más pesa en búsquedas tipo «mayorista fruta Mercamadrid». Completa, con fotos, horario y **reseñas** de clientes (pedirlas por WhatsApp).
- **Web muy rápida en el móvil** y con datos estructurados (Google entiende que somos un mayorista en Mercamadrid).
- **Mantener y mejorar las páginas que ya funcionan** (patatas, cebollas, frutas, verduras, colectividades, hostelería…), sin repetir textos.
- **Contenido vivo**: «producto de temporada» y precios orientativos o novedades que Claude actualiza cada semana desde la app.
- **Search Console** para ver por qué búsquedas salimos y corregir.
- Nadie puede garantizar el número 1, pero con esto se compite bien en un sector local con poca competencia en internet.

## Dinámica y redes (más adelante)
- Botón de WhatsApp y formulario de contacto que llega a la app (como prospecto).
- Instagram y Facebook enlazados, y publicaciones de la web compartidas en redes.
- Sección de productos de temporada alimentada desde la app.

## Dominio: pasarlo a una cuenta de FERJUSANZ y conectarlo con Cloudflare (16/11/2026)
> **Actualizado 23/11/2026: paso 1 HECHO por Red.es.** Titular FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. (`1BF3CEE-ESNIC-F5`), PCA el padre (`F36AA3-ESNIC-F5`), gestor «Usuario Final» en Red.es (ya no DonDominio/SCIP). Donde abajo dice «en DonDominio» (cambiar DNS, renovar), ahora es en **nic.es** (https://www.nic.es/sgnd/login.action). Lo de DonDominio y el Push queda solo como historia.
_Solo preparado. **No se ha cambiado nada**: ni DNS, ni alojamiento, ni configuración (ni en DonDominio, ni en Webempresa, ni en Cloudflare)._

### Lo que sabemos
| Dato | Valor | De dónde |
|---|---|---|
| Registrador | **DonDominio** | Alberto (Creativate), captura del 16/11/2026 |
| Estado | Activo | captura |
| Alta / caducidad | 26/05/2010 · **26/05/2027** | captura |
| Servidores DNS | Personalizados: `ns1/ns2/ns3.controldeservidor.com` (Webempresa) | captura + comprobado por Claude el 16/11 |
| Web antigua | En el servidor `217.61.210.26` (la que lleva Creativate). `www` apunta al mismo sitio | comprobado |
| Correo | MX `mx1/mx2/mx3.controldeservidor.com` (Webempresa); `mail.` y `webmail.` en `217.61.210.26`; `autodiscover` → `autodiscover.loading.es` | comprobado |
| SPF · DKIM · DMARC | `v=spf1 include:_spf.controldeservidor.com -all` · clave `default._domainkey` · `v=DMARC1; p=none` | comprobado |
| DNSSEC | **No activado** (más fácil: no hay que quitarlo antes) | comprobado |
| Web nueva | Cloudflare Workers (`ferjusanz-web`). El dominio **aún no está** en Cloudflare | comprobado por la API |
| «Acceso externo» de DonDominio | Es el **panel de marca blanca para revendedores**: da acceso a un dominio sin dar la cuenta | ayuda de DonDominio |

**Capturas de Alberto (16/11/2026, 2.ª tanda)**: el panel de DonDominio es el de **Creativate** (marcan `ns1-3.controldeservidor.com` como «nuestros servidores»: la web y el correo van en su alojamiento). El **titular** es un contacto `CMA-76448` que **no es la empresa**, y Alberto está intentando cambiarlo. Los contactos **administrativo, facturación y técnico** son **Fernando Sanz (`FS-240106`)**: en un .es, el cambio de titular lo aprueba el contacto administrativo, así que **le llegará a Fernando un correo** de DonDominio / Dominios.es para autorizarlo (con DNI o certificado). Titular correcto: FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L., CIF B87446670.

**Ojo, dato que no cuadra**: el 15/11 Soporte de DonDominio dijo que el dominio no estaba con ellos sino «en WebEmpresa». Lo más probable es que **los dos tengan razón**: el dominio está registrado a través de DonDominio, pero **dentro de la cuenta de otro** (un revendedor: Creativate o Webempresa), no en la cuenta de Fernando (`FerNanSz`). Por eso existe el «acceso externo». Hay que confirmarlo con Alberto (pregunta 1).

### Preguntas para Alberto (antes de nada)
1. ¿En **qué cuenta** de DonDominio está el dominio: la de Creativate, la de Webempresa u otra? ¿Quién paga la renovación?
2. ¿Quién es el **titular** (debe ser FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. con su CIF) y quién el **contacto administrativo**? (Captura de la pestaña de contactos.)
3. ¿Nos pueden pasar el dominio a una **cuenta de DonDominio de FERJUSANZ** por «Push» (traspaso entre cuentas)? Nosotros les damos el usuario y el código Push.
4. ¿El **correo** `@ferjusanz-frutas-verduras.es` está en Webempresa? ¿Qué buzones hay y quién los usa? ¿Quién paga ese plan?
5. Que **no cambien los DNS ni borren nada** del alojamiento hasta que avisemos.

### Paso 1 · Dominio a nuestra cuenta (no corta nada)
- **Recomendado: «Push» de DonDominio** (traspaso entre cuentas). El dominio se queda en DonDominio, **no cambia el titular, ni los DNS, ni el correo**: solo cambia quién tiene la llave. Lo hace quien tiene hoy el dominio: «Dominios» → «Push de dominios» → «Transferir dominios a otro usuario», con nuestro **usuario** y **código Push** (lo vemos en «Cuenta» → «Preferencias» → «General»). Ayuda: https://www.dondominio.com/es/help/232/push-transferencia-dominios-entre-distintas-cuentas/
- **Cuenta de FERJUSANZ**: recuperar la vieja `FerNanSz` («Recuperar cuenta», manda un código al correo de la cuenta) o abrir una nueva en dondominio.com a nombre de la empresa, con un correo que Fernando controle (**no** uno del propio dominio, por si algún día falla). Activar la verificación en dos pasos.
- **Si el titular no es FERJUSANZ S.L.**: cambio de titular .es desde el panel (autoriza el contacto administrativo; en «Gestor» del agente registrador poner **SCIP**, o el dominio se sale de DonDominio). Ayuda: https://www.dondominio.com/es/help/199/cambiar-titular-un-dominio-es/
- **«Acceso externo»** solo sirve de apaño (ver y tocar el dominio sin que sea nuestro). Vale para mientras, no como solución.
- **No hace falta cambiar de registrador** (ni AuthCode): DonDominio va bien y Cloudflare solo necesita que le apuntemos los DNS.
- Antes de mayo: **renovación** del dominio (caduca el 26/05/2027) ya desde nuestra cuenta, con renovación automática.

### Paso 2 · Preparar Cloudflare (sin tocar el dominio todavía)
1. Añadir `ferjusanz-frutas-verduras.es` en Cloudflare (plan gratis). Mientras no se cambien los DNS en DonDominio, **no afecta a nada**.
2. Copiar **todos** los registros de arriba tal cual, con la nube **gris** (solo DNS) en todo lo del correo: MX ×3, SPF, `default._domainkey`, `_dmarc`, `mail`, `webmail`, `autodiscover`, `ftp`. Contrastarlos con la zona que se ve en el panel de Webempresa (puede haber más: `cpanel`, `_autodiscover`, etc.).
3. Dejar `@` y `www` apuntando **todavía a la web antigua** (`217.61.210.26`), también con nube gris. Así el día del cambio de DNS no cambia nada visible: solo quién responde.
4. Claude compara con un script que cada registro en Cloudflare da lo mismo que hoy.

### Paso 3 · Cambiar los DNS (día tranquilo, entre semana por la mañana)
- En DonDominio: poner los 2 servidores que dé Cloudflare. En .es se aplican a las **02, 06, 10, 14, 18 y 22 h** y tardan hasta ~1 h más; los DNS viejos tienen 6 h de caché, así que **durante unas horas conviven** los dos (dan lo mismo, por eso no se nota). Ayuda: https://www.dondominio.com/es/help/314/actualizacion-los-servidores-dns-los-dominios-es/
- Comprobar ese día: web antigua abre, correo **entra y sale** (mandar uno desde Gmail y responder), Cloudflare marca la zona «Activa».

### Paso 4 · Pasar la web a Cloudflare Workers (otro día, cuando Fernando dé el visto bueno a la web)
1. `PRUEBAS = false` en `web/worker.js` y publicar.
2. Conectar `ferjusanz-frutas-verduras.es` y `www` al Worker `ferjusanz-web` (dominio personalizado); una sola versión manda a la otra (sin `www` → `www`, como hoy).
3. Comprobar las 71 direcciones antiguas (página o desvío 301), `robots.txt` y `sitemap.xml`.
4. Search Console: verificar la propiedad «Dominio» con un TXT en Cloudflare, enviar el `sitemap.xml` y revisar errores la primera semana. Ficha de Google con la web.
5. Tarjeta en `www…/tarjeta/` (`URL_TARJETA` en `public/index.html` y la redirección en `src/worker.js`).

### Paso 5 · Cerrar con Creativate (2-3 semanas después)
- La web antigua se puede dar de baja **solo** cuando la nueva lleve 2-3 semanas bien en Google.
- **El correo vive en Webempresa** (mismo servidor): **no dar de baja ese plan** mientras haya buzones ahí. Si se quiere dejar Webempresa del todo, antes mover el correo (Zoho / Google Workspace, o solo reenvío con Cloudflare Email Routing) y cambiar MX, SPF y DKIM ese mismo día.

### Cómo no perder correo ni Google
| Riesgo | Cómo se evita |
|---|---|
| Correo que no llega | Copiar MX/SPF/DKIM/DMARC idénticos antes del cambio; nube gris; probar envío y respuesta el mismo día; no dar de baja Webempresa. |
| Web caída unas horas | En el paso 3 `@`/`www` siguen en la web antigua; la web nueva entra después, en un paso aparte y reversible. |
| Bajar en Google | Mismo dominio, mismas direcciones o desvíos 301, sitemap y Search Console; web antigua viva 2-3 semanas. |
| Perder el dominio | Pasarlo a cuenta propia, titular FERJUSANZ, renovación automática antes del 26/05/2027. |
| Volver atrás | Basta poner otra vez `ns1-3.controldeservidor.com` en DonDominio (se apuntan aquí). |

### Lo que falta (en orden)
1. **Fernando → Alberto**: preguntas 1-5.
2. **Fernando**: recuperar `FerNanSz` o abrir la cuenta de DonDominio de FERJUSANZ (Claude le guía desde el móvil) y pasar a Alberto el usuario y el código Push (**no** por este chat).
3. **Alberto**: hacer el Push; si hace falta, cambio de titular.
4. **Fernando**: entrada a Webempresa (para ver la zona completa y el correo) o que Alberto mande captura de la zona DNS.
5. **Claude**: pasos 2-4 cuando Fernando diga «adelante con el dominio» y la web esté revisada.

Coste fijo: dominio .es 10-15 €/año; Cloudflare 0 €; correo 0 € si es reenvío (Cloudflare Email Routing) o 1-7 €/persona/mes con buzón (Zoho/Google). Total < 10 €/mes.
