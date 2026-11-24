-- 24/11/2026 (Tito): apuntar cuándo suele pagar cada cliente, para avisar cuándo le toca y si se ha pasado.
-- pago_frecuencia: 'contado' | 'semanal' | 'quincenal' | 'mensual'; pago_dia: mensual = día del mes siguiente (1-31), semanal = día de la semana (1 lunes … 7 domingo);
-- pago_nota: texto libre («paga por transferencia el viernes», «lo trae el encargado»…). Solo añade columnas: no borra ni cambia nada.
alter table public.clientes add column if not exists pago_frecuencia text check (pago_frecuencia in ('contado','semanal','quincenal','mensual'));
alter table public.clientes add column if not exists pago_dia smallint check (pago_dia between 1 and 31);
alter table public.clientes add column if not exists pago_nota text;
