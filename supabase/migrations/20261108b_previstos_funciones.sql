-- Pedidos previstos a partir de los pedidos fijos (pedidos_habituales).
-- generar_previstos(p_dias): crea, para hoy y los próximos p_dias días, un pedido en estado «previsto»
--   por cada pedido fijo activo (salvo tipo «si_llama») cuyo día de la semana toque, con su repartidor.
--   No duplica: marca cada uno con hash_origen = 'fijo:<habitual>:<fecha>' y no lo vuelve a crear aunque
--   después se anule («No se hace»). Tampoco lo crea si el cliente ya tiene otro pedido ese día.
-- confirmar_previsto(p_pedido, p_hacer): cualquiera con usuario activo confirma (pasa a «pendiente»)
--   o descarta (pasa a «anulado») un pedido previsto. Solo actúa sobre pedidos en estado «previsto».

create or replace function public.generar_previstos(p_dias int default 14)
returns int language plpgsql security definer set search_path = public as $$
declare
  n int := 0; d date; h record; nuevo uuid; marca text; hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if auth.uid() is not null and public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  for d in select generate_series(hoy, hoy + least(greatest(coalesce(p_dias, 14), 0), 31), interval '1 day')::date loop
    for h in
      select ph.id, ph.cliente_id, ph.repartidor_id, ph.tipo, ph.notas
      from public.pedidos_habituales ph join public.clientes c on c.id = ph.cliente_id
      where ph.activo and c.activo and ph.tipo <> 'si_llama' and extract(dow from d)::int = any(ph.dias_semana)
      order by ph.created_at
    loop
      marca := 'fijo:' || h.id || ':' || d;
      continue when exists (select 1 from public.pedidos where hash_origen = marca);
      continue when exists (select 1 from public.pedidos where cliente_id = h.cliente_id and fecha_entrega = d
                            and estado <> 'anulado' and not coalesce(archivado, false));
      insert into public.pedidos (cliente_id, fecha_entrega, estado, notas, repartidor_id, origen, hash_origen, creado_por)
      values (h.cliente_id, d, 'previsto',
              concat_ws(' · ',
                case h.tipo when 'no_siempre' then 'Fijo «no siempre»: confirmar si lo quiere'
                            when 'especifico' then 'Pedido específico: preguntar qué quiere'
                            else 'Pedido fijo' end,
                case when nullif(trim(h.notas), '') is not null then 'Suele llevar: ' || trim(h.notas) end),
              h.repartidor_id, 'fijo', marca, null)
      returning id into nuevo;
      insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, unidad_precio)
      select nuevo, lh.producto_id, lh.cantidad, lh.unidad, coalesce(p.unidad_precio, 'kg')
      from public.lineas_habituales lh join public.productos p on p.id = lh.producto_id
      where lh.habitual_id = h.id and p.activo;
      n := n + 1;
    end loop;
  end loop;
  return n;
end $$;

create or replace function public.confirmar_previsto(p_pedido uuid, p_hacer boolean)
returns text language plpgsql security definer set search_path = public as $$
declare v_estado text;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select estado into v_estado from public.pedidos where id = p_pedido for update;
  if v_estado is null then raise exception 'PEDIDO_NO_EXISTE'; end if;
  if v_estado <> 'previsto' then raise exception 'NO_ES_PREVISTO'; end if;
  update public.pedidos set estado = case when p_hacer then 'pendiente' else 'anulado' end where id = p_pedido;
  return case when p_hacer then 'pendiente' else 'anulado' end;
end $$;

revoke all on function public.generar_previstos(int) from public, anon;
revoke all on function public.confirmar_previsto(uuid, boolean) from public, anon;
grant execute on function public.generar_previstos(int) to authenticated;
grant execute on function public.confirmar_previsto(uuid, boolean) to authenticated;

-- Todos los días a las 4:15 (hora UTC ≈ 5:15/6:15 en Madrid) se preparan los previstos de las próximas 2 semanas.
create extension if not exists pg_cron;
select cron.schedule('ferjusanz-previstos', '15 4 * * *', $$select public.generar_previstos(14)$$);
