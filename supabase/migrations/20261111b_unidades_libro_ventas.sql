-- Unidades del libro de ventas (lista confirmada por Fernando el 11/11/2026: «OK»).
-- Los 37 productos pasan a venderse y cobrarse en su unidad (precio por unidad, no por kg),
-- y sus pedidos fijos y previstos pasan a esa misma unidad (las cantidades no cambian).
-- Iceberg y aguacate: dos productos para cada uno (94-C caja / 94 pieza; 122 caja / 122-P pieza).
-- Una sola instrucción, para que funcione pegada en el editor SQL de Supabase.
with u(codigo, uni) as (values
 ('122','caja'),('94-C','caja'),('43','caja'),('897-B','caja'),('149','caja'),('117-M','caja'),
 ('513','bandeja'),('310','bandeja'),('257','bandeja'),('168','bandeja'),('567','bandeja'),('137-M','bandeja'),('11-G','bandeja'),
 ('137-P','bolsa'),('137','bolsa'),('157','bolsa'),('157-A','bolsa'),('99','bolsa'),('301','bolsa'),('109','bolsa'),
 ('94','pieza'),('122-P','pieza'),('130','pieza'),('01-DT','pieza'),('60-B','pieza'),
 ('500','manojo'),('691','manojo'),('165','manojo'),('23','manojo'),('69','manojo'),('303','manojo'),('306','manojo'),('39','manojo'),('125','manojo'),('508','manojo'),('113','manojo'),
 ('29','docena')),
prod as (
  update productos p set unidad_venta = u.uni, unidad_precio = 'unidad'
  from u where p.codigo = u.codigo
  returning p.id, p.unidad_venta),
hab as (
  update lineas_habituales lh set unidad = prod.unidad_venta
  from prod where lh.producto_id = prod.id
  returning lh.id),
prev as (
  update lineas_pedido lp set unidad_pedida = prod.unidad_venta, unidad_precio = 'unidad'
  from prod, pedidos pe
  where lp.producto_id = prod.id and pe.id = lp.pedido_id and pe.estado = 'previsto'
  returning lp.id)
select (select count(*) from prod) as productos_cambiados,
       (select count(*) from hab) as pedidos_fijos_cambiados,
       (select count(*) from prev) as previstos_cambiados;
