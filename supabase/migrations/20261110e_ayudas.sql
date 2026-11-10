-- 🆘 Peticiones de ayuda desde la app: quién, en qué pantalla, con qué datos y qué errores le han salido.
-- La crea la persona atascada; la ve y la marca como atendida la oficina/dirección. No cambia ningún otro dato.
create table if not exists public.ayudas (
  id bigserial primary key,
  usuario_id uuid not null default auth.uid(),
  nombre text,
  nota text,
  vista text,
  titulo text,
  params jsonb,
  errores jsonb,
  info jsonb,
  estado text not null default 'nueva' check (estado in ('nueva', 'atendida')),
  created_at timestamptz not null default now(),
  atendida_por uuid,
  atendida_en timestamptz
);
create index if not exists ayudas_estado_idx on public.ayudas (estado, created_at desc);
alter table public.ayudas enable row level security;
create policy ayudas_crear on public.ayudas for insert to authenticated with check (usuario_id = auth.uid() and public.rol_actual() is not null);
create policy ayudas_ver on public.ayudas for select to authenticated using (usuario_id = auth.uid() or public.rol_actual() in ('admin', 'oficina'));
create policy ayudas_atender on public.ayudas for update to authenticated using (public.rol_actual() in ('admin', 'oficina')) with check (public.rol_actual() in ('admin', 'oficina'));
grant select, insert, update on public.ayudas to authenticated;
grant usage on sequence public.ayudas_id_seq to authenticated;
