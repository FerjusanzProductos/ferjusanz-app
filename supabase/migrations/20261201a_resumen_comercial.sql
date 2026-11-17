-- 📞 Comercial del día y 🗓️ Plan de la semana, dentro de «📊 Resumen y correo» y Comercial → Avisos (17/11/2026).
-- Los escriben las tareas automáticas «Comercial del día» (L-S) y «Plan comercial de la semana» (domingo).
-- La app solo los lee: oficina y admin. Nadie los puede cambiar desde la app.
create table if not exists public.resumen_comercial (
  fecha  date primary key,
  texto  text not null,
  creado timestamptz not null default now()
);
create table if not exists public.resumen_semana (
  fecha  date primary key,
  texto  text not null,
  creado timestamptz not null default now()
);
alter table public.resumen_comercial enable row level security;
alter table public.resumen_semana enable row level security;
grant select on public.resumen_comercial, public.resumen_semana to authenticated;
drop policy if exists leer on public.resumen_comercial;
create policy leer on public.resumen_comercial for select to authenticated using (rol_actual() in ('oficina', 'admin'));
drop policy if exists leer on public.resumen_semana;
create policy leer on public.resumen_semana for select to authenticated using (rol_actual() in ('oficina', 'admin'));
