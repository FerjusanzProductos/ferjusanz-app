-- Tito, 23/11/2026: «0,40. Con las excepciones que ya había. Pon lo que pesan las cajas».
-- Tarifa de hostelería = última compra + 0,40 €, automática (igual que colectividades, recalcular_listas_auto).
-- Excepciones de siempre: patatas con su precio (agria 0,66 · nueva esp. freír 0,60), perejil a 0, lechuga iceberg por
-- pieza con su precio (1,00), cajas a + 0,30 € por kilo, y fuera lo que no se compra (sin compra, ciruela, mix, repetidos).
create temp table antes as
  select i.id, i.nombre, i.unidad, i.precio from listas_precios_items i join listas_precios l on l.id = i.lista_id where l.nombre = 'Hostelería';

update listas_precios set margen_auto = 0.40, margen_kg_caja = 0.30 where nombre = 'Hostelería';

-- Fijos
update listas_precios_items i set precio_fijo = true, auto_aviso = null
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Hostelería' and i.nombre in ('Patata agria', 'Patata nueva esp. freír', 'Perejil');
update listas_precios_items i set unidad = 'pieza', nombre = 'Lechuga iceberg gorda', precio_fijo = true, auto_aviso = null
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Hostelería' and i.nombre = 'Lechuga iceberg gorda';

-- Fuera: ciruela, mix, aguacate repetido (sin precio; el bueno es «Aguacate Hass maduro (extra)»)
delete from listas_precios_items i using listas_precios l
 where l.id = i.lista_id and l.nombre = 'Hostelería'
   and (i.nombre in ('Ciruela Claudia', 'Mix frutos del bosque') or (i.nombre = 'Aguacate' and i.precio is null));

-- Enlaces según docs/REGLAS_INTERNAS.md
update listas_precios_items i set producto_id = (select id from productos where codigo = '91-EN')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Hostelería' and i.nombre = 'Tomate ensalada';
update listas_precios_items i set producto_id = (select id from productos where codigo = '91-M')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Hostelería' and i.nombre = 'Tomate maduro'
   and exists (select 1 from productos where codigo = '91-M');
update listas_precios_items i set producto_id = (select id from productos where codigo = '42')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Hostelería' and i.nombre = 'Naranjas de zumo';
update listas_precios_items i set producto_id = (select id from productos where codigo = '105')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Hostelería' and i.nombre = 'Manzana';

select public.recalcular_listas_auto();

-- Fuera lo que no se ha comprado nunca (Tito: «no pongas los productos que no se hayan comprado»)
delete from listas_precios_items i using listas_precios l
 where l.id = i.lista_id and l.nombre = 'Hostelería' and i.auto_aviso = 'Sin precio de compra';

-- Peso de las cajas en el nombre
update listas_precios_items i
   set nombre = regexp_replace(i.nombre, '\s*\(caja de .*\)$', '') || ' (caja de ' || replace(rtrim(rtrim(f.peso_estimado_kg::text, '0'), '.'), '.', ',') || ' kg aprox.)'
  from listas_precios l, formatos_producto f
 where l.id = i.lista_id and l.nombre = 'Hostelería' and lower(i.unidad) = 'caja'
   and f.producto_id = i.producto_id and f.formato = 'caja' and f.peso_estimado_kg > 0;

select coalesce(i.nombre, a.nombre) nombre, coalesce(i.unidad, a.unidad) unidad, a.precio antes, i.precio ahora, i.coste, i.precio_fijo, i.auto_aviso
  from antes a full join (select i.* from listas_precios_items i join listas_precios l on l.id = i.lista_id where l.nombre = 'Hostelería') i on i.id = a.id
 order by 1;
