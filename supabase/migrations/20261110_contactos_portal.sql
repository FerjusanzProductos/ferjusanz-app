-- Móvil y correo que deja el propio cliente al abrir su albarán o su página (QR / enlace).
-- Solo se guarda: la oficina lo revisa y lo pasa a la ficha. Nada se envía solo.
create table if not exists public.contactos_portal (
  id bigserial primary key,
  cliente_id uuid not null references public.clientes(id),
  movil text,
  email text,
  nombre text,
  origen text,
  created_at timestamptz not null default now(),
  estado text not null default 'nuevo' check (estado in ('nuevo', 'guardado', 'descartado')),
  resuelto_por uuid,
  resuelto_en timestamptz
);
create index if not exists contactos_portal_estado_idx on public.contactos_portal (estado, created_at desc);
alter table public.contactos_portal enable row level security;
create policy contactos_portal_ver on public.contactos_portal for select to authenticated using (public.rol_actual() in ('admin', 'oficina'));
create policy contactos_portal_cambiar on public.contactos_portal for update to authenticated using (public.rol_actual() in ('admin', 'oficina')) with check (public.rol_actual() in ('admin', 'oficina'));
grant select, update on public.contactos_portal to authenticated;

create or replace function public.portal_guardar_contacto(p_token text, p_movil text, p_email text, p_nombre text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_cli uuid; v_mov text; v_mail text; v_origen text;
begin
  if p_token is null or length(p_token) <> 32 then return jsonb_build_object('ok', false, 'error', 'enlace'); end if;
  select p.cliente_id into v_cli from public.albaran_enlaces e join public.pedidos p on p.id = e.pedido_id where e.token = p_token;
  if v_cli is not null then v_origen := 'albaran'; else select cliente_id into v_cli from public.cliente_enlaces where token = p_token; v_origen := 'pagina'; end if;
  if v_cli is null then return jsonb_build_object('ok', false, 'error', 'enlace'); end if;
  v_mov := regexp_replace(coalesce(p_movil, ''), '\D', '', 'g');
  if length(v_mov) = 11 and v_mov like '34%' then v_mov := substr(v_mov, 3); end if;
  if v_mov = '' then v_mov := null; elsif v_mov !~ '^[67][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'movil'); end if;
  v_mail := nullif(lower(trim(coalesce(p_email, ''))), '');
  if v_mail is not null and (length(v_mail) > 120 or v_mail !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$') then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  if v_mov is null and v_mail is null then return jsonb_build_object('ok', false, 'error', 'vacio'); end if;
  if (select count(*) from public.contactos_portal where cliente_id = v_cli and created_at > now() - interval '1 day') >= 5 then return jsonb_build_object('ok', false, 'error', 'muchos'); end if;
  insert into public.contactos_portal (cliente_id, movil, email, nombre, origen) values (v_cli, v_mov, v_mail, left(nullif(trim(coalesce(p_nombre, '')), ''), 80), v_origen);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.portal_guardar_contacto(text, text, text, text) from public;
grant execute on function public.portal_guardar_contacto(text, text, text, text) to anon, authenticated;
