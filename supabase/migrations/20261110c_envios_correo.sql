-- Envío automático del albarán por correo al marcar la entrega (función «albaranes-correo»).
alter table public.clientes add column if not exists albaran_por_correo boolean not null default true;   -- se puede quitar a quien no lo quiera
create table if not exists public.envios_correo (
  pedido_id uuid primary key references public.pedidos(id),
  email text not null,
  estado text not null default 'enviando' check (estado in ('enviando', 'enviado', 'error')),
  error text,
  created_at timestamptz not null default now(),
  enviado_at timestamptz
);
alter table public.envios_correo enable row level security;
create policy envios_correo_ver on public.envios_correo for select to authenticated using (public.rol_actual() is not null);
grant select on public.envios_correo to authenticated;
