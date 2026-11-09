-- Productos con «nombre para el albarán» (lo que ve el cliente). Ej.: las patatas para freír salen siempre como «Patata esp. freír».
-- Internamente (preparar, compra, carga, copia rosa de oficina) se ve el nombre real.
alter table public.productos add column if not exists nombre_albaran text;
update public.productos set nombre = 'Patata especial para freír', nombre_albaran = 'Patata esp. freír', activo = true, unidad_venta = 'kg', unidad_precio = 'kg', iva = 4 where codigo = '01-F';
insert into public.productos (codigo, nombre, nombre_albaran, unidad_venta, unidad_precio, iva, iva_origen, activo)
  select '09-F', 'Patata nueva especial para freír', 'Patata esp. freír', 'kg', 'kg', 4, 'manual', true
  where not exists (select 1 from public.productos where codigo = '09-F');

-- Además, en _albaran_json_base: 'nombre', coalesce(pr.nombre_albaran, pr.nombre)
