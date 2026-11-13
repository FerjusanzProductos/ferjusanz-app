-- BANCO → FACTURA COBRADA SOLA (Fernando, 13/11/2026)
-- Al confirmar en «🏦 Banco» una transferencia de un CLIENTE con su(s) factura(s), la factura queda COBRADA
-- en «📄 Facturas de clientes» sin tener que marcarla a mano.
--
-- Qué hace, en corto:
--  1. «Facturas de clientes» guarda 4 datos nuevos del cobro: qué movimiento del banco la cobró, quién, cuándo
--     y una nota («Cobrada por el banco el …» / «Vuelta a pendiente: …»). No se cambia nada de lo que ya hay.
--  2. Cuando un movimiento del banco de un cliente se CONFIRMA (o se corrige) con factura(s):
--     - Si las facturas suman JUSTO el importe del banco → se marcan COBRADAS (fecha de cobro = la del banco).
--     - Si NO cuadra (pago parcial o de más) → NO se marca nada (la app avisa antes de confirmar).
--     - Si la factura (de Golden o de la app) aún no estaba en «Facturas de clientes», se apunta sola.
--     - Si ya estaba cobrada a mano, no se toca.
--  3. Cuando se DESHACE la confirmación, o se corrige quitando la factura o cambiando de cliente,
--     las facturas que había cobrado ESE movimiento vuelven a PENDIENTE, con quién, cuándo y el motivo.
--  4. Cada cambio queda además en el historial general (tabla «historial»), como todo lo de facturas de clientes.
--  No borra nada, no cambia importes ni toca las facturas emitidas (sif_*), que no se pueden cambiar.

-- ===== 1. Datos del cobro en «Facturas de clientes» =====
alter table public.facturas_clientes add column if not exists cobro_banco_id uuid references public.banco_movimientos(id) on delete restrict;
alter table public.facturas_clientes add column if not exists cobro_por uuid;
alter table public.facturas_clientes add column if not exists cobro_en timestamptz;
alter table public.facturas_clientes add column if not exists cobro_nota text;

-- Para comparar números de factura escritos de formas distintas («P/20.001», «P P/20.001», «p 20001»…)
create or replace function public.banco__num(t text) returns text language sql immutable as $$
  select regexp_replace(upper(coalesce(t, '')), '[^A-Z0-9]', '', 'g') $$;

-- ===== 2 y 3. Marcar / desmarcar al confirmar, corregir o deshacer en el banco =====
create or replace function public.banco__cobro() returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_ids uuid[] := '{}'; f jsonb; v_fc uuid; v_suma numeric := 0; v_hay boolean := false;
  v_num text; v_cli uuid; v_fecha date; v_imp numeric; v_motivo text; v_quien uuid := auth.uid();
begin
  if old.estado is not distinct from new.estado and old.facturas is not distinct from new.facturas
     and old.cliente_id is not distinct from new.cliente_id and old.quien_tipo is not distinct from new.quien_tipo then
    return null;
  end if;

  -- Confirmado de un cliente: ¿las facturas suman justo lo del banco?
  if new.estado = 'confirmado' and new.tipo = 'entrada' and new.quien_tipo = 'cliente' and new.cliente_id is not null then
    select coalesce(sum((x->>'total')::numeric), 0), count(*) > 0 into v_suma, v_hay
      from jsonb_array_elements(new.facturas) x where x->>'tipo' in ('golden', 'emitida');
    if v_hay and round(v_suma * 100) = round(new.importe * 100) then
      for f in select x from jsonb_array_elements(new.facturas) x where x->>'tipo' in ('golden', 'emitida') loop
        v_fc := null; v_num := null;
        if f->>'tipo' = 'emitida' then
          select s.codigo, s.cliente_id, s.fecha, greatest(s.total, 0) into v_num, v_cli, v_fecha, v_imp
            from public.sif_facturas s where s.id = (f->>'id')::uuid;
          if v_num is not null then
            select id into v_fc from public.facturas_clientes where cliente_id = v_cli and numero = v_num;
          end if;
        else
          select g.numero, g.fecha, g.total into v_num, v_fecha, v_imp from public.golden_facturas g where g.id = (f->>'id')::uuid;
          v_cli := new.cliente_id;
          if v_num is not null then
            select id into v_fc from public.facturas_clientes
              where cliente_id = v_cli and public.banco__num(numero) in (public.banco__num(v_num), public.banco__num(f->>'numero'))
              order by created_at limit 1;
          end if;
        end if;
        continue when v_num is null;
        if v_fc is null then   -- no estaba apuntada: se apunta
          insert into public.facturas_clientes (cliente_id, numero, fecha, importe, nota, pagada)
            values (v_cli, v_num, v_fecha, greatest(coalesce(v_imp, 0), 0), 'Apuntada sola al cobrarla por el banco', false)
            on conflict (cliente_id, numero) do nothing returning id into v_fc;
          if v_fc is null then select id into v_fc from public.facturas_clientes where cliente_id = v_cli and numero = v_num; end if;
        end if;
        update public.facturas_clientes set pagada = true, fecha_pago = new.fecha, cobro_banco_id = new.id,
               cobro_por = v_quien, cobro_en = now(),
               cobro_nota = 'Cobrada por transferencia del banco del ' || to_char(new.fecha, 'DD/MM/YYYY') || ' (' || replace(to_char(new.importe, 'FM999999990.00'), '.', ',') || ' €)'
          where id = v_fc and (not pagada or cobro_banco_id = new.id);
        if found then v_ids := v_ids || v_fc; end if;
      end loop;
    end if;
  end if;

  -- Las que cobró ESTE movimiento y ya no le tocan → pendientes otra vez
  select c.motivo into v_motivo from public.banco_cambios c where c.movimiento_id = new.id order by c.id desc limit 1;
  update public.facturas_clientes set pagada = false, fecha_pago = null, cobro_banco_id = null, cobro_por = v_quien, cobro_en = now(),
         cobro_nota = 'Vuelta a pendiente: se ' || case when new.estado = 'pendiente' then 'deshizo' else 'corrigió' end
                      || ' la confirmación del banco del ' || to_char(new.fecha, 'DD/MM/YYYY')
                      || coalesce(' (motivo: ' || nullif(btrim(v_motivo), '') || ')', '')
    where cobro_banco_id = new.id and not (id = any(v_ids));
  return null;
end $$;

drop trigger if exists trg_banco_cobro on public.banco_movimientos;
create trigger trg_banco_cobro after update on public.banco_movimientos
  for each row execute function public.banco__cobro();

revoke all on function public.banco__cobro() from public, anon, authenticated;
