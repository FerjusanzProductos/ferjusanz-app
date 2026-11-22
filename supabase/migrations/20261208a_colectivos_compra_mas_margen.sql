-- Tarifa de colectividades = última compra + 0,20 € (Tito, 22/11/2026:
-- «la lista de colectivos un margen de 20 céntimos sobre el precio que nosotros tenemos de compra…
--  patata especial de freír a 0,57 y patata agria a 0,64… que se actualice automáticamente»).
-- Se recalcula sola al apuntar una compra (factura leída en la app o compras de Golden) y cada mañana
-- desde la tarea «Comercial del día», que manda a Tito los cambios y lo que hay que revisar.

alter table public.listas_precios add column if not exists margen_auto numeric(10,3);
comment on column public.listas_precios.margen_auto is 'Si tiene valor: precio = última compra + este margen (en €), automático';

alter table public.listas_precios_items
  add column if not exists precio_fijo boolean not null default false,
  add column if not exists compra_ref numeric(10,3),
  add column if not exists compra_fecha date,
  add column if not exists compra_origen text,
  add column if not exists auto_aviso text,
  add column if not exists auto_at timestamptz;
comment on column public.listas_precios_items.precio_fijo is 'Precio puesto por Fernando: el cálculo automático no lo toca';
comment on column public.listas_precios_items.auto_aviso is 'Por qué el cálculo automático no ha puesto precio (revisar a mano)';

create table if not exists public.listas_precios_cambios (
  id bigserial primary key,
  creado timestamptz not null default now(),
  lista_id uuid, item_id uuid, nombre text, unidad text,
  antes numeric(10,3), despues numeric(10,3),
  compra numeric(10,3), compra_fecha date, compra_origen text
);
alter table public.listas_precios_cambios enable row level security;
drop policy if exists leer on public.listas_precios_cambios;
create policy leer on public.listas_precios_cambios for select using (rol_actual() = any (array['oficina','admin']));

create index if not exists golden_compras_lineas_producto on public.golden_compras_lineas (producto_codigo);

-- Recalcula los precios automáticos (todas las listas con margen_auto, o solo un producto).
create or replace function public.recalcular_listas_auto(p_producto uuid default null)
returns integer language plpgsql security definer set search_path = public as $$
declare
  it record; c record; v_coste numeric; v_precio numeric; v_aviso text; n int := 0;
begin
  for it in
    select i.*, l.margen_auto, p.codigo, p.unidad_venta, p.unidad_compra, p.compra_trae
      from listas_precios_items i
      join listas_precios l on l.id = i.lista_id
      left join productos p on p.id = i.producto_id
     where l.margen_auto is not null and not i.precio_fijo
       and (p_producto is null or i.producto_id = p_producto)
  loop
    v_coste := null; v_aviso := null; c := null;
    if it.producto_id is null then
      v_aviso := 'Sin producto enlazado';
    else
      -- Última compra: factura leída en la app (tarifas_compra) o compra de Golden; la más reciente.
      select * into c from (
        select tc.fecha, tc.precio, coalesce(nullif(tc.unidad, ''), it.unidad_venta) unidad,
               'factura ' || coalesce(pr.nombre, '') origen, 1 pref
          from tarifas_compra tc left join proveedores pr on pr.id = tc.proveedor_id
         where tc.producto_id = it.producto_id and tc.precio > 0
        union all
        -- Golden apunta en la unidad en que se compra (p. ej. coliflor por caja de 6) si el producto la tiene.
        select g.fecha, gl.precio, coalesce(nullif(it.unidad_compra, ''), it.unidad_venta), 'Golden ' || coalesce(g.proveedor_nombre, ''), 2
          from golden_compras_lineas gl join golden_compras g on g.numero = gl.compra_numero
         where it.codigo is not null and gl.producto_codigo = it.codigo and gl.precio > 0 and coalesce(gl.cantidad, 1) > 0
      ) x order by fecha desc nulls last, pref limit 1;
      if c is null then
        v_aviso := 'Sin precio de compra';
      elsif lower(trim(c.unidad)) = lower(trim(it.unidad)) then
        v_coste := c.precio;
      elsif it.compra_trae > 0 and lower(trim(c.unidad)) = lower(trim(it.unidad_compra)) and lower(trim(it.unidad)) = lower(trim(it.unidad_venta)) then
        v_coste := round(c.precio / it.compra_trae, 3);
      else
        v_aviso := 'Se compra por ' || coalesce(c.unidad, '?') || ' (' || c.precio || ' €) y la lista va por ' || coalesce(it.unidad, '?') || ': ponlo a mano';
      end if;
    end if;

    if v_coste is null then
      update listas_precios_items set auto_aviso = v_aviso, auto_at = now()
       where id = it.id and auto_aviso is distinct from v_aviso;
      continue;
    end if;

    v_precio := round(v_coste + it.margen_auto, 2);
    if it.precio is distinct from v_precio then
      insert into listas_precios_cambios (lista_id, item_id, nombre, unidad, antes, despues, compra, compra_fecha, compra_origen)
      values (it.lista_id, it.id, it.nombre, it.unidad, it.precio, v_precio, v_coste, c.fecha, c.origen);
      n := n + 1;
    end if;
    update listas_precios_items
       set precio = v_precio, coste = v_coste, compra_ref = c.precio, compra_fecha = c.fecha, compra_origen = c.origen,
           auto_aviso = null, auto_at = now()
     where id = it.id
       and (precio is distinct from v_precio or coste is distinct from v_coste or compra_fecha is distinct from c.fecha
            or compra_origen is distinct from c.origen or auto_aviso is not null);
  end loop;
  return n;
end $$;
revoke all on function public.recalcular_listas_auto(uuid) from public, anon;
grant execute on function public.recalcular_listas_auto(uuid) to authenticated;

-- Al apuntar una compra se recalcula ese producto. Si algo falla, la compra se guarda igual.
create or replace function public.trg_listas_auto_tc() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from listas_precios where margen_auto is not null) then
    perform recalcular_listas_auto(new.producto_id);
  end if;
  return null;
exception when others then
  raise warning 'recalcular_listas_auto: %', sqlerrm; return null;
end $$;

create or replace function public.trg_listas_auto_golden() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  select p.id into v_id from productos p where p.codigo = new.producto_codigo limit 1;
  if v_id is not null and exists (select 1 from listas_precios_items i join listas_precios l on l.id = i.lista_id
                                   where i.producto_id = v_id and l.margen_auto is not null) then
    perform recalcular_listas_auto(v_id);
  end if;
  return null;
exception when others then
  raise warning 'recalcular_listas_auto: %', sqlerrm; return null;
end $$;

drop trigger if exists trg_listas_auto on public.tarifas_compra;
create trigger trg_listas_auto after insert or update of precio, fecha, unidad on public.tarifas_compra
  for each row execute function public.trg_listas_auto_tc();
drop trigger if exists trg_listas_auto on public.golden_compras_lineas;
create trigger trg_listas_auto after insert or update of precio on public.golden_compras_lineas
  for each row execute function public.trg_listas_auto_golden();

-- Datos: la lista de colegios, residencias y escuelas infantiles pasa a «compra + 0,20 €».
update listas_precios set margen_auto = 0.20 where nombre = 'Colegios, residencias y escuelas infantiles';

-- Patatas con precio fijo (Tito): especial freír 0,57 y agria 0,64.
update listas_precios_items i set precio = 0.57, precio_fijo = true, auto_aviso = null
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Colegios, residencias y escuelas infantiles'
   and i.producto_id = (select id from productos where codigo = '09-F');
update listas_precios_items i set precio = 0.64, precio_fijo = true, auto_aviso = null
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Colegios, residencias y escuelas infantiles'
   and i.producto_id = (select id from productos where codigo = '01');

-- Enlaces según docs/REGLAS_INTERNAS.md: tomate ensalada = 91-EN; naranja de zumo = fruta (42), no zumo embotellado;
-- manzana en caja = golden (105).
update listas_precios_items i set producto_id = (select id from productos where codigo = '91-EN')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Colegios, residencias y escuelas infantiles' and i.nombre = 'Tomate ensalada';
update listas_precios_items i set producto_id = (select id from productos where codigo = '42')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Colegios, residencias y escuelas infantiles' and i.nombre in ('Naranja de zumo', 'Naranja zumo');
update listas_precios_items i set producto_id = (select id from productos where codigo = '105')
  from listas_precios l where l.id = i.lista_id and l.nombre = 'Colegios, residencias y escuelas infantiles' and i.nombre = 'Manzana';

-- Limas: se venden por caja (Tito: «es 20,30 euros, la caja»), en todas las listas.
update listas_precios_items set unidad = 'caja'
 where producto_id = (select id from productos where codigo = '43') and unidad is distinct from 'caja';

select public.recalcular_listas_auto();
