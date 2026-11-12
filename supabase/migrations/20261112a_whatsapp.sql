-- 💬 WhatsApp automático (fase 1: Harvey PROPONE la respuesta y la oficina la envía).
-- Guarda los mensajes que llegan por la API de WhatsApp de Meta y los que manda la oficina.
-- Solo la función «whatsapp» (con la clave de servicio) apunta los mensajes que llegan;
-- la oficina/admin los ve y pulsa «Enviar» o «Descartar». No cambia ningún otro dato.
create table if not exists public.whatsapp_mensajes (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  telefono text not null,                 -- número del cliente tal como lo da WhatsApp (p. ej. 34609...)
  nombre_contacto text,                   -- nombre de su perfil de WhatsApp
  cliente_id uuid references public.clientes(id) on delete set null,
  direccion text not null check (direccion in ('entra', 'sale')),
  texto text,
  tipo text not null default 'text',      -- text, image, audio… (de momento solo se contesta texto)
  wa_id text unique,                      -- identificador del mensaje en WhatsApp (evita duplicados)
  estado text not null default 'nuevo' check (estado in ('nuevo', 'propuesto', 'contestado', 'descartado', 'enviado', 'error')),
  propuesta text,                         -- respuesta que propone Harvey (la oficina la revisa)
  enviado_por uuid,
  error text
);
create index if not exists whatsapp_mensajes_tel_idx on public.whatsapp_mensajes (telefono, created_at desc);
create index if not exists whatsapp_mensajes_estado_idx on public.whatsapp_mensajes (estado, created_at desc);
alter table public.whatsapp_mensajes enable row level security;
create policy whatsapp_ver on public.whatsapp_mensajes for select to authenticated using (public.rol_actual() in ('admin', 'oficina'));
create policy whatsapp_descartar on public.whatsapp_mensajes for update to authenticated using (public.rol_actual() in ('admin', 'oficina')) with check (public.rol_actual() in ('admin', 'oficina'));
grant select, update on public.whatsapp_mensajes to authenticated;
