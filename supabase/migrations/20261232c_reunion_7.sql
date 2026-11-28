-- 📋 Reunión de prioridades cada mañana a las 7:00 (hora de Madrid) (Tito, 28/11/2026).
-- pg_cron llama a la función jarvis-telegram a las 5:00 y a las 6:00 UTC; la función solo se reúne cuando en Madrid son las 7
-- (6:00 UTC en invierno, 5:00 UTC en verano). Va con un secreto propio guardado en jarvis_ajustes (no lo lee la app).
-- La reunión se hace con los permisos de Tito («Fernando Sanz (hijo)»), que es quien la ve también por Telegram.
create extension if not exists pg_net;
insert into public.jarvis_ajustes (clave, valor) values ('cron_secreto', replace(gen_random_uuid()::text, '-', ''))
  on conflict (clave) do nothing;
-- En la real, Tito; en pruebas, el admin de pruebas (fernando@pruebas.invalid).
insert into public.jarvis_ajustes (clave, valor)
  select 'reunion_perfil', coalesce(
    (select id from public.perfiles where nombre = 'Fernando Sanz (hijo)' and activo is not false limit 1),
    (select p.id from public.perfiles p join auth.users u on u.id = p.id where u.email = 'fernando@pruebas.invalid'))::text
  on conflict (clave) do nothing;
select cron.unschedule('jarvis_reunion_7') where exists (select 1 from cron.job where jobname = 'jarvis_reunion_7');
-- __REF__ = proyecto (real hvydnjaswdexttogsyen, pruebas pbeuxbwbpmlanbhhnpgy): se cambia al lanzarlo.
select cron.schedule('jarvis_reunion_7', '0 5,6 * * *', $$
  select net.http_post(
    url := 'https://__REF__.supabase.co/functions/v1/jarvis-telegram',
    headers := jsonb_build_object('Content-Type', 'application/json',
      'x-jarvis-cron', (select valor from public.jarvis_ajustes where clave = 'cron_secreto')),
    body := '{}'::jsonb);
$$);
