# Reglas internas de Ferjusanz (productos, pedidos y facturación)
Acordadas con Fernando Sanz. Cualquier sesión de Claude o persona que toque la app debe respetarlas.

## Patatas
- **Patata general** = la de más volumen, la que se compra a diario. En las facturas de proveedor aparece como
  P.C. / patata consumo / hostelería / nueva / jelly. Se pone a **todos los clientes que no piden agria**.
  - **AHORA (temporada de patata nueva): 09-F «Patata nueva esp. freír»** — en el albarán: «Patata nueva esp. freír».
  - **Dentro de unos meses**, cuando la patata ya venga vieja y se sobreentienda que no es nueva: pasa a
    **01-F «Patata esp. freír»** — en el albarán: «Patata esp. freír». Fernando avisará («cambio de temporada patata»).
- **01 Patata Agria**: SOLO para quien pide agria. Se compra como agria y se vende como agria, con su precio de compra original.
- **Patata de guarnición** («P.C. SACO 10 KG GUARNICIÓN») = **06 Patatas de tornear**.
- **Patata Monalisa** (COSAN01): aparte. Lavandera y El Rincón Banchero (Peninsular) llevan agria + Monalisa.
- Hay clientes que en otra época del año pasan de patata nueva a agria: se cambia su pedido fijo.
- No confundir códigos: 09-F nueva esp. freír · 01-F esp. freír (más adelante) · 01 agria.
- Proveedores habituales de patata: sobre todo **Ibérica Patatas Selectas**, también **Hermanos de Diego** y **Copace**.
  La regla del lector de facturas (fcReglaPatata) vale para cualquier proveedor; no dar por hecho el proveedor.
- La ganancia de cada patata se calcula con SU precio de compra.

### Cambio de temporada (09-F → 01-F) — solo cuando Fernando lo pida
1. `public/index.html`: `const PATATA_GENERAL = '01-F';` (y subir la versión en `public/sw.js`), publicar.
2. Supabase: activar 01-F; en `lineas_habituales` cambiar producto 09-F → 01-F; en los previstos sin confirmar, igual;
   desactivar 09-F cuando ya no queden pedidos con ella. Copiar a 01-F el precio de compra vigente.
3. Avisar a la secretaria para que use 01-F en Golden.

## Tomates
- **El tipo real lo decide la compra**: pera, bola, ensalada, Rambo… se elige en el mercado, cliente por cliente, según precio y calidad.
  Los tomates de los pedidos fijos son una **estimación** (no fiarse); suele coincidir en volumen con la factura de compra.
- La **hoja de compra** muestra un **total de tomate** para comprar por volumen.
- El **albarán** puede llevar el tomate real (no es la factura); la secretaria lo pasa a Golden como corresponda.
- **El Rambo existe** de verdad, pero muchas veces se apuntaba Rambo siendo tomate ensalada (y pera siendo bola).
- Lector de facturas (fcReglaTomate), para cualquier proveedor:
  cherry / cherry pera / cherry rama → **166 Tomate Cherri** · Daniela / Long Life / ensalada → **91-EN Tomate ensalada** ·
  Mar Azul → **91-AZ Tomate Azul** · maduro → **91-M Tomate maduro (salsa)** · bola → **92** · raf → **91-C** · rosa → **91-G** ·
  rambo → **91-B** · rama → **91-E** · beef → **91-BE** · pera → **91-D**.
- 08/11/2026: corregidas compras mal apuntadas (380 kg de Daniela salían como «Berros»; Long Life/Mar Azul/Maduro como «Tomate 1ª»; cherry como pera/rama).

## Cebollas
- **Cebolla general = 21 «Cebollas Gordas Calibre 2-3»** (la que más se vende: 10.533 kg a 79 clientes jun–oct 2026). Se pone a todos salvo que pidan otra.
  En las facturas: «cebolla saco», «cebolla caja», «cal. 3».
- Especiales, solo si las piden: morada/roja → 25 · dulce (Fuentes) → 27 · pelada → 26 · butis → 22 · 1x1 → 21-1 ·
  cebolleta → 24 · cebolleta china → 24-A · cebollino → 23 · chalota/escalonia → 27-C. Lector de facturas: fcReglaCebolla.
- 08/11/2026: corregido «CEBOLLA SACO 25 KG CAL 3» (estaba como Cebolla 1x1).

## Más familias (lector de facturas: REGLAS_FAM)
- **Naranja zumo** de la factura = fruta para zumo (**42**), NO el zumo embotellado (42-Z). Naranja mesa/navel/lane/late → 42-C · naranja 2ª → 42-B.
- Limones → 40 · banana → 104-C · plátano extra/cuqui → 104 · resto de plátano → 104-B · plátano macho → 104-A.
- Pimiento rojo/verde sin más = **extra** (111 / 110); 2ª solo si la factura lo dice (111-B / 110-B). Italiano 118 · padrón 151 · guernica 152.
- **Ajos caja = ajos enteros (30)**, no pelados; ajo pelado → 34.
- Aguacate (122) y lechuga iceberg (94-C) se compran **por caja**. Lechuga romana/bandeja → 168.
- Zanahoria 159 · calabacín 108 · berenjena 251 · pepino 116 · melón 93 · sandía 96 · perejil 165 · manzana golden 105.
- 08/11/2026: corregidos AJOS CAJA (sin producto / como pelado), PIMIENTO ROJO y VERDE (sin producto), NARANJA ZUMO (como zumo embotellado),
  NARANJA MESA y LECHUGA ICEBERG (a productos desactivados), AGUACATE (sin producto); precios de compra recolocados.

## Abreviaturas y más familias (08/11/2026)
- Abreviaturas de las facturas que entiende el lector: PIM. = pimiento · TTES. = tomates · NAR. = naranja · CEB = cebolla · A.P. = ajo pelado ·
  MAN = manzana · CLEM. = clementina · CALIF = california · P.P. = patata pelada.
- Pimiento lamuyo/california = pimiento rojo/verde (extra; «II» = 2ª). Mandarinas (Clemenules, Oronules, Primasole…) → 45 (2ª → 45-B).
  Kiwi → 98 · red delicious/starking → 153 · lima → 43 · caqui/kaki → 275 · mix frutos rojos → 897-B · nuez → 200 · cogollo → 167 · remolacha → 32.
- Patata pelada: bolsa → 10 · bravas → 10-BR · bastón → 10-BA · dado → 10-D · panaderas → 10-P. Ajo pelado bolsa → 34.
- Corregido: «P.P. BOLSA BRAVA» estaba como Breva (fruta); «PIM. CALIF ROJO II … NEGRA» como Pimienta negra; «P.P. BASTÓN AGRIA» como Patata Agria;
  32 textos de compra recolocados.

## Nombres que confunden (Fernando, 09/11/2026)
- **Tomate Daniela = tomate ensalada (91-EN)**, siempre.
- **Ensalada campestre** («ENSALADA CAMP» en las facturas de Perichán) = **mezclum** → 137-P «Ensalada Campestre». Las bolsas de «Lechuga mézclum 500 g» de las listas son este producto.
- **Lechuga romana (168)** = «Lechuga (2 unidades)» o «bolsa de lechuga». NO confundir con mezclum, campestre ni brotes de lechuga.
- **Plátanos**: hay varios. El «plátano canario» de las listas es el de **1ª (104-B)**.
- **Naranja calibre 5** = **naranja de zumo (42)**.
- **Cebollas**: todas son nuevas. La «cebolla nueva» de las listas es la **cebolla gorda (21)**. La **pequeña calibre 5** es la **20**.
- **Manzana caja** = **golden (105)** de calibre 24 aprox., en caja de unos **7 kg**.
- **Melón** = **piel de sapo (93)**. Ahora viene de **BRASIL** (en España ya no es época): que conste en la procedencia del lote.
- **Patata pelada**: la buena es la de **EL PARLEÑO**, no la de La Ibérica. El Parleño ha subido el precio.
- **Huevos**: se compran a **PATATAS DEL OLMO** a **2,00 €/docena**; mandan la factura a final de mes.
- **Perejil** (y otros detalles): a veces se regala. En las listas puede quedar por debajo de la compra a propósito.
- **Colectividades** (colegios, residencias, escuelas infantiles) gastan mucho **bananas, pera conferencia y pera de agua** de varios calibres.

## Unidades (Fernando, 10/11/2026)
- **La unidad de cada producto es la del libro de VENTAS** (y el de compras): fijarse siempre en cómo lo hacemos nosotros.
- **Iceberg y aguacate** se venden por caja o por pieza: son productos distintos (94-C caja / 94 pieza; 122 caja / 122-P pieza).
- Ejemplos: **frambuesa → bandeja**, **arándano → bandeja**, **mora → bandeja** (nunca «pieza»). Ensalada campestre → bolsa.
- Al apuntar un precio a mano o leer una factura, usar esa unidad; si la factura viene en otra, convertir o avisar.
- **Piparras = por BOTE** (Fernando, 11/11/2026), no por pieza.
- **Formatos editables a mano** (desde v208): pantalla «📦 Formatos de compra y venta». Lo que se ponga ahí manda sobre la lista fija de la app. Si se compra distinto de como se vende, se apunta «se compra por» y cuánto trae.
- Desde el 11/11/2026 la unidad buena está en la ficha de cada producto (unidad de venta y precio por unidad). Lista aplicada: `supabase/migrations/20261111b_unidades_libro_ventas.sql`.
- En la app: lista fija `UNIDAD_LIBRO` y función `fcUnidadLibro` de `public/index.html` (arándano/frambuesa/mora → bandeja, campestre/mezclum → bolsa; si no, la unidad de venta del producto). Unidades nuevas que diga Fernando: añadirlas ahí.

## Facturas de proveedor que llegan tarde (12/11/2026)
- La compra se apunta **en el día de la factura** (el escrito dentro), no en el día en que llegó el correo. Si la fecha leída es rara (más de 45 días antes o en el futuro), se usa el día de llegada y se puede cambiar a mano al revisarla.
- Mientras no llega la factura, la ganancia usa el último precio conocido marcado **⏳ provisional** y se corrige sola al llegar.

## Aviso de margen (Fernando, 11/11/2026)
- **No hay un margen mínimo fijo.** Se compara cada producto con **su propia media de compra de los últimos días** (14 días) y se avisa **cuando sube**, con lo que se pierde de margen frente al precio de venta de Golden. Pantalla «📈 Suben» en Precios de compra.

## Pedidos
- Los pedidos fijos generan **previstos** (2 semanas por delante, cada madrugada). Se confirman el día antes (✅) o se quitan (❌).
  Los previstos ya cuentan en la hoja de compra. Más allá de 2 semanas, el calendario los calcula al momento.
- Pantalla **Semana**: mover pedidos de día («solo esta vez» o «siempre») y ordenar el reparto.
- **📆 Pasar a otro día** (botón en el previsto o deslizar su tarjeta en Preparar): lo mismo que Semana, eligiendo el día de una lista o la fecha.
- **«Contador a cero»**: en la app de PRUEBAS, botón «🔄 Poner contadores a cero» (Copia de seguridad, solo admin; albaranes de prueba en la serie PRUEBA-F). En la base REAL no existe: allí, `supabase/contador_a_cero.sql` solo si Fernando lo pide con esas palabras.
- **Numeración de albaranes**: cuando se empiece de verdad, la app **sigue la numeración que ya se tenía** (Golden, serie F). Fernando avisará y dirá el último número; entonces `setval('public.albaran_f_seq', <último + 1>, false)` en lugar de empezar en 1.

## Imprimir
- **Lo único que se imprime es la hoja de COMPRA y la hoja de CARGA** (la de carga, con todos los clientes preparados).

## Albaranes: ENVIADOS, no impresos
- El **90-95 %** de los albaranes **ya no se imprime**: se envían al cliente por su **portal de clientes** (se carga solo al marcar la entrega) o por WhatsApp/correo/QR. Se dice «albarán enviado», no «albarán impreso».
- Excepción: clientes marcados en su ficha con **«📄 Quiere el albarán en PAPEL»** (no se manejan con el móvil). En Preparar llevan la etiqueta «📄 Papel» y en su albarán sale abierta la opción de imprimir.
- La copia **ROSA** (oficina, con el código de Golden) se ve **en pantalla**, sin imprimir.
- Lo que no se lleva («No hay», no disponible o «Se compra después») sale en el albarán como **«No servido»**, sin precio ni importe (12/11/2026).

## IVA y albaranes
- Clientes **sin IVA = azul**, con IVA = dorado (solo en pantallas internas; el cliente nunca lo ve).
- Clientes en azul (sin IVA) a 10/11/2026: **Bar Camarero (BACAM)**, **Bar La Torre (PVP)**, **Bar Andorra (BAAND)**, **Bar Delfín** y **Frutas Pedro** (fichas provisionales). Pendiente: que Fernando confirme el resto de la lista.
- **«Bar Delfín» y «Bar Delfines» (DEFINES) NO son el mismo cliente** (Fernando, 16/11/2026). Son dos fichas distintas: Bar Delfín es sin IVA (azul); Bar Delfines (DEFINES) va con IVA. No juntarlas ni confundirlas.
- A los azules se les aplica la línea **«Descuento por productos»** (igual al IVA): pagan el total sin IVA; el IVA sigue en el albarán.
- **Hasta el 31/12/2026 se factura en Golden Soft**, no desde la app. **Desde el 1/1/2027 se factura en la app** (plan en `docs/PLAN_FACTURACION.md`). La copia ROSA del albarán muestra el nombre interno y el código para teclearlo bien.

## Envío del albarán al cliente (desde 10/11/2026)
- **Correo:** automático al marcar la entrega, desde fernandosanzalba@gmail.com, al correo de la ficha o al que dejó el cliente con el QR **solo después de que la oficina lo acepte** («✅ Guardar en su ficha»). Fernando, 16/11/2026 (auditoría de seguridad): así nadie con un enlace suelto se apunta solo.
- **WhatsApp:** hasta nueva orden lo manda **cada repartidor desde su propio WhatsApp** (botón que sale al marcar «Entregado»). Si el cliente no tiene móvil, el repartidor lo escribe y queda apuntado en «Móviles y correos de clientes».
- **Aparcado:** envío automático por WhatsApp desde el 609 567 354 (coexistencia de WhatsApp Business con la API de Meta). Retomar cuando Fernando lo diga.


## Lo que se puede decir de la empresa (Fernando, 15/11/2026)
- **No decir «cosecha propia»** (no la hay) en web, presentaciones ni mensajes: «agricultores de confianza» y «elegido en Mercamadrid».
- **Años**: «**más de seis décadas**» en las frases («impacta más», Fernando, 16/11/2026) y «**+60 años**» en las cifras; antes se ponía 40, mal.
- **Qué somos** (Fernando, 16/11/2026): «Ferjusanz: **patatas, frutas, verduras y huevos**» (en ese orden), nunca solo «frutas y verduras».
- **Orden** (Fernando, 16/11/2026): primero «agricultores de confianza» y después «Mercamadrid». Con posibles clientes: «destacamos por la relación calidad-precio» y la tarifa se calcula con lo que gastan.
- Agricultura ecológica: «colaboramos con productores ecológicos siempre que tienen producto disponible».
- Camiones y furgonetas refrigerados: sí.

## Condiciones comerciales (confirmadas por Fernando el 12/11/2026)
- **Sin pedido mínimo.**
- **Zonas de reparto: Madrid y Segovia.** Dentro de Madrid: capital, zona norte, noroeste y **zona sur** (Fernando, 16/11/2026; falta que diga qué pueblos del sur).
- Usar solo estas condiciones en la web, anuncios y mensajes; no prometer otras sin confirmarlo con Fernando.

## Facturas de proveedores (Fernando, 12/11/2026)
- El **nº de documento** de cada compra es siempre el **número real** que pone en la factura, nunca el nombre del archivo (MADREMIA manda todas como «Factura_Electronica.pdf»).
- El archivo de la factura se nombra **«PROVEEDOR · Fra. Nº»** para que se sepa de quién es.
- Cada factura de proveedor guarda **NIF, CP y desglose de IVA** (base, %, cuota, recargo y total por tipo). Lo leído por la app solo rellena lo vacío; lo corregido por la oficina manda. En el listado de COMPRAS para Jorge el concepto es **«Compra de mercaderías»** (Jorge, 13/11/2026).
- Las facturas deben venir a nombre de **FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. (B87446670)**; si vienen a nombre de FERJUSANZ C.B. (E80746670), la app avisa.
- **Margen, rentabilidad, compras y cobros/pagos de Golden: solo Fernando, su padre y Jorge** (Fernando, 18/11/2026). Carmen y el resto, no. Lista en la tabla `ver_margenes`.
- **La C.B. sigue existiendo, pero todo se hace ya a través de la S.L.** (Fernando, 18/11/2026). Lo que aún esté a nombre de la C.B. (furgonetas, orden SEPA, certificados, facturas de proveedores) es algo pendiente de pasar a la S.L., no una forma válida de trabajar.
- **El proveedor se identifica mirándolo todo: NIF, logo, dirección de correo, nombre que sale en el correo y lo que dice el correo** (Fernando, 18/11/2026: «mira bien a quién pertenece, si no estaría repetido el gasto» · «guíate por el logo, correo, nombre del correo, lo que dice el correo, NIF»). Si no cuadran, manda el NIF. La base lo hace sola al llegar o leer cada factura (por NIF, luego correo exacto, luego nombre legal en el asunto; SQL `20261203d`); el nombre legal de cada puesto va en `proveedores.razon_social`. Antes de sumar gastos o pagos pendientes, comprobar que dos nombres no son el mismo proveedor. Comprobado el 18/11/2026: **«CARMEN MARTINEZ ORTEGA Y DOS MAS C.B.» es Herederos de Carlos Gómez Izquierdo** (puesto 44, Nave B, NIF E79125241, código Golden `HERE`), **no Madremía** (B46207858, código `MADRE`). Sus correos van a carmensegu@hotmail.com con copia a ferjusanz@hotmail.com. No había facturas repetidas entre los dos.

## Reparto (Fernando, 12/11/2026)
- Reparten: **Dani** (Daniel Ferjusanz), **Cristian**, **Fernando Sanz (hijo)** y **Fernando Sanz Boss**. **Juli** (Julián) prepara pedidos; su ruta la lleva Dani.
- Los pedidos **sin repartidor** los ven **todos los que reparten**, no solo la oficina: a veces depende de lo que digan los repartidores, que son los que hablan con los clientes. Cualquiera puede quedárselo («Me lo llevo yo»).
- El **Modo reparto** se abre solo el día que el repartidor tiene pedidos asignados por entregar.
- El **orden del reparto** lo puede cambiar **cualquiera** de la app (Fernando, 12/11/2026), arrastrando con el dedo o con ↑↓.
- En las pantallas de reparto siempre se recuerda si el cliente es **CON IVA (dorado) o SIN IVA (azul)**, para que los repartidores no se líen (Fernando, 12/11/2026).
- **Venta en ruta** (no suele ocurrir, pero pasa): dentro del Modo reparto, con su explicación. Si el cliente es sin IVA, se recalcula sola la línea «Descuento por productos» (si el pedido tenía otro descuento puesto a mano, no se toca) (Fernando, 12/11/2026: «que lo haga la app sola»).

## Facturas emitidas desde la app (Jorge, 12/11/2026; desde el 1/1/2027)
- Emisor siempre completo: FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L. · NIF B87446670 · dirección con CP 28033 · teléfono · ferjusanz@hotmail.com.
- Cliente siempre completo (nombre, NIF, dirección con CP, teléfono, correo); sin nombre, NIF o dirección con CP no se emite.
- **Datos mínimos para facturar a un cliente** (los que comprueba la app, 12/11/2026): nombre, **NIF válido** (la letra o dígito de control cuadra), dirección, **código postal de 5 cifras** y localidad. Teléfono y correo, si los hay. Los datos de la empresa (emisor) están en la ficha «🏢 Datos de la empresa» y **solo los cambia admin**; el sello es la cabecera de los albaranes de papel.
- Fecha = la de emisión. Número correlativo por año con el año dentro (2027-0001…), empieza de cero cada año, sin huecos.
- **Una factura nunca se borra**: se corrige con una **rectificativa** (serie propia) que dice qué factura corrige.
- Concepto «Venta de fruta / verdura / patata» y, por producto, base, % IVA, cuota y total; resumen por tipo de IVA.
- Sello o firma en el PDF. Forma de pago siempre. **Efectivo (Ley 7/2012, art. 7)**: si la operación con una empresa o autónomo es de **1.000 € o más, no se puede pagar NADA en efectivo** (ni una parte); se suman todos los pagos de la misma operación. Corregido el 12/11/2026 (antes decía «máximo 1.000 €», que estaba mal). **Confirmado por Jorge (13/11/2026): cada albarán es una operación.** Se pueden cobrar juntos en efectivo varios albaranes de menos de 1.000 € aunque sumen más; lo que no se puede es pagar en efectivo un albarán de 1.000 € o más. (La factura mensual sigue bloqueando el efectivo si llega a 1.000 €: es más prudente; Fernando decide dejarlo así, 13/11/2026.)
- **IBAN** (Fernando, 13/11/2026): si la forma de pago es **transferencia**, la factura lleva el IBAN de FERJUSANZ (casilla de «🏢 Datos de la empresa»). Con otras formas de pago, no sale.
- Todas las ventas se facturan; la app no tendrá ventas fuera de facturación.
- **Cómo factura la app (fase 2, 12/11/2026)**: solo albaranes **entregados**; una factura junta albaranes del **mismo cliente y del mismo mes** (factura recapitulativa); lo «No servido» no se factura; los descuentos del albarán van como línea en negativo. Series: `2027-0001` (ordinarias) y `R2027-0001` (rectificativas); en la base de pruebas `PRUEBA-…` con «SIN VALOR FISCAL». Rectificativa siempre con motivo; «anular entera» deja libres sus albaranes para la factura buena. Efectivo bloqueado si la factura (o la que se rectifica) llega a 1.000 €. La fecha y el número los pone la base de datos.
- **Paso a 2027 (13/11/2026)**: los albaranes de **2026** se facturan **siempre en Golden** (la base real no deja facturarlos en la app). La app factura desde el **1/1/2027** y solo si se enciende (decisión del 22/12, `docs/FACTURACION_2027.md`). Primera factura **2027-0001**, primera rectificativa **R2027-0001**.
- **Conservar las facturas 6 años** (Jorge, 16/11/2026): emitidas y de proveedores, también el histórico de Golden.
- **Facturas de diciembre de 2026** que se hagan en Golden en enero: con **fecha 31/12/2026** (Jorge, 16/11/2026). Se sigue facturando en Golden hasta que se empiece con la app.
- Listados para Jorge (ventas y compras): fecha, nº, nombre, NIF, CP, concepto, base, % IVA, cuota, total; una fila por tipo de IVA.
- **El tipo de IVA siempre tiene que estar bien** (Fernando, 13/11/2026): solo tipos legales (0, 2, 4, 5, 10, 21 %) y la cuota de cada fila = base × tipo. La app lo comprueba en los listados y avisa en rojo (⛔) antes de mandar nada a Jorge.

## Decidido con Jorge en persona (19/11/2026, de palabra)
- **Se empieza a facturar con la app el 1/1/2027.** Verifactu se retrasa: la app **no manda nada a Hacienda**. Jorge ve las facturas en la app (PDF y Excel, buscador por cliente, producto y fecha), las pasa a su programa y las presenta él.
- **Declaración responsable: no hace falta firmarla** mientras Verifactu no sea obligatorio. Claude, Cloudflare y Supabase no firman nada.
- **Una factura por semana** por cliente (antes se dijo al mes). Al enviarla al cliente queda en **negro = entregada**; si la pide otra vez, se le reenvía.
- **Ticket (factura simplificada)** para el cliente que no quiere dar sus datos (Jorge dijo que sí, 19/11/2026): **sin nombre ni NIF**, con su IVA y **se declara igual** (sale en los listados de Jorge). Serie propia **T** (T2027-0001…), tope **400 € con IVA** por ticket, pago en efectivo, tarjeta, Bizum o transferencia. Un ticket no se rectifica: si está mal, se anula y se hace otro. **Nunca** se esconden ventas a Jorge ni a Hacienda.
- **Domicilio en las facturas: C/ Carare, 2, 1º Izq., 28033 Madrid** hasta que se cambie el domicilio fiscal (se quiere en enero).
- Comidas, propinas y lotería pagadas de caja: **gasto de la empresa**.
- Furgonetas: siguen a nombre de la C.B. La orden SEPA se pasa a la S.L.
- Ayuntamiento de Becerril: factura electrónica por FACe con el certificado digital.
- **No se hace**: llevar ventas sin factura en otra app o a escondidas de Jorge (pedido el 19/11). Es ilegal (art. 29.2.j y 201 bis de la Ley General Tributaria).

## Programa de facturación propio (Verifactu) — desde el 12/11/2026
- FERJUSANZ es la **productora** del programa de facturación de la app. Claude programa y prueba, pero **nunca firma** la declaración responsable ni dice que el programa cumple sin pruebas.
- La app **no emite facturas reales** hasta que estén ✅ todas las pruebas de `docs/SIF_PRODUCTOR/PRUEBAS_TECNICAS.md` y haya declaración firmada de esa versión.
- Todo cambio en la facturación (`public/sif/`, funciones o tablas `sif_*`) **sube la versión del SIF** y exige declaración nueva antes de usarla. Detalle: `docs/SIF_PRODUCTOR/LEEME.md`, punto 8.

## Caja (efectivo) — fase 5 de facturación (13/11/2026)
- Jorge solo quiere: **entra efectivo** (fecha, cuánto, de quién y qué factura) y **sale efectivo** (fecha, cuánto, a quién y qué factura o justificante). Sustituye al «Debe / Haber» que mandaba Carmen.
- Los **cobros en efectivo de los albaranes entran solos** en la caja: no se apuntan otra vez.
- Si el justificante llega después (gasolina…), se apunta igual y se añade luego: queda marcado con la fecha y quién.
- **Un apunte de caja nunca se borra**: se corrige o se anula, siempre con motivo. Todo queda registrado y sale en el informe de Jorge.
- Con empresas o autónomos, nada en efectivo si la operación llega a **1.000 €** (Ley 7/2012): la app avisa.
- **La caja puede quedar en negativo** (Fernando, 18/11/2026: «a veces es necesario»): la app **no lo bloquea**. No volver a proponerlo.

## Datos de clientes y proveedores: manda Golden (Fernando, 18/11/2026)
- Lo que dice **Golden** (NIF, razón social, dirección, código) **manda** sobre lo buscado en internet por el nombre y sobre las **fichas provisionales** que puso Fernando sin Golden (código «Falta poner N», «Por poner…», NIF «FALTA PONER»).
- Si una ficha provisional es un cliente que ya está en Golden: se usa el **código de Golden**; si había dos fichas, todo pasa a la de Golden y la provisional queda **inactiva** (no se borra).
- Excepción: **Bar Delfín** y **Frutas Pedro** no están en Golden porque son clientes «sin IVA»; no se unen con «Bar Delfines» ni con «Frutas Pedro S.L.». **Mesón Jesús** («Falta poner 13») se factura en Golden a **LALI** (LALI ATM SL) pero se reparte en otra dirección: conserva su ficha.
- Golden se lee solo cada día (`scripts/golden/LEEME.md`): rellena huecos, nunca borra.
- **Patatas del Olmo** (proveedor): no está en Golden; se le compra de verdad, normalmente **huevos** (es primo de Fernando).
- Bulevar: el cliente bueno es **BULEVAR** (C/ López de Hoyos 401); BULE (Gran Vía de Hortaleza 62) ya no. Handyman: **HANDYMAN** (Made For You Iris Taberna SL); la ficha antigua HATA se borró (18/11/2026, Fernando).

## Clientes que no se contactan (Fernando, 18/11/2026)
- Las tareas comerciales (Comercial del día, Plan de la semana, Leads) **solo proponen clientes con `activo = true`**. Los inactivos no salen en «a quién llamo», «clientes a recuperar» ni «clientes que se enfrían».
- **LA DEFINITIVA** (Nadamalu SLU, Alcobendas, código `DEFINITIVA`): **no contactar nunca**. Ya no se llama así y el nuevo dueño es **mal pagador**: dejó deuda, devolvió 2 recibos y hubo que cobrarle con datáfono. No volver a proponerla.

## Gastos del reparto (Fernando, 18/11/2026)
- Al **terminar el reparto**, el repartidor apunta si ha **repostado** (gasolina o gasóleo, cuántos euros y, si lo sabe, litros) o «No he repostado».
- Antes de **fichar la salida** apunta si ha tenido **otros gastos** (parking, peaje, comida…) o «No, ninguno». La app no deja fichar la salida hasta contestar.
- El **ticket o la factura** se deja siempre **en el sobre para la oficina**. La oficina lo marca como recibido en «⛽ Gastos de reparto». Un gasto no se borra: si está mal o repetido, se anula.

## Mensajes a clientes: nunca de noche (Fernando, 18/11/2026)
- Correos y WhatsApp a clientes **solo entre las 8:00 y las 20:00** (hora de Madrid), de lunes a sábado. Si Fernando dice «manda» fuera de esa hora sin decir cuándo, se **programa para las 8:00** siguientes; nunca se envía al momento de noche. (El 18/11 salieron 17 correos a las 3:00 y no estuvo bien.)

## Vídeos de Super 9 (Tito, 18/11/2026)
- El vídeo con la **voz de Carlos** va **solo en la app** (para mandárselo a él). En la **web** va el de **Tito hablando de Carlos**.
- Siempre **«Super 9 Carnicerías»** (en plural), nunca «Carnicería Super 9».
