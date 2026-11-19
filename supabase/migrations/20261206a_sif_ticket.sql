-- FACTURA SIMPLIFICADA (TICKET) (Tito, 19/11/2026; Jorge dijo que sí).
-- Para clientes que no quieren dar sus datos: ticket SIN nombre ni NIF, con su IVA, que se declara igual.
-- · Serie propia «T» (en pruebas «PRUEBA-T»): T2027-0001…
-- · Tope: 400 € IVA incluido por ticket (límite general, RD 1619/2012 art. 4.1). Si Jorge dice otro, se cambia aquí.
-- · Mismos controles que la factura (albaranes entregados, sin facturar, del mismo cliente y mes), pero sin pedir datos del cliente.
-- · Registro tipo F2 (factura simplificada). No se rectifica: si está mal, se anula y se hace otra.
-- La factura normal no cambia.

alter table public.sif_facturas drop constraint if exists sif_facturas_tipo_check;
alter table public.sif_facturas add constraint sif_facturas_tipo_check check (tipo in ('ordinaria', 'rectificativa', 'simplificada'));
alter table public.sif_facturas drop constraint if exists sif_facturas_serie_check;
alter table public.sif_facturas add constraint sif_facturas_serie_check check (serie in ('F', 'R', 'T', 'PRUEBA', 'PRUEBA-R', 'PRUEBA-T'));
alter table public.sif_registros drop constraint if exists sif_registros_tipo_factura_check;
alter table public.sif_registros add constraint sif_registros_tipo_factura_check check (tipo_factura in ('F1', 'F2', 'R1'));
alter table public.sif_facturas drop constraint if exists sif_facturas_check1;
alter table public.sif_facturas add constraint sif_facturas_check1 check (tipo in ('ordinaria', 'simplificada') or length(btrim(coalesce(motivo, ''))) >= 5);

create or replace function public.sif__codigo(p_serie text, p_anio integer, p_num integer) returns text language sql immutable as $$
  select case p_serie when 'F' then '' when 'R' then 'R' when 'T' then 'T' when 'PRUEBA' then 'PRUEBA-' when 'PRUEBA-R' then 'PRUEBA-R' when 'PRUEBA-T' then 'PRUEBA-T' end || p_anio || '-' || lpad(p_num::text, 4, '0')
$$;

-- Tipo de registro: F1 factura, F2 simplificada, R1 rectificativa
create or replace function public.sif__tipo_registro(p_tipo text) returns text language sql immutable as $$
  select case p_tipo when 'rectificativa' then 'R1' when 'simplificada' then 'F2' else 'F1' end
$$;

create or replace function public.sif__registrar(p_factura uuid, p_cuando timestamp with time zone) returns void
language plpgsql security definer set search_path to 'public' as $function$
declare f public.sif_facturas%rowtype; v_ant text; v_fh text; v_cuota text; v_imp text; v_tipo text; v_fecha text; v_nif text;
begin
  perform pg_advisory_xact_lock(hashtext('sif_registros'));   -- un registro detrás de otro, nunca dos a la vez
  select * into f from public.sif_facturas where id = p_factura;
  select huella into v_ant from public.sif_registros order by id desc limit 1;
  v_nif := public.sif_nif_normal(f.emisor->>'nif');
  v_tipo := public.sif__tipo_registro(f.tipo);
  v_fecha := to_char(f.fecha, 'DD-MM-YYYY');
  v_cuota := (f.cuota_iva + f.cuota_re)::numeric(12,2)::text;
  v_imp := f.total::numeric(12,2)::text;
  v_fh := to_char(p_cuando at time zone 'Europe/Madrid', 'YYYY-MM-DD"T"HH24:MI:SS')
          || '+' || to_char((p_cuando at time zone 'Europe/Madrid') - (p_cuando at time zone 'UTC'), 'HH24:MI');
  insert into public.sif_registros (factura_id, nif_emisor, num_serie, fecha_expedicion, tipo_factura, cuota_total, importe_total, huella_anterior, fecha_hora_gen, huella, version_sif)
  values (f.id, v_nif, f.codigo, v_fecha, v_tipo, v_cuota, v_imp, coalesce(v_ant, ''), v_fh,
          public.sif__huella_alta(v_nif, f.codigo, v_fecha, v_tipo, v_cuota, v_imp, coalesce(v_ant, ''), v_fh), f.version_sif);
end $function$;

create or replace function public.sif_comprobar_cadena() returns jsonb
language plpgsql stable security definer set search_path to 'public' as $function$
declare r record; v_ant text := ''; n int := 0; fallos text[] := '{}'; v_sin int;
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  for r in select g.*, f.codigo, f.fecha, f.tipo, f.cuota_iva, f.cuota_re, f.total from public.sif_registros g join public.sif_facturas f on f.id = g.factura_id order by g.id loop
    n := n + 1;
    if r.huella_anterior <> v_ant then fallos := fallos || (r.num_serie || ': no engancha con el registro anterior'); end if;
    if r.tipo_registro = 'anulacion' then
      if r.huella <> public.sif__huella_anulacion(r.nif_emisor, r.num_serie, r.fecha_expedicion, r.huella_anterior, r.fecha_hora_gen) then
        fallos := fallos || (r.num_serie || ' (anulación): la huella no cuadra (el registro se ha tocado)'); end if;
      if r.num_serie <> r.codigo or r.fecha_expedicion <> to_char(r.fecha, 'DD-MM-YYYY') then
        fallos := fallos || (r.num_serie || ' (anulación): no coincide con la factura'); end if;
    else
      if r.huella <> public.sif__huella_alta(r.nif_emisor, r.num_serie, r.fecha_expedicion, r.tipo_factura, r.cuota_total, r.importe_total, r.huella_anterior, r.fecha_hora_gen) then
        fallos := fallos || (r.num_serie || ': la huella no cuadra (el registro se ha tocado)'); end if;
      if r.num_serie <> r.codigo or r.fecha_expedicion <> to_char(r.fecha, 'DD-MM-YYYY') or r.importe_total <> r.total::numeric(12,2)::text
         or r.cuota_total <> (r.cuota_iva + r.cuota_re)::numeric(12,2)::text or r.tipo_factura <> public.sif__tipo_registro(r.tipo) then
        fallos := fallos || (r.num_serie || ': la factura no coincide con su registro'); end if;
    end if;
    v_ant := r.huella;
  end loop;
  select count(*) into v_sin from public.sif_facturas f where not exists (select 1 from public.sif_registros g where g.factura_id = f.id and g.tipo_registro = 'alta');
  if v_sin > 0 then fallos := fallos || (v_sin || ' factura(s) sin registro'); end if;
  return jsonb_build_object('registros', n, 'ok', coalesce(array_length(fallos, 1), 0) = 0, 'fallos', to_jsonb(fallos), 'ultima_huella', nullif(v_ant, ''));
end $function$;

-- Un ticket no se rectifica (se anula y se hace otro)
create or replace function public.sif__no_rectificar_anulada() returns trigger language plpgsql as $function$
begin
  if new.rectifica_id is not null and public.sif_anulada(new.rectifica_id) then raise exception 'YA_ANULADA: esta factura está anulada; no se puede rectificar'; end if;
  if new.rectifica_id is not null and exists (select 1 from public.sif_facturas where id = new.rectifica_id and tipo = 'simplificada') then
    raise exception 'TICKET_NO_SE_RECTIFICA: un ticket no se rectifica; anúlalo y haz otro'; end if;
  return new;
end $function$;

-- Vista previa del ticket: la de la factura, sin pedir datos del cliente y con el tope
create or replace function public.sif_vista_previa_ticket(p_pedidos uuid[]) returns jsonb
language plpgsql stable security definer set search_path to 'public' as $function$
declare v jsonb; e text[]; a text[];
begin
  v := public.sif_vista_previa(p_pedidos);
  -- shortcut: quita los avisos de datos del cliente por su texto (los escribe sif_vista_previa); si cambian allí, cambiar aquí
  select coalesce(array_agg(x), '{}') into e from jsonb_array_elements_text(v->'errores') x where x not like 'Al cliente le falta%' and x not like 'El NIF del cliente%';
  a := array(select jsonb_array_elements_text(v->'avisos'));
  if (v->>'total')::numeric > 400 then e := e || ('El ticket llega a ' || public.sif__n((v->>'total')::numeric, 2) || ' €: el tope es 400 € con IVA. Hazle factura normal o reparte los albaranes en varios tickets.'); end if;
  if coalesce((v->>'recargo_equivalencia')::boolean, false) then a := a || 'El cliente lleva recargo de equivalencia: va incluido en el ticket.'::text; end if;
  return v || jsonb_build_object('errores', to_jsonb(e), 'avisos', to_jsonb(a), 'tope', 400,
    'serie', case when (select nombre from public.entorno) = 'pruebas' then 'PRUEBA-T' else 'T' end);
end $function$;

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
  values (v_serie, v_anio, v_num, v_cod, 'simplificada', v_fecha, (v->>'cliente_id')::uuid, jsonb_build_object('nombre', 'Cliente sin identificar'), public.sif__emisor(), v->>'concepto', p_forma_pago,
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

grant execute on function public.sif_vista_previa_ticket(uuid[]) to authenticated;
grant execute on function public.sif_emitir_ticket(uuid[], text) to authenticated;

-- Anular: también los tickets (emitidos por error)
CREATE OR REPLACE FUNCTION public.sif_anular_factura(p_factura uuid, p_motivo text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare f public.sif_facturas%rowtype; v_ant text; v_fh text; v_fecha text; v_nif text; v_cuando timestamptz := now();
begin
if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
if length(btrim(coalesce(p_motivo, ''))) < 5 then raise exception 'FALTA_MOTIVO: escribe por qué se anula'; end if;
select * into f from public.sif_facturas where id = p_factura for share;
if f.id is null then raise exception 'FACTURA_NO_EXISTE'; end if;
if f.tipo not in ('ordinaria', 'simplificada') then raise exception 'SOLO_ORDINARIAS: una rectificativa no se anula; se corrige con otra rectificativa de la factura original'; end if;
if (public.sif_serie(false) like 'PRUEBA%') <> f.prueba then raise exception 'SERIE_EQUIVOCADA'; end if;   -- en la real: bloqueado si no está activa
perform pg_advisory_xact_lock(hashtext('sif_registros'));   -- misma cola que las altas
if public.sif_anulada(f.id) then raise exception 'YA_ANULADA: esta factura ya está anulada'; end if;
if exists (select 1 from public.sif_facturas q where q.rectifica_id = f.id) then
raise exception 'TIENE_RECTIFICATIVAS: esta factura ya tiene rectificativas; corrígela con otra rectificativa';
end if;
if exists (select 1 from public.facturas_clientes where cliente_id = f.cliente_id and numero = f.codigo and pagada) then
raise exception 'YA_COBRADA: esta factura ya está cobrada; corrígela con una rectificativa';
end if;
select huella into v_ant from public.sif_registros order by id desc limit 1;
v_nif := public.sif_nif_normal(f.emisor->>'nif');
v_fecha := to_char(f.fecha, 'DD-MM-YYYY');
v_fh := to_char(v_cuando at time zone 'Europe/Madrid', 'YYYY-MM-DD"T"HH24:MI:SS')
|| '+' || to_char((v_cuando at time zone 'Europe/Madrid') - (v_cuando at time zone 'UTC'), 'HH24:MI');
insert into public.sif_registros (factura_id, tipo_registro, nif_emisor, num_serie, fecha_expedicion, huella_anterior, fecha_hora_gen, huella, version_sif, motivo)
values (f.id, 'anulacion', v_nif, f.codigo, v_fecha, coalesce(v_ant, ''), v_fh,
public.sif__huella_anulacion(v_nif, f.codigo, v_fecha, coalesce(v_ant, ''), v_fh), (select version_sif from public.sif_config), btrim(p_motivo));
-- Sus albaranes vuelven a «sin facturar» y deja de estar pendiente de cobro
delete from public.albaranes_facturados af using public.sif_factura_albaranes fa
where fa.factura_id = f.id and af.pedido_id = fa.pedido_id and af.numero_factura = f.codigo;
delete from public.facturas_clientes where cliente_id = f.cliente_id and numero = f.codigo and not pagada;
return jsonb_build_object('id', f.id, 'codigo', f.codigo);
end $function$
;
