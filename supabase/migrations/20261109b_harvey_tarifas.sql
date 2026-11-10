-- Harvey: notas internas, proveedor preferido, coste de compra y borradores de tarifas para clientes nuevos.
-- Solo añade objetos en el esquema harvey. Las listas reales solo cambian al confirmar desde la app.
-- Deshacer: select cron.unschedule('harvey_tarifas_diarias'); drop table harvey.listas_borrador, harvey.listas_auto, harvey.proveedor_preferido, harvey.notas cascade; drop function harvey.coste_compra, harvey.proponer_lista, harvey.proponer_listas_auto;

create table if not exists harvey.notas (id bigserial primary key, tema text not null, texto text not null, activa boolean not null default true, created_at timestamptz not null default now());
create table if not exists harvey.proveedor_preferido (id bigserial primary key, patron text not null, proveedor_id uuid not null references public.proveedores(id), aviso text);
create table if not exists harvey.listas_auto (lista_id uuid primary key references public.listas_precios(id) on delete cascade, margen numeric(6,2) not null, margen_min numeric(6,2) not null, margen_max numeric(6,2) not null, etiqueta text not null);
create table if not exists harvey.listas_borrador (
  id uuid primary key default gen_random_uuid(), lista_id uuid not null references public.listas_precios(id) on delete cascade,
  margen numeric(6,2) not null, items jsonb not null, estado text not null default 'pendiente' check (estado in ('pendiente','aplicado','descartado','reemplazado','deshecho')),
  automatico boolean not null default false, created_at timestamptz not null default now(), resuelto_en timestamptz, resuelto_por uuid, aplicados jsonb);
revoke all on harvey.notas, harvey.proveedor_preferido, harvey.listas_auto, harvey.listas_borrador from anon, authenticated;

insert into harvey.notas (tema, texto) values
 ('patata pelada', 'La patata pelada buena es la de EL PARLEÑO, no la de IBÉRICA PATATAS SELECTAS. Para precios y ofertas de patata pelada usar siempre el precio de compra de El Parleño.'),
 ('patata pelada', 'El Parleño ha subido el precio de la patata pelada (noviembre 2026). Los libros de compras y ventas no están al día: el precio de compra registrado puede estar desfasado. Confirmar con Fernando antes de dar precio.');
insert into harvey.proveedor_preferido (patron, proveedor_id, aviso)
  select 'patat.*pelad', id, 'El Parleño ha subido el precio: el coste registrado puede estar desfasado. Confírmalo.' from public.proveedores where nombre ilike 'EL PARLE%' limit 1;
insert into harvey.listas_auto (lista_id, margen, margen_min, margen_max, etiqueta)
  select id, 0.30, 0.25, 0.30, 'Hostelería (clientes nuevos)' from public.listas_precios where id = '014cfef9-273a-422f-8a99-c9f5e7977425'
  union all select id, 0.20, 0.15, 0.20, 'Colectividades (clientes nuevos)' from public.listas_precios where id = 'ba521bf5-2711-4ec3-baa1-df7936e9a3d3'
  on conflict do nothing;

-- Último precio de compra (30 días). Si el producto tiene proveedor preferido, solo cuenta ese proveedor.
create or replace function harvey.coste_compra(p uuid)
returns table (precio numeric, fecha date, fuente text, unidad text, proveedor text, aviso text)
language sql stable set search_path = public, harvey as $$
  with pref as (select pp.proveedor_id, pp.aviso from harvey.proveedor_preferido pp join public.productos pr on pr.id = p where pr.nombre ~* pp.patron limit 1),
  x as (
    select precio, fecha, 'precio de compra del día'::text as fuente, unidad, null::uuid as proveedor_id from public.precios_compra_dia where producto_id = p
    union all select precio, fecha, 'factura de proveedor', unidad, proveedor_id from public.tarifas_compra where producto_id = p
    union all select precio, fecha, 'factura leída', unidad, proveedor_id from public.lineas_factura_leida where producto_id = p and not coalesce(dudoso, false)
    union all select l.precio_compra, l.created_at::date, 'lote', l.unidad, c.proveedor_id from public.lotes l left join public.compras c on c.id = l.compra_id where l.producto_id = p and l.precio_compra is not null)
  select x.precio, x.fecha, x.fuente, x.unidad, pv.nombre, (select aviso from pref)
  from x left join public.proveedores pv on pv.id = x.proveedor_id
  where x.precio > 0 and x.fecha > current_date - 30
    and (not exists (select 1 from pref) or x.proveedor_id = (select proveedor_id from pref))
  order by x.fecha desc limit 1 $$;

-- Crea un BORRADOR de lista: coste de compra + margen (solo productos por kilo). No toca la lista real.
create or replace function harvey.proponer_lista(p_lista uuid, p_margen numeric, p_auto boolean default false)
returns uuid language plpgsql security definer set search_path = public, harvey as $$
declare v_items jsonb; v_id uuid;
begin
  select coalesce(jsonb_agg(z order by z.nuevo_producto, z.orden nulls last, z.nombre), '[]'::jsonb) into v_items from (
    select i.id as item_id, false as nuevo_producto, i.orden, i.nombre, i.unidad, i.precio as antes, i.coste as coste_antes, i.producto_id,
      c.precio as coste, c.fecha as coste_fecha, c.fuente, c.proveedor, c.unidad as coste_unidad, c.aviso,
      case when c.precio is not null and lower(coalesce(i.unidad, 'kg')) = 'kg' and (c.unidad is null or lower(c.unidad) in ('kg', 'kilo', 'kilos')) then round(c.precio + p_margen, 2) end as nuevo,
      case when i.producto_id is null then 'sin producto enlazado' when c.precio is null then 'sin precio de compra en los últimos 30 días'
           when lower(coalesce(i.unidad, 'kg')) <> 'kg' then 'se vende por ' || i.unidad || ': revisar a mano'
           when c.unidad is not null and lower(c.unidad) not in ('kg', 'kilo', 'kilos') then 'la compra va por ' || c.unidad end as duda
    from public.listas_precios_items i left join lateral harvey.coste_compra(i.producto_id) c on true
    where i.lista_id = p_lista
    union all
    select null, true, null, pr.nombre, coalesce(r.unidad, pr.unidad_precio, 'kg'), null, null, pr.id,
      c.precio, c.fecha, c.fuente, c.proveedor, c.unidad, c.aviso,
      case when c.precio is not null and lower(coalesce(r.unidad, pr.unidad_precio, 'kg')) = 'kg' and (c.unidad is null or lower(c.unidad) in ('kg', 'kilo', 'kilos')) then round(c.precio + p_margen, 2) end,
      case when c.precio is null then 'recomendado, pero sin precio de compra reciente' else 'recomendado de la semana: no está en la lista' end
    from (select distinct on (producto_id) * from public.recomendaciones where producto_id is not null and activa is not false and (desde is null or desde <= current_date) and (hasta is null or hasta >= current_date) order by producto_id, created_at desc) r
    join public.productos pr on pr.id = r.producto_id left join lateral harvey.coste_compra(pr.id) c on true
    where not exists (select 1 from public.listas_precios_items i2 where i2.lista_id = p_lista and i2.producto_id = r.producto_id)
  ) z;
  if p_auto then update harvey.listas_borrador set estado = 'reemplazado', resuelto_en = now() where lista_id = p_lista and estado = 'pendiente'; end if;
  insert into harvey.listas_borrador (lista_id, margen, items, automatico) values (p_lista, p_margen, v_items, p_auto) returning id into v_id;
  return v_id;
end $$;
revoke all on function harvey.proponer_lista(uuid, numeric, boolean), harvey.coste_compra(uuid) from public, anon, authenticated;

create or replace function harvey.proponer_listas_auto() returns void language plpgsql security definer set search_path = public, harvey as $$
declare r record;
begin for r in select * from harvey.listas_auto loop perform harvey.proponer_lista(r.lista_id, r.margen, true); end loop; end $$;
revoke all on function harvey.proponer_listas_auto() from public, anon, authenticated;

-- Cada día a las 7:15 (hora de Madrid en invierno) se preparan los borradores. Nadie los aplica hasta que se confirman.
select cron.schedule('harvey_tarifas_diarias', '15 6 * * *', $$select harvey.proponer_listas_auto()$$);
