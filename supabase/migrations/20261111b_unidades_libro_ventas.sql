-- Unidades del libro de ventas (lista confirmada por Fernando el 11/11/2026: «OK»).
-- 1) Cada producto pasa a venderse y cobrarse en su unidad (precio por unidad, no por kg).
-- 2) Los pedidos fijos y los previstos de esos productos pasan a esa misma unidad (las cantidades no cambian:
--    ya estaban en bandejas, bolsas, cajas… aunque pusiera «kg»).
-- Iceberg y aguacate se pueden vender por caja o por pieza: hay dos productos para cada uno (94-C / 94 y 122 / 122-P).
begin;
create temp table u(codigo text, uni text) on commit drop;
insert into u values
 ('122','caja'),('94-C','caja'),('43','caja'),('897-B','caja'),('149','caja'),('117-M','caja'),
 ('513','bandeja'),('310','bandeja'),('257','bandeja'),('168','bandeja'),('567','bandeja'),('137-M','bandeja'),('11-G','bandeja'),
 ('137-P','bolsa'),('137','bolsa'),('157','bolsa'),('157-A','bolsa'),('99','bolsa'),('301','bolsa'),('109','bolsa'),
 ('94','pieza'),('122-P','pieza'),('130','pieza'),('01-DT','pieza'),('60-B','pieza'),
 ('500','manojo'),('691','manojo'),('165','manojo'),('23','manojo'),('69','manojo'),('303','manojo'),('306','manojo'),('39','manojo'),('125','manojo'),('508','manojo'),('113','manojo'),
 ('29','docena');
update productos p set unidad_venta = u.uni, unidad_precio = 'unidad' from u where p.codigo = u.codigo;
update lineas_habituales lh set unidad = u.uni from productos p join u on u.codigo = p.codigo where lh.producto_id = p.id;
update lineas_pedido lp set unidad_pedida = u.uni, unidad_precio = 'unidad'
  from productos p join u on u.codigo = p.codigo, pedidos pe
  where lp.producto_id = p.id and pe.id = lp.pedido_id and pe.estado = 'previsto';
commit;
