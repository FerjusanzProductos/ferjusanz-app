-- ENVÍOS DE FACTURAS AL CLIENTE (Jorge, 19/11/2026): al enviar una factura al cliente queda «en negro = entregada»
-- y se puede reenviar si la pide otra vez. La factura emitida no se toca (no se puede): cada envío es una fila aquí.
-- Solo se apunta, nunca se cambia ni se borra.

create table if not exists public.sif_envios (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references public.sif_facturas(id),
  usuario_id uuid not null default auth.uid() references auth.users(id),
  enviada_at timestamptz not null default now()
);
create index if not exists sif_envios_factura on public.sif_envios (factura_id, enviada_at desc);

alter table public.sif_envios enable row level security;
revoke all on public.sif_envios from anon, authenticated;
grant select, insert on public.sif_envios to authenticated;

drop policy if exists leer on public.sif_envios;
create policy leer on public.sif_envios for select to authenticated using (rol_actual() in ('oficina', 'admin'));
drop policy if exists apuntar on public.sif_envios;
create policy apuntar on public.sif_envios for insert to authenticated
  with check (usuario_id = auth.uid() and rol_actual() in ('oficina', 'admin'));
