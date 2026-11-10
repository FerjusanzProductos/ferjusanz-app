-- «Lo de siempre» con el historial de Golden (11/11/2026, pedido por Fernando: «Hazlo con Golden»).
-- Devuelve SOLO las líneas de los últimos 40 albaranes/facturas de Golden de UN cliente
-- (fecha, nº de factura, albarán, código de producto y cantidad; sin precios ni importes),
-- para que cualquiera del equipo que apunta pedidos vea lo que suele llevar ese cliente.
-- Las tablas golden_* siguen siendo solo de oficina y admin.
create or replace function public.memoria_golden(p_cliente uuid)
returns table (fecha date, factura_numero text, albaran text, producto_codigo text, cantidad numeric)
language sql stable security definer set search_path = public as $$
  with f as (
    select gf.numero, gf.fecha
    from golden_facturas gf join clientes c on c.codigo = gf.cliente_codigo
    where c.id = p_cliente
      and rol_actual() = any (array['admin','oficina','secretaria','comercial','compras','direccion','preparador','repartidor'])
    order by gf.fecha desc limit 40)
  select f.fecha, gl.factura_numero, gl.albaran, gl.producto_codigo, gl.cantidad
  from f join golden_lineas gl on gl.factura_numero = f.numero;
$$;
revoke all on function public.memoria_golden(uuid) from public, anon;
grant execute on function public.memoria_golden(uuid) to authenticated;
