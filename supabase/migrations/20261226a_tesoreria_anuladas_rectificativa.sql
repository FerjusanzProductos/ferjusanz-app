-- Facturas anuladas por una rectificativa (Tito, 26/11/2026: caso Cafetería El 93, P/19508 anulada por R/41 al cambiar de dueño).
-- Golden deja la factura «PEN» aunque el abono la deja a 0: en la copia de la app pasa a 'AN' (anulada) y deja de salir como deuda en todas partes.
-- Empareja cada factura pendiente con un abono (importe negativo) del mismo cliente por el mismo importe, posterior o del mismo día; uno a uno.
-- Lo repite scripts/golden/compras-sql.py en cada carga, porque la carga vuelve a poner el estado de Golden.
with p as (select contador, upper(codigo) c, total, fecha_factura f,
             row_number() over (partition by upper(codigo), total order by fecha_factura desc, contador desc) n
           from golden_tesoreria where tipo = 'C' and estado in ('PEN', 'AN') and total > 0),
     r as (select upper(codigo) c, -total t, fecha_factura f,
             row_number() over (partition by upper(codigo), total order by fecha_factura, contador) n
           from golden_tesoreria where tipo = 'C' and total < 0)
update golden_tesoreria g set estado = 'AN', actualizado = now()
from p join r on r.c = p.c and r.t = p.total and r.n = p.n and r.f >= p.f
where g.contador = p.contador and g.estado = 'PEN';
