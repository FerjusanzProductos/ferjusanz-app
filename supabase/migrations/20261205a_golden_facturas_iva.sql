-- IVA EXACTO de cada factura de Golden (19/11/2026, Tito: «Sí» a la propuesta «IVA exacto para Jorge»).
-- Una fila por factura y tipo de IVA, sacada de la cabecera de Golden (BaseImp1-5, Iva1-5, imp_iva1-5, Rec/imp_rec1-5, BaseExentaIVA).
-- La cargan scripts/golden/iva-sql.py y la tarea diaria de Golden. Solo lectura para oficina y admin (como golden_facturas).
create table if not exists public.golden_facturas_iva (
  factura_numero text not null,
  tipo_iva numeric(5,2) not null,
  base numeric(12,2) not null,
  cuota numeric(12,2) not null,
  tipo_re numeric(5,2) not null default 0,
  cuota_re numeric(12,2) not null default 0,
  primary key (factura_numero, tipo_iva)
);
alter table public.golden_facturas_iva enable row level security;
drop policy if exists leer on public.golden_facturas_iva;
create policy leer on public.golden_facturas_iva for select to authenticated using (rol_actual() = any (array['oficina', 'admin']));
