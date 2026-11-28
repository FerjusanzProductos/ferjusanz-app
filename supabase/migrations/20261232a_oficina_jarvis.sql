-- 🏢 Oficina y 🤖 Jarvis (Tito, 28/11/2026): estado de cada departamento con datos REALES
-- (Golden, facturas de proveedor, prospectos, informes) y conexión de Jarvis con Telegram.
-- Solo lee datos de negocio; lo único que escribe son las tablas jarvis_*.

-- Estado de la oficina: números por departamento. Solo oficina y admin.
create or replace function public.oficina_estado() returns jsonb
language plpgsql security definer set search_path = public stable as $$
declare r jsonb;
begin
  if not exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false) then
    raise exception 'Solo la oficina puede ver la oficina';
  end if;
  with cob as (
    -- «A cuenta» en la nota de Golden = ya pagado (misma regla que scripts/panel-html.mjs).
    select tipo, estado, vencimiento,
      greatest(0, total - coalesce((select sum((p->>'importe')::numeric) from jsonb_array_elements(t.observacion_partes) p), 0)) total
    from golden_tesoreria t)
  select jsonb_build_object(
    'golden_hasta', (select max(fecha) from golden_facturas where not borrador),
    -- Las facturas P (pago mensual) se hacen el último día del mes: a mitad de mes solo hay contado.
    -- Por eso se comparan los dos últimos meses cerrados y, del mes en curso, solo lo que va.
    'ventas', (select jsonb_build_object(
        'mes_cerrado', to_char(date_trunc('month', current_date) - interval '1 month', 'YYYY-MM'),
        'ultimo_mes', coalesce(sum(base) filter (where fecha >= date_trunc('month', current_date) - interval '1 month' and fecha < date_trunc('month', current_date)), 0),
        'mes_antes', coalesce(sum(base) filter (where fecha < date_trunc('month', current_date) - interval '1 month'), 0),
        'mes_en_curso', coalesce(sum(base) filter (where fecha >= date_trunc('month', current_date)), 0))
      from golden_facturas where not borrador and fecha >= date_trunc('month', current_date) - interval '2 months'),
    -- Lo del mes en curso no es deuda (pago mensual la 1.ª semana del mes siguiente, REGLAS_INTERNAS).
    'cobros', (select jsonb_build_object(
        'vencido', coalesce(sum(total) filter (where vencimiento < date_trunc('month', current_date)), 0),
        'antiguo', coalesce(sum(total) filter (where vencimiento < date_trunc('month', current_date) - interval '1 month'), 0))
      from cob where tipo = 'C' and estado = 'PEN' and total > 0.009),
    'pagos', (select jsonb_build_object(
        'vencido', coalesce(sum(total) filter (where vencimiento < current_date), 0),
        'semana', coalesce(sum(total) filter (where vencimiento between current_date and current_date + 7), 0))
      from golden_tesoreria where tipo = 'P' and estado = 'PEN'),
    'facturas', (select jsonb_build_object(
        'por_revisar', count(*) filter (where estado = 'nueva'),
        'semana', count(*) filter (where recibido_en > now() - interval '7 days'))
      from facturas_recibidas),
    'comercial', (select jsonb_build_object(
        'llamar_hoy', count(*) filter (where proximo_contacto <= current_date),
        'nuevos', count(*) filter (where estado = 'nuevo'),
        'interesados', count(*) filter (where estado = 'interesado'))
      from prospectos where coalesce(estado, 'nuevo') not in ('cliente', 'descartado')),
    -- Han dejado de pedir: compraron en 3+ meses y llevan 45+ días sin factura (igual que el Panel).
    'clientes', (select jsonb_build_object('activos', (select count(*) from clientes where activo),
        'dejaron_de_pedir', (select count(*) from (select 1 from golden_facturas
          where not borrador and fecha >= current_date - interval '18 months'
          group by upper(trim(cliente_nombre))
          having count(distinct date_trunc('month', fecha)) >= 3 and max(fecha) < current_date - 45) x))),
    'informes', jsonb_build_object(
        'mercado', (select max(fecha) from resumen_mercado),
        'comercial_del_dia', (select max(fecha) from resumen_comercial),
        'posibles_clientes', (select max(fecha) from resumen_leads),
        'plan_semana', (select max(fecha) from resumen_semana))
  ) into r;
  return r;
end $$;
revoke all on function public.oficina_estado() from public, anon;
grant execute on function public.oficina_estado() to authenticated;

-- Telegram: token del bot y códigos para vincular (solo los lee la función jarvis-telegram, con la llave de servicio).
create table if not exists public.jarvis_ajustes (clave text primary key, valor text not null, actualizado timestamptz not null default now());
alter table public.jarvis_ajustes enable row level security;
-- Chats de Telegram vinculados a una persona de la oficina: Jarvis solo contesta a estos.
create table if not exists public.jarvis_telegram (chat_id bigint primary key, perfil_id uuid not null references public.perfiles(id) on delete cascade,
  nombre text, creado timestamptz not null default now());
alter table public.jarvis_telegram enable row level security;
drop policy if exists jarvis_telegram_ver on public.jarvis_telegram;
create policy jarvis_telegram_ver on public.jarvis_telegram for select using (perfil_id = auth.uid());
-- Conversación de Telegram (para que Jarvis recuerde lo último y las confirmaciones «sí, hazlo»).
create table if not exists public.jarvis_mensajes (id bigserial primary key, chat_id bigint not null, rol text not null, texto text not null,
  creado timestamptz not null default now());
alter table public.jarvis_mensajes enable row level security;
create index if not exists jarvis_mensajes_chat on public.jarvis_mensajes (chat_id, id desc);

create or replace function public.jarvis_guardar_token(p_token text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from perfiles where id = auth.uid() and rol = 'admin' and activo is not false) then
    raise exception 'Solo un administrador puede conectar Telegram';
  end if;
  p_token := trim(p_token);
  if p_token !~ '^[0-9]{5,}:[A-Za-z0-9_-]{30,}$' then raise exception 'Eso no parece el token de BotFather (tiene la forma 123456789:ABC…)'; end if;
  insert into jarvis_ajustes (clave, valor) values ('telegram_token', p_token)
    on conflict (clave) do update set valor = excluded.valor, actualizado = now();
end $$;

-- Código de 6 cifras, válido 15 minutos, para escribir «/start CÓDIGO» al bot.
create or replace function public.jarvis_codigo() returns text
language plpgsql security definer set search_path = public as $$
declare c text;
begin
  if not exists (select 1 from perfiles where id = auth.uid() and rol in ('oficina', 'admin') and activo is not false) then
    raise exception 'Solo la oficina puede usar Jarvis';
  end if;
  delete from jarvis_ajustes where clave like 'codigo:%' and (actualizado < now() - interval '15 minutes' or valor = auth.uid()::text);
  c := lpad((floor(random() * 1000000))::int::text, 6, '0');
  insert into jarvis_ajustes (clave, valor) values ('codigo:' || c, auth.uid()::text);
  return c;
end $$;

create or replace function public.jarvis_desconectar() returns void
language sql security definer set search_path = public as $$
  delete from jarvis_telegram where perfil_id = auth.uid();
$$;

revoke all on function public.jarvis_guardar_token(text), public.jarvis_codigo(), public.jarvis_desconectar() from public, anon;
grant execute on function public.jarvis_guardar_token(text), public.jarvis_codigo(), public.jarvis_desconectar() to authenticated;
