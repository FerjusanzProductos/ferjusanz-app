-- Rentabilidad con datos de Golden y clientes con su nombre normal (Fernando, 18/11/2026:
-- «lo de la Rentabilidad con datos de Golden, hazlo» · «en vez de nombre de la empresa, que salga el nombre normal»).
-- Solo lectura. Las líneas repetidas no cuentan (las oculta la regla de golden_lineas). Solo para la lista ver_margenes.

-- 1) Margen por cliente: el nombre comercial de la ficha del cliente (si lo tiene) en vez de la razón social de Golden.
create or replace function public.golden_margen(p_desde date, p_hasta date, p_por text)
returns table(clave text, nombre text, venta numeric, coste numeric, cantidad numeric, facturas bigint)
language sql stable set search_path = public as $$
  select case when p_por = 'cliente' then f.cliente_codigo else coalesce(l.producto_codigo, '') end,
         max(case when p_por = 'cliente' then coalesce(nullif(c.nombre_comercial, ''), f.cliente_nombre) else l.descripcion end),
         round(sum(l.neto), 2), round(sum(l.coste), 2), sum(l.cantidad), count(distinct f.numero)
  from golden_facturas f join golden_lineas l on l.factura_numero = f.numero
  left join clientes c on c.codigo = f.cliente_codigo
  where f.fecha between p_desde and p_hasta and l.neto is not null and puede_ver_margenes()
  group by 1 order by 3 desc nulls last;
$$;

-- 2) Todo lo de la pantalla «📈 Rentabilidad» de una vez: por producto, por cliente, por día y las ventas por debajo del coste.
create or replace function public.golden_rentabilidad(p_desde date, p_hasta date)
returns jsonb language sql stable set search_path = public as $$
  with l as (
    select f.numero, f.fecha, f.cliente_codigo, coalesce(nullif(c.nombre_comercial, ''), f.cliente_nombre) cli,
           coalesce(nullif(l.producto_codigo, ''), l.descripcion) prod, l.descripcion, l.cantidad, l.precio, l.neto, l.coste
    from golden_facturas f join golden_lineas l on l.factura_numero = f.numero
    left join clientes c on c.codigo = f.cliente_codigo
    where f.fecha between p_desde and p_hasta and l.neto is not null and puede_ver_margenes())
  select jsonb_build_object(
    'facturas', (select count(distinct numero) from l),
    'p', (select coalesce(jsonb_agg(x), '[]') from (select prod k, max(descripcion) n, sum(neto) venta, sum(neto) filter (where coste is not null) vc, coalesce(sum(coste), 0) coste, sum(cantidad) cant from l group by prod) x),
    'c', (select coalesce(jsonb_agg(x), '[]') from (select cliente_codigo k, max(cli) n, sum(neto) venta, sum(neto) filter (where coste is not null) vc, coalesce(sum(coste), 0) coste, sum(cantidad) cant from l group by cliente_codigo) x),
    'd', (select coalesce(jsonb_agg(x), '[]') from (select fecha k, sum(neto) venta, sum(neto) filter (where coste is not null) vc, coalesce(sum(coste), 0) coste from l group by fecha) x),
    'perd', (select coalesce(jsonb_agg(x), '[]') from (select descripcion producto, cli cliente, fecha, precio, round(coste / nullif(cantidad, 0), 4) coste_u, cantidad kg, round(coste - neto, 2) perdida
                                                   from l where coste is not null and cantidad > 0 and neto < coste - 0.005 order by coste - neto desc limit 200) x));
$$;
revoke all on function public.golden_rentabilidad(date, date) from public, anon;
grant execute on function public.golden_rentabilidad(date, date) to authenticated;
