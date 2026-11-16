-- Primer pedido (16/11/2026, Fernando: «no quiero Limones 1ª, Limones a secas; tampoco Tomate Rambo, Tomate ensalada a secas»).
-- Los 19 típicos se enseñan con un nombre sencillo (solo en el formulario; lo guardado y lo que ve la oficina es el producto real).
create or replace function public.primer_pedido_productos()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'nombre', coalesce((array['Patatas', 'Patatas peladas (bastón)', 'Cebollas', 'Ajos', 'Ajo pelado', 'Pimiento rojo', 'Pimiento verde', 'Tomate pera', 'Tomate ensalada', 'Naranjas de zumo', 'Limones', 'Berenjenas', 'Calabacín', 'Zanahorias', 'Calabaza', 'Piña', 'Manzanas', 'Plátanos', 'Peras'])[dest], nombre), 'unidad', unidad_venta, 'familia', familia, 'dest', dest) order by orden, nombre), '[]'::jsonb)
  from (select distinct on (lower(trim(nombre))) id, trim(nombre) nombre, unidad_venta, primer_pedido_familia(nombre) familia,
               array_position(array['Patata Agria', 'Patatas Peladas Baston', 'Cebollas Gordas Calibre 2-3', 'Ajos Extras', 'Ajo pelado', 'Pimiento rojo extra', 'Pimiento Verde extra', 'Tomate pera', 'Tomate ensalada', 'Naranjas de zumo 1ª cal-5-6', 'Limones 1ª', 'Berenjenas', 'Calabacín', 'Zanahorias', 'Calabaza carruecano', 'Piña del monte', 'Manzana Golden perlin', 'Plátano extra', 'Pera conferencia'], trim(nombre)) dest,
               array_position(array['Patatas (también peladas y cortadas)', 'Cebollas, ajos y puerros', 'Huevos', 'Verduras y hortalizas',
                 'Tomates, pimientos y picantes', 'Lechugas, ensaladas y brotes', 'Frutas', 'Setas', 'Hierbas y aromáticas', 'Legumbres y despensa'],
                 primer_pedido_familia(nombre)) orden
          from public.productos where activo and nombre !~* 'bandeja de flores' order by lower(trim(nombre)), created_at) p
$$;
revoke all on function public.primer_pedido_productos() from public;
grant execute on function public.primer_pedido_productos() to anon, authenticated;
