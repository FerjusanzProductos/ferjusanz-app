-- Contadores de PRUEBA separados y «Poner contadores a cero» (Facturación 2027, punto 3). 14/11/2026.
-- SOLO hace algo en la base de PRUEBAS (ficha «entorno» = 'pruebas'). En la base REAL no cambia nada.
--  1. Albaranes de pruebas con su propia serie y contador: PRUEBA-F 0000001, 0000002… (los F-6000… ya hechos se quedan).
--     Pedidos y cargas no llevan número (solo un código interno), así que no necesitan contador.
--     Facturas: ya tenían su serie PRUEBA / PRUEBA-R (20261113a).
--  2. Función poner_contadores_a_cero() (solo admin, solo pruebas): guarda una copia de lo ensayado en el esquema «copias»
--     (tablas ensayo_AAAAMMDD_HHMI_*), borra los pedidos de ensayo que NO están en una factura (con sus albaranes, cobros,
--     incidencias, cargas y entregas) y el sobrante, y deja el contador de albaranes en el siguiente libre.
--     Las facturas (y sus albaranes y pedidos) NO se borran ni en pruebas: el registro de facturación no lo permite.
--     Los previstos de los pedidos fijos no se tocan.
do $$
begin
  if coalesce((select nombre from public.entorno), '') <> 'pruebas' then
    raise notice 'Base REAL: no se toca nada'; return;
  end if;

  create sequence if not exists public.albaran_prueba_seq as integer start 1;
  grant usage, select on sequence public.albaran_prueba_seq to authenticated, service_role;
  alter table public.albaranes alter column serie set default 'PRUEBA-F',
                               alter column numero set default nextval('public.albaran_prueba_seq');
  create schema if not exists copias;
  revoke all on schema copias from anon, authenticated;

  execute $f$
  create or replace function public.poner_contadores_a_cero() returns jsonb
  language plpgsql security definer set search_path to 'public' as $b$
  declare
    v_suf text := to_char(now() at time zone 'Europe/Madrid', 'YYYYMMDD_HH24MI');
    v_ped int; v_alb int; v_cob int; v_sig int;
  begin
    if coalesce(public.rol_actual(), '') <> 'admin' then raise exception 'SIN_PERMISO'; end if;
    if coalesce((select nombre from public.entorno), '') <> 'pruebas' then raise exception 'SOLO_EN_PRUEBAS'; end if;
    if to_regclass('copias.ensayo_' || v_suf || '_pedidos') is not null then raise exception 'ESPERA_UN_MINUTO'; end if;

    -- Pedidos de ensayo que se pueden quitar: no previstos y sin nada facturado
    create temp table _ens on commit drop as
      select p.id from public.pedidos p
      where p.estado <> 'previsto'
        and not exists (select 1 from public.sif_factura_albaranes fa where fa.pedido_id = p.id)
        and not exists (select 1 from public.sif_factura_lineas fl join public.lineas_pedido l on l.id = fl.linea_pedido_id where l.pedido_id = p.id)
        and not exists (select 1 from public.sif_factura_lineas fl join public.albaranes a on a.id = fl.albaran_id where a.pedido_id = p.id);

    -- 1) Copia de lo ensayado
    execute format('create table copias.%I as select * from public.pedidos where id in (select id from _ens)', 'ensayo_' || v_suf || '_pedidos');
    execute format('create table copias.%I as select * from public.lineas_pedido where pedido_id in (select id from _ens)', 'ensayo_' || v_suf || '_lineas');
    execute format('create table copias.%I as select * from public.albaranes where pedido_id in (select id from _ens)', 'ensayo_' || v_suf || '_albaranes');
    execute format('create table copias.%I as select * from public.cobros where pedido_id in (select id from _ens)', 'ensayo_' || v_suf || '_cobros');
    execute format('create table copias.%I as select c.* from public.carga_lineas c join public.lineas_pedido l on l.id = c.linea_id where l.pedido_id in (select id from _ens)', 'ensayo_' || v_suf || '_cargas');
    execute format('create table copias.%I as select * from public.sobrante', 'ensayo_' || v_suf || '_sobrante');

    -- 2) Borrar (líneas, cargas, entregas, enlaces y lotes asignados se van en cascada)
    delete from public.cobros where pedido_id in (select id from _ens); get diagnostics v_cob = row_count;
    delete from public.incidencias where pedido_id in (select id from _ens) or linea_id in (select id from public.lineas_pedido where pedido_id in (select id from _ens));
    delete from public.envios_correo where pedido_id in (select id from _ens);
    delete from public.albaranes where pedido_id in (select id from _ens); get diagnostics v_alb = row_count;
    delete from public.pedidos where id in (select id from _ens); get diagnostics v_ped = row_count;
    delete from public.sobrante where true;  -- «where true»: Supabase no deja DELETE sin WHERE desde la app

    -- 3) Contador de albaranes: el siguiente libre de la serie PRUEBA-F (1 si no queda ninguno)
    v_sig := coalesce((select max(numero) from public.albaranes where serie = 'PRUEBA-F'), 0) + 1;
    perform setval('public.albaran_prueba_seq', v_sig, false);

    return jsonb_build_object('copia', 'copias.ensayo_' || v_suf || '_*', 'pedidos', v_ped, 'albaranes', v_alb, 'cobros', v_cob,
      'siguiente_albaran', 'PRUEBA-F ' || lpad(v_sig::text, 7, '0'),
      'facturas_que_quedan', (select count(*) from public.sif_facturas));
  end $b$;
  $f$;
  revoke all on function public.poner_contadores_a_cero() from public, anon;
  grant execute on function public.poner_contadores_a_cero() to authenticated;
end $$;
