-- «CONTADOR A CERO» — SOLO cuando Fernando lo pida con esas palabras, y enseñándole antes qué se borra.
-- Mientras la app no se use de verdad, las pruebas no deben contar. Esto:
--   1) guarda copia en el esquema «copias» de los pedidos tocados (todo lo que no sea «previsto»), sus líneas y albaranes;
--   2) borra esos pedidos, sus albaranes, cobros e incidencias (líneas, entregas y enlaces se borran en cascada);
--   2b) pone el SOBRANTE a cero (08/11/2026: ya se limpió una vez el de pruebas del 04/11)
--   3) pone el contador de albaranes para que el siguiente sea el F-1;
--   4) vuelve a crear limpios los previstos de los pedidos fijos.
-- Cambia AAAAMMDD por la fecha del día antes de ejecutarlo. Primera vez: 08/11/2026 (Bar Lanchas F-2, La Figal, La Colonia, Bar El Conde II).
begin;
create table copias.pedidos_prueba_AAAAMMDD as select * from public.pedidos where estado <> 'previsto';
create table copias.lineas_prueba_AAAAMMDD as select l.* from public.lineas_pedido l join public.pedidos p on p.id = l.pedido_id where p.estado <> 'previsto';
create table copias.albaranes_prueba_AAAAMMDD as select * from public.albaranes;
create table copias.cobros_prueba_AAAAMMDD as select * from public.cobros;
create table copias.sobrante_prueba_AAAAMMDD as select * from public.sobrante;
delete from public.sobrante;   -- el sobrante de pruebas también a cero
delete from public.cobros;
delete from public.incidencias where pedido_id in (select id from public.pedidos where estado <> 'previsto');
delete from public.albaranes;
delete from public.pedidos where estado <> 'previsto';
-- OJO (Fernando, 08/11/2026): al empezar de verdad se sigue la numeración que se tenía. Preguntar el último número y poner
-- select setval('public.albaran_f_seq', <ULTIMO + 1>, false);   -- en vez de 1
select setval('public.albaran_f_seq', 1, false);
commit;
select public.generar_previstos(14);
