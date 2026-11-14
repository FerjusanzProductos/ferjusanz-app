-- Auditoría de clientes para Carmen (Facturación 2027, punto 9). 14/11/2026.
-- Datos encontrados para completar las fichas (NIF, dirección, CP, localidad…), cada uno con su fuente,
-- confianza y estado. NO cambia la ficha del cliente: la oficina lo revisa y pulsa «Usar» o «Descartar».
-- Las propuestas las mete Claude (API de Supabase); la app solo las lee y cambia su estado.
create table if not exists public.cliente_propuestas (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  campo text not null check (campo in ('nombre', 'nif', 'direccion', 'codigo_postal', 'localidad', 'email', 'telefono')),
  valor text not null,
  fuente text not null,                      -- de dónde sale (dirección web o «factura de …»)
  confianza text not null check (confianza in ('alta', 'media', 'baja')),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'aceptado', 'descartado')),
  nota text,
  created_at timestamptz not null default now(),
  revisado_por uuid,
  revisado_at timestamptz
);
create index if not exists cliente_propuestas_cliente on public.cliente_propuestas (cliente_id) where estado = 'pendiente';
alter table public.cliente_propuestas enable row level security;
revoke all on public.cliente_propuestas from anon, authenticated;
grant select, update (estado, revisado_por, revisado_at) on public.cliente_propuestas to authenticated;
create policy cliprop_leer on public.cliente_propuestas for select to authenticated using (rol_actual() in ('oficina', 'admin'));
create policy cliprop_revisar on public.cliente_propuestas for update to authenticated
  using (rol_actual() in ('oficina', 'admin')) with check (rol_actual() in ('oficina', 'admin'));
