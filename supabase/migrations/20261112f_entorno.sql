-- Ficha «entorno»: dice si esta base de datos es la de TRABAJO REAL o la de PRUEBAS.
-- La app la lee al abrir: si no coincide con la app (normal / naranja), no arranca y sale una pantalla roja.
-- En la base real se aplica con :nombre = 'produccion'; en ferjusanz-pruebas con 'pruebas'.
-- Solo se puede leer desde la app; nadie puede cambiarla desde la app.
create table if not exists public.entorno (
  id boolean primary key default true check (id),          -- una sola fila
  nombre text not null check (nombre in ('produccion', 'pruebas')),
  creado timestamptz not null default now()
);
alter table public.entorno enable row level security;
revoke all on public.entorno from anon, authenticated;
grant select on public.entorno to anon, authenticated;
create policy entorno_leer on public.entorno for select to anon, authenticated using (true);
insert into public.entorno (nombre) values ('produccion') on conflict (id) do nothing;  -- en pruebas: 'pruebas'
