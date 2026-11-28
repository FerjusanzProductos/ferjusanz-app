-- 📋 Reunión de prioridades (Tito, 28/11/2026): la secretaria (Jarvis) recoge las prioridades de cada departamento
-- y se guarda el acta para verla desde cualquier móvil (y Jarvis la tiene en Telegram). Solo oficina y admin.
create table if not exists public.oficina_reuniones (
  id bigserial primary key,
  creado timestamptz not null default now(),
  autor uuid default auth.uid() references public.perfiles(id) on delete set null,
  filas jsonb not null,      -- [{dep, prioridad, urgencia: alta|media|baja, quien, cuando}]
  resumen text
);
alter table public.oficina_reuniones enable row level security;
drop policy if exists oficina_reuniones_ver on public.oficina_reuniones;
create policy oficina_reuniones_ver on public.oficina_reuniones for select
  using (exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false));
drop policy if exists oficina_reuniones_nueva on public.oficina_reuniones;
create policy oficina_reuniones_nueva on public.oficina_reuniones for insert
  with check (autor = auth.uid() and exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false));
grant select, insert on public.oficina_reuniones to authenticated;
grant usage on sequence public.oficina_reuniones_id_seq to authenticated;
