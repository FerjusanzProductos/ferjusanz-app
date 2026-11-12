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
- **«Contador a cero»**: mientras la app está en pruebas, ver `supabase/contador_a_cero.sql`.
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
- Clientes en azul (sin IVA) a 10/11/2026: **Bar Camarero (BACAM)**, **Bar La Torre (PVP)**, **Bar Andorra (BAAND)**, **Bar Delfín** y **Frutas Pedro** (fichas provisionales). Pendiente: que Fernando confirme el resto de la lista y si «Bar Delfín» es la misma ficha que «Bar Delfines» (DEFINES).
- A los azules se les aplica la línea **«Descuento por productos»** (igual al IVA): pagan el total sin IVA; el IVA sigue en el albarán.
- **Se factura siempre en Golden Soft**, no desde la app. La copia ROSA del albarán muestra el nombre interno y el código para teclearlo bien.

## Envío del albarán al cliente (desde 10/11/2026)
- **Correo:** automático al marcar la entrega, desde fernandosanzalba@gmail.com, al correo de la ficha o al que dejó el cliente al escanear el QR.
- **WhatsApp:** hasta nueva orden lo manda **cada repartidor desde su propio WhatsApp** (botón que sale al marcar «Entregado»). Si el cliente no tiene móvil, el repartidor lo escribe y queda apuntado en «Móviles y correos de clientes».
- **Aparcado:** envío automático por WhatsApp desde el 609 567 354 (coexistencia de WhatsApp Business con la API de Meta). Retomar cuando Fernando lo diga.


## Condiciones comerciales (confirmadas por Fernando el 12/11/2026)
- **Sin pedido mínimo.**
- **Zonas de reparto: Madrid y Segovia.**
- Usar solo estas condiciones en la web, anuncios y mensajes; no prometer otras sin confirmarlo con Fernando.

## Facturas de proveedores (Fernando, 12/11/2026)
- El **nº de documento** de cada compra es siempre el **número real** que pone en la factura, nunca el nombre del archivo (MADREMIA manda todas como «Factura_Electronica.pdf»).
- El archivo de la factura se nombra **«PROVEEDOR · Fra. Nº»** para que se sepa de quién es.

## Reparto (Fernando, 12/11/2026)
- Reparten: **Dani** (Daniel Ferjusanz), **Cristian**, **Fernando Sanz (hijo)** y **Fernando Sanz Boss**. **Juli** (Julián) prepara pedidos; su ruta la lleva Dani.
- Los pedidos **sin repartidor** los ven **todos los que reparten**, no solo la oficina: a veces depende de lo que digan los repartidores, que son los que hablan con los clientes. Cualquiera puede quedárselo («Me lo llevo yo»).
- El **Modo reparto** se abre solo el día que el repartidor tiene pedidos asignados por entregar.
- El **orden del reparto** lo puede cambiar **cualquiera** de la app (Fernando, 12/11/2026), arrastrando con el dedo o con ↑↓.
- En las pantallas de reparto siempre se recuerda si el cliente es **CON IVA (dorado) o SIN IVA (azul)**, para que los repartidores no se líen (Fernando, 12/11/2026).
- **Venta en ruta** (no suele ocurrir, pero pasa): dentro del Modo reparto, con su explicación. Si el cliente es sin IVA, se recalcula sola la línea «Descuento por productos» (si el pedido tenía otro descuento puesto a mano, no se toca) (Fernando, 12/11/2026: «que lo haga la app sola»).
