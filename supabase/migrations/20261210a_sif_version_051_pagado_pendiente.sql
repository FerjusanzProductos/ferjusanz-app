-- 24/11/2026 (Tito): el PDF de la factura dice qué albaranes están ya pagados y cuánto queda pendiente.
-- Cambia el PDF de la factura → nueva versión del SIF (docs/SIF_PRODUCTOR/LEEME.md, punto 8). Vale para las dos bases.
update public.sif_config set version_sif = 'SIF 0.5.1 (sin declaración)' where id;
