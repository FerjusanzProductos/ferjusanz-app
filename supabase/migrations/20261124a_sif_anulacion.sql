-- FASE 8 (Verifactu): REGISTRO DE ANULACIÓN (SIF 0.4.0). 14/11/2026. Vale para las dos bases.
-- Para una factura que NUNCA debió emitirse (cliente equivocado, emitida dos veces…) y que no se llegó a entregar ni cobrar.
-- Si la factura ya se entregó al cliente o hay que corregir importes, sigue siendo con RECTIFICATIVA (botón «✏️ Rectificar»).
--
-- Qué hace, en corto:
--  1. sif_registros admite registros de tipo 'anulacion' (uno como mucho por factura), con su motivo y quién lo hizo.
--  2. Su huella sigue la fórmula de la AEAT para anulaciones (IDEmisorFacturaAnulada, NumSerieFacturaAnulada,
--     FechaExpedicionFacturaAnulada, huella anterior y fecha-hora) y va ENCADENADA con las demás (igual que pruebas/sif/huella.mjs).
--  3. sif_anular_factura(factura, motivo): solo oficina/admin. La factura NO se borra: se queda guardada, marcada como anulada.
--     Solo facturas ordinarias. No deja anular si ya está anulada, si tiene rectificativas o si ya está cobrada (entonces: rectificativa).
--     Sus albaranes vuelven a «sin facturar» y se quita de lo pendiente de cobro.
--  4. sif_comprobar_cadena() comprueba también las anulaciones.
--  5. La vista previa deja volver a facturar los albaranes de una factura anulada.
-- No borra ni cambia ninguna factura existente.

-- 1. Tabla de registros: tipo 'anulacion'
alter table public.sif_registros drop constraint if exists sif_registros_tipo_registro_check;
alter table public.sif_registros add constraint sif_registros_tipo_registro_check check (tipo_registro in ('alta', 'anulacion'));
alter table public.sif_registros drop constraint if exists sif_registros_factura_id_key;
create unique index if not exists sif_registros_factura_tipo on public.sif_registros (factura_id, tipo_registro);
alter table public.sif_registros alter column tipo_factura drop not null, alter column cuota_total drop not null, alter column importe_total drop not null;
alter table public.sif_registros drop constraint if exists sif_registros_alta_completa;
alter table public.sif_registros add constraint sif_registros_alta_completa
  check (tipo_registro <> 'alta' or (tipo_factura is not null and cuota_total is not null and importe_total is not null));
alter table public.sif_registros add column if not exists motivo text;
alter table public.sif_registros add column if not exists hecho_por uuid default auth.uid();

-- 2. Huella de un registro de anulación (orden de campos fijado por la AEAT)
create or replace function public.sif__huella_anulacion(p_nif text, p_num text, p_fecha text, p_anterior text, p_fh text)
returns text language sql immutable as $$
  select upper(encode(sha256(convert_to(
    'IDEmisorFacturaAnulada=' || btrim(p_nif) || '&NumSerieFacturaAnulada=' || btrim(p_num) || '&FechaExpedicionFacturaAnulada=' || btrim(p_fecha) ||
    '&Huella=' || btrim(coalesce(p_anterior, '')) || '&FechaHoraHusoGenRegistro=' || btrim(p_fh), 'UTF8')), 'hex'))
$$;

create or replace function public.sif_anulada(p_factura uuid) returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.sif_registros where factura_id = p_factura and tipo_registro = 'anulacion')
$$;

-- 3. Anular una factura emitida por error
create or replace function public.sif_anular_factura(p_factura uuid, p_motivo text) returns jsonb
language plpgsql security definer set search_path = public as $$
declare f public.sif_facturas%rowtype; v_ant text; v_fh text; v_fecha text; v_nif text; v_cuando timestamptz := now();
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then raise exception 'FALTA_MOTIVO: escribe por qué se anula'; end if;
  select * into f from public.sif_facturas where id = p_factura for share;
  if f.id is null then raise exception 'FACTURA_NO_EXISTE'; end if;
  if f.tipo <> 'ordinaria' then raise exception 'SOLO_ORDINARIAS: una rectificativa no se anula; se corrige con otra rectificativa de la factura original'; end if;
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
end $$;

-- 4. Comprobar la cadena (altas y anulaciones)
create or replace function public.sif_comprobar_cadena() returns jsonb language plpgsql stable security definer set search_path = public as $$
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
         or r.cuota_total <> (r.cuota_iva + r.cuota_re)::numeric(12,2)::text or r.tipo_factura <> (case when r.tipo = 'rectificativa' then 'R1' else 'F1' end) then
        fallos := fallos || (r.num_serie || ': la factura no coincide con su registro'); end if;
    end if;
    v_ant := r.huella;
  end loop;
  select count(*) into v_sin from public.sif_facturas f where not exists (select 1 from public.sif_registros g where g.factura_id = f.id and g.tipo_registro = 'alta');
  if v_sin > 0 then fallos := fallos || (v_sin || ' factura(s) sin registro'); end if;
  return jsonb_build_object('registros', n, 'ok', coalesce(array_length(fallos, 1), 0) = 0, 'fallos', to_jsonb(fallos), 'ultima_huella', nullif(v_ant, ''));
end $$;

-- 5. Vista previa: los albaranes de una factura ANULADA se pueden volver a facturar (igual que la de 20261116a + esa condición)
create or replace function public.sif_vista_previa(p_pedidos uuid[]) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare
  v_cli uuid; c public.clientes%rowtype; errores text[] := '{}'; avisos text[] := '{}';
  lineas jsonb := '[]'; iva jsonb := '[]'; r record; n int := 0; v_meses int; v_mes date;
  v_base numeric := 0; v_iva numeric := 0; v_re numeric := 0; v_efectivo numeric := 0; fams text[];
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  if p_pedidos is null or coalesce(array_length(p_pedidos, 1), 0) = 0 then raise exception 'DATOS_NO_VALIDOS: elige algún albarán'; end if;
  if (select count(distinct cliente_id) from public.pedidos where id = any(p_pedidos)) <> 1 then
    errores := array_append(errores, 'Los albaranes tienen que ser todos del MISMO cliente.');
  end if;
  select cliente_id into v_cli from public.pedidos where id = any(p_pedidos) limit 1;
  select * into c from public.clientes where id = v_cli;

  -- Cada albarán: que exista, no anulado, ENTREGADO y sin facturar
  for r in select x as pid, p.id, p.estado, al.id as alb, al.serie, al.numero, al.fecha, al.estado as alb_estado,
                  exists (select 1 from public.entregas e where e.pedido_id = x) as entregado,
                  (select f.codigo from public.sif_factura_albaranes fa join public.sif_facturas f on f.id = fa.factura_id
                    where fa.albaran_id = al.id and not exists (select 1 from public.sif_facturas q where q.rectifica_id = f.id and q.anula)
                      and not public.sif_anulada(f.id) limit 1) as factura,
                  (select af.numero_factura from public.albaranes_facturados af where af.pedido_id = x) as golden
           from unnest(p_pedidos) x left join public.pedidos p on p.id = x left join public.albaranes al on al.pedido_id = x loop
    if r.id is null or r.alb is null then errores := errores || ('Un pedido elegido no tiene albarán.');
    elsif r.alb_estado = 'anulado' or r.estado = 'anulado' then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' está ANULADO.');
    elsif not r.entregado then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' no está marcado como ENTREGADO.');
    elsif r.factura is not null then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' ya está en la factura ' || r.factura || '.');
    elsif r.golden is not null then errores := errores || ('El albarán ' || r.serie || ' ' || r.numero || ' ya está marcado como facturado (' || r.golden || ').');
    end if;
  end loop;

  -- Mismo mes (factura recapitulativa: operaciones de un mismo mes natural, art. 13 RD 1619/2012)
  select count(distinct date_trunc('month', al.fecha)), min(al.fecha) into v_meses, v_mes from public.albaranes al where al.pedido_id = any(p_pedidos);
  if v_meses > 1 then errores := array_append(errores, 'Una factura solo puede juntar albaranes del MISMO MES. Haz una factura por cada mes.'); end if;
  if v_mes is not null and public.sif__fecha_hoy() > (date_trunc('month', v_mes) + interval '1 month' + interval '15 days')::date then
    avisos := avisos || ('Fuera de plazo: los albaranes de ' || to_char(v_mes, 'MM/YYYY') || ' se tenían que facturar antes del día 16 del mes siguiente. Avisa a Jorge.');
  end if;

  -- Paso a 2027 (fase 7): en la base REAL solo se facturan albaranes desde la fecha de inicio (1/1/2027). Lo anterior se factura en GOLDEN.
  if (select nombre from public.entorno) = 'produccion'
     and exists (select 1 from public.albaranes al where al.pedido_id = any(p_pedidos) and al.fecha < (select fecha_inicio from public.sif_config)) then
    errores := array_append(errores, 'Hay albaranes de antes del ' || (select to_char(fecha_inicio, 'DD/MM/YYYY') from public.sif_config) || ': esos se facturan en GOLDEN, no en la app.');
  end if;

  -- Datos del cliente obligatorios
  if c.id is not null then
    if btrim(coalesce(c.nombre, '')) = '' then errores := array_append(errores, 'Al cliente le falta el NOMBRE.'); end if;
    if btrim(coalesce(c.nif, '')) = '' then errores := array_append(errores, 'Al cliente le falta el NIF.');
    elsif not public.sif_nif_valido(c.nif) then errores := array_append(errores, ('El NIF del cliente («' || c.nif || '») está mal escrito.')); end if;
    if btrim(coalesce(c.direccion, '')) = '' then errores := array_append(errores, 'Al cliente le falta la DIRECCIÓN.'); end if;
    if coalesce(btrim(c.codigo_postal), '') !~ '^\d{5}$' then errores := array_append(errores, 'Al cliente le falta el CÓDIGO POSTAL (5 cifras).'); end if;
    if btrim(coalesce(c.localidad, '')) = '' then errores := array_append(errores, 'Al cliente le falta la LOCALIDAD.'); end if;
  end if;

  -- Líneas: lo servido de cada albarán, en orden de albarán
  for r in select al.id as alb, al.serie || ' ' || lpad(al.numero::text, 7, '0') || ' · ' || to_char(al.fecha, 'DD/MM/YYYY') as alb_txt, al.numero, al.fecha,
                  l.id as lid, l.estado, l.peso_real, l.precio, l.unidad_precio, l.unidad_pedida, coalesce(l.iva, pr.iva, 4) as tipo,
                  pr.id as prid, pr.codigo, coalesce(nullif(btrim(pr.nombre_albaran), ''), pr.nombre) as descr, pr.nombre
           from public.albaranes al join public.lineas_pedido l on l.pedido_id = al.pedido_id join public.productos pr on pr.id = l.producto_id
           where al.pedido_id = any(p_pedidos)
           order by al.fecha, al.numero, l.created_at, l.id loop
    if r.estado = 'no_disponible' or r.peso_real = 0 then continue; end if;   -- «No servido»: ni se cobra ni se factura
    if r.precio is null or r.peso_real is null then
      errores := errores || ('Albarán ' || r.alb_txt || ': «' || r.descr || '» sin ' || case when r.precio is null then 'PRECIO' else 'PESO' end || '.');
      continue;
    end if;
    n := n + 1;
    lineas := lineas || jsonb_build_object('orden', n, 'albaran_id', r.alb, 'albaran', r.alb_txt, 'linea_pedido_id', r.lid, 'producto_id', r.prid, 'codigo', r.codigo,
      'descripcion', r.descr, 'familia', public.sif_familia(r.nombre), 'cantidad', r.peso_real,
      'unidad', case when r.unidad_precio = 'kg' then 'kg' when r.unidad_pedida = 'docena' then 'docenas' else 'ud' end,
      'precio', r.precio, 'base', round(r.peso_real * r.precio, 2), 'tipo_iva', r.tipo);
  end loop;

  -- Descuento de cada albarán (p. ej. «Descuento por productos»), como línea en negativo
  for r in select al.id as alb, al.serie || ' ' || lpad(al.numero::text, 7, '0') || ' · ' || to_char(al.fecha, 'DD/MM/YYYY') as alb_txt,
                  p.descuento_base, p.descuento_iva, coalesce(nullif(btrim(p.descuento_motivo), ''), 'Descuento') as motivo
           from public.pedidos p join public.albaranes al on al.pedido_id = p.id
           where p.id = any(p_pedidos) and p.descuento_base > 0
             and exists (select 1 from public.lineas_pedido l where l.pedido_id = p.id and l.peso_real is not null and l.precio is not null and l.peso_real <> 0 and l.estado <> 'no_disponible')
           order by al.fecha, al.numero loop
    n := n + 1;
    lineas := lineas || jsonb_build_object('orden', n, 'albaran_id', r.alb, 'albaran', r.alb_txt, 'descripcion', r.motivo, 'familia', null,
      'cantidad', 1, 'unidad', null, 'precio', -r.descuento_base, 'base', -r.descuento_base, 'tipo_iva', r.descuento_iva);
  end loop;

  if n = 0 and coalesce(array_length(errores, 1), 0) = 0 then errores := array_append(errores, 'No hay nada que facturar en esos albaranes.'); end if;

  -- IVA y recargo por línea (informativo) y resumen por tipo (el que vale)
  select coalesce(jsonb_agg(x || jsonb_build_object('cuota_iva', round((x->>'base')::numeric * (x->>'tipo_iva')::numeric / 100, 2),
            'tipo_re', case when c.recargo_equivalencia then public.sif_tipo_re((x->>'tipo_iva')::numeric) else 0 end,
            'cuota_re', case when c.recargo_equivalencia then round((x->>'base')::numeric * public.sif_tipo_re((x->>'tipo_iva')::numeric) / 100, 2) else 0 end)
          || jsonb_build_object('total', (x->>'base')::numeric + round((x->>'base')::numeric * (x->>'tipo_iva')::numeric / 100, 2)
            + case when c.recargo_equivalencia then round((x->>'base')::numeric * public.sif_tipo_re((x->>'tipo_iva')::numeric) / 100, 2) else 0 end)
          order by (x->>'orden')::int), '[]')
    into lineas from jsonb_array_elements(lineas) x;

  select coalesce(jsonb_agg(jsonb_build_object('tipo_iva', t, 'base', b, 'cuota_iva', round(b * t / 100, 2), 'tipo_re', tr, 'cuota_re', round(b * tr / 100, 2),
            'total', b + round(b * t / 100, 2) + round(b * tr / 100, 2)) order by t), '[]')
    into iva from (select (x->>'tipo_iva')::numeric t, sum((x->>'base')::numeric) b,
                          case when c.recargo_equivalencia then public.sif_tipo_re((x->>'tipo_iva')::numeric) else 0 end tr
                   from jsonb_array_elements(lineas) x group by 1, 3) s;
  select coalesce(sum((x->>'base')::numeric), 0), coalesce(sum((x->>'cuota_iva')::numeric), 0), coalesce(sum((x->>'cuota_re')::numeric), 0)
    into v_base, v_iva, v_re from jsonb_array_elements(iva) x;

  -- Efectivo ya cobrado en esos albaranes (si la factura llega a 1.000 €, no se podía)
  select coalesce(sum(importe), 0) into v_efectivo from public.cobros where pedido_id = any(p_pedidos) and forma = 'efectivo';
  if v_base + v_iva + v_re >= 1000 and v_efectivo > 0 then
    avisos := avisos || ('⚠️ En estos albaranes se cobraron ' || public.sif__n(v_efectivo, 2) || ' € en EFECTIVO y la factura llega a 1.000 €: entre empresas eso no está permitido (Ley 7/2012). Habla con Jorge.');
  end if;
  if v_base < 0 then errores := array_append(errores, 'El total sale en negativo: revisa los descuentos.'); end if;

  select array_agg(f order by array_position(array['fruta', 'verdura', 'patata', 'huevos'], f)) into fams
    from (select distinct x->>'familia' f from jsonb_array_elements(lineas) x where x->>'familia' is not null) s;

  return jsonb_build_object(
    'cliente_id', v_cli,
    'cliente', jsonb_build_object('codigo', c.codigo, 'nombre', c.nombre, 'nombre_comercial', c.nombre_comercial, 'nif', public.sif_nif_normal(c.nif),
                                  'direccion', c.direccion, 'codigo_postal', c.codigo_postal, 'localidad', c.localidad, 'telefono', c.telefono, 'email', c.email),
    'recargo_equivalencia', coalesce(c.recargo_equivalencia, false),
    'dias_pago', c.dias_pago, 'forma_pago_cliente', c.forma_pago,
    'concepto', 'Venta de ' || coalesce(case when array_length(fams, 1) > 1 then array_to_string(fams[1:array_length(fams, 1) - 1], ', ') || ' y ' || fams[array_length(fams, 1)] else fams[1] end, 'productos'),
    'lineas', lineas, 'iva', iva,
    'base', v_base, 'cuota_iva', v_iva, 'cuota_re', v_re, 'total', v_base + v_iva + v_re,
    'efectivo_cobrado', v_efectivo, 'efectivo_permitido', (v_base + v_iva + v_re) < 1000,
    'errores', to_jsonb(errores), 'avisos', to_jsonb(avisos),
    'serie', case when (select nombre from public.entorno) = 'pruebas' then 'PRUEBA' else 'F' end);
end $$;

-- La rectificativa no puede corregir una factura anulada
create or replace function public.sif__no_rectificar_anulada() returns trigger language plpgsql as $$
begin
  if new.rectifica_id is not null and public.sif_anulada(new.rectifica_id) then raise exception 'YA_ANULADA: esta factura está anulada; no se puede rectificar'; end if;
  return new;
end $$;
drop trigger if exists trg_no_rectificar_anulada on public.sif_facturas;
create trigger trg_no_rectificar_anulada before insert on public.sif_facturas for each row execute function public.sif__no_rectificar_anulada();

revoke all on function public.sif_anular_factura(uuid, text) from public, anon;
grant execute on function public.sif_anular_factura(uuid, text) to authenticated;
revoke all on function public.sif_anulada(uuid) from public, anon;
grant execute on function public.sif_anulada(uuid) to authenticated;
revoke all on function public.sif_comprobar_cadena() from public, anon;
grant execute on function public.sif_comprobar_cadena() to authenticated;
revoke all on function public.sif_vista_previa(uuid[]) from public, anon;
grant execute on function public.sif_vista_previa(uuid[]) to authenticated;

update public.sif_config set version_sif = 'SIF 0.4.0 (sin declaración)' where id;
