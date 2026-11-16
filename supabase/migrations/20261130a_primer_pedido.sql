-- «Imagina tu primer pedido y te calculamos la tarifa» (Fernando, 16/11/2026).
-- El posible cliente rellena en la tarjeta (web /tarjeta/) lo que suele pedir a la semana, qué días quiere el reparto
-- y si le va bien una reunión. Se guarda aquí; la oficina lo ve en Comercial › Avisos y la app calcula su tarifa
-- con la tarifa general (hostelería o colectividades). Los precios no se envían hasta que Fernando los aprueba.
-- No crea clientes ni pedidos. Protecciones: campo trampa, móvil español válido, máximo 40 al día.

create table if not exists public.primer_pedido (
  id uuid primary key default gen_random_uuid(),
  prospecto_id uuid references public.prospectos(id) on delete set null,
  negocio text not null,
  persona text,
  tipo text not null default 'otro',
  localidad text,
  telefono text not null,
  email text,
  productos jsonb not null default '[]'::jsonb,   -- [{item_id, producto_id, nombre, unidad, cantidad}] por semana (item_id = línea de la tarifa de hostelería)
  otros text,
  dias text,
  reunion text,
  notas text,
  aprobado_at timestamptz,                         -- Fernando aprobó los precios (por WhatsApp)
  aprobado_por uuid,
  created_at timestamptz not null default now()
);
alter table public.primer_pedido enable row level security;
drop policy if exists primer_pedido_leer on public.primer_pedido;
create policy primer_pedido_leer on public.primer_pedido for select to authenticated using (rol_actual() = any (array['oficina', 'admin']));
drop policy if exists primer_pedido_cambiar on public.primer_pedido;
create policy primer_pedido_cambiar on public.primer_pedido for update to authenticated
  using (rol_actual() = any (array['oficina', 'admin'])) with check (rol_actual() = any (array['oficina', 'admin']));
drop policy if exists primer_pedido_borrar on public.primer_pedido;
create policy primer_pedido_borrar on public.primer_pedido for delete to authenticated using (rol_actual() = any (array['oficina', 'admin']));

-- Productos que se pueden pedir en el formulario: los de la tarifa general de hostelería, SIN precios.
create or replace function public.primer_pedido_productos()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  -- id = línea de la tarifa (hay productos con dos líneas, p. ej. dos aguacates).
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'unidad', unidad) order by nombre), '[]'::jsonb)
  from public.listas_precios_items
  where lista_id = '014cfef9-273a-422f-8a99-c9f5e7977425'
$$;
revoke all on function public.primer_pedido_productos() from public;
grant execute on function public.primer_pedido_productos() to anon, authenticated;

-- Guarda lo que rellena el posible cliente. p_productos: [{id, cantidad}]; nombre y unidad se toman de la tarifa (no del navegador).
create or replace function public.web_primer_pedido(
  p_negocio text, p_persona text, p_tipo text, p_localidad text, p_telefono text, p_email text,
  p_productos jsonb, p_otros text, p_dias text, p_reunion text, p_notas text,
  p_prospecto uuid default null, p_trampa text default null)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_neg text; v_tipo text; v_tel text; v_mail text; v_prod jsonb; v_pro uuid; v_id uuid; v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if coalesce(p_trampa, '') <> '' then return jsonb_build_object('ok', true); end if; -- robot: se ignora en silencio
  v_neg := left(nullif(trim(coalesce(p_negocio, '')), ''), 100);
  if v_neg is null or length(v_neg) < 2 then return jsonb_build_object('ok', false, 'error', 'nombre'); end if;
  v_tipo := case when p_tipo in ('restaurante','bar','colegio','residencia','escuela_infantil','catering','otro') then p_tipo else 'otro' end;
  v_tel := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  if length(v_tel) = 11 and v_tel like '34%' then v_tel := substr(v_tel, 3); end if;
  if v_tel !~ '^[6789][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'telefono'); end if;
  v_mail := nullif(lower(trim(coalesce(p_email, ''))), '');
  if v_mail is not null and (length(v_mail) > 120 or v_mail !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$') then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  if (select count(*) from public.primer_pedido where created_at > now() - interval '1 day') >= 40 then return jsonb_build_object('ok', false, 'error', 'muchos'); end if;
  -- Solo productos de la tarifa, cantidad entre 0 y 10.000.
  select coalesce(jsonb_agg(jsonb_build_object('item_id', i.id, 'producto_id', i.producto_id, 'nombre', i.nombre, 'unidad', i.unidad, 'cantidad', x.cant) order by i.nombre), '[]'::jsonb)
    into v_prod
    from (select (e->>'id')::uuid id, round(replace(e->>'cantidad', ',', '.')::numeric, 2) cant
            from jsonb_array_elements(case when jsonb_typeof(p_productos) = 'array' then p_productos else '[]'::jsonb end) e
           where (e->>'id') ~ '^[0-9a-f-]{36}$' and (e->>'cantidad') ~ '^\d{1,5}([.,]\d{1,2})?$'
           limit 100) x
    join public.listas_precios_items i on i.lista_id = '014cfef9-273a-422f-8a99-c9f5e7977425' and i.id = x.id
   where x.cant > 0 and x.cant <= 10000;
  -- Contacto: el del enlace personal; si no, el del mismo móvil; si no, uno nuevo.
  select id into v_pro from public.prospectos where id = p_prospecto;
  if v_pro is null then select id into v_pro from public.prospectos where regexp_replace(coalesce(telefono, ''), '\D', '', 'g') like '%' || v_tel order by created_at desc limit 1; end if;
  if v_pro is null then
    insert into public.prospectos (nombre, tipo, localidad, telefono, email, fuente, estado, proximo_contacto)
    values (v_neg, v_tipo, left(nullif(trim(coalesce(p_localidad, '')), ''), 80), v_tel, v_mail, 'Tarjeta: primer pedido', 'interesado', v_hoy)
    returning id into v_pro;
  else -- solo rellena lo vacío: nadie de fuera puede cambiar lo que ya tenemos apuntado
    update public.prospectos set telefono = coalesce(telefono, v_tel), email = coalesce(email, v_mail),
      estado = case when estado in ('nuevo', 'contactado') then 'interesado' else estado end, proximo_contacto = v_hoy
     where id = v_pro;
  end if;
  insert into public.primer_pedido (prospecto_id, negocio, persona, tipo, localidad, telefono, email, productos, otros, dias, reunion, notas)
  values (v_pro, v_neg, left(nullif(trim(coalesce(p_persona, '')), ''), 80), v_tipo, left(nullif(trim(coalesce(p_localidad, '')), ''), 80), v_tel, v_mail, v_prod,
          left(nullif(trim(coalesce(p_otros, '')), ''), 800), left(nullif(trim(coalesce(p_dias, '')), ''), 80),
          left(nullif(trim(coalesce(p_reunion, '')), ''), 200), left(nullif(trim(coalesce(p_notas, '')), ''), 800))
  returning id into v_id;
  insert into public.avisos (tipo, para, titulo, texto, fijado, caduca, creado_por)
  values ('aviso', 'equipo', '🧮 Primer pedido de ' || v_neg,
          'Ha rellenado lo que pide a la semana. Calcula su tarifa en Comercial → Avisos → «Primeros pedidos» y pide la aprobación de Fernando.', true, v_hoy + 3, null);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.web_primer_pedido(text, text, text, text, text, text, jsonb, text, text, text, text, uuid, text) from public;
grant execute on function public.web_primer_pedido(text, text, text, text, text, text, jsonb, text, text, text, text, uuid, text) to anon, authenticated;
