-- 12/11/2026 (Fernando: «que lo haga la app sola»): al añadir una VENTA EN RUTA a un cliente SIN IVA (azul),
-- se vuelve a calcular sola la línea «Descuento por productos» (igual al IVA de todo el albarán), con el mismo
-- cálculo que el botón «🔵 Calcular y poner el descuento sin IVA» de la oficina.
-- Solo si el pedido no tiene descuento o el que tiene es el «Descuento por productos»: si la oficina puso otro
-- descuento a mano (p. ej. «producto en mal estado»), no se toca.
-- El resto de la función queda igual que antes.
create or replace function public.anadir_venta_ruta(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text, p_nota text default null::text)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_rol text := public.rol_actual(); v_estado text; v_id uuid;
        v_sin boolean; v_db numeric; v_dm text; v_iva numeric; v_r numeric;
begin
  if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  if p_cantidad is null or p_cantidad <= 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
  if p_unidad_precio not in ('kg','unidad') then raise exception 'UNIDAD_PRECIO_NO_VALIDA'; end if;
  select estado into v_estado from public.pedidos where id = p_pedido for update;
  if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;

  insert into public.lineas_pedido
    (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, unidad_precio, precio,
     estado, preparado_por, preparado_en, notas, venta_ruta)
  values
    (p_pedido, p_producto, p_cantidad, p_unidad, p_cantidad, p_unidad_precio, p_precio,
     'hecha', auth.uid(), now(), 'Venta en ruta' || coalesce(' · ' || nullif(trim(coalesce(p_nota,'')),''), ''), true)
  returning id into v_id;

  -- La trazabilidad ya confirmada deja de valer: falta asignar el lote de lo añadido.
  update public.albaranes
     set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
   where pedido_id = p_pedido and estado = 'emitido' and traza_estado is not null;

  -- NUEVO: cliente sin IVA → recalcular el «Descuento por productos» (igual al IVA de todas las líneas con precio)
  select coalesce(c.sin_iva, false), p.descuento_base, p.descuento_motivo into v_sin, v_db, v_dm
    from public.pedidos p join public.clientes c on c.id = p.cliente_id where p.id = p_pedido;
  if v_sin and (coalesce(v_db, 0) = 0 or v_dm = 'Descuento por productos') then
    with l as (
      select coalesce(l.iva, pr.iva, 4) as t,
             round((case when l.unidad_precio = 'kg' then l.peso_real else l.cantidad_pedida end) * l.precio, 2) as imp
        from public.lineas_pedido l left join public.productos pr on pr.id = l.producto_id
       where l.pedido_id = p_pedido and l.precio is not null
         and (case when l.unidad_precio = 'kg' then l.peso_real else l.cantidad_pedida end) is not null),
    b as (select t, sum(imp) as base from l group by t)
    select sum(round(base * t) / 100), (select t from b order by base desc limit 1) into v_iva, v_r from b;
    if coalesce(v_iva, 0) > 0 and v_r in (0, 4, 10, 21) then
      update public.pedidos
         set descuento_base = round(v_iva / (1 + v_r / 100), 2), descuento_iva = v_r, descuento_motivo = 'Descuento por productos'
       where id = p_pedido;
    end if;
  end if;
  return v_id;
end $function$;
