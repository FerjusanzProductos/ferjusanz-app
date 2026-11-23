-- Tito, 23/11/2026: «Lo tienes en las facturas de los proveedores de compra. Haz el cálculo en función de los kilos y las cantidades».
-- Kilos por bulto sacados de las facturas (neto ÷ bultos) y guardados en «📦 Formatos» (formatos_producto):
--   champiñón: 3 bultos = 7,40 kg (Hnos. Fernández López, 20/11) → 2,5 kg/caja
--   melón piel de sapo: «5» piezas por bulto, 2 bultos = 39,9 kg y 4 = 83,3 kg; bodega «4 piezas», 2 bultos = 32 kg → 4 kg/pieza
--   tomate raf: 2 bultos = 14,7 kg (Madremía, 20/11) → 7,35 kg/caja
--   yuca: 1 bulto = 18 kg (Herederos de Carlos Gómez, 05/11) → 18 kg/caja
--   manzana golden en caja: unos 7 kg (REGLAS_INTERNAS; Golden: 7,37 y 8,87 kg por línea)
--   remolacha cocida: se compra «en bolsa» por unidad (4,50 €) → la lista pasa de «paquete» a «bolsa».
-- Acelgas y apio: la factura da kilos por bulto, no manojos: siguen «para contrastar».

-- Recalcula los precios automáticos (todas las listas con margen_auto, o solo un producto).
create or replace function public.recalcular_listas_auto(p_producto uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  it record; c record; v_coste numeric; v_precio numeric; v_aviso text; n int := 0;
begin
  for it in
    select i.*, l.margen_auto, p.codigo, p.unidad_venta, p.unidad_compra, p.compra_trae
      from listas_precios_items i
      join listas_precios l on l.id = i.lista_id
      left join productos p on p.id = i.producto_id
     where l.margen_auto is not null and not i.precio_fijo
       and (p_producto is null or i.producto_id = p_producto)
  loop
    v_coste := null; v_aviso := null; c := null;
    if it.producto_id is null then
      v_aviso := 'Sin producto enlazado';
    else
      -- Última compra: factura leída en la app (tarifas_compra) o compra de Golden; la más reciente.
      select * into c from (
        select tc.fecha, tc.precio, coalesce(nullif(tc.unidad, ''), it.unidad_venta) unidad,
               'factura ' || coalesce(pr.nombre, '') origen, 1 pref
          from tarifas_compra tc left join proveedores pr on pr.id = tc.proveedor_id
         where tc.producto_id = it.producto_id and tc.precio > 0
        union all
        -- Golden apunta en la unidad en que se compra (p. ej. coliflor por caja de 6) si el producto la tiene.
        select g.fecha, gl.precio, coalesce(nullif(it.unidad_compra, ''), it.unidad_venta), 'Golden ' || coalesce(g.proveedor_nombre, ''), 2
          from golden_compras_lineas gl join golden_compras g on g.numero = gl.compra_numero
         where it.codigo is not null and gl.producto_codigo = it.codigo and gl.precio > 0 and coalesce(gl.cantidad, 1) > 0
      ) x order by fecha desc nulls last, pref limit 1;
      if c is null then
        v_aviso := 'Sin precio de compra';
      elsif lower(trim(c.unidad)) = lower(trim(it.unidad)) then
        v_coste := c.precio;
      elsif it.compra_trae > 0 and lower(trim(c.unidad)) = lower(trim(it.unidad_compra)) and lower(trim(it.unidad)) = lower(trim(it.unidad_venta)) then
        v_coste := round(c.precio / it.compra_trae, 3);
      elsif lower(trim(c.unidad)) = 'kg' and (select max(peso_estimado_kg) from formatos_producto f
              where f.producto_id = it.producto_id and lower(f.formato) = lower(trim(it.unidad)) and f.peso_estimado_kg > 0) is not null then
        -- Se compra por kilo y se vende por caja/pieza: precio del kilo × kilos que trae (sacado de las facturas, «📦 Formatos»).
        v_coste := round(c.precio * (select max(peso_estimado_kg) from formatos_producto f
              where f.producto_id = it.producto_id and lower(f.formato) = lower(trim(it.unidad)) and f.peso_estimado_kg > 0), 3);
      else
        v_aviso := 'Se compra por ' || coalesce(c.unidad, '?') || ' (' || c.precio || ' €) y la lista va por ' || coalesce(it.unidad, '?') || ': ponlo a mano';
      end if;
    end if;

    if v_coste is null then
      update listas_precios_items set auto_aviso = v_aviso, auto_at = now()
       where id = it.id and auto_aviso is distinct from v_aviso;
      continue;
    end if;

    v_precio := round(v_coste + it.margen_auto, 2);
    if it.precio is distinct from v_precio then
      insert into listas_precios_cambios (lista_id, item_id, nombre, unidad, antes, despues, compra, compra_fecha, compra_origen)
      values (it.lista_id, it.id, it.nombre, it.unidad, it.precio, v_precio, v_coste, c.fecha, c.origen);
      n := n + 1;
    end if;
    update listas_precios_items
       set precio = v_precio, coste = v_coste, compra_ref = c.precio, compra_fecha = c.fecha, compra_origen = c.origen,
           auto_aviso = null, auto_at = now()
     where id = it.id
       and (precio is distinct from v_precio or coste is distinct from v_coste or compra_fecha is distinct from c.fecha
            or compra_origen is distinct from c.origen or auto_aviso is not null);
  end loop;
  return n;
end $$;

insert into formatos_producto (producto_id, formato, peso_estimado_kg, peso_variable, predeterminado)
select p.id, v.formato, v.kg, true, false
  from (values ('28','caja',2.5), ('93','pieza',4.0), ('91-C','caja',7.35), ('146','caja',18.0), ('105','caja',7.0)) v(codigo, formato, kg)
  join productos p on p.codigo = v.codigo
 where not exists (select 1 from formatos_producto f where f.producto_id = p.id and f.formato = v.formato);

update listas_precios_items i set unidad = 'bolsa'
  from listas_precios l where l.id = i.lista_id and l.margen_auto is not null and i.nombre like 'Remolacha cocida%';

select public.recalcular_listas_auto();
select i.nombre, i.unidad, i.precio, i.coste, i.auto_aviso from listas_precios_items i join listas_precios l on l.id = i.lista_id
 where l.margen_auto is not null and i.nombre in ('Champiñón','Melón piel de sapo','Tomate raf','Yuca','Manzana','Remolacha cocida (3 piezas)','Acelgas','Apio verde') order by 1;
