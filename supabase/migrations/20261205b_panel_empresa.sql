-- 📊 Panel Ferjusanz dentro de la app (Tito, 19/11/2026: que Jorge lo consulte solo, sin que haya que mandárselo).
-- La página la escribe cada mañana scripts/panel-html.mjs (tarea «Paneles Ferjusanz (diario)»). La app solo la lee: oficina y admin.
create table if not exists public.panel_empresa (
  fecha  date primary key,
  html   text not null,
  creado timestamptz not null default now()
);
alter table public.panel_empresa enable row level security;
grant select on public.panel_empresa to authenticated;
drop policy if exists leer on public.panel_empresa;
create policy leer on public.panel_empresa for select to authenticated using (rol_actual() in ('oficina', 'admin'));
