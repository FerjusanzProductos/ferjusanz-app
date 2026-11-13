-- 📬 Resumen de correo dentro de «Resumen del día» (13/11/2026).
-- Claude escribe aquí el resumen del correo de la mañana (skill /resumen-correo).
-- La app solo lo lee: lo ven oficina y admin. Nadie lo puede cambiar desde la app.
create table if not exists public.resumen_correo (
  fecha  date primary key,              -- un resumen por día (si se repite, se reescribe)
  texto  text not null,
  creado timestamptz not null default now()
);
alter table public.resumen_correo enable row level security;
grant select on public.resumen_correo to authenticated;
drop policy if exists leer on public.resumen_correo;
create policy leer on public.resumen_correo for select to authenticated using (rol_actual() in ('oficina', 'admin'));
