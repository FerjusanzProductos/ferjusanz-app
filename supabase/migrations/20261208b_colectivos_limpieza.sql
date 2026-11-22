-- Tito, 22/11/2026: «perejil déjalo a 0 · Ciruela Claudia no lo pongas en la lista · Patata nueva, si está repetido, no ·
-- no pongas los productos que no se hayan comprado».
update listas_precios_items i set precio = 0, coste = null, precio_fijo = true, auto_aviso = null
  from listas_precios l where l.id = i.lista_id and l.margen_auto is not null and i.nombre = 'Perejil';
delete from listas_precios_items i using listas_precios l
 where l.id = i.lista_id and l.margen_auto is not null
   and (i.nombre = 'Ciruela Claudia' or i.nombre like 'Patata nueva (REPETIDA%' or i.auto_aviso = 'Sin precio de compra');
select i.nombre, i.precio, i.auto_aviso from listas_precios_items i join listas_precios l on l.id = i.lista_id
 where l.margen_auto is not null and (i.precio is null or i.precio = 0) order by 1;
