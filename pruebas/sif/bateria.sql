-- Batería de pruebas técnicas del SIF (docs/SIF_PRODUCTOR/PRUEBAS_TECNICAS.md).
-- SOLO en la base de PRUEBAS. Todo va en una transacción que se DESHACE al final (raise exception):
-- no deja facturas, albaranes ni pedidos. Lo único que no vuelve atrás es el contador interno de sif_registros.id
-- (huecos en el id, que no es el nº de factura). El resultado sale en el mensaje de error «RESULTADO:{…}».
-- Uso: pruebas/sif/bateria.mjs (lanza esto y recalcula las huellas con huella.mjs).
do $bat$
declare
  v_ent text; u_admin uuid := '4b39a41c-5e53-4452-94f5-6d4a9c03dc84';   -- fernando@pruebas.invalid (admin)
  c1 uuid := 'a1ae5bd8-cbe9-447a-8950-bf3b17c67490'; c2 uuid := '254ca7f1-e4ad-49be-8505-5808006ee836';
  p4 uuid := 'f7394604-ffc6-4770-9d80-626b0e7a114e'; p10 uuid := 'a97a0763-f314-4dc5-aa27-d9d70ad23a07';
  res jsonb := '{}'; k int; ped uuid; f jsonb; ids uuid[] := '{}'; codigos text[] := '{}'; n_alb int := 990000;
  v_ini int; v_fin int; regs0 int; x jsonb; msg text; t1 numeric; t2 numeric; rid uuid; rr jsonb;
begin
  select nombre into v_ent from public.entorno;
  if v_ent is distinct from 'pruebas' then raise exception 'SOLO_EN_PRUEBAS'; end if;
  perform set_config('request.jwt.claims', json_build_object('sub', u_admin, 'role', 'authenticated')::text, true);
  perform set_config('request.jwt.claim.sub', u_admin::text, true);

  -- Albarán entregado de prueba: p_lin = [[producto, cantidad, precio], …]
  create function pg_temp.alb(p_cli uuid, p_fecha date, p_lin jsonb, p_num int) returns uuid language plpgsql as $f$
  declare p uuid; l jsonb; begin
    insert into public.pedidos (cliente_id, fecha_entrega) values (p_cli, p_fecha) returning id into p;
    for l in select * from jsonb_array_elements(p_lin) loop
      insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, precio, unidad_precio)
      values (p, (l->>0)::uuid, (l->>1)::numeric, 'kg', (l->>1)::numeric, (l->>2)::numeric, 'kg');
    end loop;
    insert into public.albaranes (pedido_id, serie, numero, fecha) values (p, 'PRUEBA-F', p_num, p_fecha);
    insert into public.entregas (pedido_id) values (p);
    return p; end $f$;

  select ultimo into v_ini from public.sif_contadores where serie = 'PRUEBA' and anio = extract(year from public.sif__fecha_hoy());
  v_ini := coalesce(v_ini, 0);
  select count(*) into regs0 from public.sif_registros;

  -- ===== T-NUM-01 / T-CAD-01 / T-HASH-06: 50 facturas, con 3 fallos a mitad (no deben dejar hueco) =====
  for k in 1..50 loop
    n_alb := n_alb + 1;
    ped := pg_temp.alb(case when k % 2 = 0 then c1 else c2 end, public.sif__fecha_hoy(),
             case when k % 3 = 0 then jsonb_build_array(jsonb_build_array(p4, k, 1.5), jsonb_build_array(p10, 2.5, 3.1))
                  else jsonb_build_array(jsonb_build_array(p4, k + 0.5, 1.25)) end, n_alb);
    if k in (10, 25, 40) then   -- fallo a propósito: sin forma de pago → no se emite y no gasta número
      begin perform public.sif_emitir_factura(array[ped], null); exception when others then null; end;
    end if;
    f := public.sif_emitir_factura(array[ped], 'transferencia');
    ids := ids || (f->>'id')::uuid; codigos := codigos || (f->>'codigo');
  end loop;
  select ultimo into v_fin from public.sif_contadores where serie = 'PRUEBA' and anio = extract(year from public.sif__fecha_hoy());
  res := res || jsonb_build_object('T-NUM-01', jsonb_build_object(
    'ok', v_fin - v_ini = 50 and (select bool_and(numero = v_ini + o) from public.sif_facturas q join unnest(ids) with ordinality u(id, o) on q.id = u.id),
    'primera', codigos[1], 'ultima', codigos[50]));

  -- ===== T-FAC-03: efectivo =====
  n_alb := n_alb + 1; ped := pg_temp.alb(c1, public.sif__fecha_hoy(), jsonb_build_array(jsonb_build_array(p4, 1000, 0.962)), n_alb);   -- 962 + 4 % = 1000,48
  begin perform public.sif_emitir_factura(array[ped], 'efectivo'); msg := 'SE EMITIÓ'; exception when others then msg := sqlerrm; end;
  n_alb := n_alb + 1; rid := pg_temp.alb(c1, public.sif__fecha_hoy(), jsonb_build_array(jsonb_build_array(p4, 100, 9.6)), n_alb);   -- 960 + 4 % = 998,40
  f := public.sif_emitir_factura(array[rid], 'efectivo');
  ids := ids || (f->>'id')::uuid;
  res := res || jsonb_build_object('T-FAC-03', jsonb_build_object('ok', msg like 'EFECTIVO_NO_PERMITIDO%' and (f->>'total')::numeric < 1000,
    'con_1000', msg, 'con_998', f->>'total'));
  f := public.sif_emitir_factura(array[ped], 'transferencia'); ids := ids || (f->>'id')::uuid;

  -- ===== T-FAC-02: cliente sin NIF / sin CP =====
  n_alb := n_alb + 1; ped := pg_temp.alb(c2, public.sif__fecha_hoy(), jsonb_build_array(jsonb_build_array(p4, 3, 2)), n_alb);
  update public.clientes set nif = null where id = c2;
  begin perform public.sif_emitir_factura(array[ped], 'transferencia'); msg := 'SE EMITIÓ'; exception when others then msg := sqlerrm; end;
  update public.clientes set nif = 'B88584172', codigo_postal = null where id = c2;
  begin perform public.sif_emitir_factura(array[ped], 'transferencia'); x := to_jsonb('SE EMITIÓ'::text); exception when others then x := to_jsonb(sqlerrm); end;
  res := res || jsonb_build_object('T-FAC-02', jsonb_build_object('ok', msg like '%NIF%' and x #>> '{}' like '%CÓDIGO POSTAL%', 'sin_nif', msg, 'sin_cp', x));
  update public.clientes set codigo_postal = '28033' where id = c2;   -- se deshace al final de todos modos

  -- ===== T-INA-04 / T-NUM-03 / T-HASH-07 (importe negativo): rectificativa por diferencias =====
  select total into t1 from public.sif_facturas where id = ids[1];
  select jsonb_agg(jsonb_build_object('linea_id', linea_id, 'cantidad', cantidad - 1)) into x from public.sif_lineas_vigentes(ids[1]);
  f := public.sif_emitir_rectificativa(ids[1], 'Prueba: 1 kg menos', x, false, 'transferencia');
  select total into t2 from public.sif_facturas where id = ids[1];
  rr := (select to_jsonb(q) from public.sif_facturas q where id = (f->>'id')::uuid);
  res := res || jsonb_build_object('T-INA-04', jsonb_build_object('ok', t1 = t2 and rr->>'rectifica_codigo' = codigos[1] and rr->>'motivo' = 'Prueba: 1 kg menos' and (rr->>'total')::numeric < 0,
    'codigo', rr->>'codigo', 'rectifica', rr->>'rectifica_codigo', 'total', rr->>'total', 'original_intacta', t1 = t2));
  ids := ids || (f->>'id')::uuid;

  -- ===== T-INA-05: anulación (rectificativa que deja la factura a cero) =====
  f := public.sif_emitir_rectificativa(ids[2], 'Prueba: emitida por error', '[]', true, 'compensacion');
  ids := ids || (f->>'id')::uuid;
  res := res || jsonb_build_object('T-INA-05', jsonb_build_object(
    'original_sigue', exists (select 1 from public.sif_facturas where id = ids[2]),
    'registro', (select jsonb_build_object('tipo_registro', tipo_registro, 'tipo_factura', tipo_factura, 'importe', importe_total) from public.sif_registros where factura_id = (f->>'id')::uuid),
    'otra_vez', (select case when true then null end)));
  begin perform public.sif_emitir_rectificativa(ids[2], 'Prueba: otra vez', '[]', true, 'compensacion'); msg := 'SE EMITIÓ'; exception when others then msg := sqlerrm; end;
  res := jsonb_set(res, '{T-INA-05,otra_vez}', to_jsonb(msg));
  f := public.sif_emitir_rectificativa(ids[3], 'Prueba: precio corregido', (select jsonb_agg(jsonb_build_object('linea_id', linea_id, 'precio', precio + 0.1)) from public.sif_lineas_vigentes(ids[3])), false, 'transferencia');
  ids := ids || (f->>'id')::uuid;
  res := res || jsonb_build_object('T-NUM-03', (select jsonb_agg(codigo order by numero) from public.sif_facturas where serie = 'PRUEBA-R' and anio = extract(year from public.sif__fecha_hoy())));

  -- ===== T-INA-07: REGISTRO DE ANULACIÓN (factura emitida por error) =====
  select pedido_id into ped from public.sif_factura_albaranes where factura_id = ids[10] limit 1;
  f := public.sif_anular_factura(ids[10], 'Prueba: cliente equivocado');
  x := jsonb_build_object(
    'registro', (select jsonb_build_object('tipo', tipo_registro, 'engancha', huella_anterior = (select huella from public.sif_registros h where h.id < g.id order by h.id desc limit 1), 'motivo', motivo)
                 from public.sif_registros g where factura_id = ids[10] and tipo_registro = 'anulacion'),
    'factura_sigue', exists (select 1 from public.sif_facturas where id = ids[10]),
    'albaran_libre', not exists (select 1 from public.albaranes_facturados where pedido_id = ped),
    'sin_cobro_pendiente', not exists (select 1 from public.facturas_clientes q where q.numero = codigos[10]),
    'refacturada', public.sif_emitir_factura(array[ped], 'transferencia')->>'codigo');
  begin perform public.sif_anular_factura(ids[10], 'Prueba: otra vez'); msg := 'SE ANULÓ'; exception when others then msg := sqlerrm; end;
  x := x || jsonb_build_object('otra_vez', msg);
  begin perform public.sif_anular_factura(ids[1], 'Prueba: tiene rectificativa'); msg := 'SE ANULÓ'; exception when others then msg := sqlerrm; end;
  x := x || jsonb_build_object('con_rectificativa', msg);
  begin perform public.sif_anular_factura(ids[array_length(ids, 1)], 'Prueba: es rectificativa'); msg := 'SE ANULÓ'; exception when others then msg := sqlerrm; end;
  x := x || jsonb_build_object('rectificativa', msg);
  begin perform public.sif_emitir_rectificativa(ids[10], 'Prueba: rectificar anulada', '[]', true, 'compensacion'); msg := 'SE EMITIÓ'; exception when others then msg := sqlerrm; end;
  x := x || jsonb_build_object('rectificar_anulada', msg);
  update public.facturas_clientes set pagada = true where numero = codigos[11];
  begin perform public.sif_anular_factura(ids[11], 'Prueba: ya cobrada'); msg := 'SE ANULÓ'; exception when others then msg := sqlerrm; end;
  x := x || jsonb_build_object('cobrada', msg);
  begin perform public.sif_anular_factura(ids[12], 'mal'); msg := 'SE ANULÓ'; exception when others then msg := sqlerrm; end;
  x := x || jsonb_build_object('sin_motivo', msg);
  res := res || jsonb_build_object('T-INA-07', x || jsonb_build_object('ok', (x->'registro'->>'engancha')::boolean and (x->>'factura_sigue')::boolean and (x->>'albaran_libre')::boolean
    and (x->>'sin_cobro_pendiente')::boolean and x->>'refacturada' like 'PRUEBA-%' and x->>'otra_vez' like 'YA_ANULADA%' and x->>'con_rectificativa' like 'TIENE_RECT%'
    and x->>'rectificativa' like 'SOLO_ORDINARIAS%' and x->>'rectificar_anulada' like 'YA_ANULADA%' and x->>'cobrada' like 'YA_COBRADA%' and x->>'sin_motivo' like 'FALTA_MOTIVO%'));

  -- ===== T-TRA-01 / T-TRA-02 / T-NUM-04 / T-FAC-01 =====
  res := res || jsonb_build_object(
    'T-TRA-01', (select jsonb_build_object('ok', bool_and(q.emitida_por = u_admin and g.fecha_hora_gen ~ '^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\+0[12]:00$' and g.version_sif <> ''),
                   'ejemplo', min(g.fecha_hora_gen), 'version', min(g.version_sif))
                 from public.sif_facturas q join public.sif_registros g on g.factura_id = q.id where q.id = any(ids)),
    'T-TRA-02', (select jsonb_build_object('ok', bool_and(n = 1)) from (select q.id, (select count(*) from public.sif_factura_albaranes a where a.factura_id = q.id) n from public.sif_facturas q where q.id = any(ids) and q.tipo = 'ordinaria') s),
    'T-NUM-04', (select jsonb_build_object('ok', bool_and(prueba and serie like 'PRUEBA%' and codigo like 'PRUEBA-%')) from public.sif_facturas where id = any(ids)),
    'T-FAC-01', (select jsonb_build_object('ok', bool_and(
                   emisor->>'nif' = 'B87446670' and coalesce(emisor->>'registro_mercantil', '') like '%Hoja M-618046%' and emisor->>'codigo_postal' ~ '^\d{5}$'
                   and coalesce(cliente->>'nif', '') <> '' and cliente->>'codigo_postal' ~ '^\d{5}$' and coalesce(cliente->>'direccion', '') <> '' and forma_pago is not null
                   and exists (select 1 from public.sif_factura_iva i where i.factura_id = q.id)
                   and total = (select sum(i.total) from public.sif_factura_iva i where i.factura_id = q.id)), 'facturas', count(*)) from public.sif_facturas q where id = any(ids)));

  -- ===== T-CAD-01 / T-CAD-04: cadena entera =====
  res := res || jsonb_build_object('T-CAD-01', public.sif_comprobar_cadena() - 'ultima_huella',
    'T-CAD-04', (select jsonb_build_object('ok', huella_anterior = '' and (select count(*) from public.sif_registros where huella_anterior = '') = 1, 'primero', num_serie) from public.sif_registros order by id limit 1));

  -- ===== T-INA-01..03: borrar o cambiar como usuario de la app (admin) y como dueño de la base =====
  execute 'set local role authenticated';
  for msg in select unnest(array['delete from public.sif_facturas where id = $1', 'update public.sif_facturas set total = 1 where id = $1',
                                 'delete from public.sif_registros where factura_id = $1', 'update public.sif_registros set importe_total = ''1.00'' where factura_id = $1',
                                 'delete from public.sif_factura_lineas where factura_id = $1']) loop
    begin execute msg using ids[5]; x := to_jsonb('PASÓ'::text); exception when others then x := to_jsonb(sqlerrm); end;
    res := jsonb_set(res, '{T-INA-app}', coalesce(res->'T-INA-app', '[]') || jsonb_build_array(jsonb_build_object(split_part(msg, ' where', 1), x)));
  end loop;
  execute 'reset role';
  for msg in select unnest(array['delete from public.sif_facturas where id = $1', 'update public.sif_facturas set total = 1, fecha = fecha - 1, numero = 9999 where id = $1',
                                 'delete from public.sif_registros where factura_id = $1', 'update public.sif_registros set importe_total = ''1.00'' where factura_id = $1',
                                 'update public.sif_contadores set ultimo = ultimo - 1 where serie = ''PRUEBA''', 'truncate public.sif_registros cascade']) loop
    begin execute msg using ids[5]; x := to_jsonb('PASÓ'::text); exception when others then x := to_jsonb(sqlerrm); end;
    res := jsonb_set(res, '{T-INA-base}', coalesce(res->'T-INA-base', '[]') || jsonb_build_array(jsonb_build_object(split_part(msg, ' where', 1), x)));
  end loop;

  -- ===== T-SEP-01 (parte de pruebas): todo lo emitido es serie PRUEBA. La base real se mira aparte. =====
  -- ===== Huellas para recalcular fuera (T-HASH-06) — antes de manipular nada =====
  res := res || jsonb_build_object('registros', (select jsonb_agg(to_jsonb(g) - 'creado_at' - 'factura_id' order by g.id) from public.sif_registros g where g.id > (select id from public.sif_registros order by id offset regs0 - 1 limit 1)));
  res := res || jsonb_build_object('regs_antes', regs0, 'regs_despues', (select count(*) from public.sif_registros));

  -- ===== T-HASH-07 (huso horario): invierno +01:00, verano +02:00, y las dos horas del cambio =====
  res := res || jsonb_build_object('T-HASH-07-huso', (select jsonb_agg(to_char(t at time zone 'Europe/Madrid', 'YYYY-MM-DD"T"HH24:MI:SS') || '+' || to_char((t at time zone 'Europe/Madrid') - (t at time zone 'UTC'), 'HH24:MI'))
     from unnest(array['2027-01-15 10:00:00+00', '2027-07-15 10:00:00+00', '2027-03-28 00:59:59+00', '2027-03-28 01:00:00+00', '2027-10-31 00:59:59+00', '2027-10-31 01:00:00+00']::timestamptz[]) t));

  -- ===== T-CAD-03: manipulación a mano saltándose los cerrojos (como administrador de la base) =====
  set local session_replication_role = replica;   -- apaga los triggers (los cerrojos) solo en esta transacción
  update public.sif_facturas set total = total + 1 where id = ids[7];
  update public.sif_registros set importe_total = '0.01' where factura_id = ids[9];
  set local session_replication_role = origin;
  res := res || jsonb_build_object('T-CAD-03', public.sif_comprobar_cadena() - 'ultima_huella');

  -- ===== T-NUM-02: cambio de año (se finge que hoy es 1/1 del año siguiente; también se deshace) =====
  execute format('create or replace function public.sif__fecha_hoy() returns date language sql stable as %L', 'select date ''' || (extract(year from now())::int + 1) || '-01-01''');
  n_alb := n_alb + 1; ped := pg_temp.alb(c1, public.sif__fecha_hoy(), jsonb_build_array(jsonb_build_array(p4, 2, 2)), n_alb);
  f := public.sif_emitir_factura(array[ped], 'transferencia');
  res := res || jsonb_build_object('T-NUM-02', jsonb_build_object('codigo', f->>'codigo',
    'fecha_registro', (select fecha_expedicion from public.sif_registros where factura_id = (f->>'id')::uuid)));

  raise exception 'RESULTADO:%', res::text;
end $bat$;
