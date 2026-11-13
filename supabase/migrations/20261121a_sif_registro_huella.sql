-- FASE 8 (Verifactu), primera pieza: REGISTRO DE FACTURACIÓN con HUELLA ENCADENADA (SIF 0.3.0).
-- docs/PLAN_FACTURACION.md (fase 8) y docs/SIF_PRODUCTOR/LEEME.md.
--
-- Qué hace, en corto:
--  1. Cada factura (o rectificativa) que se emite deja, en el mismo momento, un «registro de alta» en sif_registros.
--  2. El registro lleva una HUELLA (SHA-256) calculada como dice la AEAT con: NIF del emisor, nº de factura, fecha,
--     tipo (F1 ordinaria / R1 rectificativa), cuota total, importe total, la huella del registro ANTERIOR y fecha-hora.
--     Así las facturas quedan encadenadas: si alguien tocara una, la cadena se rompe y se nota.
--  3. Los registros no se pueden cambiar ni borrar (igual que las facturas).
--  4. sif_comprobar_cadena(): recalcula todas las huellas y dice si la cadena está bien.
--  5. Las facturas que ya hay (solo en PRUEBAS) reciben su registro, en el orden en que se emitieron.
-- No envía nada a Hacienda (eso es más adelante: QR y envío VERI*FACTU).
-- Comprobado antes: la base calcula la huella del ejemplo oficial de la AEAT igual (3C464DAF…2F60).

create table if not exists public.sif_registros (
  id bigint generated always as identity primary key,       -- orden de la cadena
  factura_id uuid not null unique references public.sif_facturas(id),
  tipo_registro text not null default 'alta' check (tipo_registro in ('alta')),
  nif_emisor text not null,
  num_serie text not null,                                  -- = sif_facturas.codigo
  fecha_expedicion text not null,                           -- dd-mm-aaaa
  tipo_factura text not null check (tipo_factura in ('F1', 'R1')),
  cuota_total text not null,                                -- IVA + recargo, con 2 decimales (p. ej. 12.30)
  importe_total text not null,
  huella_anterior text not null default '',                 -- vacía solo en el primer registro
  fecha_hora_gen text not null,                             -- 2027-01-02T10:15:00+01:00
  huella text not null unique,
  version_sif text not null,
  creado_at timestamptz not null default now()
);

-- Huella de un registro de alta (orden de campos fijado por la AEAT; igual que pruebas/sif/huella.mjs)
create or replace function public.sif__huella_alta(p_nif text, p_num text, p_fecha text, p_tipo text, p_cuota text, p_importe text, p_anterior text, p_fh text)
returns text language sql immutable as $$
  select upper(encode(sha256(convert_to(
    'IDEmisorFactura=' || btrim(p_nif) || '&NumSerieFactura=' || btrim(p_num) || '&FechaExpedicionFactura=' || btrim(p_fecha) ||
    '&TipoFactura=' || btrim(p_tipo) || '&CuotaTotal=' || btrim(p_cuota) || '&ImporteTotal=' || btrim(p_importe) ||
    '&Huella=' || btrim(coalesce(p_anterior, '')) || '&FechaHoraHusoGenRegistro=' || btrim(p_fh), 'UTF8')), 'hex'))
$$;

-- Crea el registro de una factura, enganchado al último de la cadena
create or replace function public.sif__registrar(p_factura uuid, p_cuando timestamptz) returns void
language plpgsql security definer set search_path = public as $$
declare f public.sif_facturas%rowtype; v_ant text; v_fh text; v_cuota text; v_imp text; v_tipo text; v_fecha text; v_nif text;
begin
  perform pg_advisory_xact_lock(hashtext('sif_registros'));   -- un registro detrás de otro, nunca dos a la vez
  select * into f from public.sif_facturas where id = p_factura;
  select huella into v_ant from public.sif_registros order by id desc limit 1;
  v_nif := public.sif_nif_normal(f.emisor->>'nif');
  v_tipo := case when f.tipo = 'rectificativa' then 'R1' else 'F1' end;
  v_fecha := to_char(f.fecha, 'DD-MM-YYYY');
  v_cuota := (f.cuota_iva + f.cuota_re)::numeric(12,2)::text;
  v_imp := f.total::numeric(12,2)::text;
  v_fh := to_char(p_cuando at time zone 'Europe/Madrid', 'YYYY-MM-DD"T"HH24:MI:SS')
          || '+' || to_char((p_cuando at time zone 'Europe/Madrid') - (p_cuando at time zone 'UTC'), 'HH24:MI');
  insert into public.sif_registros (factura_id, nif_emisor, num_serie, fecha_expedicion, tipo_factura, cuota_total, importe_total, huella_anterior, fecha_hora_gen, huella, version_sif)
  values (f.id, v_nif, f.codigo, v_fecha, v_tipo, v_cuota, v_imp, coalesce(v_ant, ''), v_fh,
          public.sif__huella_alta(v_nif, f.codigo, v_fecha, v_tipo, v_cuota, v_imp, coalesce(v_ant, ''), v_fh), f.version_sif);
end $$;

-- Cada factura nueva deja su registro en la misma operación (si falla el registro, no se emite la factura)
create or replace function public.sif__registro_trg() returns trigger language plpgsql security definer set search_path = public as $$
begin perform public.sif__registrar(new.id, now()); return null; end $$;
drop trigger if exists trg_registro on public.sif_facturas;
create trigger trg_registro after insert on public.sif_facturas for each row execute function public.sif__registro_trg();

-- Facturas que ya existían (solo hay en PRUEBAS): su registro, en el orden en que se emitieron
do $$ declare r record; begin
  for r in select f.id, f.emitida_at from public.sif_facturas f where not exists (select 1 from public.sif_registros g where g.factura_id = f.id) order by f.emitida_at, f.numero loop
    perform public.sif__registrar(r.id, r.emitida_at);
  end loop; end $$;

-- Nada se cambia ni se borra
drop trigger if exists trg_no_tocar on public.sif_registros;
create trigger trg_no_tocar before update or delete on public.sif_registros for each row execute function public.sif_no_tocar();
drop trigger if exists trg_no_vaciar on public.sif_registros;
create trigger trg_no_vaciar before truncate on public.sif_registros for each statement execute function public.sif_no_tocar();

alter table public.sif_registros enable row level security;
revoke all on public.sif_registros from anon, authenticated;
grant select on public.sif_registros to authenticated;
drop policy if exists leer on public.sif_registros;
create policy leer on public.sif_registros for select to authenticated using (rol_actual() in ('oficina', 'admin'));

-- Comprobar la cadena: recalcula cada huella, mira que enganche con la anterior y que coincida con la factura guardada
create or replace function public.sif_comprobar_cadena() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare r record; v_ant text := ''; n int := 0; fallos text[] := '{}'; v_sin int;
begin
  if public.rol_actual() is null or public.rol_actual() not in ('oficina', 'admin') then raise exception 'SIN_PERMISO'; end if;
  for r in select g.*, f.codigo, f.fecha, f.tipo, f.cuota_iva, f.cuota_re, f.total from public.sif_registros g join public.sif_facturas f on f.id = g.factura_id order by g.id loop
    n := n + 1;
    if r.huella_anterior <> v_ant then fallos := fallos || (r.num_serie || ': no engancha con el registro anterior'); end if;
    if r.huella <> public.sif__huella_alta(r.nif_emisor, r.num_serie, r.fecha_expedicion, r.tipo_factura, r.cuota_total, r.importe_total, r.huella_anterior, r.fecha_hora_gen) then
      fallos := fallos || (r.num_serie || ': la huella no cuadra (el registro se ha tocado)'); end if;
    if r.num_serie <> r.codigo or r.fecha_expedicion <> to_char(r.fecha, 'DD-MM-YYYY') or r.importe_total <> r.total::numeric(12,2)::text
       or r.cuota_total <> (r.cuota_iva + r.cuota_re)::numeric(12,2)::text or r.tipo_factura <> case when r.tipo = 'rectificativa' then 'R1' else 'F1' end then
      fallos := fallos || (r.num_serie || ': la factura no coincide con su registro'); end if;
    v_ant := r.huella;
  end loop;
  select count(*) into v_sin from public.sif_facturas f where not exists (select 1 from public.sif_registros g where g.factura_id = f.id);
  if v_sin > 0 then fallos := fallos || (v_sin || ' factura(s) sin registro'); end if;
  return jsonb_build_object('registros', n, 'ok', coalesce(array_length(fallos, 1), 0) = 0, 'fallos', to_jsonb(fallos), 'ultima_huella', nullif(v_ant, ''));
end $$;

revoke all on function public.sif__registrar(uuid, timestamptz) from public, anon, authenticated;
revoke all on function public.sif__registro_trg() from public, anon, authenticated;
revoke all on function public.sif_comprobar_cadena() from public, anon;
grant execute on function public.sif_comprobar_cadena() to authenticated;

update public.sif_config set version_sif = 'SIF 0.3.0 (sin declaración)' where id;
