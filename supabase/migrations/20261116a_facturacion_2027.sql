-- FACTURACIÓN · FASE 7: dejarlo todo LISTO para facturar desde la app el 1/1/2027, SIN ACTIVARLO.
-- Va DESPUÉS de 20261113a_facturas_emitidas.sql (en la base real, las dos juntas). Vale para las dos bases.
--
-- Qué hace, en corto:
--  1. sif_config.fecha_inicio = 1/1/2027: en la base REAL no se puede emitir NADA antes de esa fecha, aunque alguien activara la facturación.
--     (emision_real_activa sigue en FALSE: la facturación real queda APAGADA. Encenderla es otro SQL, con «Autorizo» de Fernando.)
--  2. En la base REAL, los albaranes de antes del 1/1/2027 no se pueden facturar en la app (se facturan en Golden).
--  3. Deja preparados los contadores 2027 de la base real: ordinarias 2027-0001… y rectificativas R2027-0001… (empiezan en 0; nada emitido).
--  4. sif_preparado(): una comprobación para la oficina y para Claude (¿está activa?, siguiente número, clientes sin datos…).
--  5. Sube la versión del programa de facturación a «SIF 0.2.0 (sin declaración)» (cualquier cambio en sif_* la sube; docs/SIF_PRODUCTOR/LEEME.md, punto 8).
-- No borra ni cambia ninguna factura, pedido, albarán ni cliente.

-- 1. Fecha de inicio y versión
alter table public.sif_config add column if not exists fecha_inicio date not null default '2027-01-01';
update public.sif_config set version_sif = 'SIF 0.2.0 (sin declaración)' where id;

-- Serie que toca. En la REAL: bloqueado si no está activada O si aún no es la fecha de inicio.
create or replace function public.sif_serie(p_rect boolean) returns text language plpgsql stable security definer set search_path = public as $$
declare v_ent text; v_activa boolean; v_inicio date;
begin
  select nombre into v_ent from public.entorno;
  if v_ent = 'pruebas' then return case when p_rect then 'PRUEBA-R' else 'PRUEBA' end; end if;
  select emision_real_activa, fecha_inicio into v_activa, v_inicio from public.sif_config;
  if v_ent is distinct from 'produccion' or not coalesce(v_activa, false) then
    raise exception 'FACTURACION_NO_ACTIVA: en la app normal todavía no se emiten facturas (hace falta la declaración responsable firmada)';
  end if;
  if public.sif__fecha_hoy() < coalesce(v_inicio, date '2027-01-01') then
    raise exception 'FACTURACION_NO_ACTIVA: la app factura desde el %; hasta entonces, en Golden', to_char(coalesce(v_inicio, date '2027-01-01'), 'DD/MM/YYYY');
  end if;
  return case when p_rect then 'R' else 'F' end;
end $$;
revoke all on function public.sif_serie(boolean) from public, anon, authenticated;

-- 2. Vista previa con el control de 2027 (igual que la de la fase 2 + el bloque «Paso a 2027»)
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
                    where fa.albaran_id = al.id and not exists (select 1 from public.sif_facturas q where q.rectifica_id = f.id and q.anula) limit 1) as factura,
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

-- 3. Contadores de 2027 preparados (solo en la base REAL). Empiezan en 0: la primera factura será 2027-0001 y la primera rectificativa R2027-0001.
insert into public.sif_contadores (serie, anio, ultimo)
  select s, 2027, 0 from unnest(array['F', 'R']) s where (select nombre from public.entorno) = 'produccion'
  on conflict (serie, anio) do nothing;

-- 4. Comprobación «¿está todo listo?» (solo lee)
create or replace function public.sif_preparado() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare k public.sif_config%rowtype; v_ent text; v_anio int;
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  select * into k from public.sif_config; select nombre into v_ent from public.entorno;
  v_anio := greatest(extract(year from public.sif__fecha_hoy())::int, extract(year from k.fecha_inicio)::int);
  return jsonb_build_object(
    'entorno', v_ent, 'version_sif', k.version_sif, 'activa', k.emision_real_activa, 'fecha_inicio', k.fecha_inicio,
    'siguiente_factura', public.sif__codigo(case when v_ent = 'pruebas' then 'PRUEBA' else 'F' end, v_anio,
                           coalesce((select ultimo from public.sif_contadores where serie = case when v_ent = 'pruebas' then 'PRUEBA' else 'F' end and anio = v_anio), 0) + 1),
    'siguiente_rectificativa', public.sif__codigo(case when v_ent = 'pruebas' then 'PRUEBA-R' else 'R' end, v_anio,
                           coalesce((select ultimo from public.sif_contadores where serie = case when v_ent = 'pruebas' then 'PRUEBA-R' else 'R' end and anio = v_anio), 0) + 1),
    'facturas_emitidas', (select count(*) from public.sif_facturas where not prueba),
    'facturas_prueba', (select count(*) from public.sif_facturas where prueba),
    'clientes_activos_sin_datos', (select count(*) from public.clientes c where c.activo and (btrim(coalesce(c.nombre, '')) = '' or not public.sif_nif_valido(c.nif)
                                     or btrim(coalesce(c.direccion, '')) = '' or coalesce(btrim(c.codigo_postal), '') !~ '^\d{5}$' or btrim(coalesce(c.localidad, '')) = '')),
    'empresa_completa', (select count(*) = 1 from public.empresa e where btrim(coalesce(e.razon_social, '')) <> '' and btrim(coalesce(e.nif, '')) <> ''
                                     and btrim(coalesce(e.direccion, '')) <> '' and coalesce(e.codigo_postal, '') ~ '^\d{5}$'));
end $$;
revoke all on function public.sif_preparado() from public, anon;
grant execute on function public.sif_preparado() to authenticated;
