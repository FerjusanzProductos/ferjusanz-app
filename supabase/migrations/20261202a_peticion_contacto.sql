-- 📇 Pedir correo y teléfono a los clientes activos que no los tienen (18/11/2026).
-- Una fila por cliente: a qué correo se le escribió, cuándo, y si ya contestó.
-- Lo rellena Claude al enviar (API de Supabase); la oficina marca «Contestado» o lo apunta a mano.
-- Lo encontrado en internet va en cliente_propuestas (campo email/telefono), no aquí.
create table if not exists public.cliente_peticion_contacto (
  cliente_id uuid primary key references public.clientes(id) on delete cascade,
  enviado_a text,
  enviado_at timestamptz,
  contestado_at timestamptz,
  nota text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);
alter table public.cliente_peticion_contacto enable row level security;
revoke all on public.cliente_peticion_contacto from anon, authenticated;
grant select, insert, update on public.cliente_peticion_contacto to authenticated;
drop policy if exists petcon_leer on public.cliente_peticion_contacto;
drop policy if exists petcon_crear on public.cliente_peticion_contacto;
drop policy if exists petcon_cambiar on public.cliente_peticion_contacto;
create policy petcon_leer on public.cliente_peticion_contacto for select to authenticated using (rol_actual() in ('oficina', 'admin'));
create policy petcon_crear on public.cliente_peticion_contacto for insert to authenticated with check (rol_actual() in ('oficina', 'admin'));
create policy petcon_cambiar on public.cliente_peticion_contacto for update to authenticated
  using (rol_actual() in ('oficina', 'admin')) with check (rol_actual() in ('oficina', 'admin'));
