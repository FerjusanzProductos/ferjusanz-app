-- 💬 WhatsApp · pedidos (22/11/2026). El asistente del 609 100 690 (360dialog, modo silencioso) apunta aquí
-- los pedidos que detecta como PROPUESTA para que la oficina los revise. No crea pedidos reales.
-- whatsapp_mensajes ya existía (sin migración): se deja como estaba; aquí solo se crea si falta.
create table if not exists public.whatsapp_mensajes (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  telefono text not null,
  nombre_contacto text,
  cliente_id uuid references public.clientes(id) on delete set null,
  direccion text not null default 'entra' check (direccion in ('entra', 'sale')),
  texto text,
  tipo text default 'text',
  wa_id text unique,
  estado text not null default 'nuevo' check (estado in ('nuevo', 'propuesto', 'contestado', 'descartado', 'enviado', 'error')),
  propuesta text,
  enviado_por uuid,
  error text
);

create table if not exists public.whatsapp_pedidos (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  wa_id text unique,                       -- id del mensaje de WhatsApp (360dialog reintenta: no se duplica)
  telefono text not null,                  -- de qué número vino
  nombre_contacto text,                    -- nombre que tiene en WhatsApp
  reenviado boolean not null default false,-- lo reenvió alguien de la casa (Tito) desde otro número
  cliente_id uuid references public.clientes(id) on delete set null,  -- vacío = «sin cliente», lo elige la oficina
  cliente_texto text,                      -- cómo lo nombra el mensaje
  fecha_entrega date,
  lineas jsonb not null default '[]',      -- [{producto_id, producto, cantidad, unidad}]
  tipo text,                               -- text, audio, image
  texto_original text,                     -- el texto o el pie de foto tal cual
  transcripcion text,                      -- lo que dice el audio o la foto
  nota text,                               -- dudas que tiene que mirar la oficina
  estado text not null default 'nuevo' check (estado in ('nuevo', 'revisado', 'pasado', 'descartado')),
  pedido_id uuid,
  revisado_por uuid,
  revisado_en timestamptz,
  error text
);
create index if not exists whatsapp_pedidos_estado_idx on public.whatsapp_pedidos (estado, created_at desc);

alter table public.whatsapp_pedidos enable row level security;
drop policy if exists whatsapp_pedidos_ver on public.whatsapp_pedidos;
create policy whatsapp_pedidos_ver on public.whatsapp_pedidos for select to authenticated
  using (public.rol_actual() in ('admin', 'oficina'));
drop policy if exists whatsapp_pedidos_revisar on public.whatsapp_pedidos;
create policy whatsapp_pedidos_revisar on public.whatsapp_pedidos for update to authenticated
  using (public.rol_actual() in ('admin', 'oficina')) with check (public.rol_actual() in ('admin', 'oficina'));
-- Sin insert ni delete desde la app: solo escribe la función «whatsapp» (con la llave de servicio).
