-- 15/11/2026 (Fernando: «Si» a medir visitas de la web nueva; Cloudflare Web Analytics no se pudo activar desde el móvil).
-- Contador propio, sin cookies: el Worker ferjusanz-web apunta cada página vista (no bots) con registrar_visita().
-- Solo guarda la página, de qué web viene (solo el dominio), el país y si es móvil. Nada que identifique a la persona.
create table if not exists public.web_visitas (
  id bigint generated always as identity primary key,
  creado timestamptz not null default now(),
  ruta text not null,
  origen text,
  pais text,
  movil boolean
);
create index if not exists web_visitas_creado on public.web_visitas (creado);
alter table public.web_visitas enable row level security;
revoke all on public.web_visitas from anon, authenticated;

-- La llama el Worker con la clave pública: solo puede añadir, nunca leer ni borrar.
create or replace function public.registrar_visita(p_ruta text, p_origen text default null, p_pais text default null, p_movil boolean default null)
returns void language sql security definer set search_path = public as $$
  insert into public.web_visitas (ruta, origen, pais, movil)
  values (left(coalesce(p_ruta, '/'), 200), left(nullif(p_origen, ''), 100), left(nullif(p_pais, ''), 2), p_movil);
$$;
revoke all on function public.registrar_visita(text, text, text, boolean) from public;
grant execute on function public.registrar_visita(text, text, text, boolean) to anon;

-- Resumen para la app (Resumen y correo): solo oficina y admin.
create or replace function public.web_visitas_resumen()
returns json language sql stable security definer set search_path = public as $$
  select case when public.rol_actual() = any (array['admin', 'oficina']) then (
    select json_build_object(
      'hoy', count(*) filter (where creado >= date_trunc('day', now() at time zone 'Europe/Madrid') at time zone 'Europe/Madrid'),
      'semana', count(*) filter (where creado >= now() - interval '7 days'),
      'mes', count(*),
      'movil', count(*) filter (where movil),
      'paginas', (select coalesce(json_agg(x), '[]') from (select ruta, count(*) n from public.web_visitas where creado >= now() - interval '30 days' group by ruta order by n desc limit 10) x),
      'origenes', (select coalesce(json_agg(x), '[]') from (select coalesce(origen, 'Directo') origen, count(*) n from public.web_visitas where creado >= now() - interval '30 days' group by 1 order by n desc limit 8) x))
    from public.web_visitas where creado >= now() - interval '30 days') end;
$$;
revoke all on function public.web_visitas_resumen() from public;
grant execute on function public.web_visitas_resumen() to authenticated;
