-- 🔒 Reuniones de prioridades (Tito, 28/11/2026: «Vale» a cerrar la rendija): el resumen y las filas de Cobros/Pagos
-- pueden llevar importes de Golden. La tabla solo la leen quienes ven cobros (puede_ver_cobros); el resto de la oficina
-- lee la última reunión con oficina_ultima_reunion(), sin resumen y solo con departamentos conocidos que no son de dinero.
drop policy if exists oficina_reuniones_ver on public.oficina_reuniones;
create policy oficina_reuniones_ver on public.oficina_reuniones for select
  using (puede_ver_cobros() and exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false));

create or replace function public.oficina_ultima_reunion() returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare r oficina_reuniones;
begin
  if not exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false) then
    raise exception 'Solo la oficina puede ver la reunión';
  end if;
  select * into r from oficina_reuniones order by id desc limit 1;
  if r.id is null then return null; end if;
  if puede_ver_cobros() then
    return jsonb_build_object('id', r.id, 'creado', r.creado, 'filas', r.filas, 'resumen', r.resumen);
  end if;
  -- Mismos departamentos que la app (OF_DEP), por sus 5 primeras letras, sin Cobros ni Pagos.
  return jsonb_build_object('id', r.id, 'creado', r.creado, 'resumen', null, 'filas', coalesce((select jsonb_agg(f) from jsonb_array_elements(r.filas) f
    where left(lower(coalesce(f->>'dep', '')), 5) in ('venta', 'comer', 'factu', 'clien', 'infor', 'datos')), '[]'::jsonb));
end $$;
revoke all on function public.oficina_ultima_reunion() from public, anon;
grant execute on function public.oficina_ultima_reunion() to authenticated;
