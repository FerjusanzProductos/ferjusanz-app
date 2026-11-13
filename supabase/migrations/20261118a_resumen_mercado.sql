-- 📈 Resumen de mercado dentro de «Resumen del día y correo» (13/11/2026).
-- Claude escribe aquí qué se dice este mes de los precios de nuestros productos (skill /mercado-semanal).
-- La app solo lo lee: lo ven oficina y admin. Nadie lo puede cambiar desde la app.
create table if not exists public.resumen_mercado (
  fecha  date primary key,              -- un resumen por día (si se repite, se reescribe)
  texto  text not null,
  creado timestamptz not null default now()
);
alter table public.resumen_mercado enable row level security;
grant select on public.resumen_mercado to authenticated;
drop policy if exists leer on public.resumen_mercado;
create policy leer on public.resumen_mercado for select to authenticated using (rol_actual() in ('oficina', 'admin'));
