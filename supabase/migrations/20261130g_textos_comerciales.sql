-- Textos de los mensajes comerciales que Fernando edita y guarda (16/11/2026: «y la opción de guardar el texto si se edita»).
-- clave: 'mensaje_nuevo' (posibles clientes) y 'mensaje_ex' (exclientes). En el texto, {nombre}, {yo} y {enlace} se rellenan al usarlo.
create table if not exists public.textos_comerciales (
  clave text primary key,
  texto text not null,
  updated_at timestamptz not null default now(),
  updated_por uuid default auth.uid()
);
alter table public.textos_comerciales enable row level security;
drop policy if exists textos_comerciales_oficina on public.textos_comerciales;
create policy textos_comerciales_oficina on public.textos_comerciales for all to authenticated
  using (rol_actual() = any (array['oficina', 'admin'])) with check (rol_actual() = any (array['oficina', 'admin']));
