-- 26/11/2026 (Tito: «No cuentes robots»). Solo cuentan las visitas desde España: las de fuera son casi todas robots
-- (ordenador, sin enlace de origen, a ráfagas). No se borra nada: se siguen guardando, solo no se cuentan.
create or replace function public.web_visitas_resumen()
returns json language sql stable security definer set search_path = public as $$
  select case when public.rol_actual() = any (array['admin', 'oficina']) then (
    select json_build_object(
      'hoy', count(*) filter (where creado >= date_trunc('day', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'),
      'semana', count(*) filter (where creado >= now() - interval '7 days'),
      'mes', count(*),
      'movil', count(*) filter (where movil),
      'paginas', (select coalesce(json_agg(x), '[]') from (select ruta, count(*) n from public.web_visitas where creado >= now() - interval '30 days' and pais = 'ES' group by ruta order by n desc limit 10) x),
      'origenes', (select coalesce(json_agg(x), '[]') from (select coalesce(origen, 'Directo') origen, count(*) n from public.web_visitas where creado >= now() - interval '30 days' and pais = 'ES' group by 1 order by n desc limit 8) x))
    from public.web_visitas where creado >= now() - interval '30 days' and pais = 'ES') end;
$$;
