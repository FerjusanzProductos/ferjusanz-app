-- Golden → app: coste y margen de cada venta, compras a proveedores y cobros/pagos (tesorería).
-- Solo lectura en la app (oficina y admin), como las demás golden_*. Lo rellenan los scripts de scripts/golden/.
alter table public.golden_lineas add column if not exists neto numeric, add column if not exists coste numeric;  -- sin IVA; coste = Uds × «Precio costo» de Golden
alter table public.golden_facturas add column if not exists coste numeric;  -- «Costos Brutos» de la cabecera

create table if not exists public.golden_compras (
  id uuid primary key default gen_random_uuid(),
  numero text not null unique,           -- Serie/Numero de Golden (facturas de compra, Tipo F)
  serie text, fecha date, su_numero text,
  proveedor_codigo text, proveedor_nombre text,
  base numeric, total numeric, n_lineas int);
create table if not exists public.golden_compras_lineas (
  id uuid primary key default gen_random_uuid(),
  compra_numero text not null references public.golden_compras(numero),
  orden int not null, producto_codigo text, descripcion text,
  cantidad numeric, precio numeric, iva numeric, neto numeric,
  unique (compra_numero, orden));
create table if not exists public.golden_tesoreria (
  contador int primary key,              -- «Contador» de Golden: el mismo vencimiento se actualiza al cobrarse/pagarse
  tipo text not null,                    -- C = cobro a cliente, P = pago a proveedor
  estado text,                           -- PEN pendiente, CO cobrado, PA pagado
  vencimiento date, total numeric, serie text, numero text, fecha_factura date,
  codigo text, nombre text, fecha_cobro_pago date, forma_pago text,
  actualizado timestamptz default now());
create index if not exists golden_tesoreria_pen on public.golden_tesoreria (tipo, vencimiento) where estado = 'PEN';
create index if not exists golden_compras_fecha on public.golden_compras (fecha);
create index if not exists golden_facturas_fecha on public.golden_facturas (fecha);

do $$ declare t text; begin
  foreach t in array array['golden_compras','golden_compras_lineas','golden_tesoreria'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon', t);
    execute format('drop policy if exists leer on public.%I', t);
    execute format('create policy leer on public.%I for select to authenticated using (rol_actual() = any (array[''oficina'',''admin'']))', t);
  end loop; end $$;

-- Margen de ventas (igual que el «Listado de beneficios» de Golden: base sin IVA − coste; incluye borradores).
create or replace function public.golden_margen(p_desde date, p_hasta date, p_por text)
returns table(clave text, nombre text, venta numeric, coste numeric, cantidad numeric, facturas bigint)
language sql stable security invoker set search_path = public as $$
  select case when p_por = 'cliente' then f.cliente_codigo else coalesce(l.producto_codigo, '') end,
         max(case when p_por = 'cliente' then f.cliente_nombre else l.descripcion end),
         round(sum(l.neto), 2), round(sum(l.coste), 2), sum(l.cantidad), count(distinct f.numero)
  from golden_facturas f join golden_lineas l on l.factura_numero = f.numero
  where f.fecha between p_desde and p_hasta and l.neto is not null
  group by 1 order by 3 desc nulls last;
$$;
create or replace function public.golden_compras_por(p_desde date, p_hasta date)
returns table(clave text, nombre text, base numeric, total numeric, facturas bigint)
language sql stable security invoker set search_path = public as $$
  select proveedor_codigo, max(proveedor_nombre), round(sum(base), 2), round(sum(total), 2), count(*)
  from golden_compras where fecha between p_desde and p_hasta group by 1 order by 3 desc nulls last;
$$;
create or replace function public.golden_compras_productos(p_prov text, p_desde date, p_hasta date)
returns table(clave text, nombre text, cantidad numeric, neto numeric)
language sql stable security invoker set search_path = public as $$
  select coalesce(l.producto_codigo, ''), max(l.descripcion), sum(l.cantidad), round(sum(l.neto), 2)
  from golden_compras c join golden_compras_lineas l on l.compra_numero = c.numero
  where c.proveedor_codigo = p_prov and c.fecha between p_desde and p_hasta group by 1 order by 4 desc nulls last;
$$;
revoke all on function public.golden_margen(date, date, text), public.golden_compras_por(date, date), public.golden_compras_productos(text, date, date) from public, anon;
grant execute on function public.golden_margen(date, date, text), public.golden_compras_por(date, date), public.golden_compras_productos(text, date, date) to authenticated;
