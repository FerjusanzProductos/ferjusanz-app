-- Arreglos de TRAZABILIDAD (12/11/2026). Pendiente de aplicar con Fernando delante («listo»).
-- No borra datos ni toca precios, facturas, cobros ni permisos.
--
-- 1) guardar_peso: si se cambia el peso de una línea que ya tenía UN lote, el lote se queda con los kilos
--    viejos (la traza no cuadra). Ahora se actualizan los kilos del lote. Si el albarán ya tenía la
--    trazabilidad confirmada y el peso cambia, vuelve a «sin trazabilidad asignada» (igual que corregir_linea).
--    Además, comprueba que el lote que se pasa es del mismo producto.
-- 2) corregir_linea: al cambiar la CANTIDAD de una línea que se cobra por unidad (cajas, bandejas…),
--    la trazabilidad confirmada seguía como buena. Ahora se reabre y se ajusta el lote si solo hay uno.
-- 3) validar_trazabilidad y quien_dia: lo asignado a pedidos ANULADOS ya no gasta kilos del lote.
-- 4) v_trazabilidad: no salen pedidos anulados; no se pierden compras sin proveedor;
--    añade cliente_id (buscar por ficha, no por nombre) y la unidad de la cantidad entregada.

-- ============ 1) guardar_peso ============
create or replace function public.guardar_peso(p_linea uuid, p_peso numeric, p_version integer, p_lote uuid default null)
returns integer language plpgsql security definer set search_path to 'public' as $function$
declare
  v_rol text := public.rol_actual();
  v_pedido uuid; v_estado text; v_nueva integer; v_prod uuid; v_up text; v_peso_antes numeric;
begin
  if v_rol not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;
  if p_peso is null or p_peso < 0 then raise exception 'PESO_NO_VALIDO'; end if;

  select l.pedido_id, p.estado, l.producto_id, l.unidad_precio, l.peso_real
    into v_pedido, v_estado, v_prod, v_up, v_peso_antes
    from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id
   where l.id = p_linea;
  if v_pedido is null then raise exception 'LINEA_NO_EXISTE'; end if;
  if v_estado in ('terminado','anulado') and v_rol = 'preparador' then raise exception 'PEDIDO_CERRADO'; end if;
  if p_lote is not null and not exists (select 1 from public.lotes lo where lo.id = p_lote
       and lo.producto_id = v_prod and not coalesce(lo.archivado, false)) then
    raise exception 'ASIGNACION_NO_VALIDA'; end if;

  update public.lineas_pedido
     set peso_real = p_peso, estado = 'hecha', preparado_por = auth.uid(), preparado_en = now()
   where id = p_linea and version = p_version
   returning version into v_nueva;
  if v_nueva is null then raise exception 'CONFLICTO'; end if;

  -- Si el peso cambia en un albarán con la trazabilidad ya cerrada, hay que volver a confirmarla.
  if v_up = 'kg' and v_peso_antes is distinct from p_peso then
    update public.albaranes set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
     where pedido_id = v_pedido and estado = 'emitido' and traza_estado is not null;
  end if;

  perform set_config('fj.traza_corr', '1', true);
  if p_lote is not null then
    delete from public.asignaciones_lote where linea_id = p_linea;
    insert into public.asignaciones_lote (linea_id, lote_id, cantidad) values (p_linea, p_lote, p_peso);
  elsif v_up = 'kg' and (select count(*) from public.asignaciones_lote where linea_id = p_linea) = 1 then
    update public.asignaciones_lote set cantidad = p_peso where linea_id = p_linea;
  end if;
  perform set_config('fj.traza_corr', '', true);

  update public.pedidos set estado = 'en_preparacion' where id = v_pedido and estado = 'pendiente';
  return v_nueva;
end $function$;

-- ============ 2) corregir_linea ============
create or replace function public.corregir_linea(p_linea uuid, p_cantidad numeric, p_peso numeric, p_unidad text)
returns void language plpgsql security definer set search_path to 'public' as $function$
declare v_rol text := public.rol_actual(); v_ped uuid; v_estado text; v_up text; v_reabrir boolean := false; v_nueva numeric;
begin
  if v_rol is null then raise exception 'SIN_PERMISO'; end if;
  select l.pedido_id, p.estado, l.unidad_precio into v_ped, v_estado, v_up
    from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id where l.id = p_linea for update of l;
  if v_ped is null then raise exception 'LINEA_NO_EXISTE'; end if;
  if v_estado = 'anulado' then raise exception 'PEDIDO_ANULADO'; end if;
  if v_rol not in ('oficina','admin') and exists (select 1 from public.entregas where pedido_id = v_ped) then
    raise exception 'PEDIDO_ENTREGADO'; end if;
  if p_cantidad is not null then
    if p_cantidad <= 0 then raise exception 'CANTIDAD_NO_VALIDA'; end if;
    update public.lineas_pedido set cantidad_pedida = p_cantidad where id = p_linea;
    if v_up <> 'kg' then v_reabrir := true; v_nueva := p_cantidad; end if;
  end if;
  if nullif(trim(coalesce(p_unidad,'')),'') is not null then
    update public.lineas_pedido set unidad_pedida = p_unidad where id = p_linea;
  end if;
  if p_peso is not null then
    if p_peso < 0 then raise exception 'PESO_NO_VALIDO'; end if;
    update public.lineas_pedido set peso_real = p_peso, estado = 'hecha', preparado_por = auth.uid(), preparado_en = now() where id = p_linea;
    update public.pedidos set estado = 'en_preparacion' where id = v_ped and estado = 'pendiente';
    v_reabrir := true; if v_up = 'kg' then v_nueva := p_peso; end if;
  end if;
  if v_reabrir then
    update public.albaranes set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
     where pedido_id = v_ped and estado = 'emitido' and traza_estado is not null;
    if v_nueva is not null and (select count(*) from public.asignaciones_lote where linea_id = p_linea) = 1 then
      perform set_config('fj.traza_corr', '1', true);
      update public.asignaciones_lote set cantidad = v_nueva where linea_id = p_linea;
      perform set_config('fj.traza_corr', '', true);
    end if;
  end if;
end $function$;

-- ============ 3a) validar_trazabilidad ============
create or replace function public.validar_trazabilidad(p_pedido uuid, p_asig jsonb)
returns void language plpgsql security definer set search_path to 'public' as $function$
begin
  p_asig := coalesce(p_asig, '[]'::jsonb);
  if exists (select 1 from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
             group by x.linea_id, x.lote_id having count(*) > 1) then
    raise exception 'ASIGNACION_DUPLICADA'; end if;
  if exists (select 1 from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
               left join public.lineas_pedido l on l.id = x.linea_id and l.pedido_id = p_pedido
               left join public.lotes lo on lo.id = x.lote_id
              where l.id is null or lo.id is null or lo.producto_id <> l.producto_id
                 or l.estado not in ('hecha','parcial') or coalesce(lo.archivado, false)
                 or x.cantidad is null or x.cantidad <= 0) then
    raise exception 'ASIGNACION_NO_VALIDA'; end if;
  if exists (select 1 from public.lineas_pedido l
               left join (select x.linea_id, sum(x.cantidad) as s
                            from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
                           group by x.linea_id) a on a.linea_id = l.id
              where l.pedido_id = p_pedido and l.estado in ('hecha','parcial')
                and (case when l.unidad_precio = 'kg' then coalesce(l.peso_real,0) else l.cantidad_pedida end) > 0
                and coalesce(a.s, 0) = 0) then
    raise exception 'FALTA_TRAZABILIDAD'; end if;
  if exists (select 1 from public.lineas_pedido l
               join (select x.linea_id, sum(x.cantidad) as s
                       from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
                      group by x.linea_id) a on a.linea_id = l.id
              where l.pedido_id = p_pedido
                and abs(a.s - (case when l.unidad_precio = 'kg' then coalesce(l.peso_real,0) else l.cantidad_pedida end)) > 0.001) then
    raise exception 'KILOS_NO_COINCIDEN'; end if;
  -- no repartir más kilos de los que quedan (lo de pedidos anulados no cuenta como salido)
  if exists (select 1
               from (select x.lote_id, sum(x.cantidad) as pedido
                       from jsonb_to_recordset(p_asig) as x(linea_id uuid, lote_id uuid, cantidad numeric)
                       join public.lineas_pedido l on l.id = x.linea_id and l.unidad_precio = 'kg'
                      group by x.lote_id) t
               join public.lotes lo on lo.id = t.lote_id
              where lo.unidad = 'kg'
                and t.pedido > lo.cantidad_recibida + 0.001 - coalesce((
                      select sum(a.cantidad) from public.asignaciones_lote a
                        join public.lineas_pedido l2 on l2.id = a.linea_id
                        join public.pedidos p2 on p2.id = l2.pedido_id
                       where a.lote_id = lo.id and l2.pedido_id <> p_pedido and p2.estado <> 'anulado'), 0)) then
    raise exception 'LOTE_SIN_KILOS'; end if;
end $function$;

-- ============ 3b) quien_dia ============
create or replace function public.quien_dia(p_fecha date)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $function$
declare v_lineas jsonb; v_lotes jsonb;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select coalesce(jsonb_agg(jsonb_build_object(
           'linea_id', l.id, 'pedido_id', p.id,
           'cliente', coalesce(c.nombre_comercial, c.nombre), 'producto_id', l.producto_id, 'producto', pr.nombre,
           'cantidad', case when l.unidad_precio = 'kg' then coalesce(l.peso_real, 0) else l.cantidad_pedida end,
           'unidad_precio', l.unidad_precio,
           'lotes', (select coalesce(jsonb_agg(jsonb_build_object('lote_id', a.lote_id, 'cantidad', a.cantidad)), '[]'::jsonb)
                       from public.asignaciones_lote a where a.linea_id = l.id))), '[]'::jsonb)
    into v_lineas
    from public.pedidos p
    join public.lineas_pedido l on l.pedido_id = p.id and l.estado in ('hecha','parcial')
    join public.productos pr on pr.id = l.producto_id
    left join public.clientes c on c.id = p.cliente_id
   where p.fecha_entrega = p_fecha and p.estado <> 'anulado'
     and not exists (select 1 from public.albaranes al where al.pedido_id = p.id and al.estado = 'emitido' and al.traza_estado is not null);

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', lo.id, 'producto_id', lo.producto_id, 'codigo', lo.codigo_lote, 'origen', lo.origen,
           'proveedor', pv.nombre, 'fecha', co.fecha, 'unidad', lo.unidad,
           'queda', lo.cantidad_recibida - coalesce((select sum(a.cantidad) from public.asignaciones_lote a
                      join public.lineas_pedido l3 on l3.id = a.linea_id join public.pedidos p3 on p3.id = l3.pedido_id
                     where a.lote_id = lo.id and p3.estado <> 'anulado'), 0))
           order by co.fecha, lo.created_at), '[]'::jsonb)
    into v_lotes
    from public.lotes lo
    join public.compras co on co.id = lo.compra_id
    left join public.proveedores pv on pv.id = co.proveedor_id
   where not coalesce(lo.archivado, false) and co.fecha >= p_fecha - 45
     and lo.producto_id in (select l2.producto_id from public.lineas_pedido l2 join public.pedidos p2 on p2.id = l2.pedido_id
                             where p2.fecha_entrega = p_fecha and p2.estado <> 'anulado' and l2.estado in ('hecha','parcial'));
  return jsonb_build_object('lineas', v_lineas, 'lotes', v_lotes);
end $function$;

-- ============ 4) v_trazabilidad ============
-- Mismas columnas y en el mismo orden; las nuevas (cliente_id, unidad) van al final.
create or replace view public.v_trazabilidad with (security_invoker = true) as
 select lo.id as lote_id,
    lo.codigo_lote,
    pr.nombre as producto,
    lo.origen,
    pv.nombre as proveedor,
    c.fecha as fecha_compra,
    a.cantidad as cantidad_entregada,
    p.fecha_entrega,
    cl.nombre as cliente,
    al.serie,
    al.numero as numero_albaran,
    cl.id as cliente_id,
    case when l.unidad_precio = 'kg' then 'kg' else coalesce(l.unidad_pedida, 'ud') end as unidad
   from lotes lo
     join compras c on c.id = lo.compra_id
     left join proveedores pv on pv.id = c.proveedor_id
     join productos pr on pr.id = lo.producto_id
     join asignaciones_lote a on a.lote_id = lo.id
     join lineas_pedido l on l.id = a.linea_id
     join pedidos p on p.id = l.pedido_id
     join clientes cl on cl.id = p.cliente_id
     left join albaranes al on al.pedido_id = p.id
  where p.estado <> 'anulado';
