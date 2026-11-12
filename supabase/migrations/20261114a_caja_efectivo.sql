-- CAJA (EFECTIVO): entradas y salidas de dinero en efectivo.
-- Fase 5 del plan de facturación (docs/PLAN_FACTURACION.md, punto 4). Lo que pide Jorge:
--   · Entra efectivo: fecha, cuánto, de quién (y qué factura).
--   · Sale efectivo: fecha, cuánto, a quién (y qué factura o justificante).
--   · El justificante puede llegar DESPUÉS (gasolina…): se apunta la salida y se añade luego, quedando marcado.
--
-- Qué hace, en corto:
--  1. Tabla CAJA_MOVIMIENTOS: un apunte por entrada o salida. No se crea ni se cambia nada de lo que ya hay.
--     Los cobros en efectivo de los albaranes (tabla cobros) NO se copian aquí: el informe los suma solos.
--  2. Tabla CAJA_CAMBIOS: el registro de todo lo que pasa con cada apunte (alta, justificante añadido,
--     corrección, anulación), con fecha, quién y lo de antes y lo de después. No se puede cambiar ni borrar.
--  3. Reglas (las pone la base de datos, no la app):
--     - Un apunte NUNCA se borra: si está mal, se corrige o se anula, siempre con motivo.
--     - Corregir fecha, importe, persona o concepto, y anular, piden motivo.
--     - Añadir el justificante después no pide motivo, pero queda apuntado cuándo y quién.
--     - Un apunte anulado ya no se puede tocar.
--  4. Quién puede: ver, apuntar y corregir, oficina y admin.
--  Los archivos del justificante (foto o PDF) van a la carpeta «facturas» (caja/AÑO/…), que ya existe.

-- ===== 1. Apuntes de caja =====
create table if not exists public.caja_movimientos (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  tipo text not null check (tipo in ('entrada', 'salida')),
  importe numeric(12,2) not null check (importe > 0),
  persona text not null check (btrim(persona) <> ''),        -- de quién (entrada) o a quién (salida)
  nif text,
  cliente_id uuid references public.clientes(id) on delete restrict,
  proveedor_id uuid references public.proveedores(id) on delete restrict,
  concepto text not null check (btrim(concepto) <> ''),
  documento text,                                             -- nº de factura o qué justificante es
  justificante_ruta text,                                     -- foto o PDF en la carpeta «facturas»
  anulado boolean not null default false,
  motivo_cambio text,                                         -- solo de paso: lo guarda el registro y se vacía
  creado_por uuid default auth.uid(),
  created_at timestamptz not null default now(),
  modificado_por uuid,
  modificado_en timestamptz
);
create index if not exists caja_movimientos_fecha on public.caja_movimientos (fecha);

-- ===== 2. Registro de cambios =====
create table if not exists public.caja_cambios (
  id bigserial primary key,
  movimiento_id uuid not null references public.caja_movimientos(id) on delete restrict,
  cuando timestamptz not null default now(),
  quien uuid default auth.uid(),
  accion text not null check (accion in ('alta', 'justificante', 'cambio', 'anulado')),
  detalle jsonb not null default '{}'::jsonb,                 -- { campo: { antes, despues } }
  motivo text
);
create index if not exists caja_cambios_mov on public.caja_cambios (movimiento_id);

-- ===== 3. Reglas =====
create or replace function public.caja__antes() returns trigger language plpgsql security definer set search_path = public as $$
declare
  d jsonb := '{}'::jsonb; c text; acc text;
  o jsonb; n jsonb;
begin
  if tg_op = 'DELETE' then raise exception 'Un apunte de caja no se borra: anúlalo con un motivo'; end if;
  if tg_op = 'INSERT' then
    new.creado_por := auth.uid(); new.created_at := now(); new.anulado := false;
    new.modificado_por := null; new.modificado_en := null; new.motivo_cambio := null;
    return new;
  end if;
  -- UPDATE
  if old.anulado then raise exception 'Este apunte está anulado: ya no se puede cambiar'; end if;
  if new.id <> old.id or new.creado_por is distinct from old.creado_por or new.created_at <> old.created_at then
    raise exception 'Eso no se puede cambiar'; end if;
  o := to_jsonb(old); n := to_jsonb(new);
  foreach c in array array['fecha', 'tipo', 'importe', 'persona', 'nif', 'cliente_id', 'proveedor_id', 'concepto', 'documento', 'justificante_ruta', 'anulado'] loop
    if (o -> c) is distinct from (n -> c) then d := d || jsonb_build_object(c, jsonb_build_object('antes', o -> c, 'despues', n -> c)); end if;
  end loop;
  if d = '{}'::jsonb then new.motivo_cambio := null; return new; end if;
  acc := case when new.anulado then 'anulado'
              when (d - 'documento' - 'justificante_ruta') = '{}'::jsonb then 'justificante'
              else 'cambio' end;
  if acc = 'anulado' and (d - 'anulado') <> '{}'::jsonb then raise exception 'Al anular no se puede cambiar nada más'; end if;
  if acc in ('cambio', 'anulado') and coalesce(btrim(new.motivo_cambio), '') = '' then
    raise exception 'Hay que poner el motivo'; end if;
  insert into public.caja_cambios (movimiento_id, accion, detalle, motivo)
    values (new.id, acc, d, nullif(btrim(coalesce(new.motivo_cambio, '')), ''));
  new.modificado_por := auth.uid(); new.modificado_en := now(); new.motivo_cambio := null;
  return new;
end $$;

create or replace function public.caja__alta() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.caja_cambios (movimiento_id, accion, detalle)
    values (new.id, 'alta', to_jsonb(new) - 'motivo_cambio' - 'modificado_por' - 'modificado_en');
  return new;
end $$;

create or replace function public.caja__no_tocar_registro() returns trigger language plpgsql as $$
begin raise exception 'El registro de cambios de la caja no se puede cambiar ni borrar'; end $$;

drop trigger if exists trg_caja_antes on public.caja_movimientos;
create trigger trg_caja_antes before insert or update or delete on public.caja_movimientos
  for each row execute function public.caja__antes();
drop trigger if exists trg_caja_alta on public.caja_movimientos;
create trigger trg_caja_alta after insert on public.caja_movimientos
  for each row execute function public.caja__alta();
drop trigger if exists trg_caja_registro on public.caja_cambios;
create trigger trg_caja_registro before update or delete on public.caja_cambios
  for each row execute function public.caja__no_tocar_registro();
drop trigger if exists trg_caja_no_vaciar on public.caja_movimientos;
create trigger trg_caja_no_vaciar before truncate on public.caja_movimientos
  for each statement execute function public.caja__no_tocar_registro();
drop trigger if exists trg_caja_registro_no_vaciar on public.caja_cambios;
create trigger trg_caja_registro_no_vaciar before truncate on public.caja_cambios
  for each statement execute function public.caja__no_tocar_registro();

-- ===== 4. Permisos: oficina y admin =====
alter table public.caja_movimientos enable row level security;
alter table public.caja_cambios enable row level security;
revoke all on public.caja_movimientos from anon, authenticated;
revoke all on public.caja_cambios from anon, authenticated;
grant select, insert, update on public.caja_movimientos to authenticated;
grant select on public.caja_cambios to authenticated;

drop policy if exists leer on public.caja_movimientos;
create policy leer on public.caja_movimientos for select to authenticated using (rol_actual() in ('oficina', 'admin'));
drop policy if exists apuntar on public.caja_movimientos;
create policy apuntar on public.caja_movimientos for insert to authenticated with check (rol_actual() in ('oficina', 'admin'));
drop policy if exists corregir on public.caja_movimientos;
create policy corregir on public.caja_movimientos for update to authenticated
  using (rol_actual() in ('oficina', 'admin')) with check (rol_actual() in ('oficina', 'admin'));
drop policy if exists leer on public.caja_cambios;
create policy leer on public.caja_cambios for select to authenticated using (rol_actual() in ('oficina', 'admin'));
-- Sin políticas de escribir en caja_cambios: solo escriben las reglas de arriba.
