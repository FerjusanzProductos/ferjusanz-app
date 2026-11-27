-- 🎬 Ideas de contenido para redes (Tito, 27/11/2026): 3 ideas con guion cada lunes, mirando a la competencia.
-- Lo escribe la tarea automática «Ideas de contenido (lunes)» y sale en la página fijada «Comercial Ferjusanz».
create table if not exists public.resumen_contenido (
  fecha  date primary key,
  texto  text not null,
  creado timestamptz not null default now()
);
alter table public.resumen_contenido enable row level security;
grant select on public.resumen_contenido to authenticated;
drop policy if exists leer on public.resumen_contenido;
create policy leer on public.resumen_contenido for select to authenticated using (rol_actual() in ('oficina', 'admin'));
