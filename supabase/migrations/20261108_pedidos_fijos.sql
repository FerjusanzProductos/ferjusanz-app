-- 08/11/2026 · Pedidos fijos con repartidor y tipo; estado «previsto» en pedidos.
-- Aplicado en Supabase por Claude con la conformidad de Fernando. Copia previa en el esquema «copias» (*_20261108).
alter table public.pedidos_habituales add column if not exists repartidor_id uuid references public.perfiles(id);
alter table public.pedidos_habituales add column if not exists tipo text not null default 'fijo';
alter table public.pedidos_habituales add constraint pedidos_habituales_tipo_check check (tipo in ('fijo','no_siempre','si_llama','especifico'));
alter table public.pedidos drop constraint pedidos_estado_check;
alter table public.pedidos add constraint pedidos_estado_check check (estado in ('previsto','pendiente','en_preparacion','terminado','anulado'));
-- Datos: 73 pedidos fijos (Excel «Pedidos_fijos_Ferjusanz.xlsx»), altas «Falta poner 11/12/13», JESUS reactivado,
-- alias «Peninsular» (BANCHERO) y «Pastelería Pozuelo» (HORNO), «Falta poner 8» desactivado.
