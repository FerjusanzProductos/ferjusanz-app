-- 🎯 Posibles clientes y clientes que se enfrían, dentro de «📊 Resumen y correo» (16/11/2026).
-- Lo escribe la tarea automática «Leads y clientes Ferjusanz» (lunes, miércoles y viernes).
-- La app solo lo lee: lo ven oficina y admin. Nadie lo puede cambiar desde la app.
create table if not exists public.resumen_leads (
  fecha  date primary key,              -- uno por día (si se repite, se reescribe)
  texto  text not null,
  creado timestamptz not null default now()
);
alter table public.resumen_leads enable row level security;
grant select on public.resumen_leads to authenticated;
drop policy if exists leer on public.resumen_leads;
create policy leer on public.resumen_leads for select to authenticated using (rol_actual() in ('oficina', 'admin'));
