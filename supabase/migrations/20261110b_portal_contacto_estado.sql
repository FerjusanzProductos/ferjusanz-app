-- ¿Este cliente ya tiene móvil / correo apuntado? (para no pedírselo otra vez en su albarán). No devuelve los datos, solo sí/no.
create or replace function public.portal_contacto_estado(p_token text)
returns jsonb language plpgsql stable security definer set search_path to 'public' as $$
declare v_cli uuid; v_tel text; v_mail text; v_wa text;
begin
  if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false); end if;
  select p.cliente_id into v_cli from public.albaran_enlaces e join public.pedidos p on p.id = e.pedido_id where e.token = p_token;
  if v_cli is null then select cliente_id into v_cli from public.cliente_enlaces where token = p_token; end if;
  if v_cli is null then return jsonb_build_object('ok', false); end if;
  select telefono, email into v_tel, v_mail from public.clientes where id = v_cli;
  select whatsapp into v_wa from harvey.preferencias where cliente_id = v_cli;
  return jsonb_build_object('ok', true,
    'movil', (coalesce(v_wa, '') <> '' or regexp_replace(coalesce(v_tel, ''), '\D', '', 'g') ~ '(^|34)[67][0-9]{8}$'
              or exists (select 1 from public.contactos_portal k where k.cliente_id = v_cli and k.movil is not null and k.estado <> 'descartado')),
    'email', (coalesce(v_mail, '') like '%@%' or exists (select 1 from public.contactos_portal k where k.cliente_id = v_cli and k.email is not null and k.estado <> 'descartado')));
end $$;
revoke all on function public.portal_contacto_estado(text) from public;
grant execute on function public.portal_contacto_estado(text) to anon, authenticated;
