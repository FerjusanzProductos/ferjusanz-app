-- Captación de clientes desde la página pública «Pide tu primer pedido de prueba» (/nuevos-clientes).
-- El negocio rellena el formulario → se guarda SOLO como contacto (prospecto) para llamarle HOY
-- y sale un aviso al equipo con el nombre del negocio (sin teléfono ni correo).
-- No crea clientes, ni pedidos, ni envía nada. Protecciones contra basura: campo trampa,
-- teléfono español válido, sin duplicados (mismo teléfono en 30 días) y máximo 40 al día.
-- p_prueba = true (app de PRUEBAS): comprueba los datos y contesta «ok» sin guardar nada.

create or replace function public.web_solicitud_prospecto(
  p_nombre text, p_tipo text, p_localidad text, p_telefono text,
  p_email text default null, p_mensaje text default null,
  p_trampa text default null, p_prueba boolean default false)
returns jsonb language plpgsql security definer set search_path to 'public' as $$
declare v_nom text; v_tipo text; v_loc text; v_tel text; v_mail text; v_msg text; v_id uuid;
begin
  if coalesce(p_trampa, '') <> '' then return jsonb_build_object('ok', true); end if; -- robot: se ignora en silencio
  v_nom := left(nullif(trim(coalesce(p_nombre, '')), ''), 100);
  if v_nom is null or length(v_nom) < 2 then return jsonb_build_object('ok', false, 'error', 'nombre'); end if;
  v_tipo := case when p_tipo in ('restaurante','bar','colegio','residencia','escuela_infantil','catering','otro') then p_tipo else 'otro' end;
  v_loc := left(nullif(trim(coalesce(p_localidad, '')), ''), 80);
  v_tel := regexp_replace(coalesce(p_telefono, ''), '\D', '', 'g');
  if length(v_tel) = 11 and v_tel like '34%' then v_tel := substr(v_tel, 3); end if;
  if v_tel !~ '^[6789][0-9]{8}$' then return jsonb_build_object('ok', false, 'error', 'telefono'); end if;
  v_mail := nullif(lower(trim(coalesce(p_email, ''))), '');
  if v_mail is not null and (length(v_mail) > 120 or v_mail !~ '^[^@\s]+@[^@\s]+\.[a-z]{2,}$') then return jsonb_build_object('ok', false, 'error', 'email'); end if;
  v_msg := left(nullif(trim(coalesce(p_mensaje, '')), ''), 500);
  if p_prueba then return jsonb_build_object('ok', true, 'prueba', true); end if;
  if exists (select 1 from public.prospectos where regexp_replace(coalesce(telefono, ''), '\D', '', 'g') like '%' || v_tel
             and created_at > now() - interval '30 days') then return jsonb_build_object('ok', true, 'repetido', true); end if;
  if (select count(*) from public.prospectos where fuente = 'Formulario web' and created_at > now() - interval '1 day') >= 40 then
    return jsonb_build_object('ok', false, 'error', 'muchos'); end if;
  insert into public.prospectos (nombre, tipo, localidad, telefono, email, fuente, estado, proximo_contacto, notas)
  values (v_nom, v_tipo, v_loc, v_tel, v_mail, 'Formulario web', 'nuevo', (now() at time zone 'Europe/Madrid')::date,
          '🎯 Pidió pedido de prueba desde la web el ' || to_char(now() at time zone 'Europe/Madrid', 'DD/MM/YYYY HH24:MI') || coalesce('. Dice: ' || v_msg, ''))
  returning id into v_id;
  insert into public.avisos (tipo, para, titulo, texto, fijado, caduca, creado_por)
  values ('aviso', 'equipo', '🎯 Cliente nuevo desde la web: ' || v_nom,
          'Quiere un pedido de prueba. Llamarle HOY: Comercial → Avisos (contactos).', true,
          ((now() at time zone 'Europe/Madrid')::date + 3), null);
  return jsonb_build_object('ok', true);
end $$;
revoke all on function public.web_solicitud_prospecto(text, text, text, text, text, text, text, boolean) from public;
grant execute on function public.web_solicitud_prospecto(text, text, text, text, text, text, text, boolean) to anon, authenticated;
