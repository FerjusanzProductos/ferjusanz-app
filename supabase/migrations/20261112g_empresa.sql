-- Ficha de la EMPRESA (emisor de las facturas). Fase 1 del plan de facturación (docs/PLAN_FACTURACION.md).
-- Una sola fila. Todos los usuarios de la app la pueden LEER (sale en albaranes y facturas);
-- solo ADMIN la puede CAMBIAR. Nadie la puede borrar ni crear otra desde la app.
-- Cada cambio queda en el historial (trigger «auditar», como en clientes).
-- Datos dados por Fernando el 12/11/2026 (cabecera de los albaranes de papel / sello).
create table if not exists public.empresa (
  id uuid primary key default gen_random_uuid(),
  unica boolean not null default true unique check (unica),   -- garantiza una sola fila
  razon_social text not null,
  nif text not null,
  direccion text not null,
  codigo_postal text not null check (codigo_postal ~ '^[0-9]{5}$'),
  localidad text not null,
  provincia text,
  telefono text,
  moviles text,
  email text,
  registro_mercantil text,          -- texto obligatorio en facturas y documentos (art. 24 RRM)
  lema text,
  updated_at timestamptz not null default now()
);
alter table public.empresa enable row level security;
revoke all on public.empresa from anon, authenticated;
grant select, update on public.empresa to authenticated;
create policy empresa_leer on public.empresa for select to authenticated using (rol_actual() is not null);
create policy empresa_cambiar on public.empresa for update to authenticated
  using (rol_actual() = 'admin') with check (rol_actual() = 'admin');
create trigger trg_antes_actualizar before update on public.empresa for each row execute function antes_de_actualizar();
create trigger trg_auditar after insert or delete or update on public.empresa for each row execute function auditar();

insert into public.empresa (razon_social, nif, direccion, codigo_postal, localidad, provincia, telefono, moviles, email, registro_mercantil, lema)
values ('FERJUSANZ PRODUCTOS HORTOFRUTÍCOLAS S.L.', 'B87446670', 'C/ Carare, 2', '28033', 'Madrid', 'Madrid',
        '91 763 21 86', '609 100 690 – 616 439 157 – 609 567 354', 'ferjusanz@hotmail.com',
        'Inscrita en el Registro Mercantil de Madrid, Tomo 34.358, Folio 101, Sección 8.ª, Hoja M-618046, Inscripción 1.ª',
        'Mayoristas de patatas, frutas y verduras')
on conflict (unica) do nothing;
