-- 24/11/2026 (Tito): la «Observación» que la oficina escribe en Golden › Cobros (columna «Descripcion Corta» de Tesoreria, sin el «Fra. P/…, Cliente» del principio).
-- observacion = texto tal cual; observacion_partes = [{tipo:'a cuenta'|'pagado', albaranes:['5097'], fecha:'AAAA-MM-DD'|null, importe:259.31|null}];
-- observacion_aviso = qué no se ha entendido (si algo). Lo rellena scripts/golden/compras-sql.py (nota_golden.py). Solo añade columnas: no borra ni cambia nada.
alter table public.golden_tesoreria add column if not exists observacion text;
alter table public.golden_tesoreria add column if not exists observacion_partes jsonb;
alter table public.golden_tesoreria add column if not exists observacion_aviso text;
