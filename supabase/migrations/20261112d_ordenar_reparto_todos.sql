-- 12/11/2026 (Fernando: «Que puedan todos»): cualquier usuario de la app con puesto
-- (oficina, admin, dirección, repartidores, preparadores…) puede cambiar el ORDEN del reparto
-- de cualquier repartidor. Antes: solo el propio repartidor, oficina y admin.
-- No cambia quién lleva cada pedido (eso sigue en asignar_reparto) ni toca otros datos.
create or replace function public.ordenar_reparto(p_pedidos uuid[])
 returns integer
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare v_rol text := public.rol_actual(); i integer; n integer := 0; c integer;
begin
  if v_rol is null then raise exception 'SIN_PERMISO'; end if;
  if p_pedidos is null or coalesce(array_length(p_pedidos, 1), 0) = 0 then raise exception 'DATOS_NO_VALIDOS'; end if;
  for i in 1 .. array_length(p_pedidos, 1) loop
    update public.pedidos set orden_reparto = i
      where id = p_pedidos[i] and repartidor_id is not null;
    get diagnostics c = row_count;
    if c = 0 then raise exception 'SIN_PERMISO'; end if;
    n := n + c;
  end loop;
  return n;
end $function$;
