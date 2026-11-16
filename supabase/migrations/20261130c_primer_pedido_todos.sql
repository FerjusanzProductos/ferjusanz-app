-- Primer pedido (16/11/2026, Fernando: «en productos no veo las patatas, ni las cebollas, ni los huevos… tiene que ser mucho más»).
-- El formulario de la tarjeta enseña TODOS los productos activos (antes, solo los 75 de la tarifa de hostelería),
-- agrupados por familias (por palabras del nombre; los que no encajan, «Verduras y hortalizas»). Sin precios.
-- web_primer_pedido guarda ahora el id de producto (producto_id); la app calcula el precio con la tarifa por producto.

create or replace function public.primer_pedido_familia(n text) returns text language sql immutable as $$
  select case
    when n ~* 'huevo' then 'Huevos'
    when n ~* 'patata|batata|yuca' then 'Patatas (también peladas y cortadas)'
    when n ~* 'champi|seta|shitaki|portobello' then 'Setas'
    when n ~* 'tomate|pimiento|chile|habanero|piparra|ñora' and n !~* 'tarro' then 'Tomates, pimientos y picantes'
    when n ~* 'lechuga|brote|germinad|ensalada|can[oó]nigo|r[uú]cula|escarola|endivia|cogollo|mezclun|mach[eé]|espinaca|kale|flores' then 'Lechugas, ensaladas y brotes'
    when n ~* 'albahaca|cilantro|eneldo|hierbabuena|laurel|menta|perejil|romero|tomillo|cebollino|lemon glass|jengibre|enebro' then 'Hierbas y aromáticas'
    when n ~* 'cebolla|cebolleta|chalota|puerro|calcot|ajo|ajete' then 'Cebollas, ajos y puerros'
    when n ~* 'garbanzo|jud[ií]as blancas|judi[oó]n|lenteja|arroz|nuez|bote|tarro' then 'Legumbres y despensa'
    when n ~* 'aguacate|albaricoque|ar[aá]ndano|banana|breva|caqui|cereza|chirimo|ciruela|clementina|frambuesa|fres[oó]n|fruta|frutos del bosque|granada|higo|kiwi|lima|lim[oó]n|mango|manzana|maracuy|melocot|mel[oó]n|mora|naranja|nectarina|papay|paragua|pera|picota|piña|pl[aá]tano|pomelo|sand[ií]a|uva|zumo|manix' then 'Frutas'
    else 'Verduras y hortalizas' end
$$;

-- Productos del formulario: todos los activos, sin precios, sin nombres repetidos, con su familia.
create or replace function public.primer_pedido_productos()
returns jsonb language sql stable security definer set search_path to 'public' as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', id, 'nombre', nombre, 'unidad', unidad_venta, 'familia', familia) order by orden, nombre), '[]'::jsonb)
  from (select distinct on (lower(trim(nombre))) id, trim(nombre) nombre, unidad_venta, primer_pedido_familia(nombre) familia,
               array_position(array['Patatas (también peladas y cortadas)', 'Cebollas, ajos y puerros', 'Huevos', 'Verduras y hortalizas',
                 'Tomates, pimientos y picantes', 'Lechugas, ensaladas y brotes', 'Frutas', 'Setas', 'Hierbas y aromáticas', 'Legumbres y despensa'],
                 primer_pedido_familia(nombre)) orden
          from public.productos where activo and nombre !~* 'bandeja de flores' order by lower(trim(nombre)), created_at) p
$$;
revoke all on function public.primer_pedido_productos() from public;
grant execute on function public.primer_pedido_productos() to anon, authenticated;

-- Guarda lo que rellena el posible cliente. p_productos: [{id de producto, cantidad}]; nombre y unidad se toman de productos (no del navegador).
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
  -- Solo productos de la tarifa. Marcado sin cantidad («lo uso») = cantidad null; con cantidad, entre 0 y 10.000.
  select coalesce(jsonb_agg(jsonb_build_object('producto_id', i.id, 'nombre', i.nombre, 'unidad', i.unidad_venta, 'cantidad', x.cant) order by i.nombre), '[]'::jsonb)
    into v_prod
    from (select (e->>'id')::uuid id, case when coalesce(e->>'cantidad', '') = '' then null else round(replace(e->>'cantidad', ',', '.')::numeric, 2) end cant
            from jsonb_array_elements(case when jsonb_typeof(p_productos) = 'array' then p_productos else '[]'::jsonb end) e
           where (e->>'id') ~ '^[0-9a-f-]{36}$' and coalesce(e->>'cantidad', '') ~ '^(\d{1,5}([.,]\d{1,2})?)?$'
           limit 250) x
    join public.productos i on i.activo and i.id = x.id
   where x.cant is null or (x.cant > 0 and x.cant <= 10000);
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
