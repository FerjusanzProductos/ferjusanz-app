-- IBAN de FERJUSANZ en la factura cuando se paga por TRANSFERENCIA (pedido por Fernando, 13/11/2026).
-- 1. Añade la casilla «iban» a la ficha de la empresa (vacía; la rellena un admin en «🏢 Datos de la empresa»).
--    Se guarda sin espacios y en mayúsculas (ES12 3456 … → ES123456…). Solo admite el formato de un IBAN.
-- 2. No cambia ninguna función: la foto del emisor que se guarda en cada factura (sif__emisor) ya copia
--    toda la ficha, así que el IBAN entra solo en las facturas nuevas. Las ya emitidas no se tocan.
-- 3. Cambia el PDF de la factura → sube la versión del programa de facturación (docs/SIF_PRODUCTOR/LEEME.md, punto 8).
-- No borra ni cambia pedidos, albaranes, clientes ni facturas.
alter table public.empresa add column if not exists iban text;
alter table public.empresa drop constraint if exists empresa_iban_formato;
alter table public.empresa add constraint empresa_iban_formato check (iban is null or iban ~ '^[A-Z]{2}[0-9]{2}[A-Z0-9]{11,30}$');
update public.sif_config set version_sif = 'SIF 0.2.1 (sin declaración)' where id;
