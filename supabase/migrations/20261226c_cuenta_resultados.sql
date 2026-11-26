-- 📒 Cuenta de resultados (Tito, 26/11/2026: «balance de pérdidas y ganancias… que pueda pinchar y ver dónde se van las pérdidas… y las ganancias»).
-- gastos_fijos: lo que se paga cada mes aparte de la mercancía y las nóminas (alquiler, furgoneta, parking…). Lo mete Claude por SQL
-- a partir de las facturas; desde = hasta para un gasto de una sola vez. Lo ven los de ver_sueldos.
-- panel_pyg: la página que genera scripts/pyg-html.mjs; la app solo la lee. Lleva sueldos y márgenes: solo quien está en las dos listas.
create table if not exists public.gastos_fijos (
  id bigint generated always as identity primary key,
  concepto text not null,
  grupo text not null,                    -- Oficina, Furgonetas, Mercamadrid, Gestoría…
  importe_mes numeric(10,2) not null,     -- sin IVA
  desde date not null,                    -- primer mes (día 1)
  hasta date,                             -- último mes (día 1); null = sigue
  nota text,
  creado timestamptz not null default now()
);
alter table public.gastos_fijos enable row level security;
revoke all on public.gastos_fijos from anon, authenticated;
grant select on public.gastos_fijos to authenticated;
drop policy if exists leer on public.gastos_fijos;
create policy leer on public.gastos_fijos for select to authenticated using (puede_ver_sueldos());

create table if not exists public.panel_pyg (
  fecha  date primary key,
  html   text not null,
  creado timestamptz not null default now()
);
alter table public.panel_pyg enable row level security;
revoke all on public.panel_pyg from anon, authenticated;
grant select on public.panel_pyg to authenticated;
drop policy if exists leer on public.panel_pyg;
create policy leer on public.panel_pyg for select to authenticated using (puede_ver_sueldos() and puede_ver_margenes());
