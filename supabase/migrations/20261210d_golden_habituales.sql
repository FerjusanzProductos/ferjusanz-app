-- 🧠 «¿Se le ha olvidado algo?» (24/11/2026, plan de la bandeja de pedidos, paso 2).
-- Lo que un cliente pide a menudo según el historial REAL de Golden (últimos p_dias días), para avisar en
-- «Escribir pedido» de lo que suele pedir y no está en el pedido. Solo lee; no cambia nada.
-- security invoker: cada uno ve lo que las reglas de golden_* ya le dejan ver.
create or replace function public.golden_habituales(p_cliente uuid, p_dias int default 90)
returns table(producto_id uuid, nombre text, veces int, entregas int, ultima date, cantidad_media numeric)
language sql stable security invoker set search_path = public as $$
  with lin as (
    select l.producto_codigo, coalesce(nullif(l.albaran, ''), f.numero) as entrega, f.fecha, l.cantidad
    from golden_facturas f
    join golden_lineas l on l.factura_numero = f.numero
    where f.cliente_codigo = (select codigo from clientes where id = p_cliente)
      and f.fecha >= current_date - p_dias
      and coalesce(l.cantidad, 0) > 0 and l.repetida is not true
  ), tot as (select count(distinct entrega)::int as n from lin)
  select p.id, p.nombre, count(distinct lin.entrega)::int, (select n from tot), max(lin.fecha), round(avg(lin.cantidad), 2)
  from lin join productos p on p.codigo = lin.producto_codigo
  group by p.id, p.nombre
  order by 3 desc, 5 desc;
$$;
revoke all on function public.golden_habituales(uuid, int) from public, anon;
grant execute on function public.golden_habituales(uuid, int) to authenticated;
