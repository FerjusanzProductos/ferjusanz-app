-- Cobros y pagos de Golden (golden_tesoreria): los de ver_margenes y además los de ver_cobros (Fernando, 18/11/2026: «Carmen tiene que ver deudas 100%… habilitada en todas esas funciones de pagos y cobros»).
-- Carmen NO ve margen, rentabilidad ni compras con precio (siguen solo para ver_margenes). La lista se cambia solo con SQL.
create table if not exists public.ver_cobros (user_id uuid primary key references auth.users(id) on delete cascade, nombre text);
alter table public.ver_cobros enable row level security;
revoke all on public.ver_cobros from anon;
drop policy if exists leer_mia on public.ver_cobros;
create policy leer_mia on public.ver_cobros for select to authenticated using (user_id = auth.uid());
create or replace function public.puede_ver_cobros() returns boolean
language sql stable security definer set search_path = public as $$ select puede_ver_margenes() or exists (select 1 from ver_cobros where user_id = auth.uid()) $$;
revoke all on function public.puede_ver_cobros() from public, anon;
grant execute on function public.puede_ver_cobros() to authenticated;
drop policy if exists leer on public.golden_tesoreria;
create policy leer on public.golden_tesoreria for select to authenticated using (puede_ver_cobros());
-- Base real: insert into ver_cobros values ('208c7c13-07b9-485c-af1f-8c24b6b31d39', 'Carmen Segura') on conflict do nothing;
-- Base de pruebas: insert into ver_cobros values ('fee63297-8fb5-4738-bfb6-ba96b3119f5f', 'Oficina (pruebas)') on conflict do nothing;
