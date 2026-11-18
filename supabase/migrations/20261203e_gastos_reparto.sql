-- GASTOS DE REPARTO (Fernando, 18/11/2026): al terminar el reparto, el repartidor apunta si ha repostado
-- (gasolina o gasóleo y cuánto); antes de fichar la salida, si ha tenido otros gastos, y se le recuerda
-- dejar el ticket o la factura en el sobre de la oficina. La oficina marca cuando le llega el papel.
-- Un apunte no se borra: si está mal, se anula (oficina/admin).

create table if not exists public.gastos_reparto (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default (now() at time zone 'Europe/Madrid')::date,
  usuario_id uuid not null default auth.uid() references auth.users(id),
  tipo text not null check (tipo in ('combustible', 'otro', 'nada')),  -- 'nada' = «hoy no he repostado / no he tenido gastos»
  combustible text check (combustible in ('gasolina', 'gasoleo')),
  importe numeric(10,2) check (importe is null or importe > 0),
  litros numeric(10,2) check (litros is null or litros > 0),
  concepto text,
  ticket_recibido boolean not null default false,
  anulado boolean not null default false,
  created_at timestamptz not null default now(),
  check (tipo = 'nada' or importe is not null),
  check ((tipo = 'combustible') = (combustible is not null))
);
create index if not exists gastos_reparto_fecha on public.gastos_reparto (fecha desc);

alter table public.gastos_reparto enable row level security;
revoke all on public.gastos_reparto from anon, authenticated;
grant select, insert, update on public.gastos_reparto to authenticated;

drop policy if exists leer on public.gastos_reparto;
create policy leer on public.gastos_reparto for select to authenticated
  using (usuario_id = auth.uid() or rol_actual() in ('oficina', 'admin'));
drop policy if exists apuntar on public.gastos_reparto;
create policy apuntar on public.gastos_reparto for insert to authenticated
  with check (usuario_id = auth.uid() and not ticket_recibido and not anulado);
drop policy if exists oficina on public.gastos_reparto;
create policy oficina on public.gastos_reparto for update to authenticated
  using (rol_actual() in ('oficina', 'admin')) with check (rol_actual() in ('oficina', 'admin'));

-- La oficina solo marca el ticket o anula: lo apuntado por el repartidor no se cambia.
create or replace function public.gastos_reparto__solo_marcar() returns trigger language plpgsql as $$
begin
  if (new.fecha, new.usuario_id, new.tipo, new.combustible, new.importe, new.litros, new.concepto)
     is distinct from (old.fecha, old.usuario_id, old.tipo, old.combustible, old.importe, old.litros, old.concepto)
     or (old.anulado and not new.anulado) then
    raise exception 'Solo se puede marcar el ticket o anular el apunte';
  end if;
  return new;
end $$;
drop trigger if exists trg_solo_marcar on public.gastos_reparto;
create trigger trg_solo_marcar before update on public.gastos_reparto
  for each row execute function public.gastos_reparto__solo_marcar();
drop trigger if exists trg_auditar on public.gastos_reparto;
create trigger trg_auditar after insert or update on public.gastos_reparto for each row execute function auditar();
