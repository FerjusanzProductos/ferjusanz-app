-- SEGUIMIENTO DIARIO dentro de la app (11/11/2026, pedido por Fernando).
-- Cada mañana a las 6:30 (Madrid) Supabase prepara el «comercial del día» y lo guarda en seguimiento_diario.
-- La app lo enseña en Inicio › Lo de hoy › «📞 Seguimiento comercial de hoy», con botones de WhatsApp.
-- Solo LEE pedidos, clientes, prospectos, Golden y cobros: no cambia nada de eso ni envía mensajes.
-- Una sola instrucción por bloque, para que también funcione pegado en el editor SQL de Supabase.

create table if not exists public.seguimiento_diario (
  fecha date primary key,
  datos jsonb not null,
  creado timestamptz not null default now()
);
alter table public.seguimiento_diario enable row level security;
drop policy if exists leer on public.seguimiento_diario;
create policy leer on public.seguimiento_diario for select to authenticated
  using (rol_actual() = any (array['admin','oficina','comercial','secretaria','direccion']));

create or replace function public.generar_seguimiento()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  hoy date := (now() at time zone 'Europe/Madrid')::date;
  gmax date := (select max(fecha) from golden_facturas);
  d jsonb;
begin
  -- Desde la app solo pueden generarlo a mano admin y oficina; el programador (sin usuario) siempre puede.
  if auth.uid() is not null and coalesce(rol_actual(), '') not in ('admin','oficina') then
    raise exception 'Solo oficina o admin';
  end if;
  d := jsonb_build_object(
    'fecha', hoy,
    'previstos_hoy', (select count(*) from pedidos where fecha_entrega = hoy and estado = 'previsto' and not coalesce(archivado, false)),
    'previstos_manana', (select count(*) from pedidos where fecha_entrega = hoy + 1 and estado = 'previsto' and not coalesce(archivado, false)),
    -- A quién llamar: los que tienen fecha de volver a llamar (hoy o pasada) y, si no hay, los contactos nuevos sin tocar
    'llamar', (select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('id', id, 'nombre', nombre, 'tipo', tipo, 'localidad', localidad, 'notas', left(coalesce(notas, ''), 160),
               'telefono', telefono, 'proximo', proximo_contacto, 'motivo', case when proximo_contacto <= hoy then 'volver a llamar' else 'contacto nuevo' end) as x
        from prospectos
        where (proximo_contacto <= hoy) or (proximo_contacto is null and coalesce(estado, 'nuevo') = 'nuevo')
        order by (proximo_contacto is null), proximo_contacto, created_at desc
        limit 8) s),
    -- Clientes que han dejado de pedir: en Golden muchos tienen UNA factura al mes, así que «perdido» = al menos 3 facturas
    -- en los últimos 5 meses y más de 45 días sin factura (contados desde la última importación de Golden, gmax),
    -- y que tampoco hayan pedido por la app en las últimas 3 semanas.
    'perdidos', (select coalesce(jsonb_agg(x order by (x->>'gasto')::numeric desc), '[]'::jsonb) from (
        select jsonb_build_object('id', c.id, 'nombre', coalesce(nullif(c.nombre_comercial, ''), c.nombre), 'telefono', c.telefono,
               'ultimo', greatest(g.ultimo, a.ultimo), 'dias', g.dias, 'compras', g.n, 'gasto', round(g.gasto),
               'productos', (select coalesce(jsonb_agg(pn), '[]'::jsonb) from (
                   select p.nombre as pn from golden_lineas gl join golden_facturas gf on gf.numero = gl.factura_numero
                   join productos p on p.codigo = gl.producto_codigo
                   where gf.cliente_codigo = c.codigo and gf.fecha > gmax - 150
                   group by p.nombre order by count(*) desc limit 3) t)) as x
        from clientes c
        join (select cliente_codigo, max(fecha) as ultimo, count(*) as n, sum(base) as gasto, gmax - max(fecha) as dias
              from golden_facturas where fecha > gmax - 150 group by cliente_codigo) g on g.cliente_codigo = c.codigo
        left join (select cliente_id, max(fecha_entrega) as ultimo from pedidos
                   where estado not in ('previsto', 'anulado') and fecha_entrega <= hoy group by cliente_id) a on a.cliente_id = c.id
        where c.activo and g.n >= 3 and g.dias > 45 and (a.ultimo is null or a.ultimo < hoy - 21)
        order by g.gasto desc
        limit 5) s),
    -- Cobros: lo pendiente de hace más de 30 días, por cliente
    'cobros', (select coalesce(jsonb_agg(x order by (x->>'pendiente')::numeric desc), '[]'::jsonb) from (
        select jsonb_build_object('id', v.cliente_id, 'nombre', max(v.cliente_nombre), 'pendiente', round(sum(v.pendiente), 2),
               'desde', min(v.fecha_entrega), 'telefono', max(c.telefono)) as x
        from v_pedidos_importe v left join clientes c on c.id = v.cliente_id
        where v.pendiente > 0.009 and v.fecha_entrega < hoy - 30
        group by v.cliente_id order by sum(v.pendiente) desc limit 5) s),
    'golden_hasta', gmax);
  insert into seguimiento_diario (fecha, datos, creado) values (hoy, d, now())
    on conflict (fecha) do update set datos = excluded.datos, creado = now();
  return d;
end $$;
revoke all on function public.generar_seguimiento() from public, anon;
grant execute on function public.generar_seguimiento() to authenticated;

-- Programarlo cada día a las 5:30 UTC (6:30 en Madrid en invierno, 7:30 en verano)
select cron.schedule('ferjusanz-seguimiento', '30 5 * * *', 'select public.generar_seguimiento()');
