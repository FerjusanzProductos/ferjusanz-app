-- Clientes «sin IVA» (en la app salen en azul; el resto en dorado). Se puede cambiar desde la app.
alter table public.clientes add column if not exists sin_iva boolean not null default false;
update public.clientes set sin_iva = true where codigo in ('Falta poner 11', 'Falta poner 12');  -- Bar Delfín y Frutas Pedro
