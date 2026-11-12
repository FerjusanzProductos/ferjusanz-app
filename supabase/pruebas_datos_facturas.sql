-- SOLO PARA LA BASE DE PRUEBAS (ferjusanz-pruebas). Pedidos de ensayo ya entregados para probar las facturas.
-- No vale para la base real: se para si la base no dice «pruebas».
do $$
declare v_cli uuid; v_mal uuid; p uuid; d date := (now() at time zone 'Europe/Madrid')::date;
  pr record;
begin
  if (select nombre from public.entorno) <> 'pruebas' then raise exception 'ESTO SOLO VA EN LA BASE DE PRUEBAS'; end if;
  select id into v_cli from public.clientes where codigo = 'AGRO';                       -- Aguila Rock S.L. (en pruebas): datos fiscales completos
  select id into v_mal from public.clientes where activo and (nif is null or btrim(nif) = '') order by nombre limit 1;   -- uno sin NIF
  -- Pedido 1 (hace 2 días): tomate pera, patata, huevos, perejil (IVA 10 %)
  insert into public.pedidos (cliente_id, fecha_entrega, estado, notas) values (v_cli, d - 2, 'terminado', 'ENSAYO FACTURAS') returning id into p;
  insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, unidad_precio, precio, estado)
    select p, id, q, u, r, unidad_precio, pre, 'hecha' from public.productos, (values ('91-D', 10, 'kg', 10.35, 1.85), ('09-F', 25, 'kg', 25, 0.62), ('29', 3, 'docena', 3, 2.40), ('165', 2, 'manojo', 2, 0.80)) v(c, q, u, r, pre) where codigo = c;
  insert into public.albaranes (pedido_id, fecha) values (p, d - 2); insert into public.entregas (pedido_id) values (p);
  -- Pedido 2 (ayer): manzana, cebolla y una línea «No hay» (no se factura)
  insert into public.pedidos (cliente_id, fecha_entrega, estado, notas) values (v_cli, d - 1, 'terminado', 'ENSAYO FACTURAS') returning id into p;
  insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, unidad_precio, precio, estado)
    select p, id, q, u, r, unidad_precio, pre, e from public.productos, (values ('105', 7, 'kg', 7.2, 1.35, 'hecha'), ('21', 10, 'kg', 10, 0.75, 'hecha'), ('166', 2, 'kg', null, 3.10, 'no_disponible')) v(c, q, u, r, pre, e) where codigo = c;
  insert into public.albaranes (pedido_id, fecha) values (p, d - 1); insert into public.entregas (pedido_id) values (p);
  -- Pedido 3 (hoy): grande, 1.050 kg de naranja de zumo (para probar el límite del efectivo)
  insert into public.pedidos (cliente_id, fecha_entrega, estado, notas) values (v_cli, d, 'terminado', 'ENSAYO FACTURAS') returning id into p;
  insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, unidad_precio, precio, estado)
    select p, id, 1050, 'kg', 1050, unidad_precio, 0.95, 'hecha' from public.productos where codigo = '42';
  insert into public.albaranes (pedido_id, fecha) values (p, d); insert into public.entregas (pedido_id) values (p);
  -- Pedido 4: cliente sin NIF (para ver el aviso)
  insert into public.pedidos (cliente_id, fecha_entrega, estado, notas) values (v_mal, d - 1, 'terminado', 'ENSAYO FACTURAS') returning id into p;
  insert into public.lineas_pedido (pedido_id, producto_id, cantidad_pedida, unidad_pedida, peso_real, unidad_precio, precio, estado)
    select p, id, 5, 'kg', 5, unidad_precio, 1.85, 'hecha' from public.productos where codigo = '91-D';
  insert into public.albaranes (pedido_id, fecha) values (p, d - 1); insert into public.entregas (pedido_id) values (p);
end $$;
