-- Harvey fase 1: zona aislada «harvey». Solo añade objetos nuevos; no modifica tablas existentes.
-- Para deshacerlo todo: drop schema harvey cascade;
create schema if not exists harvey;
revoke all on schema harvey from public, anon, authenticated;

-- Preferencias de contacto por cliente
create table harvey.preferencias (
  cliente_id uuid primary key references public.clientes(id) on delete cascade,
  whatsapp text,                         -- móvil para WhatsApp (si no es el teléfono de la ficha)
  no_contactar boolean not null default false,   -- el cliente no quiere mensajes
  acepta_whatsapp boolean not null default false, -- consentimiento registrado (necesario para la API oficial)
  dias smallint[],                       -- días en que se le puede escribir (1 = lunes … 7 = domingo); null = cualquiera
  hora time,                             -- hora preferida
  max_semana smallint not null default 3,
  pausado_hasta date,
  notas text,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- Contactos hechos (evita duplicados: uno por cliente/lead, día y tipo)
create table harvey.contactos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references public.clientes(id) on delete cascade,
  prospecto_id uuid references public.prospectos(id) on delete cascade,
  fecha date not null,
  tipo text not null,
  mensaje text,
  canal text not null default 'whatsapp_manual',
  usuario uuid,
  created_at timestamptz not null default now(),
  check (cliente_id is not null or prospecto_id is not null)
);
create unique index contactos_unico on harvey.contactos (coalesce(cliente_id, prospecto_id), fecha, tipo);

-- Borradores de pedido preparados por Harvey (nunca son pedidos reales)
create table harvey.borradores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  usuario uuid,
  cliente_id uuid not null references public.clientes(id) on delete cascade,
  fecha_entrega date,
  texto_original text not null,
  lineas jsonb not null default '[]',
  preguntas jsonb not null default '[]',
  estado text not null default 'pendiente' check (estado in ('pendiente', 'pasado', 'descartado'))
);

-- Registro de todo lo que hace Harvey
create table harvey.registro (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  usuario uuid,
  accion text not null,
  cliente_id uuid,
  detalle jsonb
);

alter table harvey.preferencias enable row level security;
alter table harvey.contactos enable row level security;
alter table harvey.borradores enable row level security;
alter table harvey.registro enable row level security;

-- Entregas reales del historial de Golden: fecha del albarán si consta, si no la de la factura
create view harvey.entregas as
select f.cliente_codigo,
       coalesce(to_date(substring(g.albaran from 'de ([0-9]{2}/[0-9]{2}/[0-9]{4})'), 'DD/MM/YYYY'), f.fecha) as fecha,
       g.producto_codigo, g.descripcion, g.cantidad, g.precio, g.importe
from public.golden_lineas g
join public.golden_facturas f on f.numero = g.factura_numero
where f.tipo not ilike '%rectif%' and coalesce(f.borrador, false) = false;
revoke all on all tables in schema harvey from public, anon, authenticated;
