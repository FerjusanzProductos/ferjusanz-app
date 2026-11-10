-- Para que el repartidor mande el albarán desde SU WhatsApp: móvil del cliente (ficha, Harvey o el que dejó al escanear el QR)
-- y apuntar uno nuevo si el cliente se lo da en la entrega (queda en «Móviles y correos de clientes» para que la oficina lo revise).
create or replace function public.moviles_para_albaran(p_pedidos uuid[])
returns table (pedido_id uuid, cliente_id uuid, cliente text, movil text)
language plpgsql stable security definer set search_path to 'public' as $$
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  return query
  select p.id, c.id, coalesce(c.nombre_comercial, c.nombre),
    coalesce(
      (select right(regexp_replace(pr.whatsapp, '\D', '', 'g'), 9) from harvey.preferencias pr where pr.cliente_id = c.id and coalesce(pr.whatsapp, '') <> ''),
      case when right(regexp_replace(coalesce(c.telefono, ''), '\D', '', 'g'), 9) ~ '^[67][0-9]{8}$' then right(regexp_replace(c.telefono, '\D', '', 'g'), 9) end,
      (select k.movil from public.contactos_portal k where k.cliente_id = c.id and k.movil is not null and k.estado <> 'descartado' order by k.created_at desc limit 1))
  from public.pedidos p join public.clientes c on c.id = p.cliente_id where p.id = any(p_pedidos);
end $$;
revoke all on function public.moviles_para_albaran(uuid[]) from public;
grant execute on function public.moviles_para_albaran(uuid[]) to authenticated;

create or replace function public.apuntar_movil_cliente(p_pedido uuid, p_movil text)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_cli uuid; v_mov text;
begin
  if public.rol_actual() is null then raise exception 'SIN_PERMISO'; end if;
  select cliente_id into v_cli from public.pedidos where id = p_pedido; if v_cli is null then return jsonb_build_object('ok', false); end if;
  v_mov := regexp_replace(coalesce(p_movil, ''), '\D', '', 'g'); if length(v_mov) = 11 and v_mov like '34%' then v_mov := substr(v_mov, 3); end if;
  if v_mov !~ '^[67][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'movil'); end if;
  if not exists (select 1 from public.contactos_portal where cliente_id = v_cli and movil = v_mov and estado <> 'descartado') then
    insert into public.contactos_portal (cliente_id, movil, origen, nombre) values (v_cli, v_mov, 'repartidor', (select nombre from public.perfiles where id = auth.uid()));
  end if;
  return jsonb_build_object('ok', true, 'movil', v_mov);
end $$;
revoke all on function public.apuntar_movil_cliente(uuid, text) from public;
grant execute on function public.apuntar_movil_cliente(uuid, text) to authenticated;
