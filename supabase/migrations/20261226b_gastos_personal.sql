-- 💼 Gastos de personal (Tito, 26/11/2026: nóminas y Seguridad Social «donde solo lo puedan ver Jorge, Fernando Sanz padre, Juli y yo»).
-- Lista propia (ver_sueldos): Carmen y Dani son oficina/admin y NO deben verlo, por eso no vale el rol.
-- Los datos (un apunte por trabajador y mes) los mete Claude por SQL a partir de las nóminas, el RLC y el RNT; la app solo los lee.
create table if not exists public.ver_sueldos (user_id uuid primary key references auth.users(id) on delete cascade, nombre text);
alter table public.ver_sueldos enable row level security;
revoke all on public.ver_sueldos from anon;
drop policy if exists leer_mia on public.ver_sueldos;
create policy leer_mia on public.ver_sueldos for select to authenticated using (user_id = auth.uid());
create or replace function public.puede_ver_sueldos() returns boolean
language sql stable security definer set search_path = public as $$ select exists (select 1 from ver_sueldos where user_id = auth.uid()) $$;
revoke all on function public.puede_ver_sueldos() from public, anon;
grant execute on function public.puede_ver_sueldos() to authenticated;

create table if not exists public.gastos_personal (
  mes date not null,                      -- día 1 del mes de la nómina
  trabajador text not null,
  dias int,                               -- días cotizados
  bruto numeric(10,2) not null,           -- base de cotización / total devengado
  ss_empresa numeric(10,2) not null,      -- Seguridad Social que paga la empresa
  liquido numeric(10,2),                  -- lo que cobra (si está la nómina)
  nota text,
  creado timestamptz not null default now(),
  primary key (mes, trabajador)
);
alter table public.gastos_personal enable row level security;
revoke all on public.gastos_personal from anon, authenticated;
grant select on public.gastos_personal to authenticated;
drop policy if exists leer on public.gastos_personal;
create policy leer on public.gastos_personal for select to authenticated using (puede_ver_sueldos());
