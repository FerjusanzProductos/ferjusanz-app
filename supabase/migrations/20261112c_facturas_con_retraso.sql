-- Facturas de proveedor que llegan con retraso (12/11/2026) — APLICADO el 12/11/2026 con Fernando («listo»).
--
-- Qué pasaba: si la factura llegaba un día tarde y la app no tenía guardada su fecha, la compra se apuntaba
-- en el día en que llegó el correo. Desde v225 la app usa la fecha escrita dentro de la factura.
-- Este SQL arregla lo que ya estaba guardado mal:
--   1) Pone la fecha de la factura (la que la app leyó dentro del PDF) a las facturas que no la tenían (24 a 12/11).
--   2) Pasa al día de la factura las compras que se apuntaron en el día de llegada
--      (a 12/11: 2 facturas de Ibérica Patatas Selectas, FV-B-26-032668 y FV-I-26-046316: del 10/11, apuntadas el 11/11).
--      También su documento. No toca precios, cantidades, lotes ni códigos de lote.

begin;

-- 2) Primero las compras y sus documentos (mientras fecha_factura sigue vacía, para encontrarlas)
with mal as (
  select c.id as compra_id, x.fecha as buena
    from public.facturas_recibidas f
    join public.compras c on c.id = f.compra_id
    join lateral (select min(l.fecha) as fecha from public.lineas_factura_leida l where l.factura_id = f.id) x on true
   where f.fecha_factura is null and x.fecha is not null and x.fecha <> c.fecha
     and x.fecha between (f.recibido_en at time zone 'Europe/Madrid')::date - 45 and (f.recibido_en at time zone 'Europe/Madrid')::date + 1
)
, c1 as (update public.compras c set fecha = mal.buena from mal where c.id = mal.compra_id returning c.id)
update public.documentos_compra d set fecha = mal.buena from mal where d.compra_id = mal.compra_id;

-- 1) Fecha de la factura leída del PDF
update public.facturas_recibidas f
   set fecha_factura = x.fecha
  from (select factura_id, min(fecha) as fecha from public.lineas_factura_leida group by factura_id) x
 where x.factura_id = f.id and f.fecha_factura is null and x.fecha is not null
   and x.fecha between (f.recibido_en at time zone 'Europe/Madrid')::date - 45 and (f.recibido_en at time zone 'Europe/Madrid')::date + 1;

commit;
