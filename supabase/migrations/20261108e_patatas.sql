-- Patatas (Fernando, 08/11/2026):
--  · 09-F «Patata nueva esp. freír (general)»: la patata de más volumen (P.C./consumo/hostelería/nueva/jelly). Albarán: «Patata nueva esp. freír».
--  · 01 «Patata Agria»: solo para quien pide agria; compra y venta como agria.
--  · COSAN01 «Patata Monalisa» activada (Lavandera y Rincón Banchero llevan agria + Monalisa).
--  · 01-F desactivada (se unificó en 09-F).
--  · Precios de compra: 09-F 0,40 €/kg y Monalisa 0,55 €/kg (Ibérica Patatas Selectas, factura 06/11/2026).
--  · 142 líneas de productos en los pedidos fijos (Excel «Productos_pedidos_fijos» + «Que_patata_es») y añadidas a los previstos sin líneas.
-- El lector de facturas aplica la regla en fcReglaPatata (public/index.html).

-- Albaranes enviados (no impresos): marca de cliente que quiere papel
alter table public.clientes add column if not exists albaran_papel boolean not null default false;
