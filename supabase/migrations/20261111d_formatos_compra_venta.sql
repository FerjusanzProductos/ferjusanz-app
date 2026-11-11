-- Formatos de compra y venta editables a mano (propuesta 11/11/2026, SIN APLICAR hasta que Fernando diga «listo»).
-- 1) Nueva unidad «bote» (piparras) en productos, líneas de pedido, sobrante y formatos.
-- 2) Cada producto puede decir cómo se COMPRA si no es igual que como se vende (vacío = igual que la venta),
--    y cuánto trae esa unidad de compra (p. ej. caja de 10 kg), para comparar precios y márgenes bien.
-- No borra ni cambia ningún dato.

alter table public.productos drop constraint if exists productos_unidad_venta_check;
alter table public.productos add constraint productos_unidad_venta_check
  check (unidad_venta = any (array['kg','pieza','caja','saco','bolsa','bandeja','manojo','docena','bote']));

alter table public.lineas_pedido drop constraint if exists lineas_pedido_unidad_pedida_check;
alter table public.lineas_pedido add constraint lineas_pedido_unidad_pedida_check
  check (unidad_pedida = any (array['kg','pieza','caja','saco','bolsa','bandeja','manojo','docena','bote']));

alter table public.sobrante drop constraint if exists sobrante_unidad_check;
alter table public.sobrante add constraint sobrante_unidad_check
  check (unidad = any (array['kg','pieza','caja','saco','bolsa','bandeja','manojo','docena','bote']));

alter table public.formatos_producto drop constraint if exists formatos_producto_formato_check;
alter table public.formatos_producto add constraint formatos_producto_formato_check
  check (formato = any (array['saco','caja','bolsa','bandeja','manojo','pieza','bote']));

alter table public.formatos_cliente drop constraint if exists formatos_cliente_formato_check;
alter table public.formatos_cliente add constraint formatos_cliente_formato_check
  check (formato = any (array['saco','caja','bolsa','bandeja','manojo','pieza','bote']));

alter table public.productos add column if not exists unidad_compra text
  check (unidad_compra is null or unidad_compra = any (array['kg','pieza','caja','saco','bolsa','bandeja','manojo','docena','bote']));
alter table public.productos add column if not exists compra_trae numeric;   -- cuánto trae la unidad de compra en la unidad de venta (p. ej. 10 si la caja trae 10 kg)
comment on column public.productos.unidad_compra is 'Cómo se compra (si es distinto de unidad_venta). Lo edita la oficina a mano en «📦 Formatos de compra y venta».';
comment on column public.productos.compra_trae is 'Cuántas unidades de venta trae una unidad de compra (caja de 10 kg = 10).';
