-- Tito, 23/11/2026: «Si. Cambia» → en hostelería las cajas, + 0,40 € por kilo (colectividades sigue con 0,30).
update listas_precios set margen_kg_caja = 0.40 where nombre = 'Hostelería';
select public.recalcular_listas_auto();
select i.nombre, i.precio, i.coste from listas_precios_items i join listas_precios l on l.id = i.lista_id
 where l.nombre = 'Hostelería' and lower(i.unidad) = 'caja' order by 1;
