-- Tito, 23/11/2026: «Pon lo que pesan las cajas». En el nombre, que es lo que sale en la tarifa que se envía.
update listas_precios_items i
   set nombre = regexp_replace(i.nombre, '\s*\(caja de .*\)$', '') || ' (caja de ' || replace(rtrim(rtrim(f.peso_estimado_kg::text, '0'), '.'), '.', ',') || ' kg aprox.)'
  from listas_precios l, formatos_producto f
 where l.id = i.lista_id and l.margen_auto is not null and lower(i.unidad) = 'caja'
   and f.producto_id = i.producto_id and f.formato = 'caja' and f.peso_estimado_kg > 0;
select i.nombre, i.precio from listas_precios_items i join listas_precios l on l.id = i.lista_id
 where l.margen_auto is not null and lower(i.unidad) = 'caja' order by 1;
