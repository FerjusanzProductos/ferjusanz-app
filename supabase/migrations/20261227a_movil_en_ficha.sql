-- El portal de clientes y el envío de albaranes reconocen el móvil aunque la ficha tenga varios teléfonos
-- («91 xxx / 6xx xxx xxx Lorenzo»). Antes solo miraban si el texto entero acababa en un móvil.
create or replace function public.movil_de_texto(p text)
returns text language sql immutable set search_path to 'public' as $$
  select (regexp_match(regexp_replace(coalesce(p, ''), '[\s.\-()]', '', 'g'), '(?:^|[^0-9])(?:\+?34|0034)?([67][0-9]{8})(?![0-9])'))[1]
$$;
revoke all on function public.movil_de_texto(text) from public, anon, authenticated;

CREATE OR REPLACE FUNCTION public.moviles_para_albaran(p_pedidos uuid[])
 RETURNS TABLE(pedido_id uuid, cliente_id uuid, cliente text, movil text)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  return query
  select p.id, c.id, coalesce(c.nombre_comercial, c.nombre),
    coalesce(
      (select right(regexp_replace(pr.whatsapp, '\D', '', 'g'), 9) from harvey.preferencias pr where pr.cliente_id = c.id and coalesce(pr.whatsapp, '') <> ''),
      public.movil_de_texto(c.telefono),
      (select k.movil from public.contactos_portal k where k.cliente_id = c.id and k.movil is not null and k.estado <> 'descartado' order by k.created_at desc limit 1))
  from public.pedidos p join public.clientes c on c.id = p.cliente_id where p.id = any(p_pedidos);
end $function$;

CREATE OR REPLACE FUNCTION public.portal_contacto_estado(p_token text)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare v_cli uuid; v_tel text; v_mail text; v_wa text;
begin
  if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false); end if;
  select p.cliente_id into v_cli from public.albaran_enlaces e join public.pedidos p on p.id = e.pedido_id where e.token = p_token;
  if v_cli is null then select cliente_id into v_cli from public.cliente_enlaces where token = p_token; end if;
  if v_cli is null then return jsonb_build_object('ok', false); end if;
  select telefono, email into v_tel, v_mail from public.clientes where id = v_cli;
  select whatsapp into v_wa from harvey.preferencias where cliente_id = v_cli;
  return jsonb_build_object('ok', true,
    'movil', (coalesce(v_wa, '') <> '' or public.movil_de_texto(v_tel) is not null
              or exists (select 1 from public.contactos_portal k where k.cliente_id = v_cli and k.movil is not null and k.estado <> 'descartado')),
    'email', (coalesce(v_mail, '') like '%@%' or exists (select 1 from public.contactos_portal k where k.cliente_id = v_cli and k.email is not null and k.estado <> 'descartado')));
end $function$;
