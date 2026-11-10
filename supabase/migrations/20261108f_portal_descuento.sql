-- El portal de clientes y los enlaces de albarán no restaban el descuento del pedido (p. ej. «Descuento por productos» de los clientes sin IVA).
-- _albaran_json_base ahora incluye descuento_base, descuento_iva y descuento_motivo; la app ya los resta (descPedido/pubTotales).
-- Aprobado por Fernando el 08/11/2026. Copia de la función anterior en copias.funciones_20261108.
CREATE OR REPLACE FUNCTION public._albaran_json_base(p_pedido uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
                                            declare v_res jsonb;
                                            begin
                                              select jsonb_build_object(
                                                  'ok', true,
                                                      'serie', a.serie, 'numero', a.numero, 'fecha', coalesce(a.fecha, p.fecha_entrega),
                                                          'firma_png', a.firma_png, 'firma_nombre', a.firma_nombre, 'firma_at', a.firma_at,
 'descuento_base', case when coalesce(p.descuento_base,0) > 0 then p.descuento_base end, 'descuento_iva', p.descuento_iva, 'descuento_motivo', p.descuento_motivo,
                                                              'entregado_at', (select e.entregado_at from public.entregas e where e.pedido_id = p.id),
                                                                  'entrega_nota', (select e.nota from public.entregas e where e.pedido_id = p.id),
                                                                      'cliente', jsonb_build_object('nombre', c.nombre, 'nombre_comercial', c.nombre_comercial, 'nif', c.nif, 'direccion', c.direccion,
                                                                                                        'localidad', c.localidad, 'forma_pago', c.forma_pago, 'recargo_equivalencia', c.recargo_equivalencia),
                                                                                                            'lineas', coalesce((select jsonb_agg(jsonb_build_object(
                                                                                                                    'nombre', coalesce(pr.nombre_albaran, pr.nombre), 'cantidad_pedida', l.cantidad_pedida, 'unidad_pedida', l.unidad_pedida, 'peso_real', l.peso_real,
                                                                                                                            'unidad_precio', l.unidad_precio, 'precio', l.precio, 'iva', l.iva, 'iva_producto', pr.iva) order by pr.nombre)
                                                                                                                                    from public.lineas_pedido l join public.productos pr on pr.id = l.producto_id where l.pedido_id = p.id), '[]'::jsonb)
                                                                                                                                      ) into v_res
                                                                                                                                        from public.pedidos p join public.albaranes a on a.pedido_id = p.id join public.clientes c on c.id = p.cliente_id
                                                                                                                                          where p.id = p_pedido and a.numero is not null and a.estado = 'emitido';
                                                                                                                                            return coalesce(v_res, jsonb_build_object('ok', false));
                                                                                                                                            end $function$;
