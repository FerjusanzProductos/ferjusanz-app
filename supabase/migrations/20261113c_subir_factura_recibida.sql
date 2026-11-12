-- AÑADIR A MANO una factura de proveedor a la bandeja «Facturas de proveedores» (fase 3 de facturación).
-- Hasta ahora solo entraban las que llegan por correo. Con esto, una factura en PDF o en foto (de papel)
-- también entra en la bandeja y en «🧾 NIF e IVA», y así llegará al listado de COMPRAS de Jorge.
-- No cambia ni borra nada: solo deja AÑADIR una factura nueva. Pueden compras, oficina y admin.
create or replace function public.anadir_factura_recibida(p_ruta text, p_nombre text, p_proveedor uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_id uuid;
begin
  if rol_actual() is null or rol_actual() <> all (array['compras', 'oficina', 'admin']) then raise exception 'No tienes permiso para esto'; end if;
  if coalesce(p_ruta, '') !~ '^recibidas/' then raise exception 'Ruta de archivo no válida'; end if;
  insert into public.facturas_recibidas (remitente, asunto, ruta, nombre, proveedor_id, estado)
  values ('subida a mano', 'Factura añadida desde la app', p_ruta, nullif(btrim(coalesce(p_nombre, '')), ''), p_proveedor, 'nueva')
  returning id into v_id;
  return v_id;
end $$;
revoke all on function public.anadir_factura_recibida(text, text, uuid) from public, anon;
grant execute on function public.anadir_factura_recibida(text, text, uuid) to authenticated;
