-- Domicilio completo en las facturas (Jorge, 19/11/2026): «C/ Carare, 2, 1º Izq.» hasta que se cambie el domicilio fiscal (se quiere en enero).
update public.empresa set direccion = 'C/ Carare, 2, 1º Izq.' where direccion = 'C/ Carare, 2';
