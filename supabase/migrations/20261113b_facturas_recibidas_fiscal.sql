-- FACTURAS RECIBIDAS (de proveedores): NIF, código postal y desglose de IVA.
-- Fase 3 del plan de facturación (docs/PLAN_FACTURACION.md). Deja preparada la fase 4 (listado de COMPRAS para Jorge).
--
-- Qué hace, en corto:
--  1. PROVEEDORES: añade NIF, razón social, dirección, código postal y localidad (vacíos; no se cambia nada de lo que hay).
--  2. FACTURAS RECIBIDAS: añade nº de factura, NIF y CP del proveedor (los de esa factura), total y quién lo dejó así
--     («lector» = la app al leer el PDF · «oficina» = corregido a mano). No se cambia ni se borra ninguna factura existente.
--  3. Tabla nueva FACTURAS_RECIBIDAS_IVA: una fila por cada tipo de IVA de cada factura (base, %, cuota, recargo y total).
--  4. Función guardar_fiscal_factura_recibida: la única forma de escribir estos datos.
--     - Lo que lee la app (lector) solo rellena lo que está vacío y NUNCA pisa lo que corrigió la oficina.
--     - Lo que corrige la oficina manda.
--     - Si al proveedor le falta NIF o CP en su ficha, se los copia de la factura (no pisa los que ya tiene;
--       solo oficina/admin pueden cambiar los de la ficha a propósito).
--  5. Vista v_facturas_recibidas_control: cada factura con sus avisos (falta NIF, falta CP, sin desglose, no cuadra).
--  6. Vista v_libro_compras: el listado de COMPRAS para Jorge, UNA FILA POR TIPO DE IVA (fase 4).
--
-- Quién puede: ver y guardar, compras, oficina y admin (igual que hoy con las facturas de proveedores).

-- ===== 1. Proveedores =====
alter table public.proveedores
  add column if not exists nif text,
  add column if not exists razon_social text,
  add column if not exists direccion text,
  add column if not exists codigo_postal text,
  add column if not exists localidad text;

-- ===== 2. Facturas recibidas =====
alter table public.facturas_recibidas
  add column if not exists numero_factura text,
  add column if not exists nif_proveedor text,
  add column if not exists cp_proveedor text,
  add column if not exists total_factura numeric(12,2),
  add column if not exists aviso_destinatario text,          -- p. ej. «viene a nombre de FERJUSANZ C.B. (E80746670)»
  add column if not exists fiscal_origen text check (fiscal_origen in ('lector', 'oficina')),
  add column if not exists fiscal_revisado_por uuid,
  add column if not exists fiscal_revisado_en timestamptz;

-- ===== 3. Desglose de IVA (una fila por tipo) =====
create table if not exists public.facturas_recibidas_iva (
  id uuid primary key default gen_random_uuid(),
  factura_id uuid not null references public.facturas_recibidas(id) on delete restrict,
  tipo_iva numeric(5,2) not null check (tipo_iva >= 0 and tipo_iva <= 30),   -- 0, 2, 4, 5, 10, 21…
  base numeric(12,2) not null,                                                -- puede ser negativa (abonos)
  cuota numeric(12,2) not null,
  recargo_pct numeric(5,2) not null default 0 check (recargo_pct >= 0 and recargo_pct <= 10),
  cuota_recargo numeric(12,2) not null default 0,
  total numeric(12,2) generated always as (base + cuota + cuota_recargo) stored,
  unique (factura_id, tipo_iva, recargo_pct)
);
create index if not exists facturas_recibidas_iva_factura on public.facturas_recibidas_iva (factura_id);
alter table public.facturas_recibidas_iva enable row level security;
drop policy if exists leer on public.facturas_recibidas_iva;
create policy leer on public.facturas_recibidas_iva for select
  using (rol_actual() = any (array['compras', 'oficina', 'admin']));
-- Sin políticas de escribir: solo se escribe con la función de abajo.

-- ===== 4. Guardar los datos fiscales de una factura =====
create or replace function public.fiscal__nif(p text) returns text language sql immutable as $$
  select nullif(regexp_replace(regexp_replace(upper(coalesce(p, '')), '[^A-Z0-9]', '', 'g'), '^ES(?=[A-Z0-9]{9}$)', ''), '')
$$;

-- p_datos = { numero, fecha, nif, cp, total, aviso_destinatario, desglose: [{tipo_iva, base, cuota, recargo_pct, cuota_recargo}], a_ficha: true/false }
-- p_origen = 'lector' (la app al leer) u 'oficina' (corregido a mano)
create or replace function public.guardar_fiscal_factura_recibida(p_factura uuid, p_datos jsonb, p_origen text default 'lector')
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  f public.facturas_recibidas%rowtype;
  v_rol text := rol_actual();
  v_nif text := fiscal__nif(p_datos->>'nif');
  v_cp text := nullif(regexp_replace(coalesce(p_datos->>'cp', ''), '\D', '', 'g'), '');
  v_num text := nullif(btrim(coalesce(p_datos->>'numero', '')), '');
  v_total numeric := nullif(p_datos->>'total', '')::numeric;
  v_fecha date := nullif(p_datos->>'fecha', '')::date;
  d jsonb;
begin
  if v_rol is null or v_rol <> all (array['compras', 'oficina', 'admin']) then raise exception 'No tienes permiso para esto'; end if;
  if p_origen not in ('lector', 'oficina') then raise exception 'Origen no válido'; end if;
  if v_cp is not null and v_cp !~ '^\d{5}$' then raise exception 'El código postal debe tener 5 cifras'; end if;
  select * into f from public.facturas_recibidas where id = p_factura for update;
  if not found then raise exception 'No encuentro esa factura'; end if;

  if p_origen = 'lector' then
    -- Lo leído nunca pisa lo que ha corregido la oficina, y solo rellena lo vacío
    if f.fiscal_origen = 'oficina' then return jsonb_build_object('ok', true, 'cambiado', false, 'motivo', 'revisada por la oficina'); end if;
    update public.facturas_recibidas set
      numero_factura = coalesce(numero_factura, v_num),
      nif_proveedor = coalesce(nif_proveedor, v_nif),
      cp_proveedor = coalesce(cp_proveedor, v_cp),
      total_factura = coalesce(total_factura, v_total),
      aviso_destinatario = coalesce(aviso_destinatario, nullif(p_datos->>'aviso_destinatario', '')),
      fiscal_origen = 'lector'
    where id = p_factura;
    if jsonb_typeof(p_datos->'desglose') = 'array' and jsonb_array_length(p_datos->'desglose') > 0
       and not exists (select 1 from public.facturas_recibidas_iva where factura_id = p_factura) then
      for d in select * from jsonb_array_elements(p_datos->'desglose') loop
        insert into public.facturas_recibidas_iva (factura_id, tipo_iva, base, cuota, recargo_pct, cuota_recargo)
        values (p_factura, (d->>'tipo_iva')::numeric, (d->>'base')::numeric, (d->>'cuota')::numeric,
                coalesce(nullif(d->>'recargo_pct', '')::numeric, 0), coalesce(nullif(d->>'cuota_recargo', '')::numeric, 0))
        on conflict do nothing;
      end loop;
    end if;
  else
    -- La oficina manda: se guarda tal cual lo deja
    update public.facturas_recibidas set
      numero_factura = v_num, nif_proveedor = v_nif, cp_proveedor = v_cp, total_factura = v_total,
      fecha_factura = coalesce(v_fecha, fecha_factura),
      fiscal_origen = 'oficina', fiscal_revisado_por = auth.uid(), fiscal_revisado_en = now()
    where id = p_factura;
    if jsonb_typeof(p_datos->'desglose') = 'array' then
      delete from public.facturas_recibidas_iva where factura_id = p_factura;   -- solo el desglose de ESTA factura, que se vuelve a escribir
      for d in select * from jsonb_array_elements(p_datos->'desglose') loop
        insert into public.facturas_recibidas_iva (factura_id, tipo_iva, base, cuota, recargo_pct, cuota_recargo)
        values (p_factura, (d->>'tipo_iva')::numeric, (d->>'base')::numeric, (d->>'cuota')::numeric,
                coalesce(nullif(d->>'recargo_pct', '')::numeric, 0), coalesce(nullif(d->>'cuota_recargo', '')::numeric, 0));
      end loop;
    end if;
  end if;

  -- Ficha del proveedor: se rellena lo que le falta; cambiar lo que ya tiene, solo oficina/admin y a propósito
  if f.proveedor_id is not null then
    update public.proveedores set
      nif = case when (p_origen = 'oficina' and coalesce((p_datos->>'a_ficha')::boolean, false) and v_rol in ('oficina', 'admin') and v_nif is not null) then v_nif else coalesce(nif, v_nif) end,
      codigo_postal = case when (p_origen = 'oficina' and coalesce((p_datos->>'a_ficha')::boolean, false) and v_rol in ('oficina', 'admin') and v_cp is not null) then v_cp else coalesce(codigo_postal, v_cp) end
    where id = f.proveedor_id;
  end if;
  return jsonb_build_object('ok', true, 'cambiado', true);
end $$;
revoke all on function public.guardar_fiscal_factura_recibida(uuid, jsonb, text) from public, anon;
grant execute on function public.guardar_fiscal_factura_recibida(uuid, jsonb, text) to authenticated;

-- ===== 5. Avisos de cada factura =====
create or replace view public.v_facturas_recibidas_control with (security_invoker = true) as
select f.id, f.estado, f.proveedor_id, p.nombre as proveedor,
  coalesce(f.fecha_factura, f.fecha_correo::date, f.recibido_en::date) as fecha,
  coalesce(f.numero_factura, c.numero_documento) as numero,
  coalesce(f.nif_proveedor, p.nif) as nif,
  coalesce(f.cp_proveedor, p.codigo_postal) as codigo_postal,
  f.total_factura, f.fiscal_origen, f.aviso_destinatario, f.ruta, f.nombre,
  d.n_tipos, d.suma_base, d.suma_cuota, d.suma_total,
  coalesce(f.nif_proveedor, p.nif) is null as falta_nif,
  coalesce(f.cp_proveedor, p.codigo_postal) is null as falta_cp,
  coalesce(d.n_tipos, 0) = 0 as sin_desglose,
  (f.total_factura is not null and d.suma_total is not null and abs(f.total_factura - d.suma_total) > 0.02) as no_cuadra
from public.facturas_recibidas f
left join public.proveedores p on p.id = f.proveedor_id
left join public.compras c on c.id = f.compra_id
left join lateral (select count(*) as n_tipos, sum(base) as suma_base, sum(cuota + cuota_recargo) as suma_cuota, sum(total) as suma_total
                   from public.facturas_recibidas_iva i where i.factura_id = f.id) d on true
where f.estado <> 'descartada';

-- ===== 6. Listado de COMPRAS para Jorge (fase 4): una fila por tipo de IVA =====
create or replace view public.v_libro_compras with (security_invoker = true) as
select f.id as factura_id,
  coalesce(f.fecha_factura, f.fecha_correo::date, f.recibido_en::date) as fecha_factura,
  coalesce(f.numero_factura, c.numero_documento) as numero_factura,
  coalesce(nullif(p.razon_social, ''), p.nombre) as proveedor,
  coalesce(f.nif_proveedor, p.nif) as nif,
  coalesce(f.cp_proveedor, p.codigo_postal) as codigo_postal,
  'Compra de mercaderías'::text as concepto,
  i.base as base_imponible, i.tipo_iva, i.cuota as cuota_iva,
  i.recargo_pct, i.cuota_recargo, i.total
from public.facturas_recibidas f
join public.facturas_recibidas_iva i on i.factura_id = f.id
left join public.proveedores p on p.id = f.proveedor_id
left join public.compras c on c.id = f.compra_id
where f.estado <> 'descartada';

grant select on public.v_facturas_recibidas_control, public.v_libro_compras to authenticated;
