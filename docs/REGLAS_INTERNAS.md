# Reglas internas de Ferjusanz (productos, pedidos y facturación)
Acordadas con Fernando Sanz. Cualquier sesión de Claude o persona que toque la app debe respetarlas.

## Patatas
- **Patata general** = la de más volumen, la que se compra a diario. En las facturas de proveedor aparece como
  P.C. / patata consumo / hostelería / nueva / jelly. Se pone a **todos los clientes que no piden agria**.
  - **AHORA (temporada de patata nueva): 09-F «Patata nueva esp. freír»** — en el albarán: «Patata nueva esp. freír».
  - **Dentro de unos meses**, cuando la patata ya venga vieja y se sobreentienda que no es nueva: pasa a
    **01-F «Patata esp. freír»** — en el albarán: «Patata esp. freír». Fernando avisará («cambio de temporada patata»).
- **01 Patata Agria**: SOLO para quien pide agria. Se compra como agria y se vende como agria, con su precio de compra original.
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

## Pedidos
- Los pedidos fijos generan **previstos** (2 semanas por delante, cada madrugada). Se confirman el día antes (✅) o se quitan (❌).
  Los previstos ya cuentan en la hoja de compra. Más allá de 2 semanas, el calendario los calcula al momento.
- Pantalla **Semana**: mover pedidos de día («solo esta vez» o «siempre») y ordenar el reparto.
- **«Contador a cero»**: mientras la app está en pruebas, ver `supabase/contador_a_cero.sql`.
- **Numeración de albaranes**: cuando se empiece de verdad, la app **sigue la numeración que ya se tenía** (Golden, serie F). Fernando avisará y dirá el último número; entonces `setval('public.albaran_f_seq', <último + 1>, false)` en lugar de empezar en 1.

## IVA y albaranes
- Clientes **sin IVA = azul**, con IVA = dorado (solo en pantallas internas; el cliente nunca lo ve).
- A los azules se les aplica la línea **«Descuento por productos»** (igual al IVA): pagan el total sin IVA; el IVA sigue en el albarán.
- **Se factura siempre en Golden Soft**, no desde la app. La copia ROSA del albarán muestra el nombre interno y el código para teclearlo bien.
