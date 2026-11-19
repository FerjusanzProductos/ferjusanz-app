-- 19/11/2026 (Tito): los clientes sin IVA (azul) se tratan como los demás: albarán y factura con su IVA,
-- sin la línea automática «Descuento por productos». Al cobrar, el repartidor les rebaja a mano unos euros
-- (como hoy) y queda apuntado como cobro de forma «descuento» (no es dinero: lo pierde la empresa).
-- El IVA se declara entero. Solo para clientes sin IVA y como mucho el IVA del albarán.
alter table public.cobros drop constraint if exists cobros_forma_check;
alter table public.cobros add constraint cobros_forma_check
  check (forma = any (array['efectivo','tarjeta','bizum','transferencia','otro','descuento']));

CREATE OR REPLACE FUNCTION public.cobrar(p_pedido uuid, p_importe numeric, p_forma text, p_nota text DEFAULT NULL::text, p_clave text DEFAULT NULL::text)
 RETURNS cobros
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_ped public.pedidos; v_pend numeric; v_imp numeric; v_c public.cobros;
begin
  if public.rol_actual() not in ('preparador','oficina','admin') then raise exception 'SIN_PERMISO'; end if;

  -- Esperar turno: solo un cobro a la vez por pedido
  select * into v_ped from public.pedidos where id = p_pedido for update;
  if not found then raise exception 'PEDIDO_NO_EXISTE'; end if;

  -- Reintento del mismo cobro (sin conexión): devolver el ya guardado
  if p_clave is not null then
    select * into v_c from public.cobros where clave = p_clave;
    if found then return v_c; end if;
  end if;

  if p_importe is null or p_importe <= 0 then raise exception 'IMPORTE_NO_VALIDO'; end if;
  select pendiente into v_pend from public.v_pedidos_importe where pedido_id = p_pedido;
  if v_pend is null then raise exception 'SIN_IMPORTE'; end if;
  if p_importe > v_pend + 0.01 then raise exception 'COBRO_MAYOR_QUE_PENDIENTE'; end if;

  -- Descuento al cobrar: solo clientes sin IVA (azul) y como mucho el IVA (y recargo) del albarán
  if p_forma = 'descuento' then
    if not coalesce((select sin_iva from public.clientes where id = v_ped.cliente_id), false) then raise exception 'DESCUENTO_SOLO_SIN_IVA'; end if;
    select coalesce(iva, 0) + coalesce(recargo, 0) - coalesce((select sum(importe) from public.cobros where pedido_id = p_pedido and forma = 'descuento'), 0)
      into v_imp from public.v_pedidos_importe where pedido_id = p_pedido;
    if p_importe > coalesce(v_imp, 0) + 0.01 then raise exception 'DESCUENTO_MAYOR_QUE_IVA'; end if;
  end if;

  insert into public.cobros (pedido_id, cliente_id, importe, forma, nota, clave)
    values (p_pedido, v_ped.cliente_id, round(p_importe, 2), p_forma, p_nota, p_clave)
    returning * into v_c;
  return v_c;
end $function$
;

-- Venta en ruta: ya no pone sola la línea «Descuento por productos».
CREATE OR REPLACE FUNCTION public.anadir_venta_ruta(p_pedido uuid, p_producto uuid, p_cantidad numeric, p_unidad text, p_precio numeric, p_unidad_precio text, p_nota text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_rol text := public.rol_actual(); v_estado text; v_id uuid;
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

  update public.albaranes
     set traza_estado = null, traza_motivo = null, traza_por = null, traza_at = null
   where pedido_id = p_pedido and estado = 'emitido' and traza_estado is not null;

  return v_id;
end $function$
;
