-- Tickets a nombre de «Clientes varios (ticket)», como en Golden (Tito, 19/11/2026). En el papel sigue sin salir ningún dato del cliente.
create or replace function public.sif_emitir_ticket(p_pedidos uuid[], p_forma_pago text) returns jsonb
language plpgsql security definer set search_path to 'public' as $function$
declare v jsonb; v_serie text; v_anio int; v_num int; v_cod text; v_id uuid; v_fecha date := public.sif__fecha_hoy(); xl jsonb; v_prueba boolean;
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  v_serie := case public.sif_serie(false) when 'PRUEBA' then 'PRUEBA-T' else 'T' end;   -- en la real: bloqueado hasta activar, igual que las facturas
  v_prueba := v_serie like 'PRUEBA%';
  perform 1 from public.albaranes where pedido_id = any(p_pedidos) for update;
  v := public.sif_vista_previa_ticket(p_pedidos);
  if jsonb_array_length(v->'errores') > 0 then raise exception 'NO_SE_PUEDE_FACTURAR: %', (select string_agg(e, ' · ') from jsonb_array_elements_text(v->'errores') e); end if;
  if p_forma_pago is null or p_forma_pago not in ('efectivo', 'tarjeta', 'bizum', 'transferencia') then raise exception 'FALTA_FORMA_PAGO'; end if;

  v_anio := extract(year from v_fecha)::int;
  v_num := public.sif__siguiente(v_serie, v_anio);
  v_cod := public.sif__codigo(v_serie, v_anio, v_num);
  -- cliente_id se guarda solo para el cobro dentro de la app; en el ticket NO salen sus datos
  insert into public.sif_facturas (serie, anio, numero, codigo, tipo, fecha, cliente_id, cliente, emisor, concepto, forma_pago, vencimiento, recargo_equivalencia,
    base, cuota_iva, cuota_re, total, prueba, version_sif)
  values (v_serie, v_anio, v_num, v_cod, 'simplificada', v_fecha, (v->>'cliente_id')::uuid, jsonb_build_object('nombre', 'Clientes varios (ticket)'), public.sif__emisor(), v->>'concepto', p_forma_pago,
    v_fecha, (v->>'recargo_equivalencia')::boolean,
    (v->>'base')::numeric, (v->>'cuota_iva')::numeric, (v->>'cuota_re')::numeric, (v->>'total')::numeric, v_prueba, (select version_sif from public.sif_config))
  returning id into v_id;
  for xl in select * from jsonb_array_elements(v->'lineas') loop
    insert into public.sif_factura_lineas (factura_id, orden, albaran_id, albaran, linea_pedido_id, producto_id, codigo, descripcion, familia, cantidad, unidad, precio,
      base, tipo_iva, cuota_iva, tipo_re, cuota_re, total)
    values (v_id, (xl->>'orden')::int, (xl->>'albaran_id')::uuid, xl->>'albaran', (xl->>'linea_pedido_id')::uuid, (xl->>'producto_id')::uuid, xl->>'codigo', xl->>'descripcion', xl->>'familia',
      (xl->>'cantidad')::numeric, xl->>'unidad', (xl->>'precio')::numeric, (xl->>'base')::numeric, (xl->>'tipo_iva')::numeric, (xl->>'cuota_iva')::numeric,
      (xl->>'tipo_re')::numeric, (xl->>'cuota_re')::numeric, (xl->>'total')::numeric);
  end loop;
  insert into public.sif_factura_iva (factura_id, tipo_iva, base, cuota_iva, tipo_re, cuota_re, total)
  select v_id, (x->>'tipo_iva')::numeric, (x->>'base')::numeric, (x->>'cuota_iva')::numeric, (x->>'tipo_re')::numeric, (x->>'cuota_re')::numeric, (x->>'total')::numeric
  from jsonb_array_elements(v->'iva') x;
  insert into public.sif_factura_albaranes (factura_id, albaran_id, pedido_id)
  select v_id, al.id, al.pedido_id from public.albaranes al where al.pedido_id = any(p_pedidos);
  insert into public.albaranes_facturados (pedido_id, numero_factura, fecha_factura, marcado_por)
  select x, v_cod, v_fecha, auth.uid() from unnest(p_pedidos) x
  on conflict (pedido_id) do update set numero_factura = excluded.numero_factura, fecha_factura = excluded.fecha_factura, marcado_por = excluded.marcado_por, marcado_en = now();
  insert into public.facturas_clientes (cliente_id, numero, fecha, importe, nota, pagada)
  values ((v->>'cliente_id')::uuid, v_cod, v_fecha, greatest((v->>'total')::numeric, 0), 'Ticket (factura simplificada) desde la app' || case when v_prueba then ' (PRUEBA, sin valor fiscal)' else '' end, false)
  on conflict (cliente_id, numero) do nothing;
  return jsonb_build_object('id', v_id, 'codigo', v_cod, 'total', (v->>'total')::numeric);
end $function$;
