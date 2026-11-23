-- Tito, 23/11/2026: «El manojo de acelgas son 8. El apio son 4» = manojos por bulto.
-- Kilos del bulto en las facturas: acelgas 8,05 · 8,10 · 12,10 kg (media 9,4) → 1,18 kg/manojo; apio 5,65 kg → 1,41 kg/manojo.
insert into formatos_producto (producto_id, formato, peso_estimado_kg, peso_variable, predeterminado)
select p.id, 'manojo', v.kg, true, false
  from (values ('123', 1.18), ('16', 1.41)) v(codigo, kg) join productos p on p.codigo = v.codigo
 where not exists (select 1 from formatos_producto f where f.producto_id = p.id and f.formato = 'manojo');
select public.recalcular_listas_auto();
select i.nombre, i.unidad, i.precio, i.coste, i.auto_aviso from listas_precios_items i join listas_precios l on l.id = i.lista_id
 where l.margen_auto is not null and (i.nombre in ('Acelgas','Apio verde') or i.precio is null);
