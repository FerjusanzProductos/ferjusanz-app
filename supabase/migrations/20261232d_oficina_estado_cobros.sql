-- 🔒 Oficina (Tito, 28/11/2026: «El 1 hazlo»): oficina_estado ya no da cobros ni pagos de Golden a quien no tiene
-- puede_ver_cobros() (ver_margenes o ver_cobros), igual que el RLS de golden_tesoreria. El resto, sin cambios.
CREATE OR REPLACE FUNCTION public.oficina_estado()
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare r jsonb;
begin
  if not exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false) then
    raise exception 'Solo la oficina puede ver la oficina';
  end if;
  with cob as (
    -- «A cuenta» en la nota de Golden = ya pagado (misma regla que scripts/panel-html.mjs).
    select tipo, estado, vencimiento,
      greatest(0, total - coalesce((select sum((p->>'importe')::numeric) from jsonb_array_elements(t.observacion_partes) p), 0)) total
    from golden_tesoreria t)
  select jsonb_build_object(
    'golden_hasta', (select max(fecha) from golden_facturas where not borrador),
    -- Las facturas P (pago mensual) se hacen el último día del mes: a mitad de mes solo hay contado.
    -- Por eso se comparan los dos últimos meses cerrados y, del mes en curso, solo lo que va.
    'ventas', (select jsonb_build_object(
        'mes_cerrado', to_char(date_trunc('month', current_date) - interval '1 month', 'YYYY-MM'),
        'ultimo_mes', coalesce(sum(base) filter (where fecha >= date_trunc('month', current_date) - interval '1 month' and fecha < date_trunc('month', current_date)), 0),
        'mes_antes', coalesce(sum(base) filter (where fecha < date_trunc('month', current_date) - interval '1 month'), 0),
        'mes_en_curso', coalesce(sum(base) filter (where fecha >= date_trunc('month', current_date)), 0))
      from golden_facturas where not borrador and fecha >= date_trunc('month', current_date) - interval '2 months'),
    -- Lo del mes en curso no es deuda (pago mensual la 1.ª semana del mes siguiente, REGLAS_INTERNAS).
    'cobros', (select jsonb_build_object(
        'vencido', coalesce(sum(total) filter (where vencimiento < date_trunc('month', current_date)), 0),
        'antiguo', coalesce(sum(total) filter (where vencimiento < date_trunc('month', current_date) - interval '1 month'), 0))
      from cob where tipo = 'C' and estado = 'PEN' and total > 0.009),
    'pagos', (select jsonb_build_object(
        'vencido', coalesce(sum(total) filter (where vencimiento < current_date), 0),
        'semana', coalesce(sum(total) filter (where vencimiento between current_date and current_date + 7), 0))
      from golden_tesoreria where tipo = 'P' and estado = 'PEN'),
    'facturas', (select jsonb_build_object(
        'por_revisar', count(*) filter (where estado = 'nueva'),
        'semana', count(*) filter (where recibido_en > now() - interval '7 days'))
      from facturas_recibidas),
    'comercial', (select jsonb_build_object(
        'llamar_hoy', count(*) filter (where proximo_contacto <= current_date),
        'nuevos', count(*) filter (where estado = 'nuevo'),
        'interesados', count(*) filter (where estado = 'interesado'))
      from prospectos where coalesce(estado, 'nuevo') not in ('cliente', 'descartado')),
    -- Han dejado de pedir: compraron en 3+ meses y llevan 45+ días sin factura (igual que el Panel).
    'clientes', (select jsonb_build_object('activos', (select count(*) from clientes where activo),
        'dejaron_de_pedir', (select count(*) from (select 1 from golden_facturas
          where not borrador and fecha >= current_date - interval '18 months'
          group by upper(trim(cliente_nombre))
          having count(distinct date_trunc('month', fecha)) >= 3 and max(fecha) < current_date - 45) x))),
    'informes', jsonb_build_object(
        'mercado', (select max(fecha) from resumen_mercado),
        'comercial_del_dia', (select max(fecha) from resumen_comercial),
        'posibles_clientes', (select max(fecha) from resumen_leads),
        'plan_semana', (select max(fecha) from resumen_semana))
  ) into r;
  -- Cobros y pagos de Golden solo para quien los puede ver (como golden_tesoreria): esta función salta el RLS.
  if not puede_ver_cobros() then r := r - 'cobros' - 'pagos'; end if;
  return r;
end $function$;
