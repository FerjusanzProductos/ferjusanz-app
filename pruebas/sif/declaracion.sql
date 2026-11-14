-- Prueba T-DEC-02/04: en la base de PRUEBAS finge ser la real con la facturación encendida y comprueba el bloqueo sin declaración. Se deshace sola (raise exception).
do $t$ declare res jsonb := '{}'; m text; v text;
begin
  perform set_config('request.jwt.claims', '{"sub":"4b39a41c-5e53-4452-94f5-6d4a9c03dc84"}', true);
  perform set_config('request.jwt.claim.sub', '4b39a41c-5e53-4452-94f5-6d4a9c03dc84', true);
  res := res || jsonb_build_object('programa', public.sif_programa());
  update public.entorno set nombre = 'produccion';
  update public.sif_config set emision_real_activa = true, fecha_inicio = current_date - 1;
  begin m := public.sif_serie(false); exception when others then m := sqlerrm; end;
  res := res || jsonb_build_object('sin_declaracion', m);
  select version_sif into v from public.sif_config;
  insert into public.sif_declaraciones values (v, current_date, 'Madrid', 'PRUEBA', 'x.pdf', repeat('A', 64));
  begin m := public.sif_serie(false); exception when others then m := sqlerrm; end;
  res := res || jsonb_build_object('con_declaracion', m);
  update public.sif_config set version_sif = 'SIF 9.9.9' where id;   -- versión nueva sin declaración
  begin m := public.sif_serie(false); exception when others then m := sqlerrm; end;
  res := res || jsonb_build_object('version_nueva', m, 'anteriores', public.sif_programa()->'anteriores');
  begin delete from public.sif_declaraciones; m := 'BORRÓ'; exception when others then m := sqlerrm; end;
  res := res || jsonb_build_object('borrar', m);
  execute 'set local role authenticated';
  begin insert into public.sif_declaraciones values ('X', current_date, 'M', 'Y', 'x', repeat('B', 64)); m := 'INSERTÓ'; exception when others then m := sqlerrm; end;
  res := res || jsonb_build_object('app_inserta', m);
  raise exception 'RESULTADO:%', res::text;
end $t$;
