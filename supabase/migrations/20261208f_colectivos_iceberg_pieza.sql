-- Tito, 23/11/2026: «El mix de frutos del bosque quítalo y la lechuga iceberg la vendemos por pieza: 0,90 por pieza».
delete from listas_precios_items i using listas_precios l
 where l.id = i.lista_id and l.margen_auto is not null and i.nombre = 'Mix frutos del bosque';
update listas_precios_items i
   set nombre = 'Lechuga iceberg', unidad = 'pieza', precio = 0.90, precio_fijo = true, auto_aviso = null,
       coste = null, compra_ref = null, compra_fecha = null, compra_origen = null,
       producto_id = coalesce((select id from productos where codigo = '94'), i.producto_id)  -- 94 = iceberg por pieza (REGLAS_INTERNAS)
  from listas_precios l
 where l.id = i.lista_id and l.margen_auto is not null and i.nombre like 'Lechuga iceberg%';
select i.nombre, i.unidad, i.precio, i.precio_fijo, p.codigo from listas_precios_items i join listas_precios l on l.id = i.lista_id
  left join productos p on p.id = i.producto_id
 where l.margen_auto is not null and (i.nombre like 'Lechuga iceberg%' or i.nombre like 'Mix%');
