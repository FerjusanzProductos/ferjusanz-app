-- Líneas repetidas en golden_lineas (cargas viejas: la misma línea dos veces). Fernando, 18/11/2026: que no salgan dobles, sin borrar nada.
-- Se marcan como «repetida» (se quedan guardadas) y la app deja de verlas. Para volver atrás: update golden_lineas set repetida = false.
alter table public.golden_lineas add column if not exists repetida boolean not null default false;
update public.golden_lineas g set repetida = true
from (select id, row_number() over (partition by factura_numero, orden, descripcion, cantidad, precio, importe
                                    order by (neto is null), id) n from public.golden_lineas) x
where g.id = x.id and x.n > 1 and not g.repetida;
drop policy if exists leer on public.golden_lineas;
create policy leer on public.golden_lineas for select to authenticated
  using (rol_actual() = any (array['oficina','admin']) and not repetida);
create or replace function public.memoria_golden(p_cliente uuid)
 returns table(fecha date, factura_numero text, albaran text, producto_codigo text, cantidad numeric)
 language sql stable security definer set search_path to 'public' as $$
  with f as (
    select gf.numero, gf.fecha
    from golden_facturas gf join clientes c on c.codigo = gf.cliente_codigo
    where c.id = p_cliente
      and rol_actual() = any (array['admin','oficina','secretaria','comercial','compras','direccion','preparador','repartidor'])
    order by gf.fecha desc limit 40)
  select f.fecha, gl.factura_numero, gl.albaran, gl.producto_codigo, gl.cantidad
  from f join golden_lineas gl on gl.factura_numero = f.numero and not gl.repetida;
$$;
