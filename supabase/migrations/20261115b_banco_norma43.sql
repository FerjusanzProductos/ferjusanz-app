-- BANCO (Norma 43 / Excel del banco): movimientos de la cuenta y de quién es cada uno.
-- Fase 6 del plan de facturación (docs/PLAN_FACTURACION.md, punto 3). Lo que pide Jorge:
--   · Leer el fichero del banco (Norma 43 o el Excel, un movimiento por línea).
--   · En cada movimiento: nombre, NIF y CP del cliente o proveedor, y la factura que paga.
--   · La app lo PROPONE sola (por importe y nombre) y la oficina lo CONFIRMA o lo corrige.
--
-- Qué hace, en corto:
--  1. Tabla BANCO_SUBIDAS: cada fichero que se sube (nombre, de qué fecha a qué fecha, cuántos movimientos
--     nuevos y cuántos ya estaban). Solo se añade: no se cambia ni se borra.
--  2. Tabla BANCO_MOVIMIENTOS: un movimiento del banco por fila. Cada uno lleva una «huella» única (cuenta, fecha,
--     entra/sale, importe y si hay varios iguales ese día, cuál es): si se sube dos veces el mismo fichero,
--     los que ya estaban NO se vuelven a meter.
--     Lo que dice el banco (fecha, importe, concepto…) NO se puede cambiar nunca. Solo se rellena de quién es
--     (cliente / proveedor / otro), nombre, NIF, CP, la(s) factura(s) que paga y una nota.
--  3. Tabla BANCO_CAMBIOS: registro de cada confirmación y de cada cambio posterior (lo de antes, lo de ahora,
--     quién, cuándo y por qué). No se puede cambiar ni borrar.
--  4. Reglas (las pone la base de datos, no la app):
--     - Un movimiento del banco NUNCA se borra.
--     - Confirmar pide el nombre (y el cliente o proveedor, si es uno de ellos).
--     - Cambiar algo de un movimiento YA confirmado pide motivo y queda apuntado.
--  5. Quién puede: ver, subir y confirmar, oficina y admin.
--  No se crea ni se cambia nada de lo que ya hay. El fichero original se guarda en la carpeta «facturas» (banco/AÑO/…).

-- ===== 1. Ficheros subidos =====
create table if not exists public.banco_subidas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,                                    -- nombre del fichero
  origen text not null check (origen in ('norma43', 'excel')),
  cuenta text,                                             -- últimos 10 números de la cuenta
  desde date,
  hasta date,
  leidos integer not null default 0,
  nuevos integer not null default 0,
  repetidos integer not null default 0,
  ruta text,                                               -- copia del fichero en la carpeta «facturas»
  subido_por uuid default auth.uid(),
  created_at timestamptz not null default now()
);

-- ===== 2. Movimientos del banco =====
create table if not exists public.banco_movimientos (
  id uuid primary key default gen_random_uuid(),
  -- Lo que dice el banco (no se cambia nunca)
  cuenta text not null default '',
  fecha date not null,                                     -- fecha de la operación
  fecha_valor date,
  tipo text not null check (tipo in ('entrada', 'salida')),   -- entrada = abono (nos pagan), salida = cargo (pagamos)
  importe numeric(12,2) not null check (importe > 0),
  concepto text not null default '',                       -- todo el texto del banco (ordenante, concepto, referencias)
  concepto_comun text,                                     -- código del banco (Norma 43): 02 abonaré, 04 transferencia…
  documento text,
  referencia1 text,
  referencia2 text,
  saldo numeric(14,2),                                     -- solo si el Excel lo trae
  huella text not null unique,                             -- para no meter dos veces el mismo movimiento
  origen text not null check (origen in ('norma43', 'excel')),
  subida_id uuid references public.banco_subidas(id) on delete restrict,
  subido_por uuid default auth.uid(),
  created_at timestamptz not null default now(),
  -- De quién es (lo rellena la oficina; la app lo propone)
  estado text not null default 'pendiente' check (estado in ('pendiente', 'confirmado')),
  quien_tipo text check (quien_tipo in ('cliente', 'proveedor', 'otro')),
  cliente_id uuid references public.clientes(id) on delete restrict,
  proveedor_id uuid references public.proveedores(id) on delete restrict,
  persona text,                                            -- nombre
  nif text,
  cp text,
  facturas jsonb not null default '[]'::jsonb,             -- [{ tipo: golden|emitida|recibida, id, numero, fecha, total }]
  nota text,
  motivo_cambio text,                                      -- solo de paso: lo guarda el registro y se vacía
  confirmado_por uuid,
  confirmado_en timestamptz,
  modificado_por uuid,
  modificado_en timestamptz
);
create index if not exists banco_movimientos_fecha on public.banco_movimientos (fecha);
create index if not exists banco_movimientos_estado on public.banco_movimientos (estado);

-- ===== 3. Registro de cambios =====
create table if not exists public.banco_cambios (
  id bigserial primary key,
  movimiento_id uuid not null references public.banco_movimientos(id) on delete restrict,
  cuando timestamptz not null default now(),
  quien uuid default auth.uid(),
  accion text not null check (accion in ('confirmado', 'cambio', 'deshecho')),
  detalle jsonb not null default '{}'::jsonb,              -- { campo: { antes, despues } }
  motivo text
);
create index if not exists banco_cambios_mov on public.banco_cambios (movimiento_id);

-- ===== 4. Reglas =====
create or replace function public.banco__antes() returns trigger language plpgsql security definer set search_path = public as $$
declare
  d jsonb := '{}'::jsonb; c text; acc text; o jsonb; n jsonb;
begin
  if tg_op = 'DELETE' then raise exception 'Un movimiento del banco no se borra'; end if;
  if tg_op = 'INSERT' then
    new.subido_por := auth.uid(); new.created_at := now();
    new.estado := 'pendiente'; new.quien_tipo := null; new.cliente_id := null; new.proveedor_id := null;
    new.persona := null; new.nif := null; new.cp := null; new.facturas := '[]'::jsonb; new.nota := null;
    new.motivo_cambio := null; new.confirmado_por := null; new.confirmado_en := null;
    new.modificado_por := null; new.modificado_en := null;
    return new;
  end if;
  -- UPDATE: lo que dice el banco no se toca
  o := to_jsonb(old); n := to_jsonb(new);
  foreach c in array array['id', 'cuenta', 'fecha', 'fecha_valor', 'tipo', 'importe', 'concepto', 'concepto_comun', 'documento',
                           'referencia1', 'referencia2', 'saldo', 'huella', 'origen', 'subida_id', 'subido_por', 'created_at'] loop
    if (o -> c) is distinct from (n -> c) then raise exception 'Lo que dice el banco no se puede cambiar (%)', c; end if;
  end loop;
  if new.facturas is null or jsonb_typeof(new.facturas) <> 'array' then new.facturas := '[]'::jsonb; n := to_jsonb(new); end if;
  foreach c in array array['estado', 'quien_tipo', 'cliente_id', 'proveedor_id', 'persona', 'nif', 'cp', 'facturas', 'nota'] loop
    if (o -> c) is distinct from (n -> c) then d := d || jsonb_build_object(c, jsonb_build_object('antes', o -> c, 'despues', n -> c)); end if;
  end loop;
  if d = '{}'::jsonb then new.motivo_cambio := null; return new; end if;
  if new.estado = 'confirmado' then
    if coalesce(btrim(new.persona), '') = '' then raise exception 'Para confirmar hay que poner de quién es'; end if;
    if new.quien_tipo is null then raise exception 'Para confirmar hay que decir si es cliente, proveedor u otro'; end if;
    if new.quien_tipo = 'cliente' and new.cliente_id is null then raise exception 'Elige el cliente'; end if;
    if new.quien_tipo = 'proveedor' and new.proveedor_id is null then raise exception 'Elige el proveedor'; end if;
    if new.quien_tipo <> 'cliente' then new.cliente_id := null; end if;
    if new.quien_tipo <> 'proveedor' then new.proveedor_id := null; end if;
  end if;
  if old.estado = 'pendiente' and new.estado = 'pendiente' then   -- aún sin confirmar: no hace falta registro
    new.motivo_cambio := null; return new;
  end if;
  acc := case when old.estado = 'pendiente' then 'confirmado' when new.estado = 'pendiente' then 'deshecho' else 'cambio' end;
  if acc in ('cambio', 'deshecho') and coalesce(btrim(new.motivo_cambio), '') = '' then
    raise exception 'Este movimiento ya estaba confirmado: hay que poner el motivo del cambio'; end if;
  insert into public.banco_cambios (movimiento_id, accion, detalle, motivo)
    values (new.id, acc, d, nullif(btrim(coalesce(new.motivo_cambio, '')), ''));
  if acc = 'confirmado' then new.confirmado_por := auth.uid(); new.confirmado_en := now();
  else new.modificado_por := auth.uid(); new.modificado_en := now(); end if;
  if acc = 'deshecho' then new.confirmado_por := null; new.confirmado_en := null; end if;
  new.motivo_cambio := null;
  return new;
end $$;

create or replace function public.banco__subida() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op <> 'INSERT' then raise exception 'Los ficheros del banco subidos no se cambian ni se borran'; end if;
  new.subido_por := auth.uid(); new.created_at := now();
  return new;
end $$;

create or replace function public.banco__no_tocar() returns trigger language plpgsql as $$
begin raise exception 'Los datos del banco no se pueden borrar ni vaciar'; end $$;

drop trigger if exists trg_banco_antes on public.banco_movimientos;
create trigger trg_banco_antes before insert or update or delete on public.banco_movimientos
  for each row execute function public.banco__antes();
drop trigger if exists trg_banco_subida on public.banco_subidas;
create trigger trg_banco_subida before insert or update or delete on public.banco_subidas
  for each row execute function public.banco__subida();
drop trigger if exists trg_banco_registro on public.banco_cambios;
create trigger trg_banco_registro before update or delete on public.banco_cambios
  for each row execute function public.banco__no_tocar();
drop trigger if exists trg_banco_no_vaciar on public.banco_movimientos;
create trigger trg_banco_no_vaciar before truncate on public.banco_movimientos
  for each statement execute function public.banco__no_tocar();
drop trigger if exists trg_banco_subidas_no_vaciar on public.banco_subidas;
create trigger trg_banco_subidas_no_vaciar before truncate on public.banco_subidas
  for each statement execute function public.banco__no_tocar();
drop trigger if exists trg_banco_registro_no_vaciar on public.banco_cambios;
create trigger trg_banco_registro_no_vaciar before truncate on public.banco_cambios
  for each statement execute function public.banco__no_tocar();

-- ===== 5. Permisos: oficina y admin =====
alter table public.banco_subidas enable row level security;
alter table public.banco_movimientos enable row level security;
alter table public.banco_cambios enable row level security;
revoke all on public.banco_subidas from anon, authenticated;
revoke all on public.banco_movimientos from anon, authenticated;
revoke all on public.banco_cambios from anon, authenticated;
grant select, insert on public.banco_subidas to authenticated;
grant select, insert, update on public.banco_movimientos to authenticated;
grant select on public.banco_cambios to authenticated;

drop policy if exists leer on public.banco_subidas;
create policy leer on public.banco_subidas for select to authenticated using (rol_actual() in ('oficina', 'admin'));
drop policy if exists subir on public.banco_subidas;
create policy subir on public.banco_subidas for insert to authenticated with check (rol_actual() in ('oficina', 'admin'));
drop policy if exists leer on public.banco_movimientos;
create policy leer on public.banco_movimientos for select to authenticated using (rol_actual() in ('oficina', 'admin'));
drop policy if exists subir on public.banco_movimientos;
create policy subir on public.banco_movimientos for insert to authenticated with check (rol_actual() in ('oficina', 'admin'));
drop policy if exists confirmar on public.banco_movimientos;
create policy confirmar on public.banco_movimientos for update to authenticated
  using (rol_actual() in ('oficina', 'admin')) with check (rol_actual() in ('oficina', 'admin'));
drop policy if exists leer on public.banco_cambios;
create policy leer on public.banco_cambios for select to authenticated using (rol_actual() in ('oficina', 'admin'));
-- Sin políticas de escribir en banco_cambios: solo escriben las reglas de arriba.
