-- Tito, 23/11/2026: «Quiero que las cajas sean 0,30 € el kilo». En colectividades, lo que va por CAJA lleva
-- compra + 0,30 € por cada kilo que trae la caja (kilos de «📦 Formatos», sacados de las facturas). El resto, + 0,20 €.
-- Kilos nuevos de las facturas: aguacate «ORSERO 4K» → 4 kg/caja; lima «TAHITI 42 4,3K» → 4,3 kg/caja.
-- Lechuga iceberg (9-10 piezas) y mix de frutos del bosque: la factura no trae los kilos → siguen con + 0,20 € y avisan.

alter table public.listas_precios add column if not exists margen_kg_caja numeric(10,3);
comment on column public.listas_precios.margen_kg_caja is 'Si tiene valor: en las cajas con kilos conocidos, margen = este valor × kilos';
update listas_precios set margen_kg_caja = 0.30 where margen_auto is not null;

insert into formatos_producto (producto_id, formato, peso_estimado_kg, peso_variable, predeterminado)
select p.id, 'caja', v.kg, false, false
  from (values ('122', 4.0), ('43', 4.3)) v(codigo, kg) join productos p on p.codigo = v.codigo
 where not exists (select 1 from formatos_producto f where f.producto_id = p.id and f.formato = 'caja');

-- Recalcula los precios automáticos (todas las listas con margen_auto, o solo un producto).
create or replace function public.recalcular_listas_auto(p_producto uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  it record; c record; v_coste numeric; v_precio numeric; v_aviso text; v_kg numeric; n int := 0;
begin
  for it in
    select i.*, l.margen_auto, l.margen_kg_caja, p.codigo, p.unidad_venta, p.unidad_compra, p.compra_trae
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

    -- Cajas con sus kilos conocidos: margen por kilo (Tito, 23/11/2026: «las cajas 0,30 € el kilo»).
    select max(f.peso_estimado_kg) into v_kg from formatos_producto f
     where f.producto_id = it.producto_id and lower(f.formato) = 'caja' and f.peso_estimado_kg > 0;
    v_precio := round(v_coste + case when lower(trim(it.unidad)) = 'caja' and it.margen_kg_caja is not null and v_kg is not null
                                     then it.margen_kg_caja * v_kg else it.margen_auto end, 2);
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

select public.recalcular_listas_auto();
select i.nombre, i.unidad, i.precio, i.coste from listas_precios_items i join listas_precios l on l.id = i.lista_id
 where l.margen_auto is not null and i.unidad = 'caja' order by 1;
