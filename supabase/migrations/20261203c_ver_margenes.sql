-- Margen, rentabilidad, compras y cobros/pagos de Golden: solo para quien diga Fernando (18/11/2026: él, su padre y Jorge).
-- La lista se cambia solo con SQL (no hay regla de escritura para la app): insert into ver_margenes (user_id, nombre) values (...).
create table if not exists public.ver_margenes (user_id uuid primary key references auth.users(id) on delete cascade, nombre text);
alter table public.ver_margenes enable row level security;
revoke all on public.ver_margenes from anon;
drop policy if exists leer_mia on public.ver_margenes;
create policy leer_mia on public.ver_margenes for select to authenticated using (user_id = auth.uid());
create or replace function public.puede_ver_margenes() returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from ver_margenes where user_id = auth.uid()) $$;
revoke all on function public.puede_ver_margenes() from public, anon;
grant execute on function public.puede_ver_margenes() to authenticated;
do $$ declare t text; begin
  foreach t in array array['golden_compras','golden_compras_lineas','golden_tesoreria'] loop
    execute format('drop policy if exists leer on public.%I', t);
    execute format('create policy leer on public.%I for select to authenticated using (puede_ver_margenes())', t);
  end loop; end $$;
create or replace function public.golden_margen(p_desde date, p_hasta date, p_por text)
returns table(clave text, nombre text, venta numeric, coste numeric, cantidad numeric, facturas bigint)
language sql stable security invoker set search_path = public as $$
  select case when p_por = 'cliente' then f.cliente_codigo else coalesce(l.producto_codigo, '') end,
         max(case when p_por = 'cliente' then f.cliente_nombre else l.descripcion end),
         round(sum(l.neto), 2), round(sum(l.coste), 2), sum(l.cantidad), count(distinct f.numero)
  from golden_facturas f join golden_lineas l on l.factura_numero = f.numero
  where f.fecha between p_desde and p_hasta and l.neto is not null and puede_ver_margenes()
  group by 1 order by 3 desc nulls last;
$$;
